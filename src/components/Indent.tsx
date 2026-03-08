import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, ArrowLeft } from 'lucide-react';
import IndentSessionManager from './IndentSessionManager';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { type MasterIngredient, type RecipeWithIngredients } from '@/services/database';

interface IndentProps {
  recipes: RecipeWithIngredients[];
  masterIngredients: MasterIngredient[];
  onBackToDashboard: () => void;
}

const Indent = ({ recipes, masterIngredients, onBackToDashboard }: IndentProps) => {
  const [recipeQuantities, setRecipeQuantities] = useState<Record<string, number>>({});
  const [availableQty, setAvailableQty] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleLoadSession = (rq: Record<string, number>, aq: Record<string, number>) => {
    setRecipeQuantities(rq);
    setAvailableQty(aq);
  };

  const visibleRecipes = recipes
    .filter(recipe => !recipe.is_hidden)
    .sort((a, b) => a.name.localeCompare(b.name));

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

    Object.entries(recipeQuantities).forEach(([recipeId, quantity]) => {
      if (quantity <= 0) return;

      const recipe = visibleRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const masterIngredient = masterIngredients.find(mi => mi.name === ingredient.ingredient_name);
        if (!masterIngredient) return;

        const totalWeight = ingredient.quantity * quantity;
        const costPerGram = masterIngredient.price_per_kg / 1000;
        const totalCost = totalWeight * costPerGram;

        grandTotal += totalCost;

        if (!ingredientTotals[ingredient.ingredient_name]) {
          ingredientTotals[ingredient.ingredient_name] = {
            totalWeight: 0,
            cost: 0,
            recipes: {}
          };
        }

        ingredientTotals[ingredient.ingredient_name].totalWeight += totalWeight;
        ingredientTotals[ingredient.ingredient_name].cost += totalCost;
        ingredientTotals[ingredient.ingredient_name].recipes[recipe.name] = totalWeight;
      });
    });

    return { ingredientTotals, grandTotal };
  }, [recipeQuantities, visibleRecipes, masterIngredients]);

  const exportToExcel = () => {
    if (Object.keys(recipeQuantities).length === 0) {
      toast({
        title: "No data to export",
        description: "Please add some recipe quantities first",
        variant: "destructive"
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      ['Ingredient Requirements Summary'],
      [''],
      ['Ingredient', 'Total Weight', 'Total Cost', 
       ...visibleRecipes
         .filter(recipe => recipeQuantities[recipe.id] > 0)
         .sort((a, b) => a.name.localeCompare(b.name))
         .map(recipe => recipe.name),
       'Available Qty', 'Indent'
      ],
      ...Object.entries(calculatedData.ingredientTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([ingredientName, data]) => {
        const avail = availableQty[ingredientName] || 0;
        const indent = Math.max(0, data.totalWeight - avail);
        return [
          ingredientName,
          data.totalWeight >= 1000 
            ? `${(data.totalWeight / 1000).toFixed(2)} kg`
            : `${Math.round(data.totalWeight)} g`,
          `₹${data.cost.toFixed(2)}`,
          ...visibleRecipes
            .filter(recipe => recipeQuantities[recipe.id] > 0)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(recipe => {
              if (data.recipes[recipe.name]) {
                const weight = data.recipes[recipe.name];
                return weight >= 1000 
                  ? `${(weight / 1000).toFixed(2)} kg`
                  : `${Math.round(weight)} g`;
              }
              return '-';
            }),
          avail >= 1000 ? `${(avail / 1000).toFixed(2)} kg` : `${Math.round(avail)} g`,
          indent >= 1000 ? `${(indent / 1000).toFixed(2)} kg` : `${Math.round(indent)} g`
        ];
      }),
      [''],
      ['Grand Total', '', `₹${calculatedData.grandTotal.toFixed(2)}`, 
       ...visibleRecipes.filter(recipe => recipeQuantities[recipe.id] > 0).map(() => ''),
       '-',
       (() => { const t = Object.entries(calculatedData.ingredientTotals).reduce((s, [n, d]) => s + Math.max(0, d.totalWeight - (availableQty[n] || 0)), 0); return t >= 1000 ? `${(t / 1000).toFixed(2)} kg` : `${Math.round(t)} g`; })()
      ]
    ];

    const recipeData = [
      ['Recipe Quantities'],
      [''],
      ['Recipe Name', 'Quantity'],
      ...Object.entries(recipeQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([recipeId, qty]) => {
          const recipe = recipes.find(r => r.id === recipeId);
          return [recipe?.name || 'Unknown Recipe', qty];
        })
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    const recipeWorksheet = XLSX.utils.aoa_to_sheet(recipeData);

    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Ingredient Summary');
    XLSX.utils.book_append_sheet(workbook, recipeWorksheet, 'Recipe Quantities');

    const fileName = `ingredient-requirements-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel exported successfully!",
      description: `File saved as ${fileName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 sticky top-14 sm:top-16 z-10 bg-white py-3 sm:py-4 -mx-2 sm:-mx-4 px-2 sm:px-4">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">Ingredient Indent</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={exportToExcel}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button 
            onClick={onBackToDashboard} 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      </div>

      {/* Recipe Quantities Input */}
      <Card>
        <CardHeader>
          <CardTitle>Recipe Quantities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {visibleRecipes.map((recipe) => (
              <Card key={recipe.id} className="flex items-center p-0 overflow-hidden">
                <div className="w-1 bg-orange-500 h-full" />
                <div className="flex items-center justify-between w-full px-2 sm:px-4 py-2 gap-2">
                  <label
                    className="text-xs sm:text-sm font-medium leading-tight break-words flex-1 min-w-0"
                  >
                    {recipe.name}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={recipeQuantities[recipe.id] || ''}
                    onChange={(e) => handleQuantityChange(recipe.id, e.target.value)}
                    className="w-16 sm:w-20 h-8 text-xs sm:text-sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <CardTitle className="text-xl mb-4 sm:mb-0">Ingredient Requirements Summary</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={exportToExcel} className="flex-1 sm:flex-none">
                Export
              </Button>
              <Button 
                onClick={() => {
                  const printContent = `
                    <html>
                      <head>
                        <title>Ingredient Requirements Summary</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          h1 { text-align: center; color: #333; margin-bottom: 30px; }
                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f5f5f5; font-weight: bold; }
                          tr:nth-child(even) { background-color: #f9f9f9; }
                          .total-row { font-weight: bold; background-color: #e8f4fd !important; }
                        </style>
                      </head>
                      <body>
                        <h1>Ingredient Requirements Summary</h1>
                        <table>
                          <thead>
                            <tr>
                              <th>Ingredient</th>
                              <th>Total Weight</th>
                              <th>Total Cost (₹)</th>
                              ${visibleRecipes
                                .filter(recipe => recipeQuantities[recipe.id] > 0)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(recipe => `<th>${recipe.name}</th>`).join('')}
                              <th>Available Qty</th>
                              <th>Indent</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${Object.entries(calculatedData.ingredientTotals)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([ingredientName, data]) => `
                              <tr>
                                <td>${ingredientName}</td>
                                <td>${data.totalWeight >= 1000 ? `${(data.totalWeight / 1000).toFixed(2)} kg` : `${Math.round(data.totalWeight)} g`}</td>
                                <td>₹${data.cost.toFixed(2)}</td>
                                ${visibleRecipes
                                  .filter(recipe => recipeQuantities[recipe.id] > 0)
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map(recipe => {
                                    const weight = data.recipes[recipe.name] || 0;
                                    return `<td>${weight ? (weight >= 1000 ? `${(weight / 1000).toFixed(2)} kg` : `${Math.round(weight)} g`) : '-'}</td>`;
                                  }).join('')}
                                ${(() => {
                                  const avail = availableQty[ingredientName] || 0;
                                  const indent = Math.max(0, data.totalWeight - avail);
                                  return `<td>${avail >= 1000 ? `${(avail / 1000).toFixed(2)} kg` : `${Math.round(avail)} g`}</td>
                                          <td>${indent >= 1000 ? `${(indent / 1000).toFixed(2)} kg` : `${Math.round(indent)} g`}</td>`;
                                })()}
                              </tr>
                            `).join('')}
                            <tr class="total-row">
                              <td><strong>Grand Total</strong></td>
                              <td>-</td>
                              <td><strong>₹${Object.values(calculatedData.ingredientTotals).reduce((sum, data) => sum + data.cost, 0).toFixed(2)}</strong></td>
                              ${visibleRecipes
                                .filter(recipe => recipeQuantities[recipe.id] > 0)
                                .map(() => '<td>-</td>').join('')}
                              <td>-</td>
                              <td><strong>${(() => { const t = Object.entries(calculatedData.ingredientTotals).reduce((s, [n, d]) => s + Math.max(0, d.totalWeight - (availableQty[n] || 0)), 0); return t >= 1000 ? `${(t / 1000).toFixed(2)} kg` : `${Math.round(t)} g`; })()}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                      </body>
                    </html>
                  `;
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Ingredient</TableHead>
                  <TableHead className="font-semibold">Total Weight</TableHead>
                  <TableHead className="font-semibold">Total Cost</TableHead>
                   {visibleRecipes
                    .filter(recipe => recipeQuantities[recipe.id] > 0)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(recipe => (
                      <TableHead key={recipe.id} className="font-semibold">
                        {recipe.name}
                      </TableHead>
                    ))}
                  <TableHead className="font-semibold">Available Qty</TableHead>
                  <TableHead className="font-semibold">Indent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(calculatedData.ingredientTotals)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([ingredientName, data]) => (
                  <TableRow key={ingredientName}>
                    <TableCell className="font-medium">{ingredientName}</TableCell>
                    <TableCell>
                      {data.totalWeight >= 1000 
                        ? `${(data.totalWeight / 1000).toFixed(2)} kg`
                        : `${Math.round(data.totalWeight)} g`
                      }
                    </TableCell>
                    <TableCell>₹{data.cost.toFixed(2)}</TableCell>
                    {visibleRecipes
                      .filter(recipe => recipeQuantities[recipe.id] > 0)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(recipe => (
                        <TableCell key={recipe.id}>
                          {data.recipes[recipe.name] ? 
                            (data.recipes[recipe.name] >= 1000 
                              ? `${(data.recipes[recipe.name] / 1000).toFixed(2)} kg`
                              : `${Math.round(data.recipes[recipe.name])} g`
                            ) : '-'
                          }
                        </TableCell>
                      ))}
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={availableQty[ingredientName] || ''}
                        onChange={(e) => setAvailableQty(prev => ({ ...prev, [ingredientName]: parseFloat(e.target.value) || 0 }))}
                        className="w-20 h-8 text-xs sm:text-sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {(() => {
                        const indentGrams = data.totalWeight - (availableQty[ingredientName] || 0);
                        const val = Math.max(0, indentGrams);
                        return val >= 1000 ? `${(val / 1000).toFixed(2)} kg` : `${Math.round(val)} g`;
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Grand Total Row */}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell>Grand Total</TableCell>
                  <TableCell>
                    {
                      (() => {
                        const totalWeight = Object.values(calculatedData.ingredientTotals).reduce((sum, data) => sum + data.totalWeight, 0);
                        return totalWeight >= 1000 
                          ? `${(totalWeight / 1000).toFixed(2)} kg`
                          : `${Math.round(totalWeight)} g`;
                      })()
                    }
                  </TableCell>
                  <TableCell>₹{calculatedData.grandTotal.toFixed(2)}</TableCell>
                  {visibleRecipes
                    .filter(recipe => recipeQuantities[recipe.id] > 0)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(recipe => {
                      const recipeCost = Object.entries(calculatedData.ingredientTotals).reduce((sum, [ingredientName, data]) => {
                        return sum + (data.recipes[recipe.name] ? 
                          (data.recipes[recipe.name] * (masterIngredients.find(mi => mi.name === ingredientName)?.price_per_kg || 0) / 1000) : 0);
                      }, 0);
                      return (
                        <TableCell key={recipe.id}>₹{recipeCost.toFixed(2)}</TableCell>
                      );
                    })}
                  <TableCell>-</TableCell>
                  <TableCell className="font-medium">
                    {(() => {
                      const totalIndent = Object.entries(calculatedData.ingredientTotals).reduce((sum, [name, data]) => {
                        return sum + Math.max(0, data.totalWeight - (availableQty[name] || 0));
                      }, 0);
                      return totalIndent >= 1000 ? `${(totalIndent / 1000).toFixed(2)} kg` : `${Math.round(totalIndent)} g`;
                    })()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Indent;