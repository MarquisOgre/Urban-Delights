import React, { Component, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import BackendDashboard from "./pages/BackendDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Store from "./pages/Store";
import StoreCheckout from "./pages/StoreCheckout";
import LegalPage from "./pages/LegalPage";
import StoreManager from "./pages/StoreManager";
import StoreProductImages from "./pages/StoreProductImages";
import Header from "./components/Header";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

const queryClient = new QueryClient();

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("Urban Delights application error:", error); }
  render() {
    if (this.state.error) return <div className="min-h-screen bg-stone-50 px-6 py-16 text-stone-900"><div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-black">Urban Delights could not load</h1><p className="mt-3 text-sm leading-6 text-stone-600">A browser-side error stopped the storefront from rendering. Refresh once to retry.</p><pre className="mt-5 max-h-48 overflow-auto rounded-xl bg-stone-100 p-4 text-xs text-red-700">{this.state.error.message}</pre><button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white">Refresh Store</button></div></div>;
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }, [pathname]);
  return null;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminStoreFooter = () => <footer className="h-14 shrink-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-center text-xs font-bold text-white sm:text-sm"><div className="flex h-full items-center justify-center px-4">© {new Date().getFullYear()} Crafted with ❤️ by Dexorzo Creations..</div></footer>;
const AdminStorePage = ({ children }: { children: React.ReactNode }) => <div className="flex min-h-screen flex-col bg-slate-50"><Header /><div className="min-h-0 flex-1">{children}</div><AdminStoreFooter /></div>;
const HomeRoute = () => <Store />;

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/checkout" element={<StoreCheckout />} />
              <Route path="/admin" element={<AdminRoute><BackendDashboard /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminStorePage><StoreManager /></AdminStorePage></AdminRoute>} />
              <Route path="/admin/store-products" element={<AdminRoute><AdminStorePage><StoreProductImages /></AdminStorePage></AdminRoute>} />
              <Route path="/privacy-policy" element={<LegalPage />} />
              <Route path="/terms-and-conditions" element={<LegalPage />} />
              <Route path="/shipping-policy" element={<LegalPage />} />
              <Route path="/returns-refunds" element={<LegalPage />} />
              <Route path="/about-us" element={<LegalPage />} />
              <Route path="/contact-us" element={<LegalPage />} />
              <Route path="/faq" element={<LegalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
