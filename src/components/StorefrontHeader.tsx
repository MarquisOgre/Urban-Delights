import { ShoppingBag, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const StorefrontHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: settings } = useStoreSettings();

  const goHome = () => navigate("/");
  const goSection = (id: string) => {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const openBasket = () => {
    const existingBasket = Array.from(document.querySelectorAll("body header:not(.urban-global-header) button"))
      .find((button) => button.textContent?.includes("Basket")) as HTMLButtonElement | undefined;

    if (existingBasket) {
      existingBasket.click();
      return;
    }

    navigate("/");
    window.setTimeout(() => {
      const basket = Array.from(document.querySelectorAll("body header:not(.urban-global-header) button"))
        .find((button) => button.textContent?.includes("Basket")) as HTMLButtonElement | undefined;
      basket?.click();
    }, 300);
  };

  return (
    <header className="urban-global-header sticky top-0 z-50 shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-[72px] items-center gap-4 px-4 sm:px-6">
        <button type="button" onClick={goHome} className="flex shrink-0 items-center" aria-label="Urban Delights home">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.storeName || "Urban Delights"} className="h-12 w-auto max-w-[230px] object-contain" />
        </button>

        <nav className="ml-auto hidden items-center gap-7 sm:flex" aria-label="Main navigation">
          <button type="button" onClick={() => goSection("products")} className={`text-sm font-semibold transition-colors ${pathname === "/" ? "text-stone-700 hover:text-orange-700" : "text-stone-600 hover:text-orange-700"}`}>Shop</button>
          {settings.showCategories && settings.categories.length > 0 && <button type="button" onClick={() => goSection("categories")} className="text-sm font-semibold text-stone-600 transition-colors hover:text-orange-700">Categories</button>}
          {settings.showWhyUs && <button type="button" onClick={() => goSection("why-us")} className="text-sm font-semibold text-stone-600 transition-colors hover:text-orange-700">Why Us</button>}
          <button type="button" onClick={() => navigate("/order-status")} className={`text-sm font-semibold transition-colors ${pathname === "/order-status" ? "font-bold text-orange-700" : "text-stone-600 hover:text-orange-700"}`}>Track Order</button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={openBasket} className="urban-header-basket relative inline-flex h-10 items-center rounded-full bg-stone-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-700" aria-label="Open Basket">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Basket
          </button>
          <button type="button" onClick={() => navigate("/login")} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700" aria-label="Profile">
            <UserRound className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default StorefrontHeader;
