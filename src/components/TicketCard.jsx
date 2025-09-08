import React from 'react';
import './TicketCard.css';

function TicketCard({ ticket }) {
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

  return (
    <div className="tarjeta-ticket">
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
  );
}

export default TicketCard;