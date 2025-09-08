import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './CrearTicket-Comp.css';

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    id_categoria: '',
    id_prioridad: '',
    id_usuario: user?.id || '',
    id_tags: [],
    dueDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
   const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Cargar datos desde la base de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar usuarios
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .order('full_name');
        if (usersData) setUsers(usersData);

        // Cargar categorías
        const { data: categoriasData } = await supabase
          .from('categoria_problema')
          .select('id, nombre_categoria')
          .order('nombre_categoria');
        if (categoriasData) setCategorias(categoriasData);

        // Cargar prioridades
        const { data: prioridadesData } = await supabase
          .from('prioridad_ticket')
          .select('id, nombre_gravedad')
          .order('id');
        if (prioridadesData) setPrioridades(prioridadesData);

        // Cargar estados
        const { data: estadosData } = await supabase
          .from('estado_ticket')
          .select('id, nombre_estado')
          .order('id');
        if (estadosData) setEstados(estadosData);

        // Cargar tipos de usuario
        const { data: tiposData } = await supabase
          .from('tipo_usuario')
          .select('id, nombre_tipo_usuario')
          .order('nombre_tipo_usuario');
        if (tiposData) setTiposUsuario(tiposData);

        // Cargar tags
        const { data: tagsData } = await supabase
          .from('tags')
          .select('id, nombre_tags')
          .order('nombre_tags');
        if (tagsData) setTags(tagsData);

      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejo especial para tags (multi-select)
    if (name === 'id_tags') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!formData.id_categoria) {
      newErrors.id_categoria = 'Selecciona una categoría';
    }
    
    if (!formData.id_prioridad) {
      newErrors.id_prioridad = 'Selecciona una prioridad';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que el usuario esté autenticado
    if (!user || !user.id) {
      setErrors({ submit: 'Error al crear el ticket: Por favor inicia sesión.' });
      return;
    }
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Verificar que tengamos estados disponibles
    if (estados.length === 0) {
      setErrors({ submit: 'Error: No se pudieron cargar los estados disponibles.' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Encontrar el estado inicial (generalmente "Abierto", "Nuevo", "Pendiente", etc.)
      const estadoInicial = estados.find(estado => 
        estado.nombre_estado.toLowerCase().includes('abierto') ||
        estado.nombre_estado.toLowerCase().includes('nuevo') ||
        estado.nombre_estado.toLowerCase().includes('open') ||
        estado.nombre_estado.toLowerCase().includes('pendiente')
      ) || estados[0]; // Si no encuentra ninguno específico, usa el primero

      // Preparar datos del ticket
      const ticketData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        id_categoria: formData.id_categoria, // UUID como string
        id_usuario: user.id, // Ya debería ser UUID
        id_prioridad: formData.id_prioridad, // UUID como string
        id_estado: estadoInicial.id, // UUID del estado inicial
        created_at: new Date().toISOString()
      };

      console.log('Datos a insertar:', ticketData); // Para debugging

      // Insertar el ticket
      const { data: ticketResult, error: ticketError } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();
      
      if (ticketError) {
        console.error('Error al insertar ticket:', ticketError);
        throw ticketError;
      }

      console.log('Ticket creado:', ticketResult); // Para debugging
      
      // Si hay tags seleccionados, insertarlos en tickets_tags
      if (formData.id_tags.length > 0 && ticketResult) {
        const ticketTagsData = formData.id_tags.map(tagId => ({
          id_ticket: ticketResult.id,
          id_tags: tagId // Ya es UUID como string
        }));
        
        console.log('Tags a insertar:', ticketTagsData); // Para debugging
        
        const { error: tagsError } = await supabase
          .from('tickets_tags')
          .insert(ticketTagsData);
        
        if (tagsError) {
          console.warn('Error al insertar tags:', tagsError);
          // No hacer throw aquí porque el ticket ya se creó exitosamente
        }
      }
      
      alert('¡Ticket creado exitosamente!');
      navigate('/');
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrors({ 
        submit: `Error al crear el ticket: ${error.message || 'Inténtalo nuevamente.'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = () => {
    const prioridad = prioridades.find(p => p.id === formData.id_prioridad);
    if (!prioridad) return { nombre_gravedad: 'Sin prioridad', color: '#9CA3AF' };
    
    // Asignar colores según el nombre de la gravedad
    let color = '#9CA3AF';
    const nombre = prioridad.nombre_gravedad.toLowerCase();
    
    if (nombre.includes('baja') || nombre.includes('low')) color = '#10B981';
    else if (nombre.includes('media') || nombre.includes('medium')) color = '#F59E0B';
    else if (nombre.includes('alta') || nombre.includes('high')) color = '#EF4444';
    else if (nombre.includes('crítica') || nombre.includes('urgent')) color = '#8B5CF6';
    
    return { ...prioridad, color };
  };

  const getCategoryName = () => {
    if (!formData.id_categoria) return 'Sin categoría';
    const categoria = categorias.find(c => c.id === formData.id_categoria);
    return categoria ? categoria.nombre_categoria : 'Sin categoría';
  };

  const getSelectedTags = () => {
    if (!formData.id_tags || formData.id_tags.length === 0) return [];
    return tags.filter(tag => formData.id_tags.includes(tag.id));
  };

  const getFilteredTags = () => {
    if (!tagSearchTerm.trim()) return tags;
    return tags.filter(tag =>
      tag.nombre_tags.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  };

  const getUserDisplayName = () => {
    if (!user) return 'Usuario';
    if (profile?.username?.trim()) return profile.username;
    if (profile?.full_name?.trim()) return profile.full_name;
    if (user.user_metadata?.full_name?.trim()) return user.user_metadata.full_name;
    if (user.user_metadata?.username?.trim()) return user.user_metadata.username;
    if (user.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) {
      alert('Por favor ingresa un nombre para el tag');
      return;
    }

    // Verificar que el tag no exista ya
    const existingTag = tags.find(tag => 
      tag.nombre_tags.toLowerCase() === newTagName.trim().toLowerCase()
    );
    
    if (existingTag) {
      alert('Este tag ya existe');
      return;
    }

    setAddingTag(true);
    
    try {
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert([{ nombre_tags: newTagName.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Agregar el nuevo tag a la lista
      setTags(prev => [...prev, newTag]);
      
      // Seleccionar automáticamente el nuevo tag
      setFormData(prev => ({
        ...prev,
        id_tags: [...prev.id_tags, newTag.id]
      }));

      // Limpiar el input
      setNewTagName('');
      
      // También limpiar el buscador para mostrar todos los tags incluyendo el nuevo
      setTagSearchTerm('');
      
      alert('Tag creado exitosamente');
      
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Error al crear el tag: ' + (error.message || 'Inténtalo nuevamente'));
    } finally {
      setAddingTag(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-container">
        <div className="page-header">
          <h1>Crear Nuevo Ticket</h1>
          <p>Completa el formulario para crear un nuevo ticket de soporte</p>
        </div>

        <div className="ticket-layout">
          {/* Formulario */}
          <div className="ticket-form-section">
            <div className="form-container">
              <div className="form-group-ticket">
                <label htmlFor="titulo">Título del Ticket *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={errors.titulo ? 'error' : ''}
                  placeholder="Ej: Error en el sistema de login"
                />
                {errors.titulo && (
                  <span className="error-message">{errors.titulo}</span>
                )}
              </div>

              <div className="form-group-ticket">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={errors.descripcion ? 'error' : ''}
                  placeholder="Describe detalladamente el problema o solicitud..."
                  rows={4}
                />
                {errors.descripcion && (
                  <span className="error-message">{errors.descripcion}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group-ticket">
                  <label htmlFor="id_categoria">Categoría *</label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleChange}
                    className={errors.id_categoria ? 'error' : ''}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre_categoria}
                      </option>
                    ))}
                  </select>
                  {errors.id_categoria && (
                    <span className="error-message">{errors.id_categoria}</span>
                  )}
                </div>

                <div className="form-group-ticket">
                  <label htmlFor="id_prioridad">Prioridad *</label>
                  <select
                    id="id_prioridad"
                    name="id_prioridad"
                    value={formData.id_prioridad}
                    onChange={handleChange}
                    className={errors.id_prioridad ? 'error' : ''}
                  >
                    <option value="">Seleccionar prioridad</option>
                    {prioridades.map(prioridad => (
                      <option key={prioridad.id} value={prioridad.id}>
                        {prioridad.nombre_gravedad}
                      </option>
                    ))}
                  </select>
                  {errors.id_prioridad && (
                    <span className="error-message">{errors.id_prioridad}</span>
                  )}
                </div>
              </div>

              <div className="form-group-ticket">
                <label htmlFor="id_tags">Tags (mantén Ctrl para seleccionar múltiples)</label>
                
                {/* Buscador de tags */}
                <div className="tag-search-container" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Buscar tags existentes..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {tagSearchTerm && (
                    <small style={{ color: '#6B7280', fontSize: '12px' }}>
                      Mostrando {getFilteredTags().length} de {tags.length} tags
                    </small>
                  )}
                </div>
                
                <select
                  id="id_tags"
                  name="id_tags"
                  multiple
                  value={formData.id_tags}
                  onChange={handleChange}
                  className="tags-select"
                  size={6}
                >
                  {getFilteredTags().map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.nombre_tags}
                    </option>
                  ))}
                </select>
                
                {getFilteredTags().length === 0 && tagSearchTerm && (
                  <small style={{ color: '#EF4444', fontSize: '12px' }}>
                    No se encontraron tags que coincidan con "{tagSearchTerm}"
                  </small>
                )}
                
                <small className="help-text">
                  Mantén presionada la tecla Ctrl (Cmd en Mac) para seleccionar múltiples tags
                </small>
                
                {/* Sección para crear nuevo tag */}
                <div className="new-tag-section" style={{ marginTop: '15px' }}>
                  <label htmlFor="newTag">Crear nuevo tag:</label>
                  <div className="new-tag-input-group" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <input
                      type="text"
                      id="newTag"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Nombre del nuevo tag"
                      style={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddNewTag}
                      disabled={addingTag || !newTagName.trim()}
                      className="add-tag-button"
                    >
                      {addingTag ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                  <small className="help-text" style={{ color: '#6B7280' }}>
                    El nuevo tag se agregará automáticamente a tu selección
                  </small>
                </div>
              </div>

              {errors.submit && (
                <div className="error-banner">
                  {errors.submit}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'Creando ticket...' : 'Crear Ticket'}
              </button>
            </div>
          </div>

          {/* Vista previa */}
          <div className="ticket-preview-section">
            <h2>Vista Previa del Ticket</h2>
            
            <div className="ticket-preview">
              <div className="ticket-header">
                <h3>{formData.titulo || 'Título del ticket...'}</h3>
                <div className="ticket-badges">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityConfig().color }}
                  >
                    {getPriorityConfig().nombre_gravedad || 'Sin prioridad'}
                  </span>
                  {formData.id_categoria && (
                    <span className="category-badge">
                      {getCategoryName()}
                    </span>
                  )}
                </div>
              </div>

              <div className="ticket-description">
                <h4>Descripción:</h4>
                <p>{formData.descripcion || 'Descripción del ticket...'}</p>
              </div>

              <div className="ticket-details">
                <div className="detail-item">
                  <span className="detail-label">Creado por:</span>
                  <span className="detail-value">{getUserDisplayName()}</span>
                </div>
              </div>

              {getSelectedTags().length > 0 && (
                <div className="ticket-tags">
                  <span className="detail-label">Tags:</span>
                  <div className="tags-container">
                    {getSelectedTags().map((tag) => (
                      <span key={tag.id} className="tag">
                        #{tag.nombre_tags}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="ticket-footer">
                <p>Estado: <span className="status-open">Abierto</span></p>
                <p>Creado: {new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;