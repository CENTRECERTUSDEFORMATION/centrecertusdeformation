import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';
import { Helmet } from 'react-helmet-async';

// Configuration EmailJS
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const templateParams = {
        to_email: "contact.certus@gmail.com",
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        toast.success("✅ Message envoyé avec succès ! Nous vous répondrons sous 24h.");
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error("Erreur envoi:", error);
      toast.error("❌ Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Numéros de téléphone pour WhatsApp
  const phoneNumbers = [
    { number: "54582980", display: "54 58 29 80", label: "Commercial 1" },
    { number: "54582982", display: "54 58 29 82", label: "Commercial 2" }
  ];

  const handleWhatsAppClick = (phoneNumber) => {
    window.open(`https://wa.me/216${phoneNumber}`, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Contact | Centre Certus de Formation à Monastir</title>
        <meta name="description" content="Contactez le Centre Certus de Formation à Monastir. Téléphone, WhatsApp, email, formulaire de contact. Réponse sous 24h." />
        <meta name="keywords" content="contact centre formation Monastir, téléphone Certus, WhatsApp Certus, email formation Monastir" />
        <link rel="canonical" href="https://centrecertusdeformation.tn/contact" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6"
            >
              <span>📞</span>
              <span>Prenez contact avec nous</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              Contactez notre équipe
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 max-w-2xl mx-auto"
            >
              Une question ? Besoin d'informations sur nos formations ?
              Notre équipe est à votre écoute 7j/7.
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto" fill="currentColor" style={{ color: '#f8fafc' }}>
              <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </div>

        {/* Section Contact - Formulaire + Infos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 py-16"
        >
          <div className="grid md:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Envoyez-nous un message</h2>
              <p className="text-gray-500 mb-6">Nous vous répondrons dans les meilleurs délais</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="Jean Dupont"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="06 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition"
                    placeholder="Demande d'information / Inscription / Devis"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent transition resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {sending ? "Envoi en cours..." : "📩 Envoyer le message"}
                </button>
              </form>
            </motion.div>

            {/* Informations de contact */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Carte d'infos */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Nos coordonnées</h2>
                
                <div className="space-y-5">
                  {/* Adresse - icône modernisée */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Adresse</h3>
                      <p className="text-gray-600">Avenue du Combattant Suprême, 5000 Monastir, Tunisie</p>
                    </div>
                  </div>
                  
                  {/* Téléphone Commercial avec boutons WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">Téléphone (Commercial)</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {phoneNumbers.map((phone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-600">{phone.display}</span>
                            <button
                              onClick={() => handleWhatsAppClick(phone.number)}
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              </svg>
                              WhatsApp
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Téléphone Administration */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Téléphone (Administration)</h3>
                      <p className="text-gray-600">53 58 29 80</p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">contact.certus@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horaires - Mis à jour 9h-22h tous les jours */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span>🕒</span> Horaires d'ouverture
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                    <span className="font-medium text-gray-700">Lundi - Dimanche</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-semibold text-green-600">09:00 - 22:00</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Tous les jours</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 text-center">
                    ⚡ Réponse sous 24h pour toute demande par email, formulaire ou WhatsApp
                  </p>
                </div>
              </div>

              {/* Bouton WhatsApp flottant */}
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <h3 className="font-bold text-gray-800 mb-3">💬 Contactez-nous directement</h3>
                <p className="text-gray-500 text-sm mb-4">Une question rapide ? Écrivez-nous sur WhatsApp</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {phoneNumbers.map((phone, index) => (
                    <button
                      key={index}
                      onClick={() => handleWhatsAppClick(phone.number)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      WhatsApp {phone.display}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Carte Google Maps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 pb-16"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-[400px]">
              <iframe
                title="Centre Certus de Formation - Monastir"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3237.361974077142!2d10.8207298!3d35.7711525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212ca7cc8b735%3A0xa39100a1aa34d5fb!2sCentre%20Certus%20de%20Formation!5e0!3m2!1sfr!2stn!4v1713365429971!5m2!1sfr!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Notre centre est situé au cœur de Monastir, facilement accessible depuis tout le Sahel
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Final */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Prêt à démarrer votre formation ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 mb-8"
            >
              Contactez-nous dès maintenant pour une inscription ou un devis personnalisé
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <a
                href="tel:+21654582980"
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                📞 Appelez-nous au 54 58 29 80
              </a>
              <button
                onClick={() => handleWhatsAppClick("54582980")}
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.01-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                WhatsApp
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;