
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, IndianRupee, Package, Edit, Save, X, Plus, FileText, Download } from "lucide-react";
import { masterIngredients, updateMasterIngredientPrice, addNewMasterIngredient } from "@/data/recipes";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MasterIngredientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [ingredients, setIngredients] = useState(masterIngredients);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState("");

  const filteredIngredients = ingredients
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

  const handleEditStart = (index: number, currentPrice: number) => {
    setEditingId(index);
    setEditPrice(currentPrice.toString());
  };

  const handleEditSave = (index: number, ingredientName: string) => {
    const newPrice = parseFloat(editPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      updateMasterIngredientPrice(ingredientName, newPrice);
      setIngredients([...masterIngredients]);
    }
    setEditingId(null);
    setEditPrice("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleAddIngredient = () => {
    const price = parseFloat(newIngredientPrice);
    if (newIngredientName.trim() && !isNaN(price) && price > 0) {
      addNewMasterIngredient(newIngredientName.trim(), price);
      setIngredients([...masterIngredients]);
      setNewIngredientName("");
      setNewIngredientPrice("");
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewIngredientName("");
    setNewIngredientPrice("");
    setShowAddForm(false);
  };

  const averagePrice = ingredients.reduce((sum, ing) => sum + ing.pricePerKg, 0) / ingredients.length;
  const highestPrice = Math.max(...ingredients.map(ing => ing.pricePerKg));
  const lowestPrice = Math.min(...ingredients.map(ing => ing.pricePerKg));

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Ingredient list data with header
    const ingredientData = [
      ['Artisan Foods - Traditional South Indian Podi Collection'],
      ['Ingredient List'],
      [],
      ['Total Ingredients', ingredients.length],
      ['Average Ingredient Price', `₹${averagePrice.toFixed(2)}`],
      ['Highest Ingredient Price', `₹${highestPrice}`],
      ['Lowest Ingredient Price', `₹${lowestPrice}`],
      [],
      ['Ingredient Name', 'Price per Kg (₹)']
    ];

    filteredIngredients.forEach(ingredient => {
      ingredientData.push([ingredient.name, ingredient.pricePerKg]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ingredientData);
    XLSX.utils.book_append_sheet(wb, ws, 'Ingredient List');

    XLSX.writeFile(wb, 'Artisan_Foods_Ingredient_List.xlsx');
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Header with logo and tagline
    pdf.setFontSize(24);
    pdf.text('Artisan Foods', 20, 30);
    pdf.setFontSize(16);
    pdf.text('Traditional South Indian Podi Collection', 20, 45);
    
    pdf.setFontSize(18);
    pdf.text('Ingredient List', 20, 65);
    
    pdf.setFontSize(12);
    pdf.text(`Total Ingredients: ${ingredients.length}`, 20, 80);
    pdf.text(`Average Ingredient Price: ₹${averagePrice.toFixed(2)}`, 20, 90);
    pdf.text(`Highest Ingredient Price: ₹${highestPrice}`, 20, 100);
    pdf.text(`Lowest Ingredient Price: ₹${lowestPrice}`, 20, 110);

    // Ingredients table
    const ingredientData = filteredIngredients.map(ingredient => [
      ingredient.name,
      `₹${ingredient.pricePerKg}`
    ]);

    (pdf as any).autoTable({
      startY: 130,
      head: [['Ingredient Name', 'Price per Kg']],
      body: ingredientData,
    });

    pdf.save('Artisan_Foods_Ingredient_List.pdf');
  };

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
                <p className="text-2xl font-bold text-blue-600">{ingredients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Average Ingredient Price</p>
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
                <p className="text-sm text-gray-600">Highest Ingredient Price</p>
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
                <p className="text-sm text-gray-600">Lowest Ingredient Price</p>
                <p className="text-2xl font-bold text-orange-600">₹{lowestPrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="text-orange-600" />
              Ingredient List
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToExcel} size="sm" variant="outline">
                <FileText size={16} className="mr-2" />
                Export Excel
              </Button>
              <Button onClick={exportToPDF} size="sm" variant="outline">
                <Download size={16} className="mr-2" />
                Export PDF
              </Button>
              <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-2">
                <Plus size={16} />
                Add Ingredient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Ingredient Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold mb-4 text-orange-800">Add New Ingredient</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredient Name</label>
                  <Input
                    placeholder="Enter ingredient name"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Kg (₹)</label>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    value={newIngredientPrice}
                    onChange={(e) => setNewIngredientPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddIngredient} size="sm">
                  <Save size={16} className="mr-2" />
                  Add Ingredient
                </Button>
                <Button onClick={handleCancelAdd} size="sm" variant="outline">
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Search and Sort */}
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
                <div className="text-right flex items-center gap-2">
                  {editingId === index ? (
                    <div className="flex items-center gap-1">
                      <IndianRupee size={16} />
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-20 h-8"
                        type="number"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(index, ingredient.name)}
                        className="h-8 w-8 p-0"
                      >
                        <Save size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600 flex items-center">
                          <IndianRupee size={16} />
                          {ingredient.pricePerKg}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(index, ingredient.pricePerKg)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit size={12} />
                      </Button>
                    </div>
                  )}
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
