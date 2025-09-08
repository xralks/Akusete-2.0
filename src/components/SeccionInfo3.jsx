import './Seccioninfo3.css';
import recomendadoimg from '../assets/recomendadoimg.webp';

export default function Seccioninfo3() {
  return (
       <section className="seccion-una-plataforma3">
         <div className="container-una-plataforma3">
         <div className="una-plataforma-contenido3">
           <h2>Fácil, rápido y seguro</h2>
           <p>
             Solo necesitas unos segundos para hacer un reporte. Usamos tu nombre de usuario, 
             pero no solicitamos información adicional. Describe qué ocurrió, dónde y cuándo, y
              nosotros nos encargamos de canalizar la información de manera responsable, con el
               objetivo de mejorar la seguridad en tu comunidad universitaria. 
           </p>
         </div>
           <div className="imagen-una-plataforma3">
               <img className="main-image" src={recomendadoimg} alt="akusete" />
           </div>
           </div>
       </section>
  );
}