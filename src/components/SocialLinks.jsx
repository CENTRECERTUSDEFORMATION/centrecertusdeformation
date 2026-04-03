import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function SocialLinks() {
  return (
    <div className="flex space-x-4">
      <a href="#" className="text-blue-600"><FaFacebook size={24} /></a>
      <a href="#" className="text-pink-500"><FaInstagram size={24} /></a>
      <a href="#" className="text-blue-800"><FaLinkedin size={24} /></a>
    </div>
  );
}