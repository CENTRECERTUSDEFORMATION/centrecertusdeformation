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
    { icon: FaBuilding, text: "Commercial", color: "text-blue-400", sub: "+216 54 58 29 80 / +216 54 58 29 82", whatsapp: true },
    { icon: FaPhone, text: "Administration", color: "text-green-400", sub: "+216 53 58 29 80" },
    { icon: FaPhone, text: "Fixe", color: "text-purple-400", sub: "73 463 378" },
    { icon: FaEnvelope, text: "Email", color: "text-yellow-400", sub: "contact.certus@gmail.com", mailto: true },
    { icon: FaClock, text: "Horaires", color: "text-teal-400", sub: "Tous les jours de 9h à 18h" },
  ];

  const getWhatsAppLink = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

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
                <a key={idx} href={getWhatsAppLink(cleanNum)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 text-sm flex items-center gap-2 transition-colors">
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
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Première ligne : Logo + Liens rapides + Contact (2 colonnes) + Carte */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          
          {/* Section 1: Logo & Description (avec police et couleurs) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="lg:col-span-1">
            <div className="mb-3">
              <h3 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Bosque Line', 'Georgia', 'Times New Roman', serif" }}>
                <span style={{ color: "#1a56db" }}>CENTRE</span>{' '}
                <span style={{ color: "#76c21f" }}>CERTUS</span>{' '}
                <span style={{ color: "#f59e0b" }}>DE</span>{' '}
                <span style={{ color: "#1a56db" }}>FORMATION</span>
              </h3>
            </div>
            
            {/* Hook en 4 lignes */}
            <div className="space-y-2 mb-3">
              <p className="text-blue-400 text-sm flex items-center gap-2">
                <span className="text-lg">🎓</span> Formation certifiante
              </p>
              <p className="text-green-400 text-sm flex items-center gap-2">
                <span className="text-lg">👨‍🏫</span> Formateurs experts
              </p>
              <p className="text-orange-400 text-sm flex items-center gap-2">
                <span className="text-lg">📅</span> Formation sur mesure
              </p>
              <p className="text-purple-400 text-sm flex items-center gap-2">
                <span className="text-lg">💼</span> Insertion professionnelle
              </p>
            </div>
            
            <div className="flex gap-3">
              {socialLinks.slice(0, 3).map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`bg-gray-700 p-2 rounded-full transition-all duration-300 ${link.color} hover:bg-gray-600 hover:scale-110`}>
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Section 2: Liens rapides (1 colonne) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} className="lg:col-span-1">
            <h4 className="text-md font-semibold mb-3 text-blue-400">Liens rapides</h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link, index) => (
                <a key={index} href={link.path} className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-sm">
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Section 3: Contact (2 colonnes) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="lg:col-span-2">
            <h4 className="text-md font-semibold mb-3 text-blue-400">Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-400 text-sm list-none">
                  <info.icon className={`w-3 h-3 mt-0.5 ${info.color}`} />
                  <ContactItem info={info} />
                </li>
              ))}
            </div>
          </motion.div>

          {/* Section 4: Google Maps */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} className="lg:col-span-1">
            <h4 className="text-md font-semibold mb-3 text-blue-400">Nous trouver</h4>
            <div className="rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m11!1m3!1d158.0661773992462!2d10.823342411894258!3d35.7695502164065!2m2!1f0!2f45!3m2!1i1024!2i768!4f35!3m3!1m2!1s0x130212ca7cc8b735%3A0xa39100a1aa34d5fb!2sCentre%20Certus%20de%20Formation!5e1!3m2!1sfr!2stn!4v1777549164860!5m2!1sfr!2stn"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Centre Certus de Formation"
                className="hover:opacity-90 transition-opacity"
              ></iframe>
            </div>
            <div className="mt-2 text-center">
              <a 
                href="https://maps.app.goo.gl/t9EKLgmrc6UWXBsx9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <FaMapMarkerAlt className="w-3 h-3" />
                Agrandir la carte →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Deuxième ligne : Avis Google & Facebook */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a href="https://g.page/r/CfvVNKqhAJGjEAE/review" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-all duration-300 group">
            <div className="bg-red-500 p-1.5 rounded-full group-hover:scale-110 transition-transform"><FaGoogle className="w-4 h-4 text-white" /></div>
            <div><p className="text-sm font-medium">Notez-nous sur Google</p><p className="text-xs text-gray-400">Partagez votre expérience</p></div>
          </a>
          <a href="https://www.facebook.com/Centre.Certus.de.Formation/reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-all duration-300 group">
            <div className="bg-blue-600 p-1.5 rounded-full group-hover:scale-110 transition-transform"><FaFacebook className="w-4 h-4 text-white" /></div>
            <div><p className="text-sm font-medium">Laissez un avis Facebook</p><p className="text-xs text-gray-400">Recommandez CERTUS</p></div>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-xs">© {currentYear} CERTUS Centre de Formation. Tous droits réservés.</p>
            <div className="flex gap-3">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={`text-gray-400 transition-all duration-300 ${link.color} hover:scale-110`}>
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-gray-500 text-[11px]">N° d'enregistrement: 52-193-17 | Structure privée de formation professionnelle</p>
            <p className="text-gray-600 text-[11px] mt-1">Disponible tous les jours de 9h à 18h</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;