import './Seccioninfo1.css';
import Objetos from '../assets/objetos-seguros.webp';

export default function Seccioninfo1() {
  return (
       <section className="seccion-una-plataforma1">
         <div className="container-una-plataforma1">
         <div className="una-plataforma-contenido1">
           <h2>Un espacio para expresar lo que importa</h2>
           <p>
            Akusete es una plataforma creada para fortalecer la seguridad y el bienestar dentro
             del entorno universitario. Aquí puedes reportar situaciones que merecen atención, 
             con la confianza de que tu voz será tomada en serio. Nuestro compromiso es construir
              una comunidad más segura, donde hablar sea parte del cambio.
               
           </p>
         </div>
           <div className="imagen-una-plataforma1">
               <img className="main-image" src={Objetos} alt="akusete" />
           </div>
           </div>
       </section>
  );
}