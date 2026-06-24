import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

import couverture from '../assets/couverture.WebP';
import img1 from '../assets/Image 1.WebP';
import img2 from '../assets/Image 2.WebP';
import img3 from '../assets/Image 3.WebP';
import img4 from '../assets/Image 4.WebP';
import img5 from '../assets/Image 5.WebP';
import img6 from '../assets/Image 6.WebP';
import img7 from '../assets/Image 7.WebP';
import img8 from '../assets/Image 8.WebP';
import img9 from '../assets/Image 9.WebP';
import img10 from '../assets/Image 10.WebP';
import img11 from '../assets/Image 11.WebP';
import img12 from '../assets/Image 12.WebP';

import Footer from '../components/Footer';

const images = [
  { src: img1, title: "Formation Digital" },
  { src: img2, title: "Formation Informatique" },
  { src: img3, title: "Formation Comptabilité" },
  { src: img4, title: "Formation Design" },
  { src: img5, title: "Énergies Renouvelables" },
  { src: img6, title: "Formation Marketing" },
  { src: img7, title: "Formation Management" },
  { src: img8, title: "Formation Langues" },
  { src: img9, title: "Formation RH" },
  { src: img10, title: "Formation Web" },
  { src: img11, title: "Formation Data" },
  { src: img12, title: "Formation IA" },
];

// ========== AVIS GOOGLE ==========
const testimonials = [
  { name: "Sahar Fredj", role: "Stagiaire", text: "Je suis venue de Monastir pour suivre la formation Pack Assistante de direction, qui comprend la comptabilité sur Sage. Une excellente expérience !", rating: 5, date: "2026-05-11" },
  { name: "Ines Fahem", role: "Stagiaire", text: "J'ai fait la formation Assistante de direction au centre certus à Monastir. Comptabilité sur SAGE, très professionnel !", rating: 5, date: "2026-05-11" },
  { name: "Rihem Mezrigui", role: "Stagiaire", text: "Je suis venue de Jendouba pour suivre la formation Allemand au Centre Certus à Monastir. Formation de qualité, je recommande !", rating: 5, date: "2026-05-11" },
  { name: "Najla Chtioui", role: "Stagiaire", text: "Un grand merci au Centre Certus de Formation ! Des professionnels à l'écoute et des formations de qualité.", rating: 5, date: "2025-12-01" },
  { name: "Sana Mansour Ezzine", role: "Stagiaire", text: "Des formations très adaptées à mes besoins surtout dans les spécificités soft Skills, photographie, les langues.", rating: 5, date: "2023-10-09" },
  { name: "Houda Mansour Chtioui", role: "Stagiaire", text: "J'ai suivi la formation en photographie dans le centre Certus. Le formateur était très pro, malgré la difficulté de la matière.", rating: 5, date: "2023-10-02" },
  { name: "Nawres Mansour", role: "Stagiaire", text: "Les formations sont très professionnelles et de qualité. L'administration est à l'écoute et super gentille. Je recommande vivement 👍", rating: 5, date: "2023-10-02" },
  { name: "Chtioui Malek", role: "Stagiaire", text: "Excellent centre de formation, je recommande vivement !", rating: 5, date: "2023-10-02" },
  { name: "Hatem Ben Amor", role: "Stagiaire", text: "Centre Certus bon accueil, top organisation, personnels pro et aidants. Diplôme certifié et reconnu.", rating: 5, date: "2023-10-02" },
  { name: "Belsem Mansour", role: "Stagiaire", text: "Excellent centre de formation, ils sont très professionnels. J'ai suivi des cours d'anglais, les propriétaires sont très à l'écoute.", rating: 5, date: "2023-10-02" },
  { name: "Ilyes Elwaer", role: "Stagiaire", text: "Très bonne expérience, formation de qualité !", rating: 5, date: "2019-07-02" },
  { name: "Haithem Khadraoui", role: "Stagiaire", text: "Centre sérieux et professionnel, je recommande.", rating: 5, date: "2018-03-30" },
  { name: "Moez Chargui", role: "Stagiaire", text: "Formation de qualité avec des formateurs compétents.", rating: 5, date: "2018-02-22" },
  { name: "Mariem Aouissaoui", role: "Stagiaire", text: "Formation au top ! J'ai beaucoup appris merci. Votre accompagnement et votre bienveillance m'ont beaucoup aidée.", rating: 5, date: "2026-04-29" },
  { name: "Latifa Touzi", role: "Designer", text: "I learned graphic design and photography in this center and I really recommend it ❤️❤️", rating: 5, date: "2026-04-28" },
  { name: "Sabrine Chalbi", role: "Designer Graphique", text: "Un grand merci au centre certus pour sa belle expérience. J'étudie 2 pack de design graphique et assistant manager.", rating: 5, date: "2026-04-27" },
  { name: "Marwa Bacha", role: "Stagiaire", text: "Votre accompagnement et votre bienveillance m'ont beaucoup aidée. Merci de tout cœur.", rating: 5, date: "2026-04-26" },
  { name: "Ahmed Ben Slimane", role: "Développeur Web", text: "Excellente formation ! Les formateurs sont très compétents.", rating: 5, date: "2026-04-25" },
  { name: "Nour Chaker", role: "Chef de projet", text: "Une expérience enrichissante avec des professionnels passionnés.", rating: 5, date: "2026-04-24" },
  { name: "Kamel Jlassi", role: "Manager", text: "Formation très professionnelle, je recommande vivement Certus.", rating: 5, date: "2026-04-20" },
  { name: "Olfa Ben Ahmed", role: "Consultante", text: "Une équipe à l'écoute et des formations de qualité. Merci Certus !", rating: 5, date: "2026-04-15" },
  { name: "Mohamed Ali Hammami", role: "Ingénieur", text: "Formation en Data IA très complète. Je recommande !", rating: 5, date: "2026-04-10" },
];

// Services rapides
const services = [
  { icon: "🎓", title: "Formations certifiantes", desc: "Diplômes reconnus par l'État" },
  { icon: "👨‍🏫", title: "Formateurs experts", desc: "Professionnels en activité" },
  { icon: "📅", title: "Formations sur mesure", desc: "Adaptées à vos besoins" },
  { icon: "💼", title: "Insertion professionnelle", desc: "Taux de réussite élevé" },
  { icon: "🏆", title: "Certification reconnue", desc: "Valeur ajoutée sur le marché" },
  { icon: "🤝", title: "Accompagnement", desc: "Suivi personnalisé" },
];

// ========== 7 THÈMES (CORRIGÉ) ==========
const servicesDetail = [
  { icon: "💻", title: "Digital & Web", desc: "Développement web, marketing digital", theme: "digital" },
  { icon: "📊", title: "Data & IA", desc: "Science des données, intelligence artificielle", theme: "data" },
  { icon: "🎨", title: "Design & Créativité", desc: "UI/UX design, graphisme", theme: "design" },
  { icon: "📈", title: "Management & Leadership", desc: "Gestion d'équipe, project management", theme: "management" },
  { icon: "💰", title: "Finance & Comptabilité", desc: "Gestion financière, comptabilité, audit", theme: "finance" },
  { icon: "🌱", title: "Énergies renouvelables", desc: "Développement durable, photovoltaïque", theme: "energie" },
  { icon: "🗣️", title: "Langues & Communication", desc: "Anglais, Allemand, Français des affaires, TOEIC", theme: "langues" },
];

const partners = [
  { name: "GRAVIC Tunitec", logo: "/logo_references/gravictunitec_logo.jpg" },
  { name: "Thyna Petroleum Services", logo: "/logo_references/tps.jpg" },
  { name: "BETI Moknine", logo: "/logo_references/beti-moknine.png" },
  { name: "Mauritania Airlines", logo: "/logo_references/mauritainia-airlines.png" },
  { name: "POLYCLINIQUE OKBA", logo: "/logo_references/polyclinique-okba.jpg" },
  { name: "DRÄXLMAIER Tunisie", logo: "/logo_references/draexelmaier.png" },
  { name: "Agil", logo: "/logo_references/Agil_Logo.gif" },
  { name: "SARTEX Monastir", logo: "/logo_references/sartex.png" },
  { name: "ALSICO Tunisia", logo: "/logo_references/alsico.jpg" },
  { name: "Smiths Interconnect", logo: "/logo_references/smith.jpg" },
  { name: "ENIM", logo: "/logo_references/enim.jpg" },
  { name: "ENET'Com Sfax", logo: "/logo_references/enetcom.jpg" },
  { name: "ENIS Sfax", logo: "/logo_references/enis-logo.jpg" },
  { name: "FDSPS Sousse", logo: "/logo_references/fdsps.jpg" },
  { name: "STE CONNECT", logo: "/logo_references/Ste-Connect-Sound-Light-Vision.jpg" },
  { name: "Modern Metal", logo: "/logo_references/modern-metal.jpg" },
];

const stats = [
  { value: "5000+", label: "Apprenants formés", icon: "👨‍🎓" },
  { value: "100+", label: "Formations", icon: "📚" },
  { value: "50+", label: "Formateurs experts", icon: "👨‍🏫" },
  { value: "10+", label: "Domaines d'expertise", icon: "🏆" },
];

const EMAILJS_CONFIG = {
  PUBLIC_KEY: "LNbKohuUxse3qtZjG",
  SERVICE_ID: "service_ixutrbl",
  TEMPLATE_ID: "template_5iq0uco"
};

const Home = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [randomTestimonials, setRandomTestimonials] = useState([]);
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [sendingDevis, setSendingDevis] = useState(false);
  const [devisData, setDevisData] = useState({
    name: "",
    email: "",
    telephone: "",
    formation: "",
    message: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    setRandomTestimonials(shuffled);
  }, []);

  const totalTestimonials = testimonials.length;
  const positiveTestimonials = testimonials.filter(t => t.rating >= 4).length;
  const recommendationRate = Math.round((positiveTestimonials / totalTestimonials) * 100);

  const handleDevisChange = (e) => {
    setDevisData({
      ...devisData,
      [e.target.name]: e.target.value
    });
  };

  const sendDevis = async (e) => {
    e.preventDefault();
    setSendingDevis(true);

    try {
      const templateParams = {
        to_email: "contact.certus@gmail.com",
        name: devisData.name,
        email: devisData.email,
        telephone: devisData.telephone || "Non renseigné",
        formation: devisData.formation || "Non spécifiée",
        message: devisData.message,
        title: devisData.formation || "Devis personnalisé",
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const response = await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);

      if (response.status === 200) {
        toast.success("✅ Demande de devis envoyée avec succès !");
        setShowDevisModal(false);
        setDevisData({ name: "", email: "", telephone: "", formation: "", message: "" });
      } else {
        throw new Error("Erreur d'envoi");
      }
    } catch (error) {
      console.error("Erreur envoi:", error);
      toast.error("❌ Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSendingDevis(false);
    }
  };

  // Navigation vers les formations avec filtre par thème
  const navigateToTheme = (themeId) => {
    navigate(`/formations?theme=${themeId}`);
  };

  return (
    <>
      <Helmet>
        <html lang="fr" />
        <title>Centre Certus de Formation | Formations professionnelles à Monastir</title>
        <meta name="description" content="Centre de formation professionnelle à Monastir, Tunisie. Plus de 5000 apprenants formés. Formations certifiantes en Digital, Data, Design, Management, Finance, Énergies et Langues." />
        <meta name="keywords" content="centre de formation Monastir, formation professionnelle Tunisie, formation certifiante, Certus, formation digitale, formation data, formation langues, école de formation Monastir" />
        <link rel="canonical" href="https://centrecertusdeformation.tn" />
        <meta property="og:title" content="Centre Certus de Formation | Formations professionnelles à Monastir" />
        <meta property="og:description" content="Découvrez nos formations certifiantes à Monastir. Digital, Data, Design, Management, Finance, Énergies et Langues." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://centrecertusdeformation.tn" />
        <meta property="og:image" content={couverture} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Centre Certus de Formation" />
        <meta name="twitter:description" content="Formations professionnelles certifiantes à Monastir" />
        
        {/* JSON-LD Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Centre Certus de Formation",
            "url": "https://centrecertusdeformation.tn",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Monastir",
              "addressCountry": "TN"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": totalTestimonials
            }
          })}
        </script>
      </Helmet>

      <div className="text-gray-800">
        {/* HERO SECTION */}
        <div className="h-screen bg-cover bg-center bg-fixed flex items-center justify-center" style={{ backgroundImage: `url(${couverture})` }}>
          <div className="bg-black bg-opacity-50 p-8 rounded shadow-md text-center max-w-4xl mx-4">
            <motion.h1 className="text-white text-4xl md:text-6xl font-bold mb-2" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
              Bienvenue chez CERTUS
            </motion.h1>
            <motion.p className="text-white text-xl md:text-2xl font-semibold mb-3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
              DEVENEZ CE QUE VOUS AVEZ CHOISI AVEC CERTUS
            </motion.p>
            <motion.p className="text-white text-base md:text-lg max-w-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>
              Centre de formation professionnelle au centre ville de Monastir, Tunisie.
            </motion.p>
            <motion.div className="flex flex-wrap gap-4 justify-center mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <button onClick={() => navigate('/formations')} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                📚 Découvrir nos formations
              </button>
              <button onClick={() => setShowDevisModal(true)} className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300">
                📞 Demander un devis
              </button>
            </motion.div>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="py-12 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, i) => (
                <motion.div key={i} initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }}>
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-blue-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* POURQUOI CHOISIR CERTUS */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase">À propos</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Pourquoi choisir CERTUS ?</h2>
              <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
            </motion.div>
            <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
              Fondé en 2017, CERTUS propose des formations professionnalisantes dans des domaines clés.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} viewport={{ once: true }} whileHover={{ y: -8 }} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* GALERIE DE FORMATIONS */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase">Galerie</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Découvrez nos formations</h2>
              <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
            </motion.div>
            <Swiper 
              spaceBetween={15} 
              slidesPerView={2} 
              grabCursor={true} 
              autoplay={{ delay: 2000, disableOnInteraction: false }} 
              loop={true} 
              navigation={true}
              pagination={{ clickable: true }}
              modules={[Autoplay, Pagination, Navigation]}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              className="pb-12"
            >
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <motion.div className="overflow-hidden rounded-xl shadow-md cursor-pointer" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} onClick={() => { setIndex(i); setOpen(true); }}>
                    <img src={img.src} alt={img.title} className="w-full h-48 object-cover" />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {open && <Lightbox open={open} close={() => setOpen(false)} slides={images.map(({ src, title }) => ({ src, title }))} index={index} plugins={[Captions]} captions={{ descriptionTextAlign: "center" }} />}

        {/* NOS SERVICES - Version cliquable avec 7 thèmes */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase">Expertise</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Nos formations par domaine</h2>
              <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Cliquez sur un domaine pour voir toutes les formations correspondantes</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesDetail.map((service, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1, duration: 0.5 }} 
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  onClick={() => navigateToTheme(service.theme)}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform">{service.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.desc}</p>
                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition">Voir les formations →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* TEMOIGNAGES */}
        <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase">Avis</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ce que disent nos stagiaires</h2>
              <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mt-6 shadow-md">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="font-bold text-gray-800">Recommandé par {recommendationRate}%</span>
                <span className="text-gray-500">({totalTestimonials} avis)</span>
              </div>
            </motion.div>
            <Swiper 
              spaceBetween={30} 
              slidesPerView={1} 
              breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} 
              autoplay={{ delay: 2000, disableOnInteraction: false }} 
              pagination={{ clickable: true }} 
              navigation={true} 
              modules={[Autoplay, Pagination, Navigation]} 
              className="pb-12"
            >
              {randomTestimonials.map((t, i) => (
                <SwiperSlide key={i}>
                  <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
                    <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}</div>
                    <p className="text-gray-600 text-sm italic mb-4 flex-grow">“{t.text}”</p>
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-600">{t.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* ILS NOUS FONT CONFIANCE */}
        <div className="py-16 overflow-hidden bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Partenaires</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ils nous font confiance</h2>
              <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
            </motion.div>

            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={2}
              navigation={true}
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              loop={true}
              breakpoints={{
                480: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
                1280: { slidesPerView: 6 }
              }}
              className="partners-swiper"
            >
              {partners.map((partner, i) => (
                <SwiperSlide key={i}>
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="h-24 w-24 flex items-center justify-center bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="text-3xl">🏢</div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-3 text-center font-medium line-clamp-2 max-w-[100px]">
                      {partner.name}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* CTA FINAL */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Prêt à booster votre carrière ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 mb-8"
            >
              Rejoignez CERTUS dès aujourd'hui et transformez votre avenir professionnel
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <button onClick={() => setShowDevisModal(true)} className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
                📞 Demander un devis
              </button>
              <button onClick={() => navigate('/formations')} className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                📚 Voir les formations
              </button>
            </motion.div>
          </div>
        </div>

        {/* MODAL DEVIS */}
        <AnimatePresence>
          {showDevisModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDevisModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">Demande de devis</h2>
                      <p className="text-blue-100 text-sm">Nous vous répondrons sous 24h</p>
                    </div>
                    <button onClick={() => setShowDevisModal(false)} className="text-white/80 hover:text-white transition text-2xl">✕</button>
                  </div>
                </div>
                <form onSubmit={sendDevis} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input type="text" name="name" required value={devisData.name} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="email" required value={devisData.email} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" placeholder="jean.dupont@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" name="telephone" value={devisData.telephone} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" placeholder="06 12 34 56 78" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formation souhaitée</label>
                    <input type="text" name="formation" value={devisData.formation} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]" placeholder="Ex: Développement Web" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea name="message" required rows="4" value={devisData.message} onChange={handleDevisChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db] resize-none" placeholder="Décrivez votre projet..." />
                  </div>
                  <button type="submit" disabled={sendingDevis} className="w-full bg-gradient-to-r from-[#1a56db] to-[#76c21f] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                    {sendingDevis ? "Envoi en cours..." : "📩 Envoyer la demande"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
};

export default Home;