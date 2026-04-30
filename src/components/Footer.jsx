import React from 'react';
import { FaFacebook, FaLinkedin, FaEnvelope, FaGoogle, FaPhone, FaMapMarkerAlt, FaClock, FaBuilding, FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", url: "https://www.facebook.com/Centre.Certus.de.Formation", icon: FaFacebook, color: "hover:text-[#1877f2]" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/centre-certus-de-formation-a27a60141/", icon: FaLinkedin, color: "hover:text-[#0077b5]" },
    { name: "Email", url: "mailto:contact.certus@gmail.com", icon: FaEnvelope, color: "hover:text-[#ea4335]" },
    { name: "Google Maps", url: "https://g.page/r/CfvVNKqhAJGjEAE/review", icon: FaGoogle, color: "hover:text-[#ea4335]" },
  ];

  const quickLinks = [
    { name: "Accueil", path: "/" },
    { name: "Formations", path: "/formations" },
    { name: "Actualités", path: "/actualite" },
    { name: "Contact", path: "/contact" },
    { name: "À propos", path: "/a-propos" },
    { name: "Espace Participant", path: "/espace-participant" },
  ];

  const contactInfo = [
    { icon: FaMapMarkerAlt, text: "Adresse", color: "text-red-400", sub: "Av. du combattant suprême, Monastir 5000", link: "https://maps.app.goo.gl/t9EKLgmrc6UWXBsx9" },
    { icon: FaMapMarkerAlt, text: "Localisation", color: "text-orange-400", sub: "35.770900, 10.823251" },
    { icon: FaBuilding, text: "Commercial", color: "text-blue-400", sub: "+216 54 58 29 80 / +216 54 58 29 82", whatsapp: true },
    { icon: FaPhone, text: "Administration", color: "text-green-400", sub: "+216 53 58 29 80" },
    { icon: FaPhone, text: "Fixe", color: "text-purple-400", sub: "73 463 378" },
    { icon: FaEnvelope, text: "Email", color: "text-yellow-400", sub: "contact.certus@gmail.com", mailto: true },
    { icon: FaClock, text: "Horaires", color: "text-teal-400", sub: "Tous les jours de 9h à 18h" },
  ];

  // Fonction pour générer le lien WhatsApp
  const getWhatsAppLink = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  // Composant pour afficher un numéro cliquable (WhatsApp ou appel)
  const ContactItem = ({ info }) => {
    if (info.whatsapp) {
      const numbers = info.sub.split(' / ');
      return (
        <div>
          <span className="font-medium text-gray-300">{info.text}</span>
          <div className="flex flex-col gap-1 mt-1">
            {numbers.map((num, idx) => {
              const cleanNum = num.trim();
              return (
                <a
                  key={idx}
                  href={getWhatsAppLink(cleanNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 text-sm flex items-center gap-2 transition-colors"
                >
                  <FaWhatsapp className="w-3 h-3 text-green-500" />
                  {cleanNum}
                  <span className="text-xs text-gray-500">(WhatsApp)</span>
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    if (info.mailto) {
      return (
        <div>
          <span className="font-medium text-gray-300">{info.text}</span>
          <a href={`mailto:${info.sub}`} className="block text-gray-400 hover:text-blue-400 text-sm transition-colors">
            {info.sub}
          </a>
        </div>
      );
    }

    if (info.link) {
      return (
        <div>
          <span className="font-medium text-gray-300">{info.text}</span>
          <a href={info.link} target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-blue-400 text-sm transition-colors">
            {info.sub}
            <span className="text-xs text-gray-500 block">Ouvrir dans Google Maps →</span>
          </a>
        </div>
      );
    }

    return (
      <div>
        <span className="font-medium text-gray-300">{info.text}</span>
        <p className="text-gray-400 text-sm">{info.sub}</p>
      </div>
    );
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Section 1: Logo & Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">CERTUS</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Centre de formation professionnelle engagé à vous accompagner vers l'excellence.
              Innovation, performance et réussite au cœur de nos valeurs.
            </p>
            <div className="flex gap-3">
              {socialLinks.slice(0, 3).map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`bg-gray-700 p-2 rounded-full transition-all duration-300 ${link.color} hover:bg-gray-600 hover:scale-110`}>
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Section 2: Liens rapides */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Liens rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path} className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section 3: Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="md:col-span-1">
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Contact</h4>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-400 text-sm">
                  <info.icon className={`w-4 h-4 mt-0.5 ${info.color}`} />
                  <ContactItem info={info} />
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section 4: Avis */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Donnez votre avis</h4>
            <div className="space-y-3">
              <a href="https://g.page/r/CfvVNKqhAJGjEAE/review" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300 group">
                <div className="bg-red-500 p-2 rounded-full group-hover:scale-110 transition-transform"><FaGoogle className="w-5 h-5 text-white" /></div>
                <div><p className="text-sm font-medium">Notez-nous sur Google</p><p className="text-xs text-gray-400">Partagez votre expérience</p></div>
              </a>
              <a href="https://www.facebook.com/Centre.Certus.de.Formation/reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300 group">
                <div className="bg-blue-600 p-2 rounded-full group-hover:scale-110 transition-transform"><FaFacebook className="w-5 h-5 text-white" /></div>
                <div><p className="text-sm font-medium">Laissez un avis Facebook</p><p className="text-xs text-gray-400">Recommandez CERTUS</p></div>
              </a>
              <a href="https://www.linkedin.com/in/centre-certus-de-formation-a27a60141/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-300 group">
                <div className="bg-blue-700 p-2 rounded-full group-hover:scale-110 transition-transform"><FaLinkedin className="w-5 h-5 text-white" /></div>
                <div><p className="text-sm font-medium">Suivez-nous sur LinkedIn</p><p className="text-xs text-gray-400">Réseau professionnel</p></div>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {currentYear} CERTUS Centre de Formation. Tous droits réservés.</p>
            <div className="flex gap-4">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`text-gray-400 transition-all duration-300 ${link.color} hover:scale-110`}>
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs">N° d'enregistrement: 52-193-17 | Structure privée de formation professionnelle</p>
            <p className="text-gray-600 text-xs mt-1">Disponible tous les jours de 9h à 18h</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;