import io
import base64
import os
from pathlib import Path

import cv2
import jwt
import numpy as np
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image
from ultralytics import YOLO

# carga variables de entorno del microservicio
load_dotenv()

# ============================================================================
# configuración
# ============================================================================

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET no encontrado en .env del microservicio")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
PORT         = int(os.getenv("PORT", 8000))
MODEL_PATH   = Path(os.getenv("MODEL_PATH", "best.pt"))

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Modelo no encontrado en: {MODEL_PATH.resolve()}")

# ============================================================================
# app y modelo
# ============================================================================

app = FastAPI(
    title="AutoSmart IA",
    description="Microservicio de detección de daños en piezas automotrices",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

model = YOLO(str(MODEL_PATH))
print(f"[AutoSmart IA] Modelo cargado: {MODEL_PATH}")
print(f"[AutoSmart IA] Clases: {model.names}")

# ============================================================================
# constantes de dominio
# ============================================================================

COLORES = {
    "Bad":  (220, 50,  50),
    "Good": (50,  190, 100),
}

RECOMENDACIONES = {
    "Bad":  "Pieza defectuosa - requiere revisión o reemplazo inmediato",
    "Good": "Pieza en buen estado - no requiere intervención",
}

NIVELES_SEVERIDAD = {
    "Bad":  "critico",
    "Good": "normal",
}

# ============================================================================
# autenticación JWT
# ============================================================================

security = HTTPBearer()

def verificar_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=["HS256"],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ============================================================================
# utilidades de imagen
# ============================================================================

def dibujar_detecciones(img_bgr: np.ndarray, boxes, nombres: dict) -> np.ndarray:
    img = img_bgr.copy()
    for box in boxes:
        cls_id    = int(box.cls)
        clase     = nombres[cls_id]
        confianza = float(box.conf)
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

        color = COLORES.get(clase, (100, 100, 255))
        grosor = max(2, int(min(img.shape[:2]) / 300))

        cv2.rectangle(img, (x1, y1), (x2, y2), color, grosor)

        etiqueta = f"{clase}  {confianza:.0%}"
        (tw, th), _ = cv2.getTextSize(
            etiqueta, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2
        )
        cv2.rectangle(img, (x1, y1 - th - 12), (x1 + tw + 10, y1), color, -1)
        cv2.putText(
            img, etiqueta, (x1 + 5, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2,
        )
    return img

def imagen_a_base64(img_bgr: np.ndarray) -> str:
    _, buffer = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

# ============================================================================
# rutas
# ============================================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "servicio": "AutoSmart IA",
        "version": "1.0.0",
        "modelo": str(MODEL_PATH),
        "clases": model.names,
    }


@app.post("/predecir")
async def predecir(
    imagen: UploadFile = File(...),
    usuario: dict = Depends(verificar_token),
):
    # validar tipo
    if not imagen.content_type or not imagen.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser una imagen (JPG, PNG, WEBP)",
        )

    # leer y convertir imagen
    contenido = await imagen.read()
    try:
        img_pil = Image.open(io.BytesIO(contenido)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer la imagen")

    img_np  = np.array(img_pil)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    # inferencia
    resultados = model.predict(img_bgr, conf=0.25, verbose=False)
    resultado  = resultados[0]

    # procesar detecciones
    detecciones = []
    if resultado.boxes is not None and len(resultado.boxes):
        for box in resultado.boxes:
            cls_id    = int(box.cls)
            clase     = model.names[cls_id]
            confianza = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            detecciones.append({
                "clase":       clase,
                "confianza":   round(confianza, 3),
                "porcentaje":  f"{round(confianza * 100)}%",
                "bbox":        {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                "recomendacion": RECOMENDACIONES.get(clase, ""),
                "severidad":     NIVELES_SEVERIDAD.get(clase, "desconocido"),
            })

    # anotar imagen
    img_anotada = dibujar_detecciones(img_bgr, resultado.boxes or [], model.names)
    imagen_b64  = imagen_a_base64(img_anotada)

    # determinar estado general
    clases_detectadas = {d["clase"] for d in detecciones}
    if "Bad" in clases_detectadas:
        estado = "defectuosa"
    elif "Good" in clases_detectadas:
        estado = "buena"
    else:
        estado = "no_detectada"

    return JSONResponse({
        "success":        True,
        "estado":         estado,
        "total":          len(detecciones),
        "detecciones":    detecciones,
        "imagen_anotada": imagen_b64,
        "meta": {
            "archivo":       imagen.filename,
            "analizado_por": usuario.get("email", "desconocido"),
            "rol_usuario":   usuario.get("rol", "desconocido"),
            "modelo":        str(MODEL_PATH.stem),
        },
    })