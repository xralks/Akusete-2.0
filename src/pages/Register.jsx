import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.css';
import akuseteregister from '../assets/akusete-register.webp';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.fullName) {
      newErrors.fullName = 'El nombre completo es requerido';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'El nombre debe tener al menos 2 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles') 
          .insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              email: formData.email,
            }
          ]);

        if (profileError) {
          console.warn('Error al crear perfil:', profileError.message);
        }

        alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        navigate('/login');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      setErrors({
        submit: error.message || 'Error al registrar usuario'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-seccion">
      <div className="register-container">
        <div className="ilustracion-register">
            <img className="main-image" src={akuseteregister} alt="akusete" />
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <h2>Registrate para comenzar</h2>
            <p>Accede a nuestra plataforma para crear tickets de soporte de forma rápida y sencilla.</p>
            <label htmlFor="email"></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Correo electrónico"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="fullName"></label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Nombre y apellido"
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password"></label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Contraseña"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword"></label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirmar contraseña"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
                  <div className="register-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Register;