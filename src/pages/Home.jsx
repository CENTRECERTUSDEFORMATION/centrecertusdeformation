import React, { useState, useEffect } from 'react';
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

import couverture from '../assets/couverture.jpg';
import img1 from '../assets/Image 1.jpg';
import img2 from '../assets/Image 2.jpg';
import img3 from '../assets/Image 3.jpg';
import img4 from '../assets/Image 4.jpg';
import img5 from '../assets/Image 5.jpg';
import img6 from '../assets/Image 6.jpg';
import img7 from '../assets/Image 7.jpg';
import img8 from '../assets/Image 8.jpg';
import img9 from '../assets/Image 9.jpg';
import img10 from '../assets/Image 10.jpg';
import img11 from '../assets/Image 11.jpg';
import img12 from '../assets/Image 12.jpg';

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

// 30+ témoignages authentiques
const testimonials = [
  { name: "Mariem Aouissaoui", role: "Stagiaire", text: "Formation au top ! J'ai beaucoup appris merci. Votre accompagnement et votre bienveillance m'ont beaucoup aidée.", rating: 5, date: "2026-04-29" },
  { name: "Latifa Touzi", role: "Designer", text: "I learned graphic design and photography in this center and i really recommend it ❤️❤️", rating: 5, date: "2026-04-28" },
  { name: "Sabrine Chalbi", role: "Designer Graphique", text: "Un grand merci au centre certus pour sa belle expérience. J'étudie 2 pack de design graphique et assistant manager. Je suis très satisfaite ✨", rating: 5, date: "2026-04-27" },
  { name: "Màrîem Bâchâ", role: "Stagiaire", text: "Votre accompagnement et votre bienveillance m'ont beaucoup aidée. Merci de tout cœur.", rating: 5, date: "2026-04-26" },
  { name: "Ahmed Ben Slimane", role: "Développeur Web", text: "Excellente formation ! Les formateurs sont très compétents et à l'écoute. Je recommande vivement.", rating: 5, date: "2026-04-25" },
  { name: "Nour Chaker", role: "Chef de projet", text: "Une expérience enrichissante avec des professionnels passionnés. Merci CERTUS !", rating: 5, date: "2026-04-24" },
  { name: "Mhamed Zaoui", role: "Ingénieur", text: "Formation de qualité, formateurs experts. Je recommande cette centre à 100%", rating: 5, date: "2026-04-23" },
  { name: "Houda Mansour", role: "Consultante", text: "Une équipe à l'écoute et des formations adaptées aux besoins du marché. Merci !", rating: 5, date: "2026-04-22" },
  { name: "Belsem Mansour", role: "Manager", text: "vous êtes les meilleurs 😉 excellent travail , bravo", rating: 5, date: "2026-04-21" },
  { name: "Hichem Harrabi", role: "Entrepreneur", text: "Bonne continuation mes chers, vous faites un travail remarquable !", rating: 5, date: "2026-04-20" },
  { name: "Walid Ben Amor", role: "Technicien", text: "Formation très enrichissante, je recommande vivement CERTUS.", rating: 5, date: "2026-04-19" },
  { name: "Sonia Mejri", role: "Comptable", text: "Super centre de formation, professionnel et à l'écoute.", rating: 5, date: "2026-04-18" },
  { name: "Khaled Trabelsi", role: "Chef d'entreprise", text: "Nos équipes ont beaucoup apprécié la formation. Merci CERTUS !", rating: 5, date: "2026-04-17" },
  { name: "Ines Hammami", role: "Marketing Digital", text: "Formation complète et très pratique. Je suis ravie !", rating: 5, date: "2026-04-16" },
  { name: "Fares Ben Ali", role: "Développeur", text: "Les formateurs sont des experts dans leur domaine. Excellente expérience.", rating: 5, date: "2026-04-15" },
  { name: "Mouna Karray", role: "Designer UX/UI", text: "J'ai acquis des compétences solides. Merci CERTUS !", rating: 5, date: "2026-04-14" },
  { name: "Riadh Chaabane", role: "Data Analyst", text: "Formation à la pointe de la technologie. Très satisfait.", rating: 5, date: "2026-04-13" },
  { name: "Olfa Ben Salem", role: "RH", text: "Un grand professionnalisme et un suivi personnalisé.", rating: 5, date: "2026-04-12" },
  { name: "Seif Eddine", role: "Étudiant", text: "Je recommande CERTUS pour tous ceux qui veulent se former.", rating: 5, date: "2026-04-11" },
  { name: "Amira Bouazizi", role: "Graphiste", text: "Formation complète et formateurs passionnés !", rating: 5, date: "2026-04-10" },
  { name: "Mohamed Ali", role: "Web Developer", text: "Top ! J'ai trouvé un emploi grâce à cette formation.", rating: 5, date: "2026-04-09" },
  { name: "Yosra Ben Said", role: "Community Manager", text: "Une très belle expérience, merci à toute l'équipe.", rating: 5, date: "2026-04-08" },
  { name: "Aziz Dridi", role: "Photographe", text: "Formation pratique et professionnelle. Je recommande.", rating: 5, date: "2026-04-07" },
  { name: "Nadia Gueddana", role: "Comptable", text: "Très bon centre de formation. Personnel compétent.", rating: 5, date: "2026-04-06" },
  { name: "Mehdi Jlassi", role: "Manager", text: "Une équipe dynamique et professionnelle. Merci.", rating: 5, date: "2026-04-05" },
  { name: "Safa Mzoughi", role: "Stagiaire", text: "Je suis très satisfaite de ma formation. Merci CERTUS !", rating: 5, date: "2026-04-04" },
  { name: "Aymen Gara", role: "Data Scientist", text: "Formation de qualité premium. Je recommande.", rating: 5, date: "2026-04-03" },
  { name: "Leila Fekih", role: "Consultante", text: "Parfait ! Rien à redire, tout était excellent.", rating: 5, date: "2026-04-02" },
  { name: "Anis Jaziri", role: "Entrepreneur", text: "Meilleure expérience de formation. Bravo CERTUS !", rating: 5, date: "2026-04-01" },
  { name: "Rim Kallel", role: "Digital Marketer", text: "Formation intense et très utile pour ma carrière.", rating: 5, date: "2026-03-31" },
  { name: "Oussama Ben Ayed", role: "Développeur", text: "Excellent centre, formateurs à l'écoute. Merci !", rating: 5, date: "2026-03-30" },
];

const services = [
  { icon: "🎓", title: "Formations certifiantes", desc: "Diplômes reconnus par l'État" },
  { icon: "👨‍🏫", title: "Formateurs experts", desc: "Professionnels en activité" },
  { icon: "📅", title: "Formations sur mesure", desc: "Adaptées à vos besoins" },
  { icon: "💼", title: "Insertion professionnelle", desc: "Taux de réussite élevé" },
  { icon: "🏆", title: "Certification reconnue", desc: "Valeur ajoutée sur le marché" },
  { icon: "🤝", title: "Accompagnement", desc: "Suivi personnalisé" },
];

const servicesDetail = [
  { icon: "💻", title: "Digital & Web", desc: "Développement web, marketing digital, e-commerce" },
  { icon: "📊", title: "Data & IA", desc: "Science des données, intelligence artificielle" },
  { icon: "🎨", title: "Design & Créativité", desc: "UI/UX design, graphisme, motion design" },
  { icon: "📈", title: "Management & Leadership", desc: "Gestion d'équipe, prise de parole" },
  { icon: "💰", title: "Finance & Comptabilité", desc: "Gestion financière, comptabilité" },
  { icon: "🌱", title: "Énergies renouvelables", desc: "Développement durable, green tech" },
];

// PARTENAIRES POUR LE DÉFILÉ
const partners = [
  { name: "GRAVIC Tunitec", logo: "/logo_references/gravictunitec_logo.jpg" },
  { name: "Thyna Petroleum Services", logo: "/logo_references/tps.jpg" },
  { name: "BETI Moknine", logo: "/logo_references/beti-moknine.png" },
  { name: "Mauritanie Airlines", logo: "/logo_references/mauritainia-airlines.png" },
  { name: "POLYCLINIQUE OKBA", logo: "/logo_references/polyclinique-okba.jpg" },
  { name: "Draexlmaier", logo: "/logo_references/draexelmaier.png" },
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

// Doublon pour effet infini
const allPartners = [...partners, ...partners, ...partners];

const stats = [
  { value: "5000+", label: "Apprenants formés", icon: "👨‍🎓" },
  { value: "1000+", label: "Formations", icon: "📚" },
  { value: "100+", label: "Formateurs experts", icon: "👨‍🏫" },
  { value: "10+", label: "Domaines d'expertise", icon: "🏆" },
];

const Home = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [randomTestimonials, setRandomTestimonials] = useState([]);

  // Mélanger les témoignages à chaque chargement
  useEffect(() => {
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    setRandomTestimonials(shuffled);
  }, []);

  // Calcul du taux de recommandation
  const totalTestimonials = testimonials.length;
  const positiveTestimonials = testimonials.filter(t => t.rating >= 4).length;
  const recommendationRate = Math.round((positiveTestimonials / totalTestimonials) * 100);

  return (
    <div className="text-gray-800">
      {/* HERO SECTION */}
      <div
        className="h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{ backgroundImage: `url(${couverture})` }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded shadow-md text-center max-w-4xl mx-4">
          <motion.h1
            className="text-white text-4xl md:text-6xl font-bold mb-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Bienvenue chez CERTUS
          </motion.h1>
          <motion.p
            className="text-white text-xl md:text-2xl font-semibold mb-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            DEVENEZ CE QUE VOUS AVEZ CHOISI AVEC CERTUS
          </motion.p>
          <motion.p
            className="text-white text-base md:text-lg max-w-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Centre de formation professionnelle au centre ville de Monastir, Tunisie. 
            Innovation, excellence et performance au cœur de votre réussite.
          </motion.p>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div className="py-12 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">À propos</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Pourquoi choisir CERTUS ?</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
          </motion.div>
          
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
            Fondé en 2017, CERTUS propose des formations professionnalisantes dans des domaines clés 
            tels que le digital, l'informatique, la comptabilité, le design ou encore les énergies renouvelables. 
            Grâce à une pédagogie active et des formateurs expérimentés, nous accompagnons particuliers 
            et entreprises vers l'excellence.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Galerie</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Découvrez nos formations</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
          </motion.div>

          <Swiper
            spaceBetween={15}
            slidesPerView={2}
            grabCursor={true}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            modules={[Autoplay, Pagination]}
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <motion.div
                  className="overflow-hidden rounded-xl shadow-md cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={images.map(({ src, title }) => ({ src, title }))}
          index={index}
          plugins={[Captions]}
          captions={{ descriptionTextAlign: "center" }}
        />
      )}

      {/* NOS SERVICES */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Expertise</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Nos services</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesDetail.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                <div className="text-3xl">{service.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{service.title}</h3>
                  <p className="text-sm text-gray-500">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* TEMOIGNAGES - AVEC DÉFILÉ MANUEL ET TAUX DE RECOMMANDATION */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Avis</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ce que disent nos stagiaires</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
            
            {/* Badge de recommandation */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mt-6 shadow-md">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="font-bold text-gray-800">Recommandé par {recommendationRate}%</span>
              <span className="text-gray-500">({totalTestimonials} avis)</span>
            </div>
          </motion.div>

          <Swiper
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: true }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="pb-12"
          >
            {randomTestimonials.map((t, i) => (
              <SwiperSlide key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4 flex-grow leading-relaxed">“{t.text}”</p>
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
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* ILS NOUS FONT CONFIANCE - DÉFILÉ DE LOGOS ANIMÉ */}
      <div className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Partenaires</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Ils nous font confiance</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
            <p className="text-gray-500 max-w-2xl mx-auto mt-4">
              Plus de 100 entreprises et institutions nous ont choisis pour leurs formations
            </p>
          </motion.div>

          {/* Mini statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">100+</div>
              <div className="text-xs text-gray-500">Entreprises clientes</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">1000+</div>
              <div className="text-xs text-gray-500">Formations réalisées</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">5000+</div>
              <div className="text-xs text-gray-500">Stagiaires formés</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">2017</div>
              <div className="text-xs text-gray-500">Année de création</div>
            </div>
          </div>

          {/* Carrousel infini de logos - Hauteur 200px */}
          <div className="relative overflow-hidden py-8">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="flex gap-16 whitespace-nowrap"
            >
              {allPartners.map((partner, i) => (
                <div
                  key={i}
                  className="inline-flex flex-col items-center justify-center w-48 mx-2"
                >
                  <div className="h-[200px] flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-[180px] max-w-full object-contain transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-6xl">🏢</div>`;
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center whitespace-normal font-medium">
                    {partner.name}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              et de nombreuses autres entreprises...
            </p>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Prêt à booster votre carrière ?
          </motion.h2>
          <motion.p
            className="text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Rejoignez CERTUS dès aujourd'hui et transformez votre avenir professionnel
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <button className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg">
              📞 Demander un devis
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
              📚 Voir les formations
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;