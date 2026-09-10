import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface FooterProps { showTopButton?: boolean; }

const Footer: React.FC<FooterProps> = ({ showTopButton = false }) => {
  const [visible, setVisible] = useState(false);
  const { data: settings } = useStoreSettings();

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
    <footer className="bg-white">
      <div className="container mx-auto px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-lg font-black text-stone-900">{settings.storeName}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">{settings.businessName || settings.storeName}</p>
          </div>
          {(settings.email || settings.phone) && <div className="text-sm text-stone-600"><p className="font-bold text-stone-800">Contact</p>{settings.phone && <p className="mt-2 whitespace-pre-line">{settings.phone}</p>}{settings.email && <p className="mt-1 whitespace-pre-line">{settings.email}</p>}</div>}
          {settings.address && <div className="text-sm text-stone-600"><p className="font-bold text-stone-800">Address</p><p className="mt-2 whitespace-pre-line">{settings.address}</p></div>}
        </div>
        {settings.showFooterLinks && links.length > 0 && <nav aria-label="Footer navigation" className="flex w-full flex-nowrap items-center gap-x-8 overflow-x-auto whitespace-nowrap border-t border-stone-100 pt-6 pr-20 text-sm sm:gap-x-9 sm:text-base">{links.map((link) => <Link key={`${link.path}-${link.label}`} to={link.path} className="shrink-0 text-stone-600 transition-colors duration-200 hover:text-orange-600" onClick={backToTop}>{link.label}</Link>)}</nav>}
      </div>
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 py-2.5 text-center text-xs font-bold text-white sm:text-sm"><div className="container mx-auto px-4"><p>© {new Date().getFullYear()} {settings.footerCopyright || settings.storeName}. </p></div></div>
    </footer>
    {showTopButton && visible && <button onClick={backToTop} aria-label="Back to top" className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-2xl">↑</button>}
  </>;
};

export default Footer;
