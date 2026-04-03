import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Aos from 'aos';
import 'aos/dist/aos.css';
import pyramide from '../assets/pyramide.png';
import approche from '../assets/approche.jpg';
import humain from '../assets/humain.jpg';
import partenaire from '../assets/partenaire.jpg';
import logo from '../assets/logo-certus.png';
import Footer from '../components/Footer';

const AproposDeCertus = () => {
  useEffect(() => {
    Aos.init({ once: true, duration: 1000 }); // Duration global, évite de répéter dans chaque élément
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-20">
      
      {/* Section 1 : Présentation générale avec logo statique */}
      <section className="flex flex-col md:flex-row items-center gap-8 text-justify font-georgia text-neutral-900 leading-relaxed">
        <motion.div 
          className="w-full md:w-1/2 flex justify-center" 
          data-aos="fade-right"
        >
          <img src={logo} alt="Certus Logo" className="h-[180px] w-auto" />
          {/* Utiliser h-[180px] (taille personnalisée) à la place de h-45 qui n’existe pas */}
        </motion.div>
        
        <motion.div className="w-full md:w-1/2" data-aos="fade-left">
          <h1 className="text-3xl font-bold mb-6 text-blue-900">À propos de Certus</h1>
          <p className="mb-4">
            Le <strong>Centre CERTUS de Formation</strong>, agréé par l’État sous le numéro <strong>52-193-17</strong> depuis le <strong>5 juin 2017</strong>, est situé à <strong>Monastir</strong>, en Tunisie.
          </p>
          <p className="mb-4">
            Nous proposons des formations dans divers domaines tels que les <strong>langues</strong>, l'<strong>informatique</strong>, la <strong>comptabilité</strong>, le <strong>marketing digital</strong>, la <strong>photographie</strong>, le <strong>design graphique</strong>, le <strong>développement web</strong>, la <strong>décoration d'intérieur</strong> et les <strong>énergies renouvelables</strong>.
          </p>
          <p>
            Notre objectif est de doter chaque participant de compétences pratiques et certifiées, répondant aux besoins du marché de l'emploi tunisien et international.
          </p>
        </motion.div>
      </section>

      {/* Section 2 : La pyramide de la transformation */}
      <section className="flex flex-col md:flex-row items-center gap-8">
        <motion.img 
          src={pyramide} 
          alt="Pyramide de la Transformation" 
          className="w-full md:w-1/2 rounded shadow" 
          data-aos="fade-right" 
        />
        <motion.div 
          className="w-full md:w-1/2 text-justify font-georgia text-neutral-900 leading-relaxed" 
          data-aos="fade-left"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Vision et Engagement</h2>
          <p className="mb-4">
            Au Centre CERTUS de Formation, nous croyons profondément que la formation professionnelle doit aller au-delà de la simple transmission de connaissances.
          </p>
          <p>
            Notre raison d'être est de vous apporter inspiration et innovation pour accompagner vos transformations, en conjuguant performance durable et épanouissement des équipes.
          </p>
        </motion.div>
      </section>

      {/* Section 3 */}
      <section className="flex flex-col md:flex-row-reverse items-center gap-8">
        <motion.img 
          src={approche} 
          alt="Approche sur mesure" 
          className="w-full md:w-1/2 rounded shadow" 
          data-aos="fade-left" 
        />
        <motion.div 
          className="w-full md:w-1/2 text-justify font-georgia text-neutral-900 leading-relaxed" 
          data-aos="fade-right"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Une approche sur mesure</h2>
          <p className="mb-4">
            Nous rejetons les solutions standardisées. Nos équipes conçoivent avec vous des solutions parfaitement adaptées à vos enjeux, secteur d'activité et culture d'entreprise.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Analyse stratégique de vos besoins</li>
            <li>Ingénierie pédagogique innovante</li>
            <li>Méthodes d'animation engageantes</li>
            <li>Pilotage rigoureux</li>
            <li>Logistique irréprochable</li>
            <li>Évaluation précise des résultats</li>
          </ul>
        </motion.div>
      </section>

      {/* Section 4 */}
      <section className="flex flex-col md:flex-row items-center gap-8">
        <motion.img 
          src={humain} 
          alt="Valeur humaine" 
          className="w-full md:w-1/2 rounded shadow" 
          data-aos="fade-right" 
        />
        <motion.div 
          className="w-full md:w-1/2 text-justify font-georgia text-neutral-900 leading-relaxed" 
          data-aos="fade-left"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-900">L'humain au cœur de notre démarche</h2>
          <p className="mb-4">
            Ce qui nous distingue, c’est notre conviction que la performance durable dépend de l'épanouissement des individus.
          </p>
          <p className="mb-4">
            Nos formations sont conçues comme des expériences humaines enrichissantes pour développer compétences et confiance.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Développement de compétences applicables</li>
            <li>Renforcement de la confiance</li>
            <li>Découverte de nouvelles perspectives</li>
            <li>Création de connexions significatives</li>
            <li>Appropriation des outils partagés</li>
          </ul>
        </motion.div>
      </section>

      {/* Section 5 */}
      <section className="flex flex-col md:flex-row-reverse items-center gap-8">
        <motion.img 
          src={partenaire} 
          alt="Partenaire engagé" 
          className="w-full md:w-1/2 rounded shadow" 
          data-aos="fade-left" 
        />
        <motion.div 
          className="w-full md:w-1/2 text-justify font-georgia text-neutral-900 leading-relaxed" 
          data-aos="fade-right"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-900">Un partenaire engagé dans votre réussite</h2>
          <p className="mb-4">
            En choisissant CERTUS, vous engagez un véritable partenaire pour relever les défis et saisir les opportunités de demain.
          </p>
          <p className="mb-4">
            Cette vision a construit des relations durables avec de nombreuses organisations en Tunisie.
          </p>
          <p className="font-semibold text-blue-700">
            Ensemble, transformons les compétences en performance !
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AproposDeCertus;
