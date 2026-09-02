import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Search,
  ArrowLeft,
  Plus,
  FileDown,
} from 'lucide-react';
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
import ImportRecipeDialog, { type ImportedRecipe } from '@/components/ImportRecipeDialog';

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
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [showPdfExport, setShowPdfExport] = useState(false);

  /* ---------------- Add Recipe Screen ---------------- */
  if (showAddRecipe) {
    return (
      <AddRecipe
        key={importedRecipe?.name ?? 'blank'}
        masterIngredients={masterIngredients}
        initialData={importedRecipe ?? undefined}
        onRecipeAdded={() => {
          onRecipeUpdated();
          setShowAddRecipe(false);
          setImportedRecipe(null);
        }}
        onBackToDashboard={() => {
          setShowAddRecipe(false);
          setImportedRecipe(null);
        }}
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

  /* ---------------- HTML escaping (PDF safety) ---------------- */
  const esc = (value: unknown) =>
    String(value ?? '').replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string)
    );


  /* ---------------- Export PDF (selected recipes, 1 per page) ---------------- */
  const exportRecipesToPDF = async (recipesToExport: RecipeWithIngredients[]) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Build an offscreen container to render pages via html2canvas
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 @ ~96dpi
    container.style.background = '#ffffff';
    container.style.fontFamily =
      "'Noto Sans', 'Noto Sans Telugu', 'Noto Sans Devanagari', Arial, sans-serif";
    document.body.appendChild(container);

    const renderRecipeBlock = (recipe: RecipeWithIngredients) => {
      const { totalCost, finalCost } = calculateRecipeCost(recipe, masterIngredients);
      const overheads = finalCost - totalCost;

      const rows = recipe.ingredients
        .map(ing => {
          const master = masterIngredients.find(mi => mi.name === ing.ingredient_name);
          const pricePerKg = master?.price_per_kg || 0;
          const amount = (ing.quantity * pricePerKg) / 1000;
          return `
            <tr>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;">${esc(ing.ingredient_name)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">${esc(ing.quantity)} ${esc(ing.unit)}</td>

              <td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;">₹${pricePerKg}/kg</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;text-align:right;">₹${amount.toFixed(2)}</td>
            </tr>`;
        })
        .join('');

      return `
        <div style="padding:16px 20px;border:3px solid #c2410c;border-radius:8px;margin-bottom:14px;">
          <div style="font-size:26px;font-weight:700;color:#1f2937;margin-bottom:4px;">${esc(recipe.name)}</div>
          <div style="font-size:17px;color:#6b7280;margin-bottom:12px;">Ingredients & Costs (1 KG Batch)</div>
          <table style="width:100%;border-collapse:collapse;font-size:17px;color:#111827;">
            <thead>
              <tr style="background:#ea580c;color:#fff;text-align:left;">
                <th style="padding:8px 10px;">Ingredient</th>
                <th style="padding:8px 10px;">Qty</th>
                <th style="padding:8px 10px;">Price</th>
                <th style="padding:8px 10px;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="margin-top:12px;font-size:17px;display:flex;justify-content:flex-end;">
            <table style="font-size:17px;">
              <tr><td style="padding:3px 14px 3px 0;color:#374151;">Raw Material Cost:</td><td style="text-align:right;">₹${totalCost.toFixed(2)}</td></tr>
              <tr><td style="padding:3px 14px 3px 0;color:#374151;">Overheads:</td><td style="text-align:right;">₹${overheads.toFixed(2)}</td></tr>
              <tr><td style="padding:3px 14px 3px 0;color:#c2410c;font-weight:700;">Final Cost:</td><td style="text-align:right;color:#c2410c;font-weight:700;">₹${finalCost.toFixed(2)}</td></tr>
              <tr><td style="padding:3px 14px 3px 0;color:#15803d;font-weight:700;">Selling Price:</td><td style="text-align:right;color:#15803d;font-weight:700;">₹${Math.round(recipe.selling_price)}</td></tr>
            </table>
          </div>
        </div>`;
    };

    const headerHtml = `
      <div style="display:flex;justify-content:center;align-items:center;padding:8px 0 12px;margin-bottom:14px;">
        <img src="/logo.png" style="height:60px;object-fit:contain;" crossorigin="anonymous" />
      </div>`;

    const totalPages = recipesToExport.length;

    for (let p = 0; p < totalPages; p++) {
      const recipe = recipesToExport[p];

      container.innerHTML = `
        <div style="padding:20px;">
          ${headerHtml}${renderRecipeBlock(recipe)}
        </div>`;


      // Ensure images (logo) are loaded before capture
      const imgs = Array.from(container.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          img =>
            new Promise<void>(resolve => {
              if ((img as HTMLImageElement).complete) return resolve();
              img.addEventListener('load', () => resolve());
              img.addEventListener('error', () => resolve());
            })
        )
      );

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2 - 6;
      // Preserve aspect ratio; scale down to fit the page if too tall
      let renderWidth = availableWidth;
      let renderHeight = (canvas.height * availableWidth) / canvas.width;
      if (renderHeight > availableHeight) {
        renderHeight = availableHeight;
        renderWidth = (canvas.width * availableHeight) / canvas.height;
      }
      const offsetX = margin + (availableWidth - renderWidth) / 2;

      if (p > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', offsetX, margin, renderWidth, renderHeight);

      // page number
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(`${p + 1} / ${totalPages}`, pageWidth - margin, pageHeight - 4, {
        align: 'right',
      });
    }

    document.body.removeChild(container);
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
                  <img src="/favicon.png" className="h-3 w-3 sm:h-4 sm:w-4" alt="icon" />
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

                <ImportRecipeDialog
                  masterIngredients={masterIngredients}
                  onImported={recipe => {
                    setImportedRecipe(recipe);
                    setShowAddRecipe(true);
                  }}
                />





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
