import { useState } from 'react'
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      setType('error');
      setMessage('No se pudo actualizar la contraseña.');
    } else {
      setType('success');
      setMessage('✅ Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <section className="login-seccion">
      <div className="login-container">
        <form onSubmit={handleUpdatePassword}>
          <h2>Restablecer contraseña</h2>
          <p className="texto-bv">Escribe tu nueva contraseña para continuar.</p>

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Actualizar contraseña</button>

          {message && (
            <div className={`message ${type}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}