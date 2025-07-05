
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, ChefHat, Leaf, Download, FileText } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import MasterIngredientList from "@/components/MasterIngredientList";
import AddRecipe from "@/components/AddRecipe";
import { recipes, calculateRecipeCost, masterIngredients, getIngredientPrice } from "@/data/recipes";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("recipes");

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(ing => 
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalRecipes = recipes.length;
  const totalIngredients = masterIngredients.length;

  const exportAllToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Artisan Foods - All Recipes Summary'],
      ['Total Recipes', totalRecipes],
      ['Total Unique Ingredients', totalIngredients],
      [],
      ['Recipe Name', 'Selling Price (₹/kg)', 'Cost Price (₹/kg)', 'Profit Margin (%)']
    ];

    recipes.forEach(recipe => {
      const { finalCost } = calculateRecipeCost(recipe);
      const profitMargin = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice * 100).toFixed(1);
      summaryData.push([recipe.name, recipe.sellingPrice, finalCost.toFixed(2), profitMargin]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Individual recipe sheets
    recipes.forEach(recipe => {
      const { totalCost, finalCost } = calculateRecipeCost(recipe);
      const recipeData = [
        ['Recipe Name', recipe.name],
        ['Selling Price', `₹${recipe.sellingPrice}/kg`],
        ['Final Cost', `₹${finalCost.toFixed(2)}/kg`],
        [],
        ['Ingredients', 'Quantity', 'Unit', 'Cost (₹)']
      ];

      recipe.ingredients.forEach(ingredient => {
        const pricePerKg = getIngredientPrice(ingredient.name);
        const cost = (ingredient.quantity / 1000) * pricePerKg;
        recipeData.push([ingredient.name, ingredient.quantity.toString(), ingredient.unit, cost.toFixed(2)]);
      });

      const ws = XLSX.utils.aoa_to_sheet(recipeData);
      XLSX.utils.book_append_sheet(wb, ws, recipe.name.replace(/[^\w]/g, '').substring(0, 30));
    });

    XLSX.writeFile(wb, 'Artisan_Foods_All_Recipes.xlsx');
  };

  const exportAllToPDF = () => {
    const pdf = new jsPDF();
    
    // Title page
    pdf.setFontSize(24);
    pdf.text('Artisan Foods', 20, 30);
    pdf.setFontSize(16);
    pdf.text('Traditional South Indian Podi Collection', 20, 45);
    pdf.setFontSize(12);
    pdf.text(`Total Recipes: ${totalRecipes}`, 20, 60);
    pdf.text(`Total Ingredients: ${totalIngredients}`, 20, 70);

    // Summary table
    const summaryData = recipes.map(recipe => {
      const { finalCost } = calculateRecipeCost(recipe);
      const profitMargin = ((recipe.sellingPrice - finalCost) / recipe.sellingPrice * 100).toFixed(1);
      return [recipe.name, `₹${recipe.sellingPrice}`, `₹${finalCost.toFixed(2)}`, `${profitMargin}%`];
    });

    (pdf as any).autoTable({
      startY: 90,
      head: [['Recipe Name', 'Selling Price', 'Cost Price', 'Profit Margin']],
      body: summaryData,
    });

    pdf.save('Artisan_Foods_All_Recipes.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/src/public/logo.png" 
                alt="Artisan Foods Logo" 
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <ChefHat className="text-orange-600" size={32} />
                  Artisan Foods
                </h1>
                <p className="text-gray-600 mt-1">Traditional South Indian Podi Collection</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {totalRecipes} Recipes
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {totalIngredients} Ingredients
              </Badge>
              {activeTab === "recipes" && (
                <div className="flex gap-2 ml-4">
                  <Button onClick={exportAllToExcel} size="sm" variant="outline">
                    <FileText size={16} className="mr-2" />
                    Export Excel
                  </Button>
                  <Button onClick={exportAllToPDF} size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Export PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "recipes" ? "default" : "outline"}
            onClick={() => setActiveTab("recipes")}
            className="flex items-center gap-2"
          >
            <Package size={16} />
            Recipes
          </Button>
          <Button
            variant={activeTab === "ingredients" ? "default" : "outline"}
            onClick={() => setActiveTab("ingredients")}
            className="flex items-center gap-2"
          >
            <Leaf size={16} />
            Ingredient List
          </Button>
          <Button
            variant={activeTab === "add-recipe" ? "default" : "outline"}
            onClick={() => setActiveTab("add-recipe")}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Recipe
          </Button>
        </div>

        {/* Search Bar */}
        {activeTab === "recipes" && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search recipes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Content */}
        {activeTab === "recipes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {activeTab === "ingredients" && <MasterIngredientList />}
        
        {activeTab === "add-recipe" && <AddRecipe />}
      </div>
    </div>
  );
};

export default Index;
