// src/components/Footer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  showTopButton?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showTopButton = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 200);
    if (showTopButton) window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showTopButton]);

  return (
    <>
      <footer className="border-t border-stone-200 bg-stone-950 text-stone-300">
        <div className="container mx-auto px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <img src="/logo.png" alt="Urban Delights" className="h-11 w-auto brightness-0 invert" />
              <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
                Traditional South Indian podis and masalas, made with care for everyday meals.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Shop</h3>
              <div className="mt-3 space-y-2 text-sm">
                <Link to="/#products" className="block hover:text-white">All Products</Link>
                <Link to="/#products" className="block hover:text-white">Masalas</Link>
                <Link to="/#products" className="block hover:text-white">Podis</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Help & Information</h3>
              <div className="mt-3 space-y-2 text-sm">
                <Link to="/about-us" className="block hover:text-white">About Us</Link>
                <Link to="/contact-us" className="block hover:text-white">Contact Us</Link>
                <Link to="/faq" className="block hover:text-white">FAQs</Link>
                <Link to="/shipping-policy" className="block hover:text-white">Shipping Policy</Link>
                <Link to="/returns-refunds" className="block hover:text-white">Returns & Refunds</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <div className="mt-3 space-y-2 text-sm">
                <Link to="/privacy-policy" className="block hover:text-white">Privacy Policy</Link>
                <Link to="/terms-and-conditions" className="block hover:text-white">Terms & Conditions</Link>
                <Link to="/login" className="block hover:text-white">Admin Login</Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-stone-500 sm:text-left">
            <p>© {new Date().getFullYear()} Urban Delights. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showTopButton && visible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-4 z-50 rounded-full bg-orange-600 p-3 text-white shadow-lg transition hover:bg-orange-700"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default Footer;
