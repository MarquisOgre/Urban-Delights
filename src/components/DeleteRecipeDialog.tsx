
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type RecipeWithIngredients } from "@/services/database";
import { useToast } from "@/hooks/use-toast";

interface DeleteRecipeDialogProps {
  recipe: RecipeWithIngredients;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecipeDeleted: () => void;
}

const DeleteRecipeDialog = ({ recipe, open, onOpenChange, onRecipeDeleted }: DeleteRecipeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      // Delete recipe (ingredients will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id);

      if (error) throw error;

      onRecipeDeleted();
      onOpenChange(false);

      toast({
        title: "Recipe Deleted",
        description: `${recipe.name} has been deleted successfully!`,
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error deleting recipe",
        description: "Failed to delete recipe from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 size={20} />
            Delete Recipe
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the recipe and all its ingredients.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded border-l-4 border-red-400">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={16} />
              <div>
                <h4 className="font-semibold text-red-800">Are you sure?</h4>
                <p className="text-sm text-red-700 mt-1">
                  You are about to delete "{recipe.name}". This will also delete all {recipe.ingredients.length} ingredients associated with this recipe.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDelete} 
              variant="destructive"
              className="flex-1"
              disabled={loading}
            >
              <Trash2 size={16} className="mr-2" />
              {loading ? "Deleting..." : "Delete Recipe"}
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRecipeDialog;
