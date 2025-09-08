import './HeroHome.css';
import akusete from '../assets/akusete3d.webp';
import chatbubble from '../assets/chatbubble.svg';
import peligro from '../assets/peligro.svg';
import ticketplus from '../assets/ticketplus.svg';

export default function HeroHome() {
  return (
    <section className="hero-section">
      <div className="container-generalHERO">
        <div className="containerIMG-aku">
          <img className="img-aku" src={akusete} alt="Akusete Logo" />
          <img className="floating-icon icon-1" src={chatbubble} alt="akusete" />
          <img className="floating-icon icon-2" src={peligro} alt="akusete" />
          <img className="floating-icon icon-3" src={ticketplus} alt="akusete" />
        </div>
        <div className="containerTexto-Hero">
            <h1 className="hero-title">Crea un ticket para dar aviso a la institución del problema.</h1>
            <p className="hero-description">
              Estarás ayudando a mejorar el ambiente estudiantil y entregando seguridad.
            </p>
          <div className="containerbotones">
            <a className="btn-primario" href="/crear-ticket">Crear ticket →</a>
            <a className="btn-segundario" href="/que-es-akusete">Leer más →</a>
          </div>
        </div>
      </div>
    </section>
  );
}
