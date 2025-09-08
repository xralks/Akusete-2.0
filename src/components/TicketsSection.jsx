import React, { useEffect, useState, useMemo } from 'react';
import './TicketsSection.css';
import SearchBar from './SearchBar';
import TicketCard from './TicketCard';
import { supabase } from '../lib/supabaseClient';

const getDateRange = (filterType) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filterType) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    case 'thisWeek':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek, end: now };
    case 'lastWeek':
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      return { start: startOfLastWeek, end: endOfLastWeek };
    case 'thisMonth':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfMonth, end: now };
    case 'lastMonth':
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return { start: startOfLastMonth, end: endOfLastMonth };
    case 'last30Days':
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: thirtyDaysAgo, end: now };
    case 'all':
    default:
      return null;
  }
};

const filterTicketsByDate = (tickets, dateFilter) => {
  if (dateFilter === 'all' || !dateFilter) return tickets;
  const dateRange = getDateRange(dateFilter);
  if (!dateRange) return tickets;

  return tickets.filter(ticket => {
    const createdAt = new Date(ticket.created_at);
    return createdAt >= dateRange.start && createdAt <= dateRange.end;
  });
};

function TicketsSection() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      
      try {
        let query = supabase
          .from('tickets')
          .select(`
            *,
            categoria_problema ( id, nombre_categoria ),
            prioridad_ticket ( id, nombre_gravedad ),
            estado_ticket ( id, nombre_estado ),
            profiles ( id, username, full_name )
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        const { data: ticketsData, error } = await query;
        if (error) throw error;

        let ticketsWithTags = [];
        if (ticketsData && ticketsData.length > 0) {
          ticketsWithTags = await Promise.all(
            ticketsData.map(async (ticket) => {
              try {
                const { data: tagsData } = await supabase
                  .from('tickets_tags')
                  .select(` tags ( id, nombre_tags ) `)
                  .eq('id_ticket', ticket.id);
                
                return { ...ticket, tickets_tags: tagsData || [] };
              } catch {
                return { ...ticket, tickets_tags: [] };
              }
            })
          );
        }

        setTickets(ticketsWithTags);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Error al cargar los tickets: ' + error.message);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    if (searchTerm.trim()) {
      filtered = filtered.filter(ticket =>
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filterTicketsByDate(filtered, dateFilter);
  }, [tickets, searchTerm, dateFilter]);

  return (
    <section className="tickets-section">
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm}
        onDateFilterChange={setDateFilter}
      />
      <h2 className="tickets-title">Tickets en evaluación</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="tickets-list">
        {loading ? (
          <div className="loading"><p>Cargando tickets...</p></div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <p style={{ textAlign: 'center' }}>
            No se encontraron tickets que coincidan con los filtros.
          </p>
        )}
      </div>

      <div className="containerboton">
        <a className="btn-segundario" href="/tickets">
          Ver todos los tickets →
        </a>
      </div>
    </section>
  );
}

export default TicketsSection;
