
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, IndianRupee, AlertTriangle } from "lucide-react";
import { addMasterIngredient, updateMasterIngredientPrice, deleteMasterIngredient, type MasterIngredient } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface MasterIngredientListProps {
  masterIngredients: MasterIngredient[];
  onRefresh: () => void;
}

const MasterIngredientList = ({ masterIngredients, onRefresh }: MasterIngredientListProps) => {
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState<number>(0);
  const [editingIngredient, setEditingIngredient] = useState<MasterIngredient | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [deletingIngredient, setDeletingIngredient] = useState<MasterIngredient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

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
      await addMasterIngredient(newIngredientName, newIngredientPrice);
      setNewIngredientName("");
      setNewIngredientPrice(0);
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
    setEditPrice(ingredient.price_per_kg);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePrice = async () => {
    if (!editingIngredient || editPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateMasterIngredientPrice(editingIngredient.id, editPrice);
      setEditingIngredient(null);
      setEditPrice(0);
      setIsEditDialogOpen(false);
      onRefresh();
      
      toast({
        title: "Price Updated",
        description: `Price for ${editingIngredient.name} has been updated!`,
      });
    } catch (error) {
      toast({
        title: "Error updating price",
        description: "Failed to update price in database",
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Master Ingredients</h2>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {masterIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-gray-900">{ingredient.name}</CardTitle>
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
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-3 py-1">
                  <IndianRupee size={16} className="mr-1" />
                  {ingredient.price_per_kg}/kg
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient Price</DialogTitle>
            <DialogDescription>
              Update the price per kg for {editingIngredient?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editPrice">Price per Kg (₹)</Label>
              <Input
                id="editPrice"
                type="number"
                value={editPrice || ""}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                placeholder="Enter new price per kg"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdatePrice} className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Save size={16} className="mr-2" />
                Update Price
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
