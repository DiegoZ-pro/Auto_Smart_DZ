// ============================================================================
// RECEPCIÓN DE VEHÍCULO - TALLER
// Formulario con búsqueda de clientes y vehículos existentes
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, User, Phone, FileText, Calendar, Clock, Upload, Send,
  Search, Plus, X, Check
} from 'lucide-react';
import Alert from '../../../components/common/Alert/Alert';
import { ordenesService } from '../../../services/ordenesService';
import clientesService from '../../../services/clientesService';
import vehiculosService from '../../../services/vehiculosService';
import styles from './RecepcionVehiculo.module.css';

const RecepcionVehiculo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Estados - Cliente
  const [clienteMode, setClienteMode] = useState('search');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clientesBusqueda, setClientesBusqueda] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados - Vehículo
  const [vehiculoMode, setVehiculoMode] = useState('new');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [vehiculosCliente, setVehiculosCliente] = useState([]);

  // Estados - Formulario
  const [formData, setFormData] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
    marca: '',
    modelo: '',
    anio: '',
    placa: '',
    vin: '',
    descripcionProblema: '',
    fechaRecepcion: new Date().toISOString().split('T')[0],
    horaRecepcion: new Date().toTimeString().slice(0, 5),
    fechaDiagnostico: '',
    horaDiagnostico: '',
    fechaEntrega: '',
    horaEntrega: '',
    archivos: []
  });

  const [fileNames, setFileNames] = useState([]);

  // Buscar clientes
  useEffect(() => {
    if (clienteMode === 'search' && busquedaCliente.length >= 2) {
      buscarClientes();
    } else {
      setClientesBusqueda([]);
      setMostrarResultados(false);
    }
  }, [busquedaCliente, clienteMode]);

  // Cargar vehículos del cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      cargarVehiculosCliente(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado]);

  const buscarClientes = async () => {
    setBuscandoCliente(true);
    try {
      const response = await clientesService.getAll({ search: busquedaCliente });
      if (response.success) {
        setClientesBusqueda(response.data || []);
        setMostrarResultados(true);
      }
    } catch (error) {
      console.error('[RecepcionVehiculo] Client search failed:', error.message);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData(prev => ({
      ...prev,
      nombreCliente: cliente.nombre_completo || '',
      telefonoCliente: cliente.telefono || '',
      emailCliente: cliente.email || ''
    }));
    setBusquedaCliente('');
    setMostrarResultados(false);
    setVehiculoMode('select');
  };

  const limpiarCliente = () => {
    setClienteSeleccionado(null);
    setVehiculosCliente([]);
    setVehiculoSeleccionado(null);
    setFormData(prev => ({
      ...prev,
      nombreCliente: '',
      telefonoCliente: '',
      emailCliente: '',
      marca: '',
      modelo: '',
      anio: '',
      placa: '',
      vin: ''
    }));
  };

  const cargarVehiculosCliente = async (clienteId) => {
    try {
      const response = await vehiculosService.getByCliente(clienteId);
      if (response.success) {
        const vehiculos = response.data || [];
        setVehiculosCliente(vehiculos);
        
        // Si el cliente NO tiene vehículos, forzar modo 'new'
        if (vehiculos.length === 0) {
          setVehiculoMode('new');
        } else {
          // Si tiene vehículos, permitir seleccionar
          setVehiculoMode('select');
        }
      }
    } catch (error) {
      console.error('[RecepcionVehiculo] Failed to load client vehicles:', error.message);
      setVehiculosCliente([]);
      setVehiculoMode('new');
    }
  };

  const seleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setFormData(prev => ({
      ...prev,
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      anio: vehiculo.anio ? String(vehiculo.anio) : '',
      placa: vehiculo.placa || '',
      vin: vehiculo.vin || ''
    }));
  };

  const limpiarVehiculo = () => {
    setVehiculoSeleccionado(null);
    setFormData(prev => ({
      ...prev,
      marca: '',
      modelo: '',
      anio: '',
      placa: '',
      vin: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        setAlert({ show: true, type: 'error', message: `${file.name} no es válido` });
        return false;
      }
      
      if (file.size > maxSize) {
        setAlert({ show: true, type: 'error', message: `${file.name} excede 10MB` });
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({ ...prev, archivos: [...prev.archivos, ...validFiles] }));
    setFileNames(prev => [...prev, ...validFiles.map(f => f.name)]);
  };

  const removeFile = (index) => {
    setFormData(prev => ({ ...prev, archivos: prev.archivos.filter((_, i) => i !== index) }));
    setFileNames(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (clienteMode === 'new' && (!formData.nombreCliente.trim() || !formData.telefonoCliente.trim())) {
      setAlert({ show: true, type: 'error', message: 'Complete datos del cliente' });
      return false;
    }
    if (clienteMode === 'search' && !clienteSeleccionado) {
      setAlert({ show: true, type: 'error', message: 'Seleccione un cliente' });
      return false;
    }
    if (vehiculoMode === 'new' && (!formData.marca.trim() || !formData.modelo.trim() || !formData.placa.trim())) {
      setAlert({ show: true, type: 'error', message: 'Complete datos del vehículo' });
      return false;
    }
    if (vehiculoMode === 'select' && !vehiculoSeleccionado) {
      setAlert({ show: true, type: 'error', message: 'Seleccione un vehículo' });
      return false;
    }
    if (!formData.descripcionProblema.trim()) {
      setAlert({ show: true, type: 'error', message: 'Ingrese descripción del problema' });
      return false;
    }
    if (!formData.fechaDiagnostico || !formData.horaDiagnostico || !formData.fechaEntrega || !formData.horaEntrega) {
      setAlert({ show: true, type: 'error', message: 'Complete fechas estimadas' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      const ordenData = {
        tipo_orden_id: 1,
        descripcion_problema: formData.descripcionProblema.trim(),
        fecha_recepcion: formData.fechaRecepcion,
        hora_recepcion: formData.horaRecepcion,
        fecha_diagnostico: formData.fechaDiagnostico,
        hora_diagnostico: formData.horaDiagnostico,
        fecha_entrega_estimada: formData.fechaEntrega,
        hora_entrega_estimada: formData.horaEntrega,
        estado_id: 1,
        prioridad_id: 2
      };

      // ==================== CLIENTE ====================
      if (clienteMode === 'search' && clienteSeleccionado) {
        // Cliente existente - usar su ID
        ordenData.cliente_id = clienteSeleccionado.id;
      } else if (clienteMode === 'new') {
        // Cliente nuevo - enviar datos para crearlo
        ordenData.cliente = {
          nombreCompleto: formData.nombreCliente.trim(),
          telefono: formData.telefonoCliente.trim(),
          email: formData.emailCliente.trim() || null
        };
      }

      // ==================== VEHÍCULO ====================
      if (vehiculoMode === 'select' && vehiculoSeleccionado) {
        // Vehículo existente - usar su ID
        ordenData.vehiculo_id = vehiculoSeleccionado.id;
      } else if (vehiculoMode === 'new') {
        // Vehículo nuevo - enviar datos para crearlo
        ordenData.vehiculo_id = null; // Explícitamente null
        ordenData.vehiculo = {
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          anio: formData.anio ? parseInt(formData.anio) : null,
          placa: formData.placa.trim(),
          vin: formData.vin.trim() || null
        };

        // CRÍTICO: Asociar vehículo al cliente
        if (clienteSeleccionado) {
          // Si es cliente existente, asociar vehículo a ese cliente
          ordenData.vehiculo.cliente_id = clienteSeleccionado.id;
        }
        // Si es cliente nuevo, el backend debe crear cliente primero
        // y luego asociar el vehículo automáticamente
      }

      const response = await ordenesService.create(ordenData);

      if (response.success) {
        // Scroll al inicio para ver la alerta
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setAlert({ 
          show: true, 
          type: 'success', 
          message: 'Orden creada exitosamente - Formulario listo para nueva recepción' 
        });
        
        // Limpiar formulario después de 1.5 segundos
        setTimeout(() => {
          // Resetear estados
          setClienteSeleccionado(null);
          setVehiculoSeleccionado(null);
          setVehiculosCliente([]);
          setClienteMode('search');
          setVehiculoMode('new');
          setBusquedaCliente('');
          
          // Resetear formulario
          setFormData({
            nombreCliente: '',
            telefonoCliente: '',
            emailCliente: '',
            marca: '',
            modelo: '',
            anio: '',
            placa: '',
            vin: '',
            descripcionProblema: '',
            fechaRecepcion: new Date().toISOString().split('T')[0],
            horaRecepcion: new Date().toTimeString().slice(0, 5),
            fechaDiagnostico: '',
            horaDiagnostico: '',
            fechaEntrega: '',
            horaEntrega: '',
            archivos: []
          });
          setFileNames([]);
          
          // Mantener la alerta visible por 2 segundos más
          setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
          }, 2000);
        }, 1500);
      }

    } catch (error) {
      console.error('[RecepcionVehiculo] Order creation failed:', error.message);
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Error al crear la orden'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Registrar Nuevo Vehículo</h1>
          <p className={styles.subtitle}>Ingrese los datos del vehículo y problema reportado</p>
        </div>
      </div>

      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: '', message: '' })}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* DATOS DEL CLIENTE */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Datos del Cliente</h2>
            <div className={styles.modeButtons}>
              <button
                type="button"
                className={`${styles.modeBtn} ${clienteMode === 'search' ? styles.active : ''}`}
                onClick={() => { setClienteMode('search'); limpiarCliente(); }}
              >
                <Search size={18} />
                Buscar
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${clienteMode === 'new' ? styles.active : ''}`}
                onClick={() => { setClienteMode('new'); limpiarCliente(); }}
              >
                <Plus size={18} />
                Nuevo
              </button>
            </div>
          </div>

          {clienteMode === 'search' && (
            <>
              {!clienteSeleccionado ? (
                <div className={styles.searchContainer}>
                  <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o teléfono..."
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  {buscandoCliente && <div className={styles.searching}>Buscando...</div>}

                  {mostrarResultados && clientesBusqueda.length > 0 && (
                    <div className={styles.resultados}>
                      {clientesBusqueda.map(cliente => (
                        <div
                          key={cliente.id}
                          className={styles.resultadoItem}
                          onClick={() => seleccionarCliente(cliente)}
                        >
                          <User size={20} />
                          <div className={styles.resultadoInfo}>
                            <div className={styles.resultadoNombre}>{cliente.nombre_completo}</div>
                            <div className={styles.resultadoTel}>{cliente.telefono}</div>
                          </div>
                          <Check size={20} />
                        </div>
                      ))}
                    </div>
                  )}

                  {mostrarResultados && clientesBusqueda.length === 0 && !buscandoCliente && (
                    <div className={styles.noResultados}>No se encontraron clientes</div>
                  )}
                </div>
              ) : (
                <div className={styles.clienteSeleccionado}>
                  <div className={styles.clienteInfo}>
                    <User size={24} />
                    <div>
                      <div className={styles.clienteNombre}>{clienteSeleccionado.nombre_completo}</div>
                      <div className={styles.clienteTel}>{clienteSeleccionado.telefono}</div>
                    </div>
                  </div>
                  <button type="button" onClick={limpiarCliente} className={styles.btnCambiar}>
                    <X size={18} />
                    Cambiar
                  </button>
                </div>
              )}
            </>
          )}

          {clienteMode === 'new' && (
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <User size={16} />
                  Nombre Completo*
                </label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Phone size={16} />
                  Teléfono*
                </label>
                <input
                  type="tel"
                  name="telefonoCliente"
                  value={formData.telefonoCliente}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ej: 75123456"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* DATOS DEL VEHÍCULO */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Datos del Vehículo</h2>
            {clienteSeleccionado && vehiculosCliente.length > 0 && (
              <div className={styles.modeButtons}>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${vehiculoMode === 'select' ? styles.active : ''}`}
                  onClick={() => { setVehiculoMode('select'); limpiarVehiculo(); }}
                >
                  <Car size={18} />
                  Seleccionar
                </button>
                <button
                  type="button"
                  className={`${styles.modeBtn} ${vehiculoMode === 'new' ? styles.active : ''}`}
                  onClick={() => { setVehiculoMode('new'); limpiarVehiculo(); }}
                >
                  <Plus size={18} />
                  Nuevo
                </button>
              </div>
            )}
          </div>

          {/* Mensaje cuando cliente no tiene vehículos */}
          {clienteSeleccionado && vehiculosCliente.length === 0 && vehiculoMode === 'new' && (
            <div className={styles.infoMessage}>
              <Car size={20} />
              <p>Este cliente no tiene vehículos registrados. Registre un nuevo vehículo a su nombre:</p>
            </div>
          )}

          {/* Mensaje cuando es cliente nuevo */}
          {!clienteSeleccionado && clienteMode === 'new' && (
            <div className={styles.infoMessage}>
              <Car size={20} />
              <p>Registre el vehículo del nuevo cliente:</p>
            </div>
          )}

          {vehiculoMode === 'select' && vehiculosCliente.length > 0 && (
            <>
              {!vehiculoSeleccionado ? (
                <div className={styles.vehiculosLista}>
                  {vehiculosCliente.map(vehiculo => (
                    <div
                      key={vehiculo.id}
                      className={styles.vehiculoItem}
                      onClick={() => seleccionarVehiculo(vehiculo)}
                    >
                      <Car size={24} />
                      <div className={styles.vehiculoInfo}>
                        <div className={styles.vehiculoMarca}>{vehiculo.marca} {vehiculo.modelo}</div>
                        <div className={styles.vehiculoPlaca}>{vehiculo.placa} • {vehiculo.anio}</div>
                      </div>
                      <Check size={20} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.vehiculoSeleccionado}>
                  <div className={styles.vehiculoInfo}>
                    <Car size={24} />
                    <div>
                      <div className={styles.vehiculoMarca}>{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</div>
                      <div className={styles.vehiculoPlaca}>{vehiculoSeleccionado.placa} • {vehiculoSeleccionado.anio}</div>
                    </div>
                  </div>
                  <button type="button" onClick={limpiarVehiculo} className={styles.btnCambiar}>
                    <X size={18} />
                    Cambiar
                  </button>
                </div>
              )}
            </>
          )}

          {vehiculoMode === 'new' && (
            <>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Car size={16} />Marca*</label>
                  <input type="text" name="marca" value={formData.marca} onChange={handleChange} className={styles.input} placeholder="Ej: Toyota" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Car size={16} />Modelo*</label>
                  <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className={styles.input} placeholder="Ej: Corolla" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><Calendar size={16} />Año</label>
                  <input type="number" name="anio" value={formData.anio} onChange={handleChange} className={styles.input} placeholder="2019" min="1900" max={new Date().getFullYear() + 1} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}><FileText size={16} />Placa*</label>
                  <input type="text" name="placa" value={formData.placa} onChange={handleChange} className={styles.input} placeholder="ABC-1234" required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}><FileText size={16} />VIN</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleChange} className={styles.input} placeholder="Número de identificación" />
              </div>
            </>
          )}
        </div>

        {/* DESCRIPCIÓN */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Descripción del Problema</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}><FileText size={16} />Detalle*</label>
            <textarea name="descripcionProblema" value={formData.descripcionProblema} onChange={handleChange} className={styles.textarea} placeholder="Describa..." rows={5} required />
          </div>
        </div>

        {/* HORARIOS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><Clock size={20} />Horarios</h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Recepción:</h3>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha</label>
                <input type="date" name="fechaRecepcion" value={formData.fechaRecepcion} onChange={handleChange} className={styles.input} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hora</label>
                <input type="time" name="horaRecepcion" value={formData.horaRecepcion} onChange={handleChange} className={styles.input} required />
              </div>
            </div>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Diagnóstico Estimado:</h3>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha</label>
                <input type="date" name="fechaDiagnostico" value={formData.fechaDiagnostico} onChange={handleChange} className={styles.input} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hora</label>
                <input type="time" name="horaDiagnostico" value={formData.horaDiagnostico} onChange={handleChange} className={styles.input} required />
              </div>
            </div>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Entrega Estimada:</h3>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha</label>
                <input type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange} className={styles.input} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hora</label>
                <input type="time" name="horaEntrega" value={formData.horaEntrega} onChange={handleChange} className={styles.input} required />
              </div>
            </div>
          </div>
        </div>

        {/* ARCHIVOS */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Adjuntar Archivos</h2>
          <div className={styles.uploadArea}>
            <input type="file" id="fileInput" multiple accept="image/png,image/jpeg,image/jpg,application/pdf" onChange={handleFileChange} className={styles.fileInput} />
            <label htmlFor="fileInput" className={styles.uploadLabel}>
              <Upload size={48} />
              <p className={styles.uploadText}><strong>Subir archivos</strong></p>
              <p className={styles.uploadHint}>PNG, JPG, PDF hasta 10MB</p>
            </label>
          </div>

          {fileNames.length > 0 && (
            <div className={styles.fileList}>
              {fileNames.map((name, index) => (
                <div key={index} className={styles.fileItem}>
                  <FileText size={20} />
                  <span>{name}</span>
                  <button type="button" onClick={() => removeFile(index)} className={styles.removeFileBtn}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              <div className={styles.spinner} />
              Creando...
            </>
          ) : (
            <>
              <Send size={20} />
              Registrar y Crear Orden
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RecepcionVehiculo;