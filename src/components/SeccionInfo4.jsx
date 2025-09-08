import './Seccioninfo4.css'
import chatbubble from '../assets/chatbubble.svg';
import peligro from '../assets/peligro.svg';

export default function SeccionInfo4() {
     return (
    <section className="seccion-final">
      <div className="iconos-flotantes">
        <img src={chatbubble} className="icono flotante-1" alt="Icono 1" />
        <img src={peligro} className="icono flotante-2" alt="Icono 2" />
      </div>

      <div className="texto-final">
        <p className="frase-destacada">
          <span className="estiloescribir-text">Porque alzar la voz también es cuidarnos.</span>
        </p>
        <p className="firma">
          Creado por <a href="https://ramirosepulveda.cl/" target="_blank">Ramiro Sepúlveda Cáceres</a>
        </p>
      </div>
    </section>
  ); 
}