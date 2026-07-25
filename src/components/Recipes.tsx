import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  ArrowLeft,
  Download,
  Plus,
  FileDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COMPANY_NAME = 'Urban Delights';
const COMPANY_ADDRESS =
  'Plot No. 12, Jubilee Hills, Hyderabad, Telangana - 500033 | +91 98765 43210 | hello@urbandelights.in';

const loadImageDataUrl = (src: string): Promise<string | null> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

import RecipeCard from '@/components/RecipeCard';
import AddRecipe from '@/components/AddRecipe';
import {
  type MasterIngredient,
  type RecipeWithIngredients,
  calculateRecipeCost,
} from '@/services/database';

interface RecipesProps {
  recipes: RecipeWithIngredients[];
  masterIngredients: MasterIngredient[];
  onRecipeUpdated: () => void;
  onBackToDashboard: () => void;
}

const Recipes = ({
  recipes,
  masterIngredients,
  onRecipeUpdated,
  onBackToDashboard,
}: RecipesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  /* ---------------- Add Recipe Screen ---------------- */
  if (showAddRecipe) {
    return (
      <AddRecipe
        masterIngredients={masterIngredients}
        onRecipeAdded={() => {
          onRecipeUpdated();
          setShowAddRecipe(false);
        }}
        onBackToDashboard={() => setShowAddRecipe(false)}
      />
    );
  }

  /* ---------------- Filtering ---------------- */
  const filteredRecipes = recipes.filter(
    recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing =>
        ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const visibleRecipes = filteredRecipes
    .filter(recipe => !recipe.is_hidden)
    .sort((a, b) => a.name.localeCompare(b.name));

  /* ---------------- Export Excel ---------------- */
  const exportRecipesToExcel = () => {
    const workbook = XLSX.utils.book_new();

    visibleRecipes.forEach(recipe => {
      const { totalCost, finalCost } = calculateRecipeCost(
        recipe,
        masterIngredients
      );

      const recipeData: any[][] = [
        ['Recipe Name', recipe.name],
        [''],
        ['Ingredients', 'Qty', 'Unit', 'Price', 'Amount'],
      ];

      recipe.ingredients.forEach(ingredient => {
        const masterIngredient = masterIngredients.find(
          mi => mi.name === ingredient.ingredient_name
        );
        const pricePerKg = masterIngredient?.price_per_kg || 0;
        const amount = (ingredient.quantity * pricePerKg) / 1000;

        recipeData.push([
          ingredient.ingredient_name,
          ingredient.quantity,
          ingredient.unit,
          `₹${pricePerKg}/kg`,
          `₹${amount.toFixed(2)}`,
        ]);
      });

      recipeData.push(['']);
      recipeData.push(['Raw Material Cost', `₹${totalCost.toFixed(2)}`]);
      recipeData.push([
        'Overheads',
        `₹${(finalCost - totalCost).toFixed(2)}`,
      ]);
      recipeData.push(['Final Cost', `₹${finalCost.toFixed(2)}`]);
      recipeData.push([
        'Selling Price',
        `₹${recipe.selling_price.toFixed(2)}`,
      ]);

      recipeData.push(['']);
      recipeData.push(['Preparation Method']);
      recipeData.push([recipe.preparation || 'N/A']);

      if (recipe.calories || recipe.protein || recipe.fat || recipe.carbs) {
        recipeData.push(['']);
        recipeData.push(['Nutrition (per 100g)']);
        if (recipe.calories) recipeData.push(['Calories', recipe.calories]);
        if (recipe.protein) recipeData.push(['Protein (g)', recipe.protein]);
        if (recipe.fat) recipeData.push(['Fat (g)', recipe.fat]);
        if (recipe.carbs) recipeData.push(['Carbs (g)', recipe.carbs]);
      }

      recipeData.push(['']);
      recipeData.push(['Storage']);
      recipeData.push([recipe.storage || 'N/A']);
      if (recipe.shelf_life) {
        recipeData.push(['Shelf Life', recipe.shelf_life]);
      }

      const worksheet = XLSX.utils.aoa_to_sheet(recipeData);
      const sheetName = recipe.name
        .replace(/[\\/:*?"<>|]/g, '_')
        .substring(0, 31);

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, 'All Recipes.xlsx');
  };

  /* ---------------- Export PDF (All Recipes) ---------------- */
  const exportRecipesToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logoData = await loadImageDataUrl('/logo.png');

    const drawHeader = () => {
      if (logoData) {
        try {
          pdf.addImage(logoData, 'PNG', 10, 8, 40, 14);
        } catch {}
      }
      pdf.setFontSize(14);
      pdf.setTextColor(194, 65, 12);
      pdf.text(COMPANY_NAME, pageWidth - 10, 15, { align: 'right' });
      pdf.setFontSize(10);
      pdf.setTextColor(90);
      pdf.text('Recipes — Ingredients & Cost', pageWidth - 10, 21, { align: 'right' });
      pdf.setDrawColor(230);
      pdf.line(10, 26, pageWidth - 10, 26);
    };

    const drawFooter = () => {
      pdf.setDrawColor(230);
      pdf.line(10, pageHeight - 14, pageWidth - 10, pageHeight - 14);
      pdf.setFontSize(8);
      pdf.setTextColor(110);
      pdf.text(COMPANY_ADDRESS, pageWidth / 2, pageHeight - 8, { align: 'center' });
    };

    visibleRecipes.forEach((recipe, idx) => {
      if (idx > 0) pdf.addPage();
      drawHeader();

      let y = 34;
      pdf.setFontSize(16);
      pdf.setTextColor(30);
      pdf.text(recipe.name, 10, y);
      y += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(90);
      pdf.text('Ingredients & Costs (1 KG Batch)', 10, y);
      y += 3;

      const { totalCost, finalCost } = calculateRecipeCost(recipe, masterIngredients);
      const overheads = finalCost - totalCost;

      const rows = recipe.ingredients.map(ing => {
        const master = masterIngredients.find(mi => mi.name === ing.ingredient_name);
        const pricePerKg = master?.price_per_kg || 0;
        const amount = (ing.quantity * pricePerKg) / 1000;
        return [
          ing.ingredient_name,
          `${ing.quantity} ${ing.unit}`,
          `Rs. ${pricePerKg}/kg`,
          `Rs. ${amount.toFixed(2)}`,
        ];
      });

      autoTable(pdf, {
        startY: y + 3,
        head: [['Ingredient', 'Qty', 'Price', 'Amount']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [234, 88, 12], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 10, right: 10 },
      });

      const afterTableY = (pdf as any).lastAutoTable.finalY + 6;
      const summary: [string, string][] = [
        ['Raw Material Cost', `Rs. ${totalCost.toFixed(2)}`],
        ['Overheads', `Rs. ${overheads.toFixed(2)}`],
        ['Final Cost', `Rs. ${finalCost.toFixed(2)}`],
        ['Selling Price', `Rs. ${Math.round(recipe.selling_price)}`],
      ];
      pdf.setFontSize(10);
      summary.forEach(([k, v], i) => {
        const yy = afterTableY + i * 6;
        const bold = i >= 2;
        pdf.setTextColor(bold ? (i === 2 ? 194 : 21) : 60, bold ? (i === 2 ? 65 : 128) : 60, bold ? (i === 2 ? 12 : 61) : 60);
        pdf.setFont(undefined as any, bold ? 'bold' : 'normal');
        pdf.text(k + ':', pageWidth - 70, yy);
        pdf.text(v, pageWidth - 12, yy, { align: 'right' });
      });
      pdf.setFont(undefined as any, 'normal');

      drawFooter();
    });

    // Page numbers
    const total = pdf.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(`${i} / ${total}`, 10, pageHeight - 8);
    }

    pdf.save('All Recipes - Ingredients & Cost.pdf');
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-gray-50">
      
      {/* ================= STICKY HEADER ================= */}
      <div className="sticky top-[56px] sm:top-[64px] z-30 bg-white border-b shadow-sm">
        <div className="px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-6">
              <h2 className="text-lg sm:text-2xl font-bold text-orange-800 whitespace-nowrap">
                All Recipes
              </h2>

              <div className="flex items-center gap-1 sm:gap-2">
                <Badge className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                  <FileText size={12} />
                  {visibleRecipes.length}
                </Badge>

                <Badge className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap">
                  <img src="/logo.png" className="h-3 w-3 sm:h-4 sm:w-4" alt="icon" />
                  {masterIngredients.length}
                </Badge>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-[260px] lg:w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddRecipe(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap flex-1 sm:flex-none text-xs sm:text-sm h-9"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>

                <Button
                  size="sm"
                  onClick={exportRecipesToExcel}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 whitespace-nowrap flex-1 sm:flex-none text-xs sm:text-sm h-9"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>

                <Button
                  size="sm"
                  onClick={exportRecipesToPDF}
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-50 whitespace-nowrap flex-1 sm:flex-none text-xs sm:text-sm h-9"
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF
                </Button>


                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBackToDashboard}
                  className="whitespace-nowrap text-xs sm:text-sm h-9"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-2 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {visibleRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              masterIngredients={masterIngredients}
              onRecipeUpdated={onRecipeUpdated}
            />
          ))}
        </div>

        {visibleRecipes.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-base sm:text-lg">
            {searchTerm
              ? 'No recipes found matching your search.'
              : 'No recipes available. Add your first recipe!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
