import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-black text-orange-700">404</h1>
          <p className="mb-4 text-xl text-stone-600">Oops! Page not found</p>
          <button onClick={() => navigate("/?preview=1")} className="font-semibold text-orange-700 underline hover:text-orange-900">
            Return to Home
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
