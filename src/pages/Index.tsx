
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, ChefHat, Leaf, Download, FileText, BarChart3 } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import MasterIngredientList from "@/components/MasterIngredientList";
import AddRecipe from "@/components/AddRecipe";
import { recipes, calculateRecipeCost, masterIngredients, getIngredientPrice } from "@/data/recipes";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

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
    
    // Summary sheet with logo and tagline
    const summaryData = [
      ['Artisan Foods - Traditional South Indian Podi Collection'],
      ['All Recipes Summary'],
      [],
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
        ['Artisan Foods - Traditional South Indian Podi Collection'],
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
    
    // Title page with logo and tagline
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

  const averagePrice = masterIngredients.reduce((sum, ing) => sum + ing.pricePerKg, 0) / masterIngredients.length;
  const highestPrice = Math.max(...masterIngredients.map(ing => ing.pricePerKg));
  const lowestPrice = Math.min(...masterIngredients.map(ing => ing.pricePerKg));

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
            {(activeTab === "recipes" || activeTab === "dashboard") && (
              <div className="flex gap-2">
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

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Dashboard
          </Button>
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
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Total Recipes</p>
                      <p className="text-2xl font-bold text-blue-600">{totalRecipes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Total Ingredients</p>
                      <p className="text-2xl font-bold text-green-600">{totalIngredients}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ChefHat className="text-orange-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Average Ingredient Price</p>
                      <p className="text-2xl font-bold text-orange-600">₹{averagePrice.toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Price Range</p>
                      <p className="text-lg font-bold text-purple-600">₹{lowestPrice} - ₹{highestPrice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Recipes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Recipes</CardTitle>
                <CardDescription>Latest additions to your recipe collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipes.slice(0, 6).map((recipe) => (
                    <div key={recipe.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">₹{recipe.sellingPrice}/kg</p>
                      <Badge variant="secondary" className="mt-2">
                        {recipe.ingredients.length} ingredients
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
