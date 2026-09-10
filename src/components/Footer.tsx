import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_STORE_SETTINGS, useStoreSettings } from "@/hooks/useStoreSettings";

interface FooterProps { showTopButton?: boolean; }

const Footer: React.FC<FooterProps> = ({ showTopButton = false }) => {
  const [visible, setVisible] = useState(false);
  const { data: settings = DEFAULT_STORE_SETTINGS } = useStoreSettings();

  useEffect(() => {
    const toggleVisibility = () => setVisible(window.scrollY > 200);
    if (showTopButton) {
      toggleVisibility();
      window.addEventListener("scroll", toggleVisibility);
    }
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showTopButton]);

  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const links = (settings.footerLinks ?? []).filter((link) => link.enabled && link.label.trim() && link.path.trim());

  return <>
    <footer className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-white">
      {settings.showFooterLinks && links.length > 0 && <nav aria-label="Footer navigation" className="container mx-auto flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-8 text-center text-sm sm:gap-x-10 sm:px-8 sm:py-10 sm:text-base">{links.map((link) => <Link key={`${link.path}-${link.label}`} to={link.path} className="shrink-0 font-semibold text-white/95 transition-colors duration-200 hover:text-white hover:underline" onClick={backToTop}>{link.label}</Link>)}</nav>}
      <div className="border-t border-white/20 bg-black/10 py-2.5 text-center text-xs font-bold text-white sm:text-sm"><div className="container mx-auto px-4"><p>© {new Date().getFullYear()} {settings.footerCopyright || settings.storeName}.</p></div></div>
    </footer>
    {showTopButton && visible && <button onClick={backToTop} aria-label="Back to top" className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-2xl">↑</button>}
  </>;
};

export default Footer;
