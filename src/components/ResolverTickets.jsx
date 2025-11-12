import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import TicketDetail from './TicketDetail';
import './ResolverTickets.css';

const ResolverTickets = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tickets, setTickets] = useState([]);
  const [activeTickets, setActiveTickets] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    percentage: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [priorityStats, setPriorityStats] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const { user } = useAuth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, currentMonth, currentYear, selectedFilter, selectedCategory]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTickets(),
        loadUsersCount(),
        loadStatsData(),
        loadTicketStats(),
        loadCategoryStats(),
        loadPriorityStats()
      ]);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          profiles!tickets_id_usuario_fkey(id, full_name, username, telefono),
          prioridad_ticket!tickets_id_prioridad_fkey(id, nombre_gravedad),
          estado_ticket!tickets_id_estado_fkey(id, nombre_estado),
          categoria_problema!tickets_id_categoria_fkey(id, nombre_categoria),
          tickets_tags!inner(tags!inner(nombre_tags))
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'active') {
          query = query.not('estado_ticket.nombre_estado', 'in', '(Resuelto,Cerrado)');
        } else if (selectedFilter === 'urgent') {
          query = query.eq('prioridad_ticket.nombre_gravedad', 'Alto');
        }
      }

      if (selectedCategory !== 'all') {
        query = query.eq('categoria_problema.nombre_categoria', selectedCategory);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setTickets(data || []);
      
      // Filtrar tickets activos
      const active = data?.filter(ticket => 
        ticket.estado_ticket?.nombre_estado && 
        !['Resuelto', 'Cerrado'].includes(ticket.estado_ticket.nombre_estado)
      ) || [];
      
      setActiveTickets(active);
    } catch (error) {
      console.error('Error cargando tickets:', error);
    }
  };

  const loadUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error cargando cantidad de usuarios:', error);
    }
  };

  const loadStatsData = async () => {
    try {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const statsPromises = last7Days.map(async (date) => {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const { count, error } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);

        if (error) throw error;
        return { date: date.toISOString().split('T')[0], count: count || 0 };
      });

      const results = await Promise.all(statsPromises);
      setStatsData(results);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadTicketStats = async () => {
    try {
      const { data: allTickets, error } = await supabase
        .from('tickets')
        .select('estado_ticket!inner(nombre_estado)');

      if (error) throw error;

      const total = allTickets?.length || 0;
      const resolved = allTickets?.filter(ticket => 
        ['Resuelto', 'Cerrado'].includes(ticket.estado_ticket?.nombre_estado)
      ).length || 0;
      const active = total - resolved;
      const percentage = total > 0 ? Math.round((active / total) * 100) : 0;

      setTicketStats({
        total,
        active,
        resolved,
        percentage
      });
    } catch (error) {
      console.error('Error cargando estadísticas de tickets:', error);
    }
  };

  const loadCategoryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          categoria_problema!inner(nombre_categoria)
        `);

      if (error) throw error;

      // Agrupar por categoría
      const categoryCount = {};
      data?.forEach(ticket => {
        const category = ticket.categoria_problema?.nombre_categoria;
        if (category) {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      const categoryArray = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCategoryStats(categoryArray);
    } catch (error) {
      console.error('Error cargando estadísticas por categoría:', error);
    }
  };

  const loadPriorityStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          prioridad_ticket!inner(nombre_gravedad)
        `);

      if (error) throw error;

      // Agrupar por prioridad
      const priorityCount = {};
      data?.forEach(ticket => {
        const priority = ticket.prioridad_ticket?.nombre_gravedad;
        if (priority) {
          priorityCount[priority] = (priorityCount[priority] || 0) + 1;
        }
      });

      const priorityArray = Object.entries(priorityCount)
        .map(([name, count]) => ({ name, count }));

      setPriorityStats(priorityArray);
    } catch (error) {
      console.error('Error cargando estadísticas por prioridad:', error);
    }
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
      loadTicketsByDate(day);
    }
  };

  const loadTicketsByDate = async (day) => {
    try {
      const selectedDateTime = new Date(currentYear, currentMonth, day);
      const startOfDay = new Date(selectedDateTime.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(selectedDateTime.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles!tickets_id_usuario_fkey(full_name, username),
          prioridad_ticket!tickets_id_prioridad_fkey(nombre_gravedad),
          estado_ticket!tickets_id_estado_fkey(nombre_estado),
          categoria_problema!tickets_id_categoria_fkey(nombre_categoria)
        `)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`Tickets para el ${day}/${currentMonth + 1}/${currentYear}:`, data);
    } catch (error) {
      console.error('Error cargando tickets por fecha:', error);
    }
  };

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const startDay = getFirstDayOfMonth(currentMonth, currentYear);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() && 
                     currentMonth === new Date().getMonth() && 
                     currentYear === new Date().getFullYear();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${selectedDate === day ? 'active' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const getChartPoints = () => {
    if (statsData.length === 0) return "10,80 50,60 90,70 130,40 170,50 210,30 250,45";
    
    const maxCount = Math.max(...statsData.map(s => s.count), 1);
    return statsData.map((stat, index) => {
      const x = 10 + (index * 45);
      const y = Math.max(10, 100 - (stat.count / maxCount * 80));
      return `${x},${y}`;
    }).join(' ');
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleCloseTicketDetail = () => {
    setSelectedTicketId(null);
    // Recargar datos después de cerrar el modal
    loadDashboardData();
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

  if (loading) {
    return (
      <div className="resolver-problemas">
        <div className="page-header">
          <p>Cargando panel de control...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="resolver-problemas">
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Gestiona los tickets activos</p>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Filtrar por estado:</label>
          <select 
            value={selectedFilter} 
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="urgent">Urgentes</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Categoría:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            {categoryStats.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Widget 1: Tickets Activos */}
          <div className="grid-item ticket-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">🎫</div>
                  Tickets activos ({activeTickets.length})
                </h2>
              </div>
              <div className="widget-content">
                {activeTickets.length > 0 ? (
                  <div className="tickets-listRT">
                    {activeTickets.slice(0, 3).map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="ticket-cardRT clickable"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div className="ticket-imageRT"></div>
                        <div className="ticket-infoRT">
                          <h3>{ticket.titulo || 'Ticket sin título'}</h3>
                          <p>{ticket.descripcion?.substring(0, 60)}...</p>
                          <div className="ticket-metaRT">
                            <span className="ticket-user">
                              👤 {ticket.profiles?.full_name || ticket.profiles?.username || 'Usuario'}
                            </span>
                            <span className="ticket-category">
                              📁 {ticket.categoria_problema?.nombre_categoria}
                            </span>
                          </div>
                          <div className="ticket-badges">
                            <span 
                              className="status-badge"
                              style={{
                                backgroundColor: getPriorityColor(ticket.prioridad_ticket?.nombre_gravedad),
                                color: getPriorityTextColor(ticket.prioridad_ticket?.nombre_gravedad)
                              }}
                            >
                              {ticket.prioridad_ticket?.nombre_gravedad}
                            </span>
                            <span className="status-badge status-state">
                              {ticket.estado_ticket?.nombre_estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="empty-state-icon">📋</div>
                    <p className="empty-state-text">No hay tickets activos</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Widget 2: Estadísticas de Usuario */}
          <div className="grid-item chart-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">📊</div>
                  Actividad (últimos 7 días)
                </h2>
              </div>
              <div className="widget-content">
                <div className="stats-number">{totalUsers} usuarios registrados</div>
                <div className="chart-container">
                  <div className="chart-line">
                    <svg width="100%" height="120" viewBox="0 0 320 120">
                      <polyline
                        points={getChartPoints()}
                        fill="none"
                        stroke="#1b194d"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {statsData.map((stat, index) => (
                        <circle 
                          key={index}
                          cx={10 + (index * 45)} 
                          cy={Math.max(10, 100 - (stat.count / Math.max(...statsData.map(s => s.count), 1) * 80))} 
                          r="4" 
                          fill="#1b194d" 
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="chart-labels">
                    {statsData.map((stat, index) => (
                      <span key={index}>
                        {new Date(stat.date).toLocaleDateString('es', { weekday: 'short' })}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Calendario */}
          <div className="grid-item calendar-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">📅</div>
                  {monthNames[currentMonth]}, {currentYear}
                </h2>
                <div className="calendar-nav">
                  <button onClick={() => changeMonth('prev')}>‹</button>
                  <button onClick={() => changeMonth('next')}>›</button>
                </div>
              </div>
              <div className="widget-content">
                <div className="calendar-grid">
                  <div className="calendar-header">Lun</div>
                  <div className="calendar-header">Mar</div>
                  <div className="calendar-header">Mié</div>
                  <div className="calendar-header">Jue</div>
                  <div className="calendar-header">Vie</div>
                  <div className="calendar-header">Sáb</div>
                  <div className="calendar-header">Dom</div>
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>

          {/* Widget 4: Estadísticas por Categoría */}
          <div className="grid-item percentage-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">📊</div>
                  Por categorías
                </h2>
              </div>
              <div className="widget-content">
                <div className="category-stats">
                  {categoryStats.slice(0, 4).map((category, index) => (
                    <div key={category.name} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count}</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{
                            width: `${(category.count / Math.max(...categoryStats.map(c => c.count))) * 100}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Widget 5: Resumen de Estado */}
          <div className="grid-item summary-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">📋</div>
                  Resumen general
                </h2>
              </div>
              <div className="widget-content">
                <div className="summary-stats">
                  <div className="summary-item">
                    <div className="summary-number">{ticketStats.total}</div>
                    <div className="summary-label">Total tickets</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-number" style={{color: '#f56565'}}>{ticketStats.active}</div>
                    <div className="summary-label">Activos</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-number" style={{color: '#48bb78'}}>{ticketStats.resolved}</div>
                    <div className="summary-label">Resueltos</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{width: `${ticketStats.total > 0 ? (ticketStats.resolved / ticketStats.total) * 100 : 0}%`}}
                  ></div>
                </div>
                <p className="progress-text">
                  {ticketStats.total > 0 ? Math.round((ticketStats.resolved / ticketStats.total) * 100) : 0}% completado
                </p>
              </div>
            </div>
          </div>

          {/* Widget 6: Prioridades */}
          <div className="grid-item priority-widget">
            <div className="widget">
              <div className="widget-header">
                <h2 className="widget-title">
                  <div className="widget-icon">⚡</div>
                  Por prioridad
                </h2>
              </div>
              <div className="widget-content">
                <div className="priority-chart">
                  {priorityStats.map((priority, index) => (
                    <div key={priority.name} className="priority-item">
                      <div 
                        className="priority-circle"
                        style={{
                          backgroundColor: getPriorityColor(priority.name),
                          color: getPriorityTextColor(priority.name)
                        }}
                      >
                        {priority.count}
                      </div>
                      <span className="priority-name">{priority.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedTicketId && (
        <TicketDetail 
          ticketId={selectedTicketId} 
          onClose={handleCloseTicketDetail}
        />
      )}
    </div>
  );
};

export default ResolverTickets;