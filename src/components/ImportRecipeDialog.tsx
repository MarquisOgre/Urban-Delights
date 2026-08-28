import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { MasterIngredient, NewIngredient } from '@/services/database';

export interface ImportedRecipe {
  name: string;
  description?: string;
  preparation?: string;
  shelf_life?: string;
  storage?: string;
  yield_output?: number;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
  ingredients: (NewIngredient & { matched?: boolean })[];
}

interface Props {
  masterIngredients: MasterIngredient[];
  onImported: (recipe: ImportedRecipe) => void;
  trigger?: React.ReactNode;
}

const ImportRecipeDialog = ({ masterIngredients, onImported, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toBase64 = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fileData = await toBase64(file);
      const { data, error } = await supabase.functions.invoke('parse-recipe-pdf', {
        body: {
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileData,
          masterIngredients: masterIngredients.map(mi => mi.name),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const recipe = data?.recipe as ImportedRecipe | undefined;
      if (!recipe?.name) throw new Error('Could not read a recipe from this file');

      const ingredients = (recipe.ingredients || []).map(ing => ({
        ingredient_name: ing.ingredient_name,
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit || 'g',
        matched: masterIngredients.some(mi => mi.name === ing.ingredient_name),
      }));

      const unmatched = ingredients.filter(i => !i.matched).length;

      onImported({ ...recipe, ingredients });
      setOpen(false);
      setFile(null);

      toast({
        title: 'Recipe imported',
        description: unmatched
          ? `${recipe.name} loaded. ${unmatched} ingredient(s) not in the Ingredients list — please select them manually.`
          : `${recipe.name} loaded with costing from your Ingredients list.`,
      });
    } catch (e) {
      toast({
        title: 'Import failed',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="h-9 text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            Import ChatGPT Recipe (PDF)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-pdf">Upload Recipe PDF</Label>
            <Input
              id="recipe-pdf"
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900 space-y-1">
            <p className="font-semibold">Expected Format</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Ingredients table with Ingredient + Quantity</li>
              <li>Preparation steps (numbered)</li>
              <li>Storage &amp; Shelf Life section</li>
              <li>Nutritional values (calories, protein, fat, carbs)</li>
            </ul>
            <p>Prices and costing are always taken from your Ingredients page — never from the PDF.</p>
          </div>

          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reading recipe...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import &amp; Review
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRecipeDialog;
