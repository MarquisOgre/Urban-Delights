// src/components/Footer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  showTopButton?: boolean;
}

const footerLinks = [
  { label: 'About Us', to: '/about-us' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Returns & Refunds', to: '/returns-refunds' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'FAQs', to: '/faq' },
];

const Footer: React.FC<FooterProps> = ({ showTopButton = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 200);
    if (showTopButton) {
      toggleVisibility();
      window.addEventListener('scroll', toggleVisibility);
    }
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showTopButton]);

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer className="bg-white">
        <div className="container mx-auto px-6 py-8 sm:px-8 sm:py-10">
          <nav
            aria-label="Footer navigation"
            className="flex w-full flex-nowrap items-center gap-x-8 overflow-x-auto whitespace-nowrap pr-20 text-sm sm:gap-x-9 sm:text-base"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="shrink-0 text-stone-600 transition-colors duration-200 hover:text-orange-600"
                onClick={backToTop}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 py-2.5 text-center text-xs font-bold text-white sm:text-sm">
          <div className="container mx-auto px-4">
            <p>
              © {new Date().getFullYear()} Urban Delights. Crafted with ❤️ by Dexorzo Creations.
            </p>
          </div>
        </div>
      </footer>

      {showTopButton && visible && (
        <button
          onClick={backToTop}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-2xl"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Footer;
