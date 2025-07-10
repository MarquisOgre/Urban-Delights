// src/components/Footer.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface FooterProps {
  showTopButton?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showTopButton = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 200);
    };

    if (showTopButton) {
      window.addEventListener('scroll', toggleVisibility);
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showTopButton]);

  return (
    <>
      <footer className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-500 to-yellow-400 border-t text-center text-white font-bold py-2 z-30 text-xs sm:text-sm">
        <div className="container mx-auto px-2">
          <p className="truncate">
            © {new Date().getFullYear()} Artisan Delights. Crafted with ❤️ by Dexorzo Creations.
          </p>
        </div>
      </footer>

      {showTopButton && visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-16 right-4 z-50 p-2 sm:p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition text-sm sm:text-base"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Footer;
