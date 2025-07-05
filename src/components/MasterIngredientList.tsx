
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, IndianRupee, Package } from "lucide-react";
import { masterIngredients } from "@/data/recipes";

const MasterIngredientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredIngredients = masterIngredients
    .filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc'
          ? a.pricePerKg - b.pricePerKg
          : b.pricePerKg - a.pricePerKg;
      }
    });

  const handleSort = (field: 'name' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const averagePrice = masterIngredients.reduce((sum, ing) => sum + ing.pricePerKg, 0) / masterIngredients.length;
  const highestPrice = Math.max(...masterIngredients.map(ing => ing.pricePerKg));
  const lowestPrice = Math.min(...masterIngredients.map(ing => ing.pricePerKg));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Ingredients</p>
                <p className="text-2xl font-bold text-blue-600">{masterIngredients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-green-600">₹{averagePrice.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Highest Price</p>
                <p className="text-2xl font-bold text-red-600">₹{highestPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Lowest Price</p>
                <p className="text-2xl font-bold text-orange-600">₹{lowestPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="text-orange-600" />
            Master Ingredient List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'name' ? "default" : "outline"}
                onClick={() => handleSort('name')}
                size="sm"
              >
                Sort by Name
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />
                )}
              </Button>
              <Button
                variant={sortBy === 'price' ? "default" : "outline"}
                onClick={() => handleSort('price')}
                size="sm"
              >
                Sort by Price
                {sortBy === 'price' && (
                  sortDirection === 'asc' ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={ingredient.pricePerKg > averagePrice ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {ingredient.pricePerKg > averagePrice ? "High" : "Low"} Cost
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600 flex items-center">
                    <IndianRupee size={16} />
                    {ingredient.pricePerKg}
                  </div>
                  <div className="text-xs text-gray-500">per kg</div>
                </div>
              </div>
            ))}
          </div>

          {filteredIngredients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>No ingredients found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterIngredientList;
