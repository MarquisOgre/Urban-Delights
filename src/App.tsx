import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipesDashboard from "./pages/RecipesDashboard";
import Backend from "./pages/Backend";
import ManageRecipeDashboard from "./pages/ManageRecipeDashboard";
import IngredientsDashboard from "./pages/IngredientsDashboard";
import AddRecipeDashboard from "./pages/AddRecipeDashboard";
import PricingDashboard from "./pages/PricingDashboard";
import IndentDashboard from "./pages/IndentDashboard";
import StockRegister from "./pages/StockRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RecipesDashboard />} />
          <Route path="/backend" element={<Backend />} />
          <Route path="/recipes-dashboard" element={<RecipesDashboard />} />
          <Route path="/manage-recipe-dashboard" element={<ManageRecipeDashboard />} />
          <Route path="/ingredients-dashboard" element={<IngredientsDashboard />} />
          <Route path="/add-recipe-dashboard" element={<AddRecipeDashboard />} />
          <Route path="/pricing-dashboard" element={<PricingDashboard />} />
          <Route path="/indent-dashboard" element={<IndentDashboard />} />
          <Route path="/stock-register" element={<StockRegister />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
