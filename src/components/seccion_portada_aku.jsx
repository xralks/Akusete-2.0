import './seccion_portada_aku.css';
import portadaAku from '../assets/akuseteguiño.webp';

export default function SeccionPortadaAku() {
  return (
    <section className="seccion-portada-aku">
      <div className="contenido-portada-aku">
        <div className="imagen-aku">
          <img src={portadaAku} alt="Akusete portada" />
        </div>
        <div className="texto-aku">
          <h2><strong>AKUSETE</strong><br />Única manera permitida<br />de Acusar.</h2>
          <div className="container-texto">
            <p>Conoce más</p>
          </div>
          <div className="mano-pointer" />
        </div>
      </div>
    </section>
  );
}
