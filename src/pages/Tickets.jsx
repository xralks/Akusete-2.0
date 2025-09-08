import React, { useState } from 'react';
import TicketsHero from '../components/TicketsHero';
import TicketsLista from '../components/TicketsLista';

const TicketsPage = () => {
  const [filters, setFilters] = useState({
    categoria: '',
    prioridad: '',
    estado: '',
    tags: '',
    busqueda: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <TicketsHero onFilterChange={handleFilterChange} />
      <TicketsLista filters={filters} />
    </div>
  );
};

export default TicketsPage;