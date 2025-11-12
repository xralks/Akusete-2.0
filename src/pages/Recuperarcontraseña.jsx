import { useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setType('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '/reset-password',
    });

    if (error) {
      setType('error');
      setMessage('Hubo un error al enviar el correo. Verifica tu dirección.');
    } else {
      setType('success');
      setMessage('📩 Revisa tu correo para restablecer tu contraseña.');
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <section className="login-seccion">
      <div className="login-container">
        <form onSubmit={handleResetPassword}>
          <h2>Recuperar contraseña</h2>
          <p className="texto-bv">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner-RC"></span>
            ) : (
              'Enviar enlace'
            )}
          </button>

          {message && (
            <div className={`message ${type}`}>
              {message}
            </div>
          )}

          <p className="texto-footer">
            <a href="/login">Volver al inicio de sesión</a>
          </p>
        </form>
      </div>
    </section>
  );
}