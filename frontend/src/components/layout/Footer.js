import React from 'react';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Autores y Libros nivel 3</p>
      </div>
    </footer>
  );
};

export default Footer;
