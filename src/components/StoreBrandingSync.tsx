import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const createUserIcon = () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
  return svg;
};

export default function StoreBrandingSync() {
  const location = useLocation();
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const applyStoreBranding = () => {
      const logo = document.querySelector<HTMLImageElement>('header button img[src="/logo.png"], header button img');
      if (logo) {
        const logoUrl = settings?.logoUrl || "/logo.png";
        if (logo.getAttribute("src") !== logoUrl) logo.src = logoUrl;
        logo.alt = settings?.storeName || "Urban Delights";
        const logoButton = logo.closest("button");
        if (logoButton) {
          logoButton.setAttribute("aria-label", "Go to home");
          logoButton.onclick = () => { window.location.href = "/?preview=1"; };
        }
        const brandText = logo.parentElement?.querySelector("span");
        if (brandText) brandText.style.display = "none";
      }

      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("header button"));
      const adminLogin = buttons.find((button) => button.textContent?.trim() === "Admin Login");
      if (adminLogin && !adminLogin.dataset.profileIcon) {
        adminLogin.dataset.profileIcon = "true";
        adminLogin.setAttribute("aria-label", "Admin Login");
        adminLogin.title = "Admin Login";
        adminLogin.className = `${adminLogin.className.replace(/px-\d+|py-\d+|sm:inline-flex|rounded-full/g, "")} h-10 w-10 rounded-full border border-stone-200 bg-white p-0 text-stone-700 hover:bg-stone-100`;
        adminLogin.textContent = "";
        adminLogin.appendChild(createUserIcon());
      }
    };

    applyStoreBranding();
    const observer = new MutationObserver(applyStoreBranding);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, settings?.logoUrl, settings?.storeName]);

  return null;
}
