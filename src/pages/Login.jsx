import { useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'
import akusetelogin from '../assets/akusete-login.webp';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage('Correo o contraseña inválidos ❌');
      setMessageType('error');
    } else {
      setMessage('¡Sesión iniciada exitosamente! 🎉');
      setMessageType('success');

      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  return (
    <section className="login-seccion">
      <div className="login-container">
        <div className="container-ilustracion">
          <img className="main-image" src={akusetelogin} alt="akusete" />
        </div>

        <form onSubmit={handleLogin}>
          <h2>¡Hola! Bienvenido</h2>
          <p className='texto-bv'>Accede o crea tu cuenta y únete a nuestra comunidad.</p>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={messageType === 'error' ? 'error' : ''}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={messageType === 'error' ? 'error' : ''}
          />

          <button type="submit">Entrar</button>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <p className='texto-footer'>¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a></p>
          <p className='texto-footer'>¿Olvidaste tu contraseña? <a href="/recuperar-contraseña">Recuperar contraseña</a></p>
        </form>
      </div>
    </section>
  );
}
