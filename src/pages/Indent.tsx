import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchRecipesWithIngredients, fetchMasterIngredients } from '@/services/database';
import Footer from '@/components/Footer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface RecipeQuantity {
  recipeId: string;
  quantity: number;
}

const Indent: React.FC = () => {
  const { toast } = useToast();
  const [recipeQuantities, setRecipeQuantities] = useState<Record<string, number>>({});

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipesWithIngredients,
  });

  const { data: masterIngredients = [], isLoading: ingredientsLoading } = useQuery({
    queryKey: ['master-ingredients'],
    queryFn: fetchMasterIngredients,
  });

  // Filter out hidden recipes
  const visibleRecipes = recipes.filter(recipe => !recipe.is_hidden);

  const handleQuantityChange = (recipeId: string, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setRecipeQuantities(prev => ({
      ...prev,
      [recipeId]: qty
    }));
  };

  // Calculate ingredient requirements and costs
  const calculatedData = useMemo(() => {
    const ingredientTotals: Record<string, { totalWeight: number; cost: number; recipes: Record<string, number> }> = {};
    let grandTotal = 0;

    // Process each recipe with quantity
    Object.entries(recipeQuantities).forEach(([recipeId, quantity]) => {
      if (quantity <= 0) return;

      const recipe = visibleRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      // Calculate total cost for this recipe
      let recipeCost = 0;

      recipe.ingredients.forEach(ingredient => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        if (!masterIngredient) return;

        const totalWeight = ingredient.quantity * quantity; // Total weight needed
        const costPerGram = masterIngredient.price_per_kg / 1000;
        const totalCost = totalWeight * costPerGram;

        recipeCost += totalCost;

        // Initialize ingredient if not exists
        if (!ingredientTotals[ingredient.ingredient_name]) {
          ingredientTotals[ingredient.ingredient_name] = {
            totalWeight: 0,
            cost: 0,
            recipes: {}
          };
        }

        // Add to totals
        ingredientTotals[ingredient.ingredient_name].totalWeight += totalWeight;
        ingredientTotals[ingredient.ingredient_name].cost += totalCost;
        ingredientTotals[ingredient.ingredient_name].recipes[recipe.name] = totalWeight;
      });

      // Add overheads to recipe cost
      recipeCost += recipe.overheads * quantity;
      grandTotal += recipeCost;
    });

    return { ingredientTotals, grandTotal };
  }, [recipeQuantities, visibleRecipes, masterIngredients]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Ingredient Indent Report', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Recipe quantities summary
    doc.setFontSize(14);
    doc.text('Recipe Quantities:', 20, 50);
    
    let yPos = 60;
    Object.entries(recipeQuantities).forEach(([recipeId, quantity]) => {
      if (quantity > 0) {
        const recipe = visibleRecipes.find(r => r.id === recipeId);
        if (recipe) {
          doc.setFontSize(10);
          doc.text(`${recipe.name}: ${quantity} units`, 25, yPos);
          yPos += 10;
        }
      }
    });

    // Ingredients table
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Ingredient Requirements:', 20, yPos);

    const tableData = Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => [
      ingredientName,
      `${data.totalWeight.toFixed(2)}g`,
      `₹${data.cost.toFixed(2)}`,
      ...visibleRecipes.map(recipe => {
        const recipeQuantity = recipeQuantities[recipe.id] || 0;
        if (recipeQuantity > 0 && data.recipes[recipe.name]) {
          return `${data.recipes[recipe.name].toFixed(2)}g`;
        }
        return '-';
      })
    ]);

    const tableHeaders = [
      'Ingredient',
      'Total Weight',
      'Total Cost',
      ...visibleRecipes
        .filter(recipe => recipeQuantities[recipe.id] > 0)
        .map(recipe => recipe.name)
    ];

    doc.autoTable({
      startY: yPos + 10,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 }
      }
    });

    // Grand total
    doc.setFontSize(12);
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 100;
    doc.text(`Grand Total: ₹${calculatedData.grandTotal.toFixed(2)}`, 20, finalY + 20);

    doc.save('ingredient-indent.pdf');
    
    toast({
      title: 'PDF Exported',
      description: 'Ingredient indent report has been downloaded successfully',
    });
  };

  if (recipesLoading || ingredientsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ingredient Indent</h1>
          <Button 
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Recipe Quantities Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recipe Quantities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRecipes.map(recipe => (
                <div key={recipe.id} className="flex items-center space-x-2">
                  <label className="text-sm font-medium min-w-0 flex-1 truncate">
                    {recipe.name}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={recipeQuantities[recipe.id] || ''}
                    onChange={(e) => handleQuantityChange(recipe.id, e.target.value)}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredient Requirements Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Total Weight (g)</TableHead>
                  <TableHead>Total Cost (₹)</TableHead>
                  {visibleRecipes
                    .filter(recipe => recipeQuantities[recipe.id] > 0)
                    .map(recipe => (
                      <TableHead key={recipe.id}>{recipe.name}</TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(calculatedData.ingredientTotals).map(([ingredientName, data]) => (
                  <TableRow key={ingredientName}>
                    <TableCell className="font-medium">{ingredientName}</TableCell>
                    <TableCell>{data.totalWeight.toFixed(2)}g</TableCell>
                    <TableCell>₹{data.cost.toFixed(2)}</TableCell>
                    {visibleRecipes
                      .filter(recipe => recipeQuantities[recipe.id] > 0)
                      .map(recipe => (
                        <TableCell key={recipe.id}>
                          {data.recipes[recipe.name] ? `${data.recipes[recipe.name].toFixed(2)}g` : '-'}
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell colSpan={2}>Grand Total</TableCell>
                  <TableCell>₹{calculatedData.grandTotal.toFixed(2)}</TableCell>
                  {visibleRecipes
                    .filter(recipe => recipeQuantities[recipe.id] > 0)
                    .map(recipe => {
                      const recipeCost = Object.entries(calculatedData.ingredientTotals).reduce((sum, [_, data]) => {
                        return sum + (data.recipes[recipe.name] ? 
                          (data.recipes[recipe.name] * (masterIngredients.find(mi => mi.name === _)?.price_per_kg || 0) / 1000) : 0);
                      }, 0);
                      const recipeObj = visibleRecipes.find(r => r.name === recipe.name);
                      const totalRecipeCost = recipeCost + (recipeObj ? recipeObj.overheads * (recipeQuantities[recipeObj.id] || 0) : 0);
                      return (
                        <TableCell key={recipe.id}>₹{totalRecipeCost.toFixed(2)}</TableCell>
                      );
                    })}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Footer showTopButton={true} />
    </div>
  );
};

export default Indent;