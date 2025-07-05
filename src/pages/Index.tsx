// index.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Leaf, Plus, Download, FileText, Search, Package,
  CircleDollarSign, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import RecipeCard from '@/components/RecipeCard';
import MasterIngredientList from '@/components/MasterIngredientList';
import AddRecipe from '@/components/AddRecipe';
import {
  recipes,
  calculateRecipeCost,
  masterIngredients,
} from '@/data/recipes';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF to include autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'recipes' | 'ingredients' | 'add-recipe'>('recipes');
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredRecipes = recipes.filter(
    recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRecipes = recipes.length;
  const totalIngredients = masterIngredients.length;
  const averagePrice = masterIngredients.reduce((sum, ing) => sum + ing.pricePerKg, 0) / masterIngredients.length;
  const highestPrice = Math.max(...masterIngredients.map(ing => ing.pricePerKg));
  const lowestPrice = Math.min(...masterIngredients.map(ing => ing.pricePerKg));

  const exportAllToExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryData = [['Recipe Name', 'Selling Price (₹/kg)', 'Cost Price (₹/kg)', 'Profit Margin (%)']];
    recipes.forEach(recipe => {
      const { finalCost } = calculateRecipeCost(recipe);
      const profitMargin = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice) * 100;
      summaryData.push([
        recipe.name,
        recipe.sellingPrice.toString(),
        finalCost.toFixed(2),
        `${profitMargin.toFixed(1)}%`
      ]);
    });
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.writeFile(wb, 'Artisan_Foods_All_Recipes.xlsx');
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Artisan Delights - Podi Recipes', 20, 20);
    const tableData = recipes.map(recipe => {
      const { finalCost } = calculateRecipeCost(recipe);
      const profit = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice) * 100;
      return [recipe.name, `₹${recipe.sellingPrice}`, `₹${finalCost.toFixed(2)}`, `${profit.toFixed(1)}%`];
    });
    doc.autoTable({
      startY: 30,
      head: [['Recipe', 'Selling Price', 'Cost Price', 'Profit Margin']],
      body: tableData,
    });
    doc.save('Artisan_Foods_All_Recipes.pdf');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Artisan Foods Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">
              Artisan Delights
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant={activeTab === 'recipes' ? 'default' : 'outline'} onClick={() => setActiveTab('recipes')}>
              <BarChart3 className="mr-2" size={16} /> Recipes
            </Button>
            <Button variant={activeTab === 'ingredients' ? 'default' : 'outline'} onClick={() => setActiveTab('ingredients')}>
              <Leaf className="mr-2" size={16} /> Ingredient List
            </Button>
            <Button variant={activeTab === 'add-recipe' ? 'default' : 'outline'} onClick={() => setActiveTab('add-recipe')}>
              <Plus className="mr-2" size={16} /> Add Recipe
            </Button>
            <div className="w-8" />
            <Button onClick={exportAllToExcel} variant="outline" size="sm">
              <FileText className="mr-2" size={16} /> Export Excel
            </Button>
            <Button onClick={exportAllToPDF} variant="outline" size="sm">
              <Download className="mr-2" size={16} /> Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-28 flex-grow">
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[{
                label: 'Total Recipes', value: totalRecipes, icon: <Package size={28} className="text-blue-600" />
              }, {
                label: 'Total Ingredients', value: totalIngredients, icon: <Leaf size={28} className="text-green-600" />
              }, {
                label: 'Avg Ingredient Price', value: `₹${averagePrice.toFixed(2)}`, icon: <CircleDollarSign size={28} className="text-orange-600" />
              }, {
                label: 'Ingredient Price Range', value: `₹${lowestPrice} - ₹${highestPrice}`, icon: <TrendingUp size={28} className="text-purple-600" />
              }].map((stat, index) => (
                <div key={index}>
                  <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4 flex items-center gap-4">
                      {stat.icon}
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search recipes or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 mb-4"
              />
            </div>

            {/* Recipe Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && <MasterIngredientList />}
        {activeTab === 'add-recipe' && <AddRecipe />}
      </main>

      {/* Fixed Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-red-500 to-yellow-400 border-t text-center text-white font-bold py-2 z-30"
        style={{ fontSize: '12px' }}
      >
        <div className="container mx-auto px-2">
          <p>© {new Date().getFullYear()} Artisan Delights. Crafted with ❤️ in South India.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
        >
          ↑
        </button>
      )}
    </div>
  );
}
