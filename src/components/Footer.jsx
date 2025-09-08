import './Footer.css';
import facebookIcon from '../assets/facebook.svg';
import instagramIcon from '../assets/instagram.svg';
import linkedinIcon from '../assets/linkedin.svg';

export default function Footer() {
  return (
    <footer className="footer">
          <div className="footer-content">
            <div className="logo-section">
              <h2> AKUSETE</h2> 
              <p className="description">
              AKUSETE es un servicio destinado a mejorar el ambiente estudiantil y entregar seguridad.
              </p>
            </div>
            <div className="social-icons1">
                <a href="#0"><img className="icon1" src={facebookIcon} alt="Facebook" /></a>
                <a href="#0"><img className="icon1" src={instagramIcon} alt="Twitter" /></a>
                <a href="#0"><img className="icon1" src={linkedinIcon} alt="Instagram" /></a>
            </div>
          </div>
          <div className="copyright">
            Copyright 2025 AKUSETE.cl
          </div>
        </footer>
  );    
}