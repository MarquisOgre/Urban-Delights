
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Calculator, ChefHat, Leaf } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import MasterIngredientList from "@/components/MasterIngredientList";
import CostCalculator from "@/components/CostCalculator";
import { recipes } from "@/data/recipes";

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
  const totalIngredients = new Set(recipes.flatMap(r => r.ingredients.map(i => i.name))).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="text-orange-600" size={32} />
                Artisan Foods
              </h1>
              <p className="text-gray-600 mt-1">Traditional South Indian Podi Collection</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {totalRecipes} Recipes
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {totalIngredients} Ingredients
              </Badge>
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
            Master Ingredients
          </Button>
          <Button
            variant={activeTab === "calculator" ? "default" : "outline"}
            onClick={() => setActiveTab("calculator")}
            className="flex items-center gap-2"
          >
            <Calculator size={16} />
            Cost Calculator
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
        
        {activeTab === "calculator" && <CostCalculator />}
      </div>
    </div>
  );
};

export default Index;
