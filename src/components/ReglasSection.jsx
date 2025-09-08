import './ReglasSection.css';
import Ticketerror from '../assets/ticketerror.svg';
import Informal from '../assets/inmormal.svg';
import Sos from '../assets/sos.svg';

export default function ReglasSection() {
  return (
        <section className="reglas-section"> 
        <h1 className="tickets-title">Advertencias</h1>
      <div className="containerReglas">
            <div className="reglas">
            <img src={Ticketerror} alt="akusete" />
            <h2 className="reglas-title">1. Creacion tickets falsos</h2>
            <p className="reglas-text">
                Evitar la creación de tickets falsos es crucial para mantener la confianza en el sistema. Esta práctica puede alertar a los encargados y generar respuestas innecesarias. Además, puede tener repercusiones legales y afectar la reputación del sitio web.
            </p>
            </div>
            <div className="reglas">
            <img src={Informal} alt="akusete" />
            <h2 className="reglas-title">2. Informalidad y groserias</h2>
            <p className="reglas-text">
                El uso de lenguaje informal y grosero puede perjudicar la comunicación y el ambiente laboral. Mantener un tono respetuoso es clave para fomentar el respeto y la colaboración, evitando ofensas y malentendidos.
            </p>
            </div>
            <div className="reglas">
            <img src={Sos} alt="akusete" />
            <h2 className="reglas-title">3. Solo para emergencias</h2>
            <p className="reglas-text">
                Es esencial utilizar el sitio web designado "solo para emergencias" deben usarse con responsabilidad. Su uso inapropiado puede comprometer la respuesta ante situaciones críticas y acarrear sanciones. Evalúa siempre la necesidad antes de recurrir a ellos.
            </p>
            </div>
      </div>
      </section>
  );
}