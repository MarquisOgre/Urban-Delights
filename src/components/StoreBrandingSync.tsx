import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function StoreBrandingSync() {
  const location = useLocation();
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const applyLogo = () => {
      const logo = document.querySelector<HTMLImageElement>('header button img[src="/logo.png"], header button img');
      if (!logo) return;

      const logoUrl = settings?.logoUrl || "/logo.png";
      if (logo.getAttribute("src") !== logoUrl) logo.src = logoUrl;
      logo.alt = settings?.storeName || "Urban Delights";

      const brandText = logo.parentElement?.querySelector("span");
      if (brandText) brandText.style.display = "none";
    };

    applyLogo();
    const observer = new MutationObserver(applyLogo);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, settings?.logoUrl, settings?.storeName]);

  return null;
}
