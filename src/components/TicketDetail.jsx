import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './TicketDetail.css';

const TicketDetail = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetail();
      loadEstados();
      loadPrioridades();
    }
  }, [ticketId]);

  const loadTicketDetail = async () => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
            *,
            profiles!tickets_id_usuario_fkey(id, full_name, username, telefono),
            prioridad_ticket!tickets_id_prioridad_fkey(id, nombre_gravedad),
            estado_ticket!tickets_id_estado_fkey(id, nombre_estado),
            categoria_problema!tickets_id_categoria_fkey(id, nombre_categoria),
            tickets_tags(tags(nombre_tags))
            `)

      .eq('id', ticketId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Ticket no encontrado");
    setTicket(data);
  } catch (error) {
    console.error("Error cargando detalle del ticket:", error);
  } finally {
    setLoading(false);
  }
};


  const loadEstados = async () => {
    try {
      const { data, error } = await supabase
        .from('estado_ticket')
        .select('*')
        .order('id');

      if (error) throw error;
      setEstados(data || []);
    } catch (error) {
      console.error('Error cargando estados:', error);
    }
  };

  const loadPrioridades = async () => {
    try {
      const { data, error } = await supabase
        .from('prioridad_ticket')
        .select('*')
        .order('id');

      if (error) throw error;
      setPrioridades(data || []);
    } catch (error) {
      console.error('Error cargando prioridades:', error);
    }
  };

  const updateTicketStatus = async (newStatusId) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ id_estado: newStatusId })
        .eq('id', ticketId);

      if (error) throw error;
      loadTicketDetail();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const updateTicketPriority = async (newPriorityId) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ id_prioridad: newPriorityId })
        .eq('id', ticketId);

      if (error) throw error;
      loadTicketDetail();
    } catch (error) {
      console.error('Error actualizando prioridad:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Alto': '#fed7d7',
      'Medio': '#feebc8',
      'Bajo': '#c6f6d5'
    };
    return colors[priority] || '#e2e8f0';
  };

  const getPriorityTextColor = (priority) => {
    const colors = {
      'Alto': '#c53030',
      'Medio': '#c05621',
      'Bajo': '#22543d'
    };
    return colors[priority] || '#4a5568';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="ticket-detail-overlay" onClick={onClose}>
        <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-overlay" onClick={onClose}>
        <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="error-container">
            <h2>Ticket no encontrado</h2>
            <button onClick={onClose} className="btn-back">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-overlay" onClick={onClose}>
      <div className="ticket-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-detail-header">
          <h1>Ticket #{ticket.id}</h1>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="ticket-detail-content">
          {/* Información principal */}
          <div className="detail-card main-info">
            <h2 className="card-title">Información del Ticket</h2>
            
            <div className="info-row">
              <label>Título:</label>
              <h3>{ticket.titulo || 'Sin título'}</h3>
            </div>

            <div className="info-row">
              <label>Descripción:</label>
              <p className="description-modal">{ticket.descripcion || 'Sin descripción'}</p>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Categoría:</label>
                <span className="badge category-badge-modal">
                  📁 {ticket.categoria_problema?.nombre_categoria || 'Sin categoría'}
                </span>
              </div>

              <div className="info-item">
                <label>Prioridad:</label>
                <select 
                  value={ticket.id_prioridad}
                  onChange={(e) => updateTicketPriority(e.target.value)}
                  className="select-priority"
                  style={{
                    backgroundColor: getPriorityColor(ticket.prioridad_ticket?.nombre_gravedad),
                    color: getPriorityTextColor(ticket.prioridad_ticket?.nombre_gravedad)
                  }}
                >
                  {prioridades.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_gravedad}</option>
                  ))}
                </select>
              </div>

              <div className="info-item">
                <label>Estado:</label>
                <select 
                  value={ticket.id_estado}
                  onChange={(e) => updateTicketStatus(e.target.value)}
                  className="select-status"
                >
                  {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre_estado}</option>
                  ))}
                </select>
              </div>

              <div className="info-item">
                <label>Fecha de creación:</label>
                <span>📅 {formatDate(ticket.created_at)}</span>
              </div>
            </div>

            {ticket.tickets_tags && ticket.tickets_tags.length > 0 && (
              <div className="info-row">
                <label>Tags:</label>
                <div className="tags-container">
                  {ticket.tickets_tags.map((tag, index) => (
                    <span key={index} className="tag">
                      🏷️ {tag.tags?.nombre_tags}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información del usuario */}
          <div className="detail-card user-info">
            <h2 className="card-title">Usuario Solicitante</h2>
            
            <div className="user-avatar-modal">
              <div className="avatar-circle-modal">
                {ticket.profiles?.full_name?.charAt(0) || ticket.profiles?.username?.charAt(0) || '?'}
              </div>
            </div>

            <div className="user-details">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{ticket.profiles?.full_name || 'N/A'}</span>
              </div>

              <div className="info-item">
                <label>Usuario:</label>
                <span>@{ticket.profiles?.username || 'N/A'}</span>
              </div>

              {ticket.profiles?.email && (
                <div className="info-item">
                  <label>Email:</label>
                  <span>{ticket.profiles.email}</span>
                </div>
              )}

              {ticket.profiles?.telefono && (
                <div className="info-item">
                  <label>Teléfono:</label>
                  <span>{ticket.profiles.telefono}</span>
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="detail-card actions-card">
            <h2 className="card-title">Acciones Rápidas</h2>
            
            <div className="action-buttons">
              <button 
                className="action-btn resolve"
                onClick={() => {
                  const resolvedStatus = estados.find(e => e.nombre_estado === 'Activo');
                  if (resolvedStatus) updateTicketStatus(resolvedStatus.id);
                }}
              >
                ✅ Marcar como Resuelto
              </button>
              
              <button 
                className="action-btn inprogress"
                onClick={() => {
                  const inProgressStatus = estados.find(e => e.nombre_estado === 'En progreso');
                  if (inProgressStatus) updateTicketStatus(inProgressStatus.id);
                }}
              >
                🔄 En Progreso
              </button>
              
              <button 
                className="action-btn close"
                onClick={() => {
                  const closedStatus = estados.find(e => e.nombre_estado === 'Cerrado');
                  if (closedStatus) updateTicketStatus(closedStatus.id);
                }}
              >
                🔒 Cerrar Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;