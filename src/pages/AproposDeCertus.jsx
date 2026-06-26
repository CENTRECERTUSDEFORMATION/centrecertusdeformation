import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Aos from 'aos';
import 'aos/dist/aos.css';

// ✅ CORRIGÉ : extensions en minuscules .webp
import pyramide from '../assets/pyramide.webp';
import approche from '../assets/approche.webp';
import humain from '../assets/humain.webp';
import partenaire from '../assets/partenaire.webp';
import logo from '../assets/logo-certus.webp';
import Footer from '../components/Footer';

const AproposDeCertus = () => {
  useEffect(() => {
    Aos.init({ once: true, duration: 1000 });
  }, []);

  // Statistiques
  const stats = [
    { value: "2017", label: "Année de création", icon: "📅" },
    { value: "5000+", label: "Apprenants formés", icon: "👨‍🎓" },
    { value: "50+", label: "Formations proposées", icon: "📚" },
    { value: "100%", label: "Satisfaction client", icon: "⭐" }
  ];

  // Valeurs
  const values = [
    { title: "Excellence", description: "Nous visons l'excellence dans chaque formation que nous proposons.", icon: "🏆", color: "from-yellow-500 to-orange-500" },
    { title: "Innovation", description: "Nos méthodes pédagogiques sont constamment innovantes et adaptées.", icon: "💡", color: "from-blue-500 to-cyan-500" },
    { title: "Bienveillance", description: "L'humain est au cœur de notre démarche pédagogique.", icon: "🤝", color: "from-green-500 to-emerald-500" },
    { title: "Engagement", description: "Nous nous engageons pour la réussite de chaque apprenant.", icon: "🎯", color: "from-purple-500 to-pink-500" }
  ];

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

  return (
    <>
      <Helmet>
        <title>À propos | Centre Certus de Formation - Votre partenaire formation à Monastir</title>
        <meta name="description" content="Découvrez le Centre Certus de Formation à Monastir, agréé par l'État depuis 2017. Formations certifiantes en langues, informatique, digital, design et plus. +5000 apprenants formés." />
        <meta name="keywords" content="centre formation Monastir, Certus, formation certifiante, école formation Tunisie" />
        <link rel="canonical" href="https://centrecertusdeformation.tn/a-propos" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#1a56db] via-[#1a56db] to-[#76c21f] text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6"
            >
              <span>🏆</span>
              <span>Depuis 2017</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">Certus</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Centre de formation professionnelle agréé par l'État tunisien
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto" fill="currentColor" style={{ color: '#f8fafc' }}>
              <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </div>

        {/* Statistiques */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center p-4"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-[#1a56db]">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1 : Présentation générale avec logo */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="w-full md:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <img src={logo} alt="Certus Logo" className="h-40 w-auto mx-auto" />
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Agrément N° <strong className="text-[#1a56db]">52-193-17</strong></p>
                  <p className="text-sm text-gray-500">Depuis le <strong>5 juin 2017</strong></p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Qui sommes-nous ?</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Le <strong className="text-[#1a56db]">Centre CERTUS de Formation</strong>, agréé par l'État sous le numéro <strong>52-193-17</strong> depuis le <strong>5 juin 2017</strong>, est situé à <strong>Monastir</strong>, en Tunisie.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Nous proposons des formations dans divers domaines tels que les <strong>langues</strong>, l'<strong>informatique</strong>, la <strong>comptabilité</strong>, le <strong>marketing digital</strong>, la <strong>photographie</strong>, le <strong>design graphique</strong>, le <strong>développement web</strong>, la <strong>décoration d'intérieur</strong> et les <strong>énergies renouvelables</strong>.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Notre objectif est de doter chaque participant de compétences pratiques et certifiées, répondant aux besoins du marché de l'emploi tunisien et international.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Nos valeurs */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-[#1a56db] font-semibold text-sm uppercase tracking-wider">Nos valeurs</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-800">Ce qui nous anime</h2>
              <div className="w-20 h-1 bg-[#1a56db] mx-auto rounded-full"></div>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl"
                >
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Section 2 : Vision et Engagement */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src={pyramide} alt="Pyramide de la Transformation" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Vision et Engagement</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Au Centre CERTUS de Formation, nous croyons profondément que la formation professionnelle doit aller au-delà de la simple transmission de connaissances.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Notre raison d'être est de vous apporter inspiration et innovation pour accompagner vos transformations, en conjuguant performance durable et épanouissement des équipes.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-blue-700 text-sm font-semibold">🎯 Notre mission : Transformer les compétences en performance durable</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 3 : Approche sur mesure */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img src={approche} alt="Approche sur mesure" className="w-full h-auto object-cover" />
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Une approche sur mesure</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Nous rejetons les solutions standardisées. Nos équipes conçoivent avec vous des solutions parfaitement adaptées à vos enjeux, secteur d'activité et culture d'entreprise.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {["Analyse stratégique", "Ingénierie innovante", "Méthodes engageantes", "Pilotage rigoureux", "Logistique irréprochable", "Évaluation précise"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Section 4 : L'humain au cœur */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img src={humain} alt="Valeur humaine" className="w-full h-auto object-cover" />
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">L'humain au cœur de notre démarche</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Ce qui nous distingue, c'est notre conviction que la performance durable dépend de l'épanouissement des individus.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Nos formations sont conçues comme des expériences humaines enrichissantes pour développer compétences et confiance.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {["Compétences applicables", "Confiance renforcée", "Nouvelles perspectives", "Connexions significatives", "Outils partagés"].map((item, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 5 : Partenaire engagé */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img src={partenaire} alt="Partenaire engagé" className="w-full h-auto object-cover" />
                </div>
              </motion.div>
              
              <motion.div 
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Un partenaire engagé dans votre réussite</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    En choisissant CERTUS, vous engagez un véritable partenaire pour relever les défis et saisir les opportunités de demain.
                  </p>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Cette vision a construit des relations durables avec de nombreuses organisations en Tunisie.
                  </p>
                  <div className="mt-6 p-4 bg-gradient-to-r from-[#1a56db] to-[#76c21f] rounded-xl text-white text-center">
                    <p className="font-semibold text-lg">Ensemble, transformons les compétences en performance !</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="py-16 bg-gradient-to-r from-[#1a56db] to-[#76c21f]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Rejoignez l'aventure Certus
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-blue-100 mb-8"
            >
              Découvrez nos formations et donnez un nouvel élan à votre carrière
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <a
                href="/formations"
                className="px-8 py-3 bg-white text-[#1a56db] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                📚 Découvrir nos formations
              </a>
              <a
                href="/contact"
                className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
              >
                📞 Nous contacter
              </a>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AproposDeCertus;