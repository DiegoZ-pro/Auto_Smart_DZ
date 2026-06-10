import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Upload, RefreshCw, AlertCircle, CheckCircle,
  X, Activity, FileSearch, Cpu, ImageOff, Info
} from 'lucide-react'
import iaService from '../../../services/iaService'
import styles from './DiagnosticoIA.module.css'

const ESTADO_CONFIG = {
  defectuosa:   { label: 'Pieza defectuosa',     icon: AlertCircle,   cls: 'estadoBad'  },
  buena:        { label: 'Pieza en buen estado',  icon: CheckCircle,   cls: 'estadoGood' },
  no_detectada: { label: 'Pieza no identificada', icon: ImageOff,      cls: 'estadoNone' },
}

export default function DiagnosticoIA() {
  const [archivo, setArchivo]       = useState(null)
  const [preview, setPreview]       = useState(null)
  const [resultado, setResultado]   = useState(null)
  const [cargando, setCargando]     = useState(false)
  const [error, setError]           = useState('')
  const [dragging, setDragging]     = useState(false)
  const [servicioOk, setServicioOk] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    iaService.verificarConexion().then(setServicioOk)
  }, [])

  const procesarArchivo = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG o WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar los 10MB')
      return
    }
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    setResultado(null)
    setError('')
  }, [])

  const handleInput     = (e) => procesarArchivo(e.target.files?.[0])
  const handleDrop      = (e) => { e.preventDefault(); setDragging(false); procesarArchivo(e.dataTransfer.files?.[0]) }
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const analizar = async () => {
    if (!archivo || cargando) return
    setCargando(true)
    setError('')
    try {
      const data = await iaService.analizarPieza(archivo)
      setResultado(data)
    } catch (err) {
      setError(err.message || 'Error al conectar con el servicio de IA')
    } finally {
      setCargando(false)
    }
  }

  const reiniciar = () => {
    setArchivo(null)
    setPreview(null)
    setResultado(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const cfg = resultado ? ESTADO_CONFIG[resultado.estado] : null

  return (
    <div className={styles.wrapper}>

      <h1 className={styles.pageTitle}>Diagnóstico con IA</h1>
      <p className={styles.pageSubtitle}>
        Detecta daños en piezas automotrices automáticamente con YOLOv8
      </p>

      {/* alerta de error */}
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* alerta servicio caído */}
      {servicioOk === false && (
        <div className={`${styles.alert} ${styles.alertWarning}`}>
          <Info size={16} />
          Microservicio de IA no disponible — ejecuta{' '}
          <code>python3.11 -m uvicorn main:app --reload</code> en la carpeta{' '}
          <code>autosmartIA/</code>
          <button onClick={() => iaService.verificarConexion().then(setServicioOk)}>
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* split panel */}
      <div className={styles.editorLayout}>

        {/* panel izquierdo */}
        <div className={styles.editorPanelLista}>

          <div className={styles.editorListaHeader}>
            <div className={styles.panelTitleRow}>
              <FileSearch size={15} className={styles.panelTitleIcon} />
              <span className={styles.panelTitleText}>Imagen de la pieza</span>
            </div>
            <div className={`${styles.servicioIndicator} ${
              servicioOk === true  ? styles.servicioUp :
              servicioOk === false ? styles.servicioDown :
              styles.servicioChecking
            }`}>
              <Activity size={11} />
              {servicioOk === null  && 'Verificando...'}
              {servicioOk === true  && 'Servicio activo'}
              {servicioOk === false && 'Sin conexión'}
            </div>
          </div>

          <div className={styles.editorLista}>

            {!preview ? (
              <div
                className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInput}
                  style={{ display: 'none' }}
                />
                <Upload size={28} className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>Arrastra una imagen aquí</p>
                <p className={styles.dropzoneHint}>o haz clic para seleccionar · JPG, PNG, WEBP · máx. 10MB</p>
              </div>
            ) : (
              <div className={styles.previewBox}>
                <img src={preview} alt="pieza a analizar" className={styles.previewImg} />
                <div className={styles.previewMeta}>
                  <span className={styles.previewNombre}>{archivo?.name}</span>
                  <span className={styles.previewSize}>
                    {archivo ? (archivo.size / 1024).toFixed(0) + ' KB' : ''}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.acciones}>
              {preview && !cargando && (
                <button
                  className={styles.btnAnalizar}
                  onClick={analizar}
                  disabled={!servicioOk}
                >
                  <Search size={14} />
                  Analizar pieza
                </button>
              )}
              {cargando && (
                <div className={styles.loaderBox}>
                  <RefreshCw size={16} className={styles.spin} />
                  <span>Analizando con YOLOv8...</span>
                </div>
              )}
              {(preview || resultado) && !cargando && (
                <button className={styles.btnNueva} onClick={reiniciar}>
                  <X size={13} /> Nueva imagen
                </button>
              )}
            </div>

            <div className={styles.modelInfo}>
              <Cpu size={12} className={styles.modelIcon} />
              <span className={styles.modelTag}>YOLOv8s</span>
              <span className={styles.modelMeta}>mAP@50 = 90.9% · Bad / Good</span>
            </div>

          </div>
        </div>

        {/* panel derecho */}
        <div className={styles.editorPanelForm}>

          {!resultado && !cargando && (
            <div className={styles.editorFormVacio}>
              <div className={styles.editorFormVacioIcon}>
                <FileSearch size={40} />
              </div>
              <h3>Sube una imagen para analizar</h3>
              <p>
                El modelo detectará si la pieza está en buen estado o presenta
                daños, indicando el porcentaje de confianza y una recomendación.
              </p>
            </div>
          )}

          {cargando && (
            <div className={styles.editorFormVacio}>
              <RefreshCw size={32} className={styles.spin} />
              <p>Procesando imagen...</p>
            </div>
          )}

          {resultado && !cargando && (
            <div className={styles.editorFormContent}>

              {cfg && (() => {
                const IconoEstado = cfg.icon
                return (
                  <div className={`${styles.estadoBadge} ${styles[cfg.cls]}`}>
                    <IconoEstado size={15} />
                    {cfg.label}
                  </div>
                )
              })()}

              <div className={styles.imgResultadoWrap}>
                <img
                  src={resultado.imagen_anotada}
                  alt="resultado con bounding boxes"
                  className={styles.imgResultado}
                />
              </div>

              <div className={styles.seccion}>
                <h3 className={styles.seccionTitle}>
                  Detecciones encontradas ({resultado.total})
                </h3>
                {resultado.total === 0 ? (
                  <div className={styles.itemsVacio}>
                    <ImageOff size={24} />
                    <p>No se encontraron detecciones con confianza mayor o igual a 25%</p>
                  </div>
                ) : (
                  <div className={styles.detList}>
                    {resultado.detecciones.map((d, i) => (
                      <div
                        key={i}
                        className={`${styles.detItem} ${d.clase === 'Bad' ? styles.detItemBad : styles.detItemGood}`}
                      >
                        <div className={styles.detInfo}>
                          <span className={`${styles.detClase} ${d.clase === 'Bad' ? styles.detClaseBad : styles.detClaseGood}`}>
                            {d.clase === 'Bad'
                              ? <AlertCircle size={13} />
                              : <CheckCircle size={13} />
                            }
                            {d.clase}
                          </span>
                          <span className={styles.detRec}>{d.recomendacion}</span>
                        </div>
                        <div className={styles.detDerecha}>
                          <span className={styles.detConf}>{d.porcentaje}</span>
                          <span className={`${styles.detSeveridad} ${d.severidad === 'critico' ? styles.sevCritico : styles.sevNormal}`}>
                            {d.severidad}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {resultado.meta && (
                <div className={styles.metaBox}>
                  <span>Modelo: {resultado.meta.modelo}</span>
                  <span>Analizado por: {resultado.meta.analizado_por}</span>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  )
}