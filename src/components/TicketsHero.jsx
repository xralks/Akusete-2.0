import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './TicketsHero.css';

const TicketsHero = ({ onFilterChange }) => {
  const [filtros, setFiltros] = useState({
    categoria: '',
    prioridad: '',
    estado: '',
    tags: '',
    busqueda: ''
  });
  

  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {

        const [categoriasData, prioridadesData, estadosData, tagsData] = await Promise.all([
          supabase.from('categoria_problema').select('id, nombre_categoria').order('nombre_categoria'),
          supabase.from('prioridad_ticket').select('id, nombre_gravedad').order('id'),
          supabase.from('estado_ticket').select('id, nombre_estado').order('id'),
          supabase.from('tags').select('id, nombre_tags').order('nombre_tags')
        ]);

        if (categoriasData.data) setCategorias(categoriasData.data);
        if (prioridadesData.data) setPrioridades(prioridadesData.data);
        if (estadosData.data) setEstados(estadosData.data);
        if (tagsData.data) setTags(tagsData.data);

      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filtros);
    }
  }, [filtros, onFilterChange]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      categoria: '',
      prioridad: '',
      estado: '',
      tags: '',
      busqueda: ''
    };
    setFiltros(emptyFilters);
  };

  const getTagDisplayName = (tag) => {
    return tag?.nombre_tags || 'Tag sin nombre';
  };

  const activeFiltersCount = Object.values(filtros).filter(value => value && value.trim()).length;

  return (
    <div className="tickets-hero">
      <div className="tickets-hero-container">
        <div className="container-titulo">
          <h1>Lista de Tickets</h1>
          <p>Visualiza todos los tickets del sistema</p>
          {activeFiltersCount > 0 && (
            <div className="contador-filtros-activos">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="section-filtros">
          <div className="container-filtros">
            <h2 className="titulo-secc-filtros">Filtrar tickets</h2>
            
            {/* Búsqueda principal */}
            <div className="grupos-filtro">
              <label htmlFor="busqueda" className="filter-label">
                Buscar en títulos y descripciones
              </label>
              <input
                type="text"
                id="busqueda"
                name="busqueda"
                value={filtros.busqueda}
                onChange={handleFilterChange}
                placeholder="Escribe palabras clave para buscar..."
                className="search-input"
                disabled={loading}
              />
            </div>

            {/* Filtros en grid */}
            <div className="linea-filtros">
              <div className="grupos-filtro">
                <label htmlFor="categoria" className="filter-label">Categoría</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={filtros.categoria}
                  onChange={handleFilterChange}
                  className="seleccion-filtro"
                  disabled={loading}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre_categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grupos-filtro">
                <label htmlFor="prioridad" className="filter-label">Prioridad</label>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={filtros.prioridad}
                  onChange={handleFilterChange}
                  className="seleccion-filtro"
                  disabled={loading}
                >
                  <option value="">Todas las prioridades</option>
                  {prioridades.map(prioridad => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre_gravedad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grupos-filtro">
                <label htmlFor="estado" className="filter-label">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFilterChange}
                  className="seleccion-filtro"
                  disabled={loading}
                >
                  <option value="">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre_estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grupos-filtro">
                <label htmlFor="tags" className="filter-label">Tags</label>
                <select
                  id="tags"
                  name="tags"
                  value={filtros.tags}
                  onChange={handleFilterChange}
                  className="seleccion-filtro"
                  disabled={loading}
                >
                  <option value="">Todos los tags</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {getTagDisplayName(tag)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            <div className="accion-limpiar-filtros">
              <button 
                onClick={clearFilters} 
                className="btn-limpiar-filtros"
                disabled={loading || activeFiltersCount === 0}
              >
                {loading ? 'Cargando...' : `Limpiar filtros ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsHero;