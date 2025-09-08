// src/pages/Login.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'
import akusetelogin from '../assets/akusete-login.webp';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      alert('¡Sesión iniciada exitosamente!');
      navigate('/');
    }
  }

  return (
    <section className="login-seccion">
    <div className="login-container">
        <div className="container-ilustracion">
            <img className="main-image" src={akusetelogin} alt="akusete" />
        </div>
      <form onSubmit={handleLogin}>
        <h2>Hola! Bienvenido</h2>
        <p className='texto-bv'>Accede o crea tu cuenta y únete a nuestra comunidad.</p>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
            <p className='texto-footer'>¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a></p>
            <p className='texto-footer'>¿Olvidaste tu contraseña? <a href="/reset-password">Recuperar contraseña</a></p>
                  {message && <p>{message}</p>}
      </form>
    </div>
    </section>
  )
}
