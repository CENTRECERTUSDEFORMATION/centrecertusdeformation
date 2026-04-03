import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
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
  { src: img1, title: "Formation 1" },
  { src: img2, title: "Formation 2" },
  { src: img3, title: "Formation 3" },
  { src: img4, title: "Formation 4" },
  { src: img5, title: "Formation 5" },
  { src: img6, title: "Formation 6" },
  { src: img7, title: "Formation 7" },
  { src: img8, title: "Formation 8" },
  { src: img9, title: "Formation 9" },
  { src: img10, title: "Formation 10" },
  { src: img11, title: "Formation 11" },
  { src: img12, title: "Formation 12" },
];

const testimonials = [
  {
    name: "Imen B.",
    text: "Une formation exceptionnelle, très enrichissante. Les formateurs sont compétents et à l’écoute.",
  },
  {
    name: "Khaled M.",
    text: "CERTUS m’a permis de décrocher un poste en informatique juste après la formation. Merci !",
  },
  {
    name: "Nour R.",
    text: "J’ai adoré l’ambiance et le contenu pédagogique. Je recommande à 100%.",
  },
];

const Home = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div className="text-gray-800">
      <div
        className="h-[80vh] bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{ backgroundImage: `url(${couverture})` }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded shadow-md text-center">
          <motion.h1
            className="text-white text-4xl md:text-5xl font-bold mb-2"
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
            className="text-white text-lg md:text-xl max-w-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Centre de formation professionnelle au centre ville de Monastir, Tunisie. Innovation, excellence et performance au cœur de votre réussite.
          </motion.p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Pourquoi choisir CERTUS ?</h2>
        <p className="leading-relaxed text-justify mb-6">
          Fondé en 2017, CERTUS propose des formations professionnalisantes dans des domaines clés tels que le digital, l’informatique, la comptabilité, le design ou encore les énergies renouvelables. Grâce à une pédagogie active et des formateurs expérimentés, nous accompagnons particuliers et entreprises vers l'excellence.
        </p>

        <div className="mt-10">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Galerie de formations</h3>
          <Swiper
            spaceBetween={15}
            slidesPerView={3}
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
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-48 object-cover transition-transform duration-300 ease-in-out"
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
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

        <div className="mt-16">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Nos formations en action</h3>
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            modules={[Autoplay, Pagination]}
          >
            {images.slice(0, 6).map((img, i) => (
              <SwiperSlide key={i}>
                <img
                  src={img.src}
                  alt={img.title}
                  className="rounded-lg w-full h-64 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">Ce que disent nos stagiaires</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="bg-white shadow-md p-6 rounded-xl border-l-4 border-blue-600"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="italic text-gray-700">“{t.text}”</p>
                <p className="mt-4 font-bold text-blue-800">– {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
