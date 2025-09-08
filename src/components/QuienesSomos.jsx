import './QuienesSomos.css';
import AkuseteQS from '../assets/akumobdes.webp';

export default function QuienesSomos() {
  return (
    <section className="quienes-somos-section">
      <div className="containerQS">
      <div className="quienes-somos-content">
        <h2>¿Qué es AKUSETE?</h2>
        <p>
          AKUSETE es un servicio que se implementará en la Universidad Bernardo O'Higgins,
             enfocado en mejorar la infraestructura, seguridad y bienestar del alumnado y el personal.
              Este proyecto consiste en la creación de una plataforma web que centralizará recursos y
               protocolos de emergencia, facilitando así una respuesta rápida y eficiente ante incidentes.
            
        </p>
        <div className="containerbotonQS">
        <a className="btn-primario" href="/que-es-akusete">Leer más →</a>
        </div>
      </div>
        <div className="imagenQS">
            <img className="main-image" src={AkuseteQS} alt="akusete" />
        </div>
        </div>
    </section>
  );
}