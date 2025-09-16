import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fetchMasterIngredients, fetchRecipesWithIngredients, type MasterIngredient, type RecipeWithIngredients } from "@/services/database";

interface PodiEntry {
  id: string;
  date: Date;
  podiName: string;
  openingStock: number;
  production: number;
  sales: number;
  closingStock: number;
}

interface RawMaterialEntry {
  id: string;
  date: Date;
  ingredient: string;
  opening: number;
  purchased: number;
  used: number;
  closing: number;
}

const StockRegisterComponent = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Data State
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  
  // Podi Register State
  const [podiName, setPodiName] = useState<string>("");
  const [podiOpeningStock, setPodiOpeningStock] = useState<string>("");
  const [podiProduction, setPodiProduction] = useState<string>("");
  const [podiSales, setPodiSales] = useState<string>("");
  const [podiEntries, setPodiEntries] = useState<PodiEntry[]>([]);
  
  // Raw Material Register State
  const [ingredient, setIngredient] = useState<string>("");
  const [rmOpening, setRmOpening] = useState<string>("");
  const [rmPurchased, setRmPurchased] = useState<string>("");
  const [rmUsed, setRmUsed] = useState<string>("");
  const [rawMaterialEntries, setRawMaterialEntries] = useState<RawMaterialEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [masterIngredientsData, recipesData] = await Promise.all([
          fetchMasterIngredients(),
          fetchRecipesWithIngredients()
        ]);
        setMasterIngredients(masterIngredientsData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const calculatePodiClosingStock = () => {
    const opening = parseFloat(podiOpeningStock) || 0;
    const production = parseFloat(podiProduction) || 0;
    const sales = parseFloat(podiSales) || 0;
    return opening + production - sales;
  };

  const calculateRmClosing = () => {
    const opening = parseFloat(rmOpening) || 0;
    const purchased = parseFloat(rmPurchased) || 0;
    const used = parseFloat(rmUsed) || 0;
    return opening + purchased - used;
  };

  const getLastPodiClosingStock = (podiName: string): number => {
    const filteredEntries = podiEntries
      .filter(entry => entry.podiName === podiName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filteredEntries.length > 0 ? filteredEntries[0].closingStock : 0;
  };

  const getLastRawMaterialClosingStock = (ingredient: string): number => {
    const filteredEntries = rawMaterialEntries
      .filter(entry => entry.ingredient === ingredient)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filteredEntries.length > 0 ? filteredEntries[0].closing : 0;
  };

  const handlePodiNameChange = (selectedPodiName: string) => {
    setPodiName(selectedPodiName);
    const lastClosingStock = getLastPodiClosingStock(selectedPodiName);
    setPodiOpeningStock(lastClosingStock.toString());
  };

  const handleIngredientChange = (selectedIngredient: string) => {
    setIngredient(selectedIngredient);
    const lastClosingStock = getLastRawMaterialClosingStock(selectedIngredient);
    setRmOpening(lastClosingStock.toString());
  };

  const handleAddPodiEntry = () => {
    if (!podiName || !podiOpeningStock || !podiProduction || !podiSales) return;

    const newEntry: PodiEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      podiName,
      openingStock: parseFloat(podiOpeningStock),
      production: parseFloat(podiProduction),
      sales: parseFloat(podiSales),
      closingStock: calculatePodiClosingStock(),
    };

    setPodiEntries([...podiEntries, newEntry]);
    setPodiName("");
    setPodiOpeningStock("");
    setPodiProduction("");
    setPodiSales("");
  };

  const handleAddRawMaterialEntry = () => {
    if (!ingredient || !rmOpening || !rmPurchased || !rmUsed) return;

    const newEntry: RawMaterialEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      ingredient,
      opening: parseFloat(rmOpening),
      purchased: parseFloat(rmPurchased),
      used: parseFloat(rmUsed),
      closing: calculateRmClosing(),
    };

    setRawMaterialEntries([...rawMaterialEntries, newEntry]);
    setIngredient("");
    setRmOpening("");
    setRmPurchased("");
    setRmUsed("");
  };

  const handlePrint = () => {
    const currentMonth = format(selectedMonth, "MMMM yyyy");
    const printContent = `
      <html>
        <head>
          <title>Stock Register - ${currentMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; margin-bottom: 30px; }
            h2 { color: #333; margin-top: 30px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Stock Register - ${currentMonth}</h1>
          
          <h2>Podi's Register</h2>
          <table>
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Date</th>
                <th>Podi Name</th>
                <th>Opening Stock (kg)</th>
                <th>Production (kg)</th>
                <th>Sales (kg)</th>
                <th>Closing Stock (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${podiEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${format(entry.date, "dd/MM/yyyy")}</td>
                  <td>${entry.podiName}</td>
                  <td>${entry.openingStock}</td>
                  <td>${entry.production}</td>
                  <td>${entry.sales}</td>
                  <td>${entry.closingStock.toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Raw Material Inventory</h2>
          <table>
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Date</th>
                <th>Ingredient</th>
                <th>Opening (kg)</th>
                <th>Purchased (kg)</th>
                <th>Used (kg)</th>
                <th>Closing (kg)</th>
              </tr>
            </thead>
            <tbody>
              ${rawMaterialEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${format(entry.date, "dd/MM/yyyy")}</td>
                  <td>${entry.ingredient}</td>
                  <td>${entry.opening}</td>
                  <td>${entry.purchased}</td>
                  <td>${entry.used}</td>
                  <td>${entry.closing.toFixed(1)}</td>
                </tr>
              `).join('')}
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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Stock Register</h1>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint}
              className="flex items-center gap-2"
              disabled={podiEntries.length === 0 && rawMaterialEntries.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print Monthly Report
            </Button>
            <Button 
              onClick={onBackToDashboard} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Month Picker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedMonth ? format(selectedMonth, "MMMM yyyy") : <span>Select month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Tabs defaultValue="podi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="podi"
              className="bg-orange-100 text-orange-800 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2"
            >
              Podi's Register
            </TabsTrigger>
            <TabsTrigger
              value="raw-materials"
              className="bg-orange-100 text-orange-800 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2"
            >
              Raw Material Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="podi" className="space-y-6">
            {/* Podi Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add Podi Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-[180px_1fr_100px_100px_100px_120px_auto] gap-4 items-end w-full">
                  {/* Date */}
                  <div className="min-w-[180px]">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Podi Name */}
                  <div className="flex-1 min-w-[300px] max-w-[400px]">
                    <Label htmlFor="podiName">Podi Name</Label>
                    <Select value={podiName} onValueChange={handlePodiNameChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select podi" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.name}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Opening Stock */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="podiOpeningStock">Opening</Label>
                    <Input
                      id="podiOpeningStock"
                      type="number"
                      value={podiOpeningStock}
                      onChange={(e) => setPodiOpeningStock(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Production */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="podiProduction">Production</Label>
                    <Input
                      id="podiProduction"
                      type="number"
                      value={podiProduction}
                      onChange={(e) => setPodiProduction(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Sales */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="podiSales">Sales</Label>
                    <Input
                      id="podiSales"
                      type="number"
                      value={podiSales}
                      onChange={(e) => setPodiSales(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Closing Stock */}
                  <div className="min-w-[120px]">
                    <Label htmlFor="podiClosingStock">Closing</Label>
                    <Input
                      id="podiClosingStock"
                      type="number"
                      value={Math.round(calculatePodiClosingStock())}
                      disabled
                    />
                  </div>

                  {/* Add Button */}
                  <div className="ml-auto">
                    <Button onClick={handleAddPodiEntry}>
                      <Plus className="h-4 w-4 mr-2" />
                      + Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Podi Entries Table */}
            {podiEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Podi's Register</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Sl.No</th>
                          <th className="text-left p-2 font-medium">Date</th>
                          <th className="text-left p-2 font-medium">Podi Name</th>
                          <th className="text-left p-2 font-medium">Opening Stock (kg)</th>
                          <th className="text-left p-2 font-medium">Production (kg)</th>
                          <th className="text-left p-2 font-medium">Sales (kg)</th>
                          <th className="text-left p-2 font-medium">Closing Stock (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {podiEntries.map((entry, index) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                            <td className="p-2">{entry.podiName}</td>
                            <td className="p-2">{entry.openingStock}</td>
                            <td className="p-2">{entry.production}</td>
                            <td className="p-2">{entry.sales}</td>
                            <td className="p-2 font-medium">{entry.closingStock.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="raw-materials" className="space-y-6">
            {/* Raw Material Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add Raw Material Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-[180px_1fr_100px_100px_100px_120px_auto] gap-4 items-end w-full">
                  {/* Date */}
                  <div className="min-w-[180px]">
                    <Label htmlFor="rmDate">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Ingredient */}
                  <div className="flex-1 min-w-[300px] max-w-[400px]">
                    <Label htmlFor="ingredient">Ingredient</Label>
                    <Select value={ingredient} onValueChange={handleIngredientChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {masterIngredients.map((ing) => (
                          <SelectItem key={ing.id} value={ing.name}>
                            {ing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Opening */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="rmOpening">Opening</Label>
                    <Input
                      id="rmOpening"
                      type="number"
                      value={rmOpening}
                      onChange={(e) => setRmOpening(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Purchased */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="rmPurchased">Purchased</Label>
                    <Input
                      id="rmPurchased"
                      type="number"
                      value={rmPurchased}
                      onChange={(e) => setRmPurchased(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Used */}
                  <div className="min-w-[100px]">
                    <Label htmlFor="rmUsed">Used</Label>
                    <Input
                      id="rmUsed"
                      type="number"
                      value={rmUsed}
                      onChange={(e) => setRmUsed(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  {/* Closing */}
                  <div className="min-w-[120px]">
                    <Label htmlFor="rmClosing">Closing</Label>
                    <Input
                      id="rmClosing"
                      type="number"
                      value={Math.round(calculateRmClosing())}
                      disabled
                    />
                  </div>

                  {/* Add Button */}
                  <div className="ml-auto">
                    <Button onClick={handleAddRawMaterialEntry}>
                      <Plus className="h-4 w-4 mr-2" />
                      + Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Material Entries Table */}
            {rawMaterialEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Raw Material Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Sl.No</th>
                          <th className="text-left p-2 font-medium">Date</th>
                          <th className="text-left p-2 font-medium">Ingredient</th>
                          <th className="text-left p-2 font-medium">Opening (kg)</th>
                          <th className="text-left p-2 font-medium">Purchased (kg)</th>
                          <th className="text-left p-2 font-medium">Used (kg)</th>
                          <th className="text-left p-2 font-medium">Closing (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawMaterialEntries.map((entry, index) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                            <td className="p-2">{entry.ingredient}</td>
                            <td className="p-2">{entry.opening}</td>
                            <td className="p-2">{entry.purchased}</td>
                            <td className="p-2">{entry.used}</td>
                            <td className="p-2 font-medium">{entry.closing.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StockRegisterComponent;