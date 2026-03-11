import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, GlassWater, FileSpreadsheet, Printer } from 'lucide-react';
import XLSX from 'xlsx-js-style';

interface DetoxJuicesProps {
  onBackToDashboard: () => void;
}

type JuiceType = 'all' | 'ash_gourd' | 'beetroot' | 'carrot' | 'mix_veg' | 'wheatgrass';
type MethodType = 'sujatha' | 'mixer';

interface IngredientRow {
  name: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
}

const PRICES: Record<string, number> = {
  'Amla': 105,
  'Ash Gourd': 23,
  'Beetroot': 40,
  'Black Salt': 60,
  'Bottle Gourd': 29,
  'Carrot': 60,
  'Coriander Leaves': 80,
  'Cucumber': 34,
  'Ginger': 135,
  'Lemon Juice': 200,
  'Mint Leaves': 100,
  'Tomato':30,
  'Water': 1,
  'Wheatgrass': 200,
};

const BOTTLE_COST = 4;

// Day multipliers for 7-day plan: Ash Gourd ×2, Wheatgrass ×2, others ×1
const DAY_MULTIPLIERS: Record<string, number> = {
  ash_gourd: 2,
  wheatgrass: 2,
  beetroot: 1,
  carrot: 1,
  mix_veg: 1,
};

const SUJATHA_RECIPES: Record<string, IngredientRow[]> = {
  wheatgrass: [
    { name: 'Wheatgrass', quantity: 400, unit: 'g', pricePerKg: PRICES['Wheatgrass'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
  ],
  ash_gourd: [
    { name: 'Ash Gourd', quantity: 3500, unit: 'g', pricePerKg: PRICES['Ash Gourd'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
  ],
  carrot: [
    { name: 'Carrot', quantity: 3500, unit: 'g', pricePerKg: PRICES['Carrot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
  ],
  beetroot: [
    { name: 'Beetroot', quantity: 3200, unit: 'g', pricePerKg: PRICES['Beetroot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
  ],
  mix_veg: [
    { name: 'Carrot', quantity: 1400, unit: 'g', pricePerKg: PRICES['Carrot'] },
    { name: 'Beetroot', quantity: 1000, unit: 'g', pricePerKg: PRICES['Beetroot'] },
    { name: 'Cucumber', quantity: 900, unit: 'g', pricePerKg: PRICES['Cucumber'] },
    { name: 'Bottle Gourd', quantity: 800, unit: 'g', pricePerKg: PRICES['Bottle Gourd'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Tomato', quantity: 1200, unit: 'g', pricePerKg: PRICES['Tomato'] },
  ],
};

const MIXER_RECIPES: Record<string, IngredientRow[]> = {
  wheatgrass: [
    { name: 'Wheatgrass', quantity: 400, unit: 'g', pricePerKg: PRICES['Wheatgrass'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 2200, unit: 'ml', pricePerKg: PRICES['Water'] },
  ],
  ash_gourd: [
    { name: 'Ash Gourd', quantity: 2500, unit: 'g', pricePerKg: PRICES['Ash Gourd'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1000, unit: 'ml', pricePerKg: PRICES['Water'] },
  ],
  carrot: [
    { name: 'Carrot', quantity: 2500, unit: 'g', pricePerKg: PRICES['Carrot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: PRICES['Water'] },
  ],
  beetroot: [
    { name: 'Beetroot', quantity: 2300, unit: 'g', pricePerKg: PRICES['Beetroot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: PRICES['Water'] },
  ],
  mix_veg: [
    { name: 'Carrot', quantity: 1000, unit: 'g', pricePerKg: PRICES['Carrot'] },
    { name: 'Beetroot', quantity: 800, unit: 'g', pricePerKg: PRICES['Beetroot'] },
    { name: 'Cucumber', quantity: 600, unit: 'g', pricePerKg: PRICES['Cucumber'] },
    { name: 'Bottle Gourd', quantity: 500, unit: 'g', pricePerKg: PRICES['Bottle Gourd'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: PRICES['Water'] },
    { name: 'Tomato', quantity: 800, unit: 'g', pricePerKg: PRICES['Tomato'] },
  ],
};

const JUICE_LABELS: Record<string, string> = {
  ash_gourd: 'Ash Gourd Juice',
  beetroot: 'Beetroot Juice',
  carrot: 'Carrot Juice',
  mix_veg: 'Mix Veg Juice',
  wheatgrass: 'Wheat Grass Shot',
};

const BATCH_GLASSES = 10;

const DetoxJuices = ({ onBackToDashboard }: DetoxJuicesProps) => {
  const [juiceType, setJuiceType] = useState<JuiceType>('ash_gourd');
  const [method, setMethod] = useState<MethodType>('sujatha');
  const [bottleCount, setBottleCount] = useState<number>(10);

  const multiplier = bottleCount / BATCH_GLASSES;

  const juiceKeys = juiceType === 'all'
    ? Object.keys(JUICE_LABELS) as string[]
    : [juiceType];

  const recipes = method === 'sujatha' ? SUJATHA_RECIPES : MIXER_RECIPES;

  const computedData = useMemo(() => {
    if (juiceType === 'all') {
      // 7-day plan: Ash Gourd ×2, Wheatgrass ×2, Beetroot ×1, Carrot ×1, Mix Veg ×1 = 7 days
      const aggregated: Record<string, { name: string; unit: string; pricePerKg: number; scaledQty: number; cost: number }> = {};
      const totalDays = 7;
      const totalBottles = totalDays * bottleCount;

      Object.keys(JUICE_LABELS).forEach(key => {
        const dayMul = DAY_MULTIPLIERS[key] || 1;
        const baseIngredients = recipes[key] || [];
        baseIngredients.forEach(ing => {
          const scaledQty = ing.quantity * multiplier * dayMul;
          const cost = (scaledQty / 1000) * ing.pricePerKg;
          if (aggregated[ing.name]) {
            aggregated[ing.name].scaledQty += scaledQty;
            aggregated[ing.name].cost += cost;
          } else {
            aggregated[ing.name] = { name: ing.name, unit: ing.unit, pricePerKg: ing.pricePerKg, scaledQty, cost };
          }
        });
      });

      const ingredients = Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name));
      const ingredientCost = ingredients.reduce((s, i) => s + i.cost, 0);
      const totalBottleCost = totalBottles * BOTTLE_COST;
      const totalCost = ingredientCost + totalBottleCost;
      const costPerGlass = totalBottles > 0 ? totalCost / totalBottles : 0;

      return [{
        key: 'all',
        label: `Weekly Plan (7 Days) — Ash Gourd ×2, Wheatgrass ×2, Beetroot ×1, Carrot ×1, Mix Veg ×1`,
        ingredients,
        ingredientCost,
        totalBottleCost,
        totalCost,
        costPerGlass,
        totalBottles,
      }];
    }

    return juiceKeys.map(key => {
      const baseIngredients = recipes[key] || [];
      const scaled = baseIngredients.map(ing => {
        const scaledQty = ing.quantity * multiplier;
        const cost = (scaledQty / 1000) * ing.pricePerKg;
        return { ...ing, scaledQty, cost };
      }).sort((a, b) => a.name.localeCompare(b.name));
      const ingredientCost = scaled.reduce((s, i) => s + i.cost, 0);
      const totalBottleCost = bottleCount * BOTTLE_COST;
      const totalCost = ingredientCost + totalBottleCost;
      const costPerGlass = bottleCount > 0 ? totalCost / bottleCount : 0;
      return {
        key,
        label: JUICE_LABELS[key],
        ingredients: scaled,
        ingredientCost,
        totalBottleCost,
        totalCost,
        costPerGlass,
        totalBottles: bottleCount,
      };
    });
  }, [juiceType, juiceKeys.join(','), method, bottleCount, multiplier]);

  const formatQty = (qty: number, unit: string) => {
    if (qty >= 1000 && (unit === 'g' || unit === 'ml')) {
      return `${(qty / 1000).toFixed(2)} ${unit === 'g' ? 'kg' : 'L'}`;
    }
    return `${qty.toFixed(1)} ${unit}`;
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    computedData.forEach(juice => {
      const headerStyle = { font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '2E7D32' } }, alignment: { horizontal: 'center' } };
      const boldStyle = { font: { bold: true } };
      const rightAlign = { alignment: { horizontal: 'right' } };
      const boldRight = { font: { bold: true }, alignment: { horizontal: 'right' } };

      const rows: any[][] = [];

      // Title
      rows.push([{ v: juice.label, s: { font: { bold: true, sz: 14, color: { rgb: '2E7D32' } } } }]);
      rows.push([{ v: `Method: ${method === 'sujatha' ? 'Sujatha Juicer' : 'Normal Mixer'} | Bottles: ${juice.totalBottles}`, s: { font: { sz: 10, color: { rgb: '666666' } } } }]);
      rows.push([]);

      // Header row
      rows.push([
        { v: 'Ingredient', s: headerStyle },
        { v: `Qty (${juice.totalBottles} bottles)`, s: headerStyle },
        { v: 'Rate (₹/kg)', s: headerStyle },
        { v: 'Cost (₹)', s: headerStyle },
      ]);

      // Data rows
      juice.ingredients.forEach(ing => {
        rows.push([
          { v: ing.name, s: boldStyle },
          { v: formatQty(ing.scaledQty, ing.unit), s: rightAlign },
          { v: `₹${ing.pricePerKg}`, s: rightAlign },
          { v: `₹${ing.cost.toFixed(2)}`, s: rightAlign },
        ]);
      });

      rows.push([]);
      rows.push([
        { v: 'Ingredient Cost', s: boldStyle }, '', '',
        { v: `₹${juice.ingredientCost.toFixed(2)}`, s: boldRight },
      ]);
      rows.push([
        { v: `Bottle Cost (${juice.totalBottles} × ₹${BOTTLE_COST})`, s: boldStyle }, '', '',
        { v: `₹${juice.totalBottleCost.toFixed(2)}`, s: boldRight },
      ]);
      rows.push([
        { v: 'Total Cost', s: { font: { bold: true, sz: 12, color: { rgb: '2E7D32' } } } }, '', '',
        { v: `₹${juice.totalCost.toFixed(2)}`, s: { font: { bold: true, sz: 12, color: { rgb: '2E7D32' } }, alignment: { horizontal: 'right' } } },
      ]);
      rows.push([
        { v: 'Cost per Glass', s: { font: { bold: true, color: { rgb: '7B1FA2' } } } }, '', '',
        { v: `₹${juice.costPerGlass.toFixed(2)}`, s: { font: { bold: true, color: { rgb: '7B1FA2' } }, alignment: { horizontal: 'right' } } },
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];

      const sheetName = juice.key === 'all' ? 'Weekly Plan' : juice.label.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileName = juiceType === 'all'
      ? `Detox_Juices_Weekly_Plan_${bottleCount}bottles.xlsx`
      : `Detox_${JUICE_LABELS[juiceType]?.replace(/\s/g, '_')}_${bottleCount}bottles.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    const printContent = computedData.map(juice => `
      <div style="margin-bottom:30px;page-break-inside:avoid;">
        <h2 style="color:#2E7D32;margin-bottom:4px;">${juice.label}</h2>
        <p style="color:#666;font-size:12px;margin-bottom:12px;">
          Method: ${method === 'sujatha' ? 'Sujatha Juicer' : 'Normal Mixer'} | Bottles: ${juice.totalBottles}
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#2E7D32;color:white;">
              <th style="padding:8px;text-align:left;border:1px solid #ccc;">Ingredient</th>
              <th style="padding:8px;text-align:right;border:1px solid #ccc;">Qty (${juice.totalBottles} bottles)</th>
              <th style="padding:8px;text-align:right;border:1px solid #ccc;">Rate (₹/kg)</th>
              <th style="padding:8px;text-align:right;border:1px solid #ccc;">Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${juice.ingredients.map((ing, i) => `
              <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding:6px 8px;border:1px solid #ddd;font-weight:500;">${ing.name}</td>
                <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;font-weight:600;">${formatQty(ing.scaledQty, ing.unit)}</td>
                <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">₹${ing.pricePerKg}</td>
                <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">₹${ing.cost.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display:flex;gap:16px;margin-top:12px;flex-wrap:wrap;">
          <div style="background:#EBF5FB;padding:10px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:11px;color:#1976D2;">Ingredient Cost</div>
            <div style="font-size:18px;font-weight:bold;color:#0D47A1;">₹${juice.ingredientCost.toFixed(2)}</div>
          </div>
          <div style="background:#FFF3E0;padding:10px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:11px;color:#E65100;">Bottle Cost (${juice.totalBottles} × ₹${BOTTLE_COST})</div>
            <div style="font-size:18px;font-weight:bold;color:#BF360C;">₹${juice.totalBottleCost.toFixed(2)}</div>
          </div>
          <div style="background:#E8F5E9;padding:10px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:11px;color:#2E7D32;">Total Cost</div>
            <div style="font-size:18px;font-weight:bold;color:#1B5E20;">₹${juice.totalCost.toFixed(2)}</div>
          </div>
          <div style="background:#F3E5F5;padding:10px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:11px;color:#7B1FA2;">Cost per Glass</div>
            <div style="font-size:18px;font-weight:bold;color:#4A148C;">₹${juice.costPerGlass.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Detox Juices Recipes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <h1 style="color:#2E7D32;border-bottom:2px solid #2E7D32;padding-bottom:8px;">🥤 Detox Juices Recipes</h1>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-[56px] sm:top-[64px] z-30 bg-white border-b shadow-sm">
        <div className="px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <GlassWater className="h-6 w-6 text-green-600" />
              <h2 className="text-lg sm:text-2xl font-bold text-green-800">Detox Juices Recipes</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Juice Selector */}
              <Select value={juiceType} onValueChange={(v) => setJuiceType(v as JuiceType)}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Select Juice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL (7 Days)</SelectItem>
                  <SelectItem value="ash_gourd">Ash Gourd Juice</SelectItem>
                  <SelectItem value="beetroot">Beetroot Juice</SelectItem>
                  <SelectItem value="carrot">Carrot Juice</SelectItem>
                  <SelectItem value="mix_veg">Mix Veg Juice</SelectItem>
                  <SelectItem value="wheatgrass">Wheat Grass Shot</SelectItem>
                </SelectContent>
              </Select>

              {/* Method Selector */}
              <Select value={method} onValueChange={(v) => setMethod(v as MethodType)}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sujatha">Sujatha Juicer</SelectItem>
                  <SelectItem value="mixer">Normal Mixer</SelectItem>
                </SelectContent>
              </Select>

              {/* Bottle Count */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 whitespace-nowrap">Bottles/day:</span>
                <Input
                  type="number"
                  min={1}
                  value={bottleCount}
                  onChange={(e) => setBottleCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-9 text-sm"
                />
              </div>

              {/* Export & Print */}
              <Button size="sm" variant="outline" onClick={handleExportExcel} className="h-9" title="Export to Excel">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint} className="h-9" title="Print">
                <Printer className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="outline" onClick={onBackToDashboard} className="h-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}

<div className="px-2 sm:px-6 py-4 sm:py-6">

  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

    {/* LEFT SIDE - JUICE RECIPE CARDS (80%) */}
    <div className="lg:col-span-4 space-y-6">

      {computedData.map(juice => (
        <Card key={juice.key}>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg text-green-800 flex items-center justify-between flex-wrap gap-2">
              <span>{juice.label}</span>
              <span className="text-sm font-normal text-gray-500">
                {method === 'sujatha' ? 'Sujatha Juicer' : 'Normal Mixer'} · {juice.totalBottles} bottles
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 sm:p-6 pt-0">

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Ingredient</TableHead>
                    <TableHead className="text-xs text-right">
                      Qty ({juice.totalBottles} bottles)
                    </TableHead>
                    <TableHead className="text-xs text-right">Rate (₹/kg)</TableHead>
                    <TableHead className="text-xs text-right">Cost (₹)</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {juice.ingredients.map((ing, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm font-medium">
                        {ing.name}
                      </TableCell>

                      <TableCell className="text-sm text-right font-semibold">
                        {formatQty(ing.scaledQty, ing.unit)}
                      </TableCell>

                      <TableCell className="text-sm text-right">
                        ₹{ing.pricePerKg}
                      </TableCell>

                      <TableCell className="text-sm text-right">
                        ₹{ing.cost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </div>

            {/* Cost Summary */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-blue-600">Ingredient Cost</p>
                <p className="text-lg font-bold text-blue-800">
                  ₹{juice.ingredientCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xs text-orange-600">
                  Bottle Cost ({juice.totalBottles} × ₹{BOTTLE_COST})
                </p>
                <p className="text-lg font-bold text-orange-800">
                  ₹{juice.totalBottleCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-xs text-green-600">Total Cost</p>
                <p className="text-lg font-bold text-green-800">
                  ₹{juice.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-xs text-purple-600">Cost per Glass</p>
                <p className="text-lg font-bold text-purple-800">
                  ₹{juice.costPerGlass.toFixed(2)}
                </p>
              </div>

            </div>

          </CardContent>
        </Card>
      ))}

    </div>


    {/* RIGHT SIDE - VEGETABLE MARKET PRICES (20%) */}
    <div className="lg:col-span-1">

      <Card className="sticky top-6">

        <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-sm sm:text-base text-gray-700">
            Vegetable Market Prices (₹/kg)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0">

          <div className="flex flex-wrap gap-2">
            {Object.entries(PRICES)
              .filter(([, p]) => p > 0)
              .map(([name, price]) => (
                <span
                  key={name}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs sm:text-sm"
                >
                  {name}: <strong>₹{price}</strong>/kg
                </span>
              ))}
          </div>

        </CardContent>

      </Card>

    </div>

  </div>

</div>
</div>

  );
};

export default DetoxJuices;
