import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './TicketsLista.css';

const TicketsLista = ({ filters = {} }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          categoria_problema (
            id,
            nombre_categoria
          ),
          prioridad_ticket (
            id,
            nombre_gravedad
          ),
          estado_ticket (
            id,
            nombre_estado
          ),
          profiles (
            id,
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.categoria) {
        query = query.eq('id_categoria', filters.categoria);
      }
      if (filters.prioridad) {
        query = query.eq('id_prioridad', filters.prioridad);
      }
      if (filters.estado) {
        query = query.eq('id_estado', filters.estado);
      }
      if (filters.busqueda) {
        query = query.or(`titulo.ilike.%${filters.busqueda}%,descripcion.ilike.%${filters.busqueda}%`);
      }

      const { data: ticketsData, error } = await query;

      if (error) throw error;

      let ticketsWithTags = [];
      
      if (ticketsData && ticketsData.length > 0) {
        ticketsWithTags = await Promise.all(
          ticketsData.map(async (ticket) => {
            try {
              const { data: tagsData, error: tagsError } = await supabase
                .from('tickets_tags')
                .select(`
                  tags (
                    id,
                    nombre_tags
                  )
                `)
                .eq('id_ticket', ticket.id);
              
              if (tagsError) {
                console.error(`Error loading tags for ticket ${ticket.id}:`, tagsError);
              }
              
              return {
                ...ticket,
                tickets_tags: tagsData || []
              };
            } catch (tagError) {
              console.error(`Error loading tags for ticket ${ticket.id}:`, tagError);
              return {
                ...ticket,
                tickets_tags: []
              };
            }
          })
        );
      }

      if (filters.tags) {
        ticketsWithTags = ticketsWithTags.filter(ticket => 
          ticket.tickets_tags.some(ticketTag => 
            ticketTag.tags?.id === filters.tags
          )
        );
      }

      setTickets(ticketsWithTags);

    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Error al cargar los tickets: ' + error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (nombreGravedad) => {
    if (!nombreGravedad) return '#9CA3AF';
    
    const nombre = nombreGravedad.toLowerCase();
    if (nombre.includes('baja') || nombre.includes('low')) return '#10B981';
    else if (nombre.includes('media') || nombre.includes('medium')) return '#F59E0B';
    else if (nombre.includes('alta') || nombre.includes('high')) return '#EF4444';
    else if (nombre.includes('crítica') || nombre.includes('urgent')) return '#8B5CF6';
    
    return '#9CA3AF';
  };

  const getStatusColor = (nombreEstado) => {
    if (!nombreEstado) return '#9CA3AF';
    
    const nombre = nombreEstado.toLowerCase();
    if (nombre.includes('abierto') || nombre.includes('open') || nombre.includes('nuevo')) return '#10B981';
    else if (nombre.includes('en progreso') || nombre.includes('progress')) return '#F59E0B';
    else if (nombre.includes('cerrado') || nombre.includes('closed') || nombre.includes('resuelto')) return '#6B7280';
    else if (nombre.includes('pendiente') || nombre.includes('waiting')) return '#8B5CF6';
    
    return '#9CA3AF';
  };

  const getUserDisplayName = (profile) => {
    if (!profile) return 'Usuario desconocido';
    
    if (profile.full_name && profile.full_name.trim()) {
      return profile.full_name;
    } else if (profile.username && profile.username.trim()) {
      return profile.username;
    } else {
      return 'Usuario sin nombre';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="seccion-lista-tickets">
        <div className="containter-listado-tickets">
          <div className="cargando-tickets">
            <div className="spinner"></div>
            <p>Cargando tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seccion-lista-tickets">
      <div className="containter-listado-tickets">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <div className="no-tickets">
              <p>No se encontraron tickets que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="tarjeta-ticket">
                <div className="tarjeta-ticket-header">
                  <h3 className="ticket-titulo">{ticket.titulo}</h3>
                  <div className="ticket-badges">
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.prioridad_ticket?.nombre_gravedad) }}
                    >
                      {ticket.prioridad_ticket?.nombre_gravedad || 'Sin prioridad'}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.estado_ticket?.nombre_estado) }}
                    >
                      {ticket.estado_ticket?.nombre_estado || 'Sin estado'}
                    </span>
                  </div>
                </div>

                <div className="ticket-description">
                  <p>{ticket.descripcion}</p>
                </div>

                <div className="ticket-meta">
                  <div className="meta-item">
                    <span className="meta-label">Categoría:</span>
                    <span className="category-badge">
                      {ticket.categoria_problema?.nombre_categoria || 'Sin categoría'}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Creado por:</span>
                    <span className="meta-value">
                      {getUserDisplayName(ticket.profiles)}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Fecha:</span>
                    <span className="meta-value">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>

                  {ticket.tickets_tags && ticket.tickets_tags.length > 0 && (
                    <div className="meta-item tags-item">
                      <span className="meta-label">Tags:</span>
                      <div className="tags-container">
                        {ticket.tickets_tags.map((ticketTag, index) => (
                          <span key={ticketTag.tags?.id || index} className="tag">
                            #{ticketTag.tags?.nombre_tags || 'Tag sin nombre'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {tickets.length > 0 && (
          <div className="tickets-summary">
            <p>Mostrando {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsLista;