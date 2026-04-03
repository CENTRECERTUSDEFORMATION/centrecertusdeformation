import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.h1
        className="text-4xl font-bold text-center mb-6 text-blue-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Contactez-Nous
      </motion.h1>

      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <p className="text-lg text-gray-700 mb-2">
          <strong>Adresse :</strong> Avenue du Combattant Suprême, 5000 Monastir
        </p>
        <p className="text-lg text-gray-700 mb-2">
          <strong>Commercial :</strong> 54 58 29 80 - 54 58 29 82
        </p>
        <p className="text-lg text-gray-700 mb-2">
          <strong>Administration :</strong> 53 58 29 80
        </p>
        <p className="text-lg text-gray-700">
          <strong>Email :</strong> contact.certus@gmail.com
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="rounded overflow-hidden shadow-lg"
      >
        <iframe
          title="Centre Certus de Formation - Monastir"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3237.361974077142!2d10.8207298!3d35.7711525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212ca7cc8b735%3A0xa39100a1aa34d5fb!2sCentre%20Certus%20de%20Formation!5e0!3m2!1sfr!2stn!4v1713365429971!5m2!1sfr!2stn"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </motion.div>
    </div>
  );
};

export default Contact;
