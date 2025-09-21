import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './perfil.css';
import avatarDefault from '../assets/akuperfil.webp';

const Perfil = () => {
  const [datosUsuario, setDatosUsuario] = useState({
    email: '',
    full_name: '',
    username: '',
    telefono: '',
    avatar_url: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    obtenerDatosUsuario();
  }, []);

  const obtenerDatosUsuario = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/login');
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfilError) {
        console.error('Error al obtener perfil:', perfilError);
      }

      setDatosUsuario({
        email: user.email || '',
        full_name: perfil?.full_name || '',
        username: perfil?.username || '',
        telefono: perfil?.telefono || '',
        avatar_url: perfil?.avatar_url || ''
      });

    } catch (error) {
      console.error('Error:', error);
      setErrores({ general: 'Error al cargar los datos' });
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarDatos = () => {
    const nuevosErrores = {};

    if (!datosUsuario.full_name) {
      nuevosErrores.full_name = 'El nombre completo es requerido';
    }

    if (!datosUsuario.username) {
      nuevosErrores.username = 'El nombre de usuario es requerido';
    }

    return nuevosErrores;
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    
    const erroresValidacion = validarDatos();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setGuardando(true);
    setErrores({});
    setMensaje('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: datosUsuario.full_name,
          username: datosUsuario.username,
          telefono: datosUsuario.telefono,
          avatar_url: datosUsuario.avatar_url
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setModoEdicion(false);
      setMensaje('Perfil actualizado correctamente');

    } catch (error) {
      console.error('Error al actualizar:', error);
      setErrores({ submit: 'Error al actualizar el perfil' });
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    obtenerDatosUsuario(); // Recargar datos originales
    setModoEdicion(false);
    setErrores({});
  };

  const cerrarSesion = async () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  if (cargando) {
    return (
      <div className="perfil-seccion">
        <div className="cargando">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="perfil-seccion">
      <div className="perfil-container">
        <div className="perfil-header">
          <div className="avatar-section">
            <img 
              src={datosUsuario.avatar_url || avatarDefault} 
              alt="Avatar" 
              className="avatar-image"
            />
          </div>
          <div className="usuario-info">
            <h1>{datosUsuario.full_name || 'Usuario'}</h1>
            <p className="email">{datosUsuario.email}</p>
            <p className="username">@{datosUsuario.username}</p>
          </div>
        </div>

        {mensaje && (
          <div className="mensaje-exito">{mensaje}</div>
        )}

        {errores.general && (
          <div className="error-message">{errores.general}</div>
        )}

        <div className="perfil-content">
          <div className="perfil-acciones">
            {!modoEdicion ? (
              <>
                <button 
                  onClick={() => setModoEdicion(true)}
                  className="boton-editar"
                >
                  Editar Perfil
                </button>
                <button 
                  onClick={cerrarSesion}
                  className="boton-cerrar-sesion"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={guardarCambios}
                  disabled={guardando}
                  className="boton-guardar"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                  onClick={cancelarEdicion}
                  className="boton-cancelar"
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>

          <form className="perfil-form">
            <div className="form-group">
              <label htmlFor="full_name">Nombre Completo</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={datosUsuario.full_name}
                onChange={manejarCambio}
                disabled={!modoEdicion}
                className={errores.full_name ? 'error' : ''}
                placeholder="Tu nombre completo"
              />
              {errores.full_name && <span className="error-message">{errores.full_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={datosUsuario.username}
                onChange={manejarCambio}
                disabled={!modoEdicion}
                className={errores.username ? 'error' : ''}
                placeholder="Tu nombre de usuario"
              />
              {errores.username && <span className="error-message">{errores.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={datosUsuario.email}
                disabled
                className="input-disabled"
              />
              <small className="input-help">El correo electrónico no se puede modificar</small>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={datosUsuario.telefono}
                onChange={manejarCambio}
                disabled={!modoEdicion}
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar_url">URL del Avatar</label>
              <input
                type="url"
                id="avatar_url"
                name="avatar_url"
                value={datosUsuario.avatar_url}
                onChange={manejarCambio}
                disabled={!modoEdicion}
                placeholder="URL de tu imagen de perfil"
              />
            </div>

            {errores.submit && (
              <div className="error-message submit-error">{errores.submit}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;