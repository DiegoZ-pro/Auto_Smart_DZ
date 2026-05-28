// ============================================================================
// RECEPCIÓN DE LABORATORIO - TALLER
// Formulario con búsqueda de clientes - DISEÑO EXACTO A RECEPCIÓN VEHÍCULO
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, FileText, Calendar, Clock, Upload, Send,
  Search, Plus, X, Check
} from 'lucide-react';
import Alert from '../../../components/common/Alert/Alert';
import { ordenesService } from '../../../services/ordenesService';
import clientesService from '../../../services/clientesService';
import styles from './RecepcionLaboratorio.module.css';

const RecepcionLaboratorio = () => {
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

  // Estados - Formulario
  const [formData, setFormData] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
    tipoPieza: '',
    marcaPieza: '',
    modeloOrigen: '',
    numeroParte: '',
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

  // Búsqueda de clientes
  useEffect(() => {
    const buscarClientes = async () => {
      if (busquedaCliente.length >= 2) {
        try {
          setBuscandoCliente(true);
          const response = await clientesService.getAll({ search: busquedaCliente });
          setClientesBusqueda(response.data || []);
          setMostrarResultados(true);
        } catch (error) {
          console.error('Error al buscar clientes:', error);
          setClientesBusqueda([]);
        } finally {
          setBuscandoCliente(false);
        }
      } else {
        setClientesBusqueda([]);
        setMostrarResultados(false);
      }
    };

    const timeoutId = setTimeout(buscarClientes, 300);
    return () => clearTimeout(timeoutId);
  }, [busquedaCliente]);

  // Seleccionar cliente
  const handleSelectCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombre_completo);
    setMostrarResultados(false);
    
    setFormData(prev => ({
      ...prev,
      nombreCliente: cliente.nombre_completo,
      telefonoCliente: cliente.telefono || '',
      emailCliente: cliente.email || ''
    }));
  };

  // Limpiar cliente seleccionado
  const limpiarCliente = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setClientesBusqueda([]);
    setMostrarResultados(false);
  };

  // Cambiar modo cliente
  const handleClienteModeChange = (mode) => {
    setClienteMode(mode);
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setClientesBusqueda([]);
    setMostrarResultados(false);
    setFormData(prev => ({
      ...prev,
      nombreCliente: '',
      telefonoCliente: '',
      emailCliente: ''
    }));
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
      const maxSize = 10 * 1024 * 1024;
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, ...validFiles]
    }));

    setFileNames(prev => [
      ...prev,
      ...validFiles.map(f => f.name)
    ]);
  };

  // Eliminar archivo
  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index)
    }));
    setFileNames(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulario
  const validarFormulario = () => {
    if (clienteMode === 'new') {
      if (!formData.nombreCliente.trim()) {
        setAlert({ show: true, type: 'error', message: 'El nombre del cliente es obligatorio' });
        return false;
      }
      if (!formData.telefonoCliente.trim()) {
        setAlert({ show: true, type: 'error', message: 'El teléfono del cliente es obligatorio' });
        return false;
      }
    } else {
      if (!clienteSeleccionado) {
        setAlert({ show: true, type: 'error', message: 'Debe seleccionar un cliente' });
        return false;
      }
    }

    if (!formData.tipoPieza.trim()) {
      setAlert({ show: true, type: 'error', message: 'El tipo de pieza es obligatorio' });
      return false;
    }

    if (!formData.descripcionProblema.trim()) {
      setAlert({ show: true, type: 'error', message: 'Las observaciones son obligatorias' });
      return false;
    }

    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const ordenData = {
        tipo_orden_id: 2,
        descripcion_problema: formData.descripcionProblema,
        fecha_recepcion: formData.fechaRecepcion,
        hora_recepcion: formData.horaRecepcion,
        fecha_diagnostico: formData.fechaDiagnostico || null,
        hora_diagnostico: formData.horaDiagnostico || null,
        fecha_entrega_estimada: formData.fechaEntrega || null,
        hora_entrega_estimada: formData.horaEntrega || null,
        tipo_pieza: formData.tipoPieza,
        marca_pieza: formData.marcaPieza || null,
        modelo_origen: formData.modeloOrigen || null,
        numero_parte: formData.numeroParte || null
      };

      if (clienteMode === 'search' && clienteSeleccionado) {
        ordenData.cliente_id = clienteSeleccionado.id;
      } else {
        ordenData.cliente = {
          nombreCompleto: formData.nombreCliente,
          telefono: formData.telefonoCliente,
          email: formData.emailCliente || null
        };
      }

      const response = await ordenesService.create(ordenData);

      if (response.success) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setAlert({ 
          show: true, 
          type: 'success', 
          message: 'Orden de laboratorio creada exitosamente - Formulario listo para nueva recepción' 
        });
        
        setTimeout(() => {
          setClienteSeleccionado(null);
          setClienteMode('search');
          setBusquedaCliente('');
          setClientesBusqueda([]);
          
          setFormData({
            nombreCliente: '',
            telefonoCliente: '',
            emailCliente: '',
            tipoPieza: '',
            marcaPieza: '',
            modeloOrigen: '',
            numeroParte: '',
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
          
          setTimeout(() => {
            setAlert({ show: false, type: '', message: '' });
          }, 2000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ 
        show: true, 
        type: 'error', 
        message: error.response?.data?.message || 'Error al crear la orden de laboratorio' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Recepción de Piezas (Laboratorio)</h1>
          <p className={styles.subtitle}>Registre piezas sueltas para diagnóstico y reparación en laboratorio.</p>
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
                    onClick={() => handleClienteModeChange('search')}
                  >
                    <Search size={18} />
                    Buscar
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${clienteMode === 'new' ? styles.active : ''}`}
                    onClick={() => handleClienteModeChange('new')}
                  >
                    <Plus size={18} />
                    Nuevo
                  </button>
                </div>
              </div>

              {clienteMode === 'search' ? (
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
                              onClick={() => handleSelectCliente(cliente)}
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
              ) : (
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <User size={16} />
                      Nombre Completo Cliente*
                    </label>
                    <input
                      type="text"
                      name="nombreCliente"
                      className={styles.input}
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombreCliente}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <Phone size={16} />
                      Teléfono Cliente*
                    </label>
                    <input
                      type="tel"
                      name="telefonoCliente"
                      className={styles.input}
                      placeholder="Ej: 75123456"
                      value={formData.telefonoCliente}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DATOS DE LA PIEZA */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Datos de la Pieza</h2>
              
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Pieza*</label>
                  <input
                    type="text"
                    name="tipoPieza"
                    className={styles.input}
                    placeholder="Ej: Bomba hidráulica, Cremallera"
                    value={formData.tipoPieza}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Marca de la Pieza</label>
                  <input
                    type="text"
                    name="marcaPieza"
                    className={styles.input}
                    placeholder="Ej: Bosch, TRW"
                    value={formData.marcaPieza}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Modelo Vehículo Origen</label>
                  <input
                    type="text"
                    name="modeloOrigen"
                    className={styles.input}
                    placeholder="Ej: Toyota Hilux 2015"
                    value={formData.modeloOrigen}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Número de Parte (Si aplica)</label>
                  <input
                    type="text"
                    name="numeroParte"
                    className={styles.input}
                    placeholder="Código de la pieza"
                    value={formData.numeroParte}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FileText size={16} />
                  Detalle del problema o servicio solicitado*
                </label>
                <textarea
                  name="descripcionProblema"
                  className={styles.textarea}
                  placeholder="Describa..."
                  value={formData.descripcionProblema}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* HORARIOS */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Horarios de Gestión</h2>
              
              <div className={styles.subsectionTitle}>Recepción Actual:</div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={16} />
                    Fecha Recepción
                  </label>
                  <input
                    type="date"
                    className={styles.input}
                    value={formData.fechaRecepcion}
                    readOnly
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Hora Recepción
                  </label>
                  <input
                    type="time"
                    name="horaRecepcion"
                    className={styles.input}
                    value={formData.horaRecepcion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.subsectionTitle}>Diagnóstico Estimado:</div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={16} />
                    Fecha Est. Diagnóstico
                  </label>
                  <input
                    type="date"
                    name="fechaDiagnostico"
                    className={styles.input}
                    value={formData.fechaDiagnostico}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Hora Est. Diagnóstico
                  </label>
                  <input
                    type="time"
                    name="horaDiagnostico"
                    className={styles.input}
                    value={formData.horaDiagnostico}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.subsectionTitle}>Entrega Estimada:</div>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={16} />
                    Fecha Est. Entrega
                  </label>
                  <input
                    type="date"
                    name="fechaEntrega"
                    className={styles.input}
                    value={formData.fechaEntrega}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Hora Est. Entrega
                  </label>
                  <input
                    type="time"
                    name="horaEntrega"
                    className={styles.input}
                    value={formData.horaEntrega}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.infoBox}>
                Estos horarios son referenciales y se confirmarán tras la revisión técnica.
              </div>
            </div>

            {/* ADJUNTAR ARCHIVOS */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Adjuntar Imágenes/Documentos</h2>
              
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="fileInput"
                  className={styles.fileInput}
                  accept="image/png,image/jpeg,image/jpg,video/mp4"
                  multiple
                  onChange={handleFileChange}
                />
                <label htmlFor="fileInput" className={styles.uploadLabel}>
                  <Upload size={48} className={styles.uploadIcon} />
                  <p className={styles.uploadText}>
                    <strong>Subir archivos</strong> o arrastrar y soltar
                  </p>
                  <p className={styles.uploadHint}>PNG, JPG, MP4 hasta 10MB cada uno</p>
                </label>
              </div>

              {fileNames.length > 0 && (
                <div className={styles.fileList}>
                  {fileNames.map((name, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className={styles.removeFile}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              <Send size={20} />
              {loading ? 'Registrando...' : 'Registrar Pieza y Crear Orden de Recepción'}
            </button>
          </form>
        </div>
      );
    };
    
    export default RecepcionLaboratorio;