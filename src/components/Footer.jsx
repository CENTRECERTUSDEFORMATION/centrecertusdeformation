import React from 'react';
import { FaFacebook, FaLinkedin, FaEnvelope, FaGoogle } from 'react-icons/fa'; // Icônes Facebook, LinkedIn, Email, Google

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 text-center">
      <p className="mb-4">© {new Date().getFullYear()} CERTUS. Tous droits réservés.</p>

      {/* Liens vers les pages Facebook, Google et LinkedIn */}
      <div className="mt-4">
        <ul className="flex justify-center gap-8 text-2xl">
          <li className="flex flex-col items-center">
            <a href="https://www.facebook.com/Centre.Certus.de.Formation/reviews" target="_blank" rel="noopener noreferrer" title="Laisser un avis sur Facebook" className="flex flex-col items-center">
              <FaFacebook className="text-blue-600 mb-2" />
              <p className="text-sm">Laissez un avis sur Facebook</p>
            </a>
          </li>
          <li className="flex flex-col items-center">
            <a href="https://www.facebook.com/Centre.Certus.de.Formation" target="_blank" rel="noopener noreferrer" title="Page Facebook de CERTUS" className="flex flex-col items-center">
              <FaFacebook className="text-blue-600 mb-2" />
              <p className="text-sm">Page CERTUS</p>
            </a>
          </li>
          <li className="flex flex-col items-center">
            <a href="https://www.linkedin.com/in/centre-certus-de-formation-a27a60141/" target="_blank" rel="noopener noreferrer" title="Page LinkedIn de CERTUS" className="flex flex-col items-center">
              <FaLinkedin className="text-blue-700 mb-2" />
              <p className="text-sm">Suivez-nous sur LinkedIn</p>
            </a>
          </li>
          <li className="flex flex-col items-center">
            <a href="mailto:contact.certus@gmail.com" target="_blank" rel="noopener noreferrer" title="Envoyer un email" className="flex flex-col items-center">
              <FaEnvelope className="text-red-500 mb-2" />
              <p className="text-sm">Contactez-nous par email</p>
            </a>
          </li>
          <li className="flex flex-col items-center">
            <a href="https://g.page/r/CfvVNKqhAJGjEAE/review" target="_blank" rel="noopener noreferrer" title="Laisser un avis sur Google" className="flex flex-col items-center">
              <FaGoogle className="text-red-600 mb-2" />
              <p className="text-sm">Laissez un avis sur Google</p>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
