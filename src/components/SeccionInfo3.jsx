import './Seccioninfo3.css';
import recomendadoimg from '../assets/recomendadoimg.webp';

export default function Seccioninfo3() {
  return (
       <section className="seccion-una-plataforma3">
         <div className="container-una-plataforma3">
         <div className="una-plataforma-contenido3">
           <h2>Fácil, rápido y 100% anónimo</h2>
           <p>
             Solo necesitas unos segundos para hacer un reporte. No pedimos tus datos personales
              y no se rastrea tu ubicación. Simplemente describes lo que ocurrió, dónde, y cuándo.
               Nosotros nos encargamos de canalizar la información de forma segura y responsable.
               
           </p>
         </div>
           <div className="imagen-una-plataforma3">
               <img className="main-image" src={recomendadoimg} alt="akusete" />
           </div>
           </div>
       </section>
  );
}