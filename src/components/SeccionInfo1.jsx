import './Seccioninfo1.css';
import Objetos from '../assets/objetos-seguros.webp';

export default function Seccioninfo1() {
  return (
       <section className="seccion-una-plataforma1">
         <div className="container-una-plataforma1">
         <div className="una-plataforma-contenido1">
           <h2>Una plataforma para hablar sin temor</h2>
           <p>
             Akusete nace para proteger lo más importante: tu seguridad. Es un canal anónimo 
             y confidencial donde puedes reportar situaciones de riesgo dentro del entorno universitario
              sin exponerte. Nuestra misión es que ningún estudiante sienta que debe guardar silencio.
               
           </p>
         </div>
           <div className="imagen-una-plataforma1">
               <img className="main-image" src={Objetos} alt="akusete" />
           </div>
           </div>
       </section>
  );
}