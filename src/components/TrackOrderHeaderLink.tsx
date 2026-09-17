import { PackageSearch } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/**
 * Shared guest order tracking entry point for public pages.
 * Kept outside individual page layouts so every customer-facing page exposes Track Order.
 */
export default function TrackOrderHeaderLink() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/admin") || pathname === "/login" || pathname === "/auth" || pathname === "/order-status") return null;

  return (
    <Link
      to="/order-status"
      aria-label="Track your order"
      className="fixed left-1/2 top-[18px] z-[60] hidden -translate-x-1/2 translate-x-[230px] items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-700 lg:flex"
    >
      <PackageSearch className="h-4 w-4" />
      Track Order
    </Link>
  );
}
