
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, IndianRupee, Package, Edit, Save, X, Plus, FileText, Download } from "lucide-react";
import { addMasterIngredient, updateMasterIngredientPrice, type MasterIngredient } from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface MasterIngredientListProps {
  masterIngredients: MasterIngredient[];
  onRefresh: () => void;
}

const MasterIngredientList = ({ masterIngredients, onRefresh }: MasterIngredientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState("");
  const { toast } = useToast();

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
          ? a.price_per_kg - b.price_per_kg
          : b.price_per_kg - a.price_per_kg;
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

  const handleEditStart = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice.toString());
  };

  const handleEditSave = async (id: string) => {
    const newPrice = parseFloat(editPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      try {
        await updateMasterIngredientPrice(id, newPrice);
        onRefresh();
        toast({
          title: "Price updated",
          description: "Ingredient price has been updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error updating price",
          description: "Failed to update ingredient price",
          variant: "destructive"
        });
      }
    }
    setEditingId(null);
    setEditPrice("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleAddIngredient = async () => {
    const price = parseFloat(newIngredientPrice);
    if (newIngredientName.trim() && !isNaN(price) && price > 0) {
      try {
        await addMasterIngredient(newIngredientName.trim(), price);
        onRefresh();
        setNewIngredientName("");
        setNewIngredientPrice("");
        setShowAddForm(false);
        toast({
          title: "Ingredient added",
          description: "New ingredient has been added successfully",
        });
      } catch (error) {
        toast({
          title: "Error adding ingredient",
          description: "Failed to add new ingredient",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancelAdd = () => {
    setNewIngredientName("");
    setNewIngredientPrice("");
    setShowAddForm(false);
  };

  const averagePrice = masterIngredients.length > 0 
    ? masterIngredients.reduce((sum, ing) => sum + ing.price_per_kg, 0) / masterIngredients.length 
    : 0;
  const highestPrice = masterIngredients.length > 0 
    ? Math.max(...masterIngredients.map(ing => ing.price_per_kg)) 
    : 0;
  const lowestPrice = masterIngredients.length > 0 
    ? Math.min(...masterIngredients.map(ing => ing.price_per_kg)) 
    : 0;

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Ingredient list data with header
    const ingredientData = [
      ['Artisan Delights - Traditional South Indian Podi Collection'],
      ['Ingredient List'],
      [],
      ['Total Ingredients', masterIngredients.length],
      ['Average Ingredient Price', `₹${averagePrice.toFixed(2)}`],
      ['Highest Ingredient Price', `₹${highestPrice}`],
      ['Lowest Ingredient Price', `₹${lowestPrice}`],
      [],
      ['Ingredient Name', 'Price per Kg (₹)']
    ];

    filteredIngredients.forEach(ingredient => {
      ingredientData.push([ingredient.name, ingredient.price_per_kg]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ingredientData);
    XLSX.utils.book_append_sheet(wb, ws, 'Ingredient List');

    XLSX.writeFile(wb, 'Artisan_Foods_Ingredient_List.xlsx');
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    
    // Header with logo and tagline
    pdf.setFontSize(24);
    pdf.text('Artisan Delights', 20, 30);
    pdf.setFontSize(16);
    pdf.text('Traditional South Indian Podi Collection', 20, 45);
    
    pdf.setFontSize(18);
    pdf.text('Ingredient List', 20, 65);
    
    pdf.setFontSize(12);
    pdf.text(`Total Ingredients: ${masterIngredients.length}`, 20, 80);
    pdf.text(`Average Ingredient Price: ₹${averagePrice.toFixed(2)}`, 20, 90);
    pdf.text(`Highest Ingredient Price: ₹${highestPrice}`, 20, 100);
    pdf.text(`Lowest Ingredient Price: ₹${lowestPrice}`, 20, 110);

    // Ingredients table
    const ingredientData = filteredIngredients.map(ingredient => [
      ingredient.name,
      `₹${ingredient.price_per_kg}`
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
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={ingredient.price_per_kg > averagePrice ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {ingredient.price_per_kg > averagePrice ? "High" : "Low"} Cost
                    </Badge>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  {editingId === ingredient.id ? (
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
                        onClick={() => handleEditSave(ingredient.id)}
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
                          {ingredient.price_per_kg}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(ingredient.id, ingredient.price_per_kg)}
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
