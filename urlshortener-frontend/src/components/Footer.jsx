import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaGlobe  } from "react-icons/fa";

const Footer = () => {
  return (
    /* Replaced bg-custom-gradient */
    <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8 z-40 relative">
      <div className="container mx-auto px-6 lg:px-14 flex flex-col lg:flex-row lg:justify-between items-center gap-4">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-2">PS Linky</h2>
          <p>Simplifying URL shortening for efficient sharing</p>
        </div>

        <p className="mt-4 lg:mt-0">
          &copy; 2026 PS Linky. All rights reserved.
        </p>

        <div className="flex space-x-6 mt-4 lg:mt-0">
          <a href="https://github.com/Pranav-Sharma-Official/" className="hover:text-gray-200">
            <FaGithub size={24} />
          </a>
          <a href="https://www.linkedin.com/in/-pranav--sharma-/" className="hover:text-gray-200">
            <FaLinkedin size={24} />
          </a>
          <a href="https://www.instagram.com/pranav_sharma.official/" className="hover:text-gray-200">
            <FaInstagram size={24} />
          </a>
          <a href="https://pranav-sharma.dev/" className="hover:text-gray-200">
            <FaGlobe size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;