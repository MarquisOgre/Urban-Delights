import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, GlassWater } from 'lucide-react';

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

// Vegetable prices (avg of ranges from screenshot, ₹/kg)
const PRICES: Record<string, number> = {
  'Wheatgrass': 200,
  'Ash Gourd': 23,
  'Carrot': 60,
  'Beetroot': 40,
  'Cucumber': 34,
  'Bottle Gourd': 29,
  'Amla': 105,
  'Coriander Leaves': 80,
  'Mint Leaves': 100,
  'Ginger': 135,
  'Lemon Juice': 200, // approx per kg/liter
  'Black Salt': 60,
  'Water': 0,
};

const BOTTLE_COST = 4;

// Sujatha Juicer recipes – 10 glasses (300ml each = 3L batch), no water needed
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
  ],
};

// Mixer recipes – 3L batch, includes water
const MIXER_RECIPES: Record<string, IngredientRow[]> = {
  wheatgrass: [
    { name: 'Wheatgrass', quantity: 400, unit: 'g', pricePerKg: PRICES['Wheatgrass'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 2200, unit: 'ml', pricePerKg: 0 },
  ],
  ash_gourd: [
    { name: 'Ash Gourd', quantity: 2500, unit: 'g', pricePerKg: PRICES['Ash Gourd'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1000, unit: 'ml', pricePerKg: 0 },
  ],
  carrot: [
    { name: 'Carrot', quantity: 2500, unit: 'g', pricePerKg: PRICES['Carrot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: 0 },
  ],
  beetroot: [
    { name: 'Beetroot', quantity: 2300, unit: 'g', pricePerKg: PRICES['Beetroot'] },
    { name: 'Amla', quantity: 80, unit: 'g', pricePerKg: PRICES['Amla'] },
    { name: 'Coriander Leaves', quantity: 60, unit: 'g', pricePerKg: PRICES['Coriander Leaves'] },
    { name: 'Mint Leaves', quantity: 30, unit: 'g', pricePerKg: PRICES['Mint Leaves'] },
    { name: 'Ginger', quantity: 50, unit: 'g', pricePerKg: PRICES['Ginger'] },
    { name: 'Lemon Juice', quantity: 50, unit: 'ml', pricePerKg: PRICES['Lemon Juice'] },
    { name: 'Black Salt', quantity: 6, unit: 'g', pricePerKg: PRICES['Black Salt'] },
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: 0 },
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
    { name: 'Water', quantity: 1200, unit: 'ml', pricePerKg: 0 },
  ],
};

const JUICE_LABELS: Record<string, string> = {
  ash_gourd: 'Ash Gourd Juice',
  beetroot: 'Beetroot Juice',
  carrot: 'Carrot Juice',
  mix_veg: 'Mix Veg Juice',
  wheatgrass: 'Wheat Grass Shot',
};

const BATCH_GLASSES = 10; // each batch = 10 glasses of 300ml

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
      // Combine all juice ingredients, aggregating by name
      const aggregated: Record<string, { name: string; unit: string; pricePerKg: number; scaledQty: number; cost: number }> = {};
      const allKeys = Object.keys(JUICE_LABELS);
      const totalBottles = bottleCount * allKeys.length;
      
      allKeys.forEach(key => {
        const baseIngredients = recipes[key] || [];
        baseIngredients.forEach(ing => {
          const scaledQty = ing.quantity * multiplier;
          const cost = (scaledQty / 1000) * ing.pricePerKg;
          if (aggregated[ing.name]) {
            aggregated[ing.name].scaledQty += scaledQty;
            aggregated[ing.name].cost += cost;
          } else {
            aggregated[ing.name] = { name: ing.name, unit: ing.unit, pricePerKg: ing.pricePerKg, scaledQty, cost };
          }
        });
      });

      const ingredients = Object.values(aggregated);
      const ingredientCost = ingredients.reduce((s, i) => s + i.cost, 0);
      const totalBottleCost = totalBottles * BOTTLE_COST;
      const totalCost = ingredientCost + totalBottleCost;
      const costPerGlass = totalBottles > 0 ? totalCost / totalBottles : 0;

      return [{
        key: 'all',
        label: `All Juices Combined (${allKeys.length} types × ${bottleCount} bottles each = ${totalBottles} bottles)`,
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
      });
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
                  <SelectItem value="all">ALL</SelectItem>
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
                <span className="text-xs text-gray-600 whitespace-nowrap">Bottles (300ml):</span>
                <Input
                  type="number"
                  min={1}
                  value={bottleCount}
                  onChange={(e) => setBottleCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-9 text-sm"
                />
              </div>

              <Button size="sm" variant="outline" onClick={onBackToDashboard} className="h-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Vegetable Price Reference */}
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm sm:text-base text-gray-700">Vegetable Market Prices (₹/kg)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRICES).filter(([, p]) => p > 0).map(([name, price]) => (
                <span key={name} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs sm:text-sm">
                  {name}: <strong>₹{price}</strong>/kg
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Juice Recipe Cards */}
        {computedData.map(juice => (
          <Card key={juice.key}>
            <CardHeader className="p-3 sm:p-6 pb-2">
              <CardTitle className="text-base sm:text-lg text-green-800 flex items-center justify-between flex-wrap gap-2">
                <span>{juice.label}</span>
                <span className="text-sm font-normal text-gray-500">
                  {method === 'sujatha' ? 'Sujatha Juicer' : 'Normal Mixer'} · {bottleCount} bottles
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Ingredient</TableHead>
                      <TableHead className="text-xs text-right">Base Qty (10 glasses)</TableHead>
                      <TableHead className="text-xs text-right">Scaled Qty ({bottleCount} bottles)</TableHead>
                      <TableHead className="text-xs text-right">Rate (₹/kg)</TableHead>
                      <TableHead className="text-xs text-right">Cost (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {juice.ingredients.map((ing, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium">{ing.name}</TableCell>
                        <TableCell className="text-sm text-right">{ing.quantity} {ing.unit}</TableCell>
                        <TableCell className="text-sm text-right font-semibold">{formatQty(ing.scaledQty, ing.unit)}</TableCell>
                        <TableCell className="text-sm text-right">₹{ing.pricePerKg}</TableCell>
                        <TableCell className="text-sm text-right">₹{ing.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cost Summary */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-600">Ingredient Cost</p>
                  <p className="text-lg font-bold text-blue-800">₹{juice.ingredientCost.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-orange-600">Bottle Cost ({bottleCount} × ₹{BOTTLE_COST})</p>
                  <p className="text-lg font-bold text-orange-800">₹{juice.totalBottleCost.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-600">Total Cost</p>
                  <p className="text-lg font-bold text-green-800">₹{juice.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-purple-600">Cost per Glass</p>
                  <p className="text-lg font-bold text-purple-800">₹{juice.costPerGlass.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DetoxJuices;
