import './Seccioninfo2.css';
import Estudiantes from '../assets/estudiantesimg.webp';

export default function Seccioninfo2() {
  return (
       <section className="seccion-una-plataforma2">
         <div className="container-una-plataforma2">
            <div className="imagen-una-plataforma2">
               <img className="main-image" src={Estudiantes} alt="akusete" />
           </div>
         <div className="una-plataforma-contenido2">
           <h2>Hecho por estudiantes, para estudiantes</h2>
           <p>
             Sabemos lo difícil que es hablar cuando algo no está bien. Por eso diseñamos Akusete
              con empatía y respeto. Queremos cambiar la cultura del silencio, creando un espacio 
              donde denunciar no sea un riesgo, sino un acto de valentía colectiva.
               
           </p>
         </div>
           </div>
       </section>
  );
}