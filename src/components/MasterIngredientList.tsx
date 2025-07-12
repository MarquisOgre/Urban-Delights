
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, IndianRupee, AlertTriangle, Search, Leaf } from "lucide-react";
import { addMasterIngredient, updateMasterIngredient, deleteMasterIngredient, upsertMasterIngredient, type MasterIngredient } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

import ExcelBulkIngredients from "@/components/ExcelBulkIngredients";

interface MasterIngredientListProps {
  masterIngredients: MasterIngredient[];
  onRefresh: () => void;
}

const MasterIngredientList = ({ masterIngredients, onRefresh }: MasterIngredientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState<number>(0);
  const [newIngredientBrand, setNewIngredientBrand] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<MasterIngredient | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editBrand, setEditBrand] = useState("");
  const [deletingIngredient, setDeletingIngredient] = useState<MasterIngredient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredIngredients = masterIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = async () => {
    if (!newIngredientName.trim() || newIngredientPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid ingredient name and price",
        variant: "destructive"
      });
      return;
    }

    try {
      await addMasterIngredient(newIngredientName, newIngredientPrice, newIngredientBrand);
      setNewIngredientName("");
      setNewIngredientPrice(0);
      setNewIngredientBrand("");
      setIsAddDialogOpen(false);
      onRefresh();
      
      toast({
        title: "Ingredient Added",
        description: `${newIngredientName} has been added successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error adding ingredient",
        description: "Failed to add ingredient to database",
        variant: "destructive"
      });
    }
  };

  const handleEditIngredient = (ingredient: MasterIngredient) => {
    setEditingIngredient(ingredient);
    setEditName(ingredient.name);
    setEditPrice(ingredient.price_per_kg);
    setEditBrand(ingredient.brand || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateIngredient = async () => {
    if (!editingIngredient || !editName.trim() || editPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid name and price",
        variant: "destructive"
      });
      return;
    }

    try {
      // If name changed, we need to delete old and create new due to database constraints
      if (editName !== editingIngredient.name) {
        await deleteMasterIngredient(editingIngredient.id);
        await addMasterIngredient(editName, editPrice, editBrand);
      } else {
        await updateMasterIngredient(editingIngredient.id, editPrice, editBrand);
      }
      
      setEditingIngredient(null);
      setEditName("");
      setEditPrice(0);
      setEditBrand("");
      setIsEditDialogOpen(false);
      onRefresh();
      
      toast({
        title: "Ingredient Updated",
        description: `${editName} has been updated!`,
      });
    } catch (error) {
      toast({
        title: "Error updating ingredient",
        description: "Failed to update ingredient in database",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIngredient = (ingredient: MasterIngredient) => {
    setDeletingIngredient(ingredient);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingIngredient) return;

    try {
      await deleteMasterIngredient(deletingIngredient.id);
      setDeletingIngredient(null);
      setIsDeleteDialogOpen(false);
      onRefresh();
      
      toast({
        title: "Ingredient Deleted",
        description: `${deletingIngredient.name} has been deleted successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error deleting ingredient",
        description: "Failed to delete ingredient from database",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Master Ingredients List</h2>
        
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            
            <ExcelBulkIngredients onRefresh={onRefresh} />
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus size={16} className="mr-2" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Master Ingredient</DialogTitle>
                <DialogDescription>
                  Add a new ingredient to your master list with its price per kg.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ingredientName">Ingredient Name</Label>
                  <Input
                    id="ingredientName"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    placeholder="Enter ingredient name"
                  />
                </div>
                <div>
                  <Label htmlFor="ingredientBrand">Brand (Optional)</Label>
                  <Input
                    id="ingredientBrand"
                    value={newIngredientBrand}
                    onChange={(e) => setNewIngredientBrand(e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="ingredientPrice">Price per Kg (₹)</Label>
                  <Input
                    id="ingredientPrice"
                    type="number"
                    value={newIngredientPrice || ""}
                    onChange={(e) => setNewIngredientPrice(Number(e.target.value))}
                    placeholder="Enter price per kg"
                  />
                </div>
                <Button onClick={handleAddIngredient} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Save size={16} className="mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900">{ingredient.name}</CardTitle>
                  {ingredient.brand && (
                    <p className="text-sm text-gray-600 mt-1">Brand: {ingredient.brand}</p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-2 py-1 mr-2">
                  <IndianRupee size={14} className="mr-1" />
                  {ingredient.price_per_kg}/kg
                </Badge>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleEditIngredient(ingredient)}
                    size="sm"
                    variant="outline"
                    className="p-1 h-7 w-7"
                  >
                    <Edit size={12} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteIngredient(ingredient)}
                    size="sm"
                    variant="outline"
                    className="p-1 h-7 w-7 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Leaf size={48} className="mx-auto mb-4 opacity-50" />
          <p>No ingredients found matching your search.</p>
        </div>
      )}

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update the ingredient details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Ingredient Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter ingredient name"
              />
            </div>
            <div>
              <Label htmlFor="editBrand">Brand (Optional)</Label>
              <Input
                id="editBrand"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
            <div>
              <Label htmlFor="editPrice">Price per Kg (₹)</Label>
              <Input
                id="editPrice"
                type="number"
                value={editPrice || ""}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                placeholder="Enter price per kg"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateIngredient} className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Save size={16} className="mr-2" />
                Update Ingredient
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 size={20} />
              Delete Ingredient
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the ingredient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={16} />
                <div>
                  <h4 className="font-semibold text-red-800">Are you sure?</h4>
                  <p className="text-sm text-red-700 mt-1">
                    You are about to delete "{deletingIngredient?.name}" from your master ingredients list.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={confirmDelete} variant="destructive" className="flex-1">
                <Trash2 size={16} className="mr-2" />
                Delete Ingredient
              </Button>
              <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterIngredientList;
