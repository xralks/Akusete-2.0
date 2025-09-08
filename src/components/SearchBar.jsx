import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ value, onChange, onDateFilterChange }) {
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  const handleDateFilterChange = (filterValue) => {
    setSelectedDateFilter(filterValue);
    if (onDateFilterChange) {
      onDateFilterChange(filterValue);
    }
  };

  return (
    <div className="search-bar">
      <div className="search-container">
        <div className="search-section">
          <label className="search-label">Buscar Ticket</label>
          <input
            type="text"
            placeholder="Computador no enciende"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="date-section">
          <label className="search-label">Fecha del Ticket</label>
          <select 
            value={selectedDateFilter} 
            onChange={(e) => handleDateFilterChange(e.target.value)}
            className="date-select"
          >
            <option value="all">Cualquier Fecha</option>
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="thisWeek">Esta semana</option>
            <option value="lastWeek">Semana pasada</option>
            <option value="thisMonth">Este mes</option>
            <option value="lastMonth">Mes pasado</option>
            <option value="last30Days">Últimos 30 días</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;