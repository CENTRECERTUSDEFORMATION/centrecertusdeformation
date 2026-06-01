// frontend/src/components/ModalInscriptionDemande.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import InscriptionForm from "./InscriptionForm";

const ModalInscriptionDemande = ({ isOpen, onClose, formation, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <InscriptionForm
              formation={formation}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalInscriptionDemande;