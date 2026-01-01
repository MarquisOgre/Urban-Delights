import { useState, useEffect } from "react";
import { format, isSameMonth } from "date-fns";
import { CalendarIcon, Printer, Plus, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { fetchMasterIngredients, fetchRecipesWithIngredients, type MasterIngredient, type RecipeWithIngredients } from "@/services/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const PODI_ENTRIES_KEY = 'STOCK_REGISTER_PODI_ENTRIES';
const RAW_MATERIAL_ENTRIES_KEY = 'STOCK_REGISTER_RAW_MATERIAL_ENTRIES';

const StockRegisterComponent = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Edit/Delete state
  const [editingPodiEntry, setEditingPodiEntry] = useState<PodiEntry | null>(null);
  const [editingRmEntry, setEditingRmEntry] = useState<RawMaterialEntry | null>(null);
  const [deletingPodiEntry, setDeletingPodiEntry] = useState<PodiEntry | null>(null);
  const [deletingRmEntry, setDeletingRmEntry] = useState<RawMaterialEntry | null>(null);
  
  // Edit form state
  const [editPodiDate, setEditPodiDate] = useState<Date>(new Date());
  const [editPodiOpeningStock, setEditPodiOpeningStock] = useState<string>("");
  const [editPodiProduction, setEditPodiProduction] = useState<string>("");
  const [editPodiSales, setEditPodiSales] = useState<string>("");
  
  const [editRmDate, setEditRmDate] = useState<Date>(new Date());
  const [editRmOpening, setEditRmOpening] = useState<string>("");
  const [editRmPurchased, setEditRmPurchased] = useState<string>("");
  const [editRmUsed, setEditRmUsed] = useState<string>("");

  // Filtered entries for display
  const filteredPodiEntries = podiEntries.filter(entry => isSameMonth(entry.date, selectedMonth));
  const filteredRawMaterialEntries = rawMaterialEntries.filter(entry => isSameMonth(entry.date, selectedMonth));

  // Calculate monthly summaries
  const podiSummary = {
    totalOpening: filteredPodiEntries.reduce((sum, e) => sum + e.openingStock, 0),
    totalProduction: filteredPodiEntries.reduce((sum, e) => sum + e.production, 0),
    totalSales: filteredPodiEntries.reduce((sum, e) => sum + e.sales, 0),
    totalClosing: filteredPodiEntries.reduce((sum, e) => sum + e.closingStock, 0),
  };

  const rmSummary = {
    totalOpening: filteredRawMaterialEntries.reduce((sum, e) => sum + e.opening, 0),
    totalPurchased: filteredRawMaterialEntries.reduce((sum, e) => sum + e.purchased, 0),
    totalUsed: filteredRawMaterialEntries.reduce((sum, e) => sum + e.used, 0),
    totalClosing: filteredRawMaterialEntries.reduce((sum, e) => sum + e.closing, 0),
  };

  // Load cached data from localStorage
  const loadCachedData = () => {
    try {
      const cachedPodiEntries = localStorage.getItem(PODI_ENTRIES_KEY);
      const cachedRawMaterialEntries = localStorage.getItem(RAW_MATERIAL_ENTRIES_KEY);
      
      if (cachedPodiEntries) {
        const parsed = JSON.parse(cachedPodiEntries);
        setPodiEntries(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
      if (cachedRawMaterialEntries) {
        const parsed = JSON.parse(cachedRawMaterialEntries);
        setRawMaterialEntries(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error('Error loading cached stock data:', error);
    }
  };

  // Save data to localStorage
  const cachePodiEntries = (entries: PodiEntry[]) => {
    try {
      localStorage.setItem(PODI_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error caching podi entries:', error);
    }
  };

  const cacheRawMaterialEntries = (entries: RawMaterialEntry[]) => {
    try {
      localStorage.setItem(RAW_MATERIAL_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error caching raw material entries:', error);
    }
  };

  // Fetch entries from database
  const fetchStockEntries = async () => {
    try {
      // Fetch podi entries
      const { data: podiData, error: podiError } = await supabase
        .from('podi_stock_entries')
        .select('*')
        .order('entry_date', { ascending: true });

      if (podiError) throw podiError;

      const mappedPodiEntries: PodiEntry[] = (podiData || []).map(entry => ({
        id: entry.id,
        date: new Date(entry.entry_date),
        podiName: entry.podi_name,
        openingStock: Number(entry.opening_stock),
        production: Number(entry.production),
        sales: Number(entry.sales),
        closingStock: Number(entry.closing_stock),
      }));
      
      setPodiEntries(mappedPodiEntries);
      cachePodiEntries(mappedPodiEntries);

      // Fetch raw material entries
      const { data: rmData, error: rmError } = await supabase
        .from('raw_material_entries')
        .select('*')
        .order('entry_date', { ascending: true });

      if (rmError) throw rmError;

      const mappedRmEntries: RawMaterialEntry[] = (rmData || []).map(entry => ({
        id: entry.id,
        date: new Date(entry.entry_date),
        ingredient: entry.ingredient,
        opening: Number(entry.opening),
        purchased: Number(entry.purchased),
        used: Number(entry.used),
        closing: Number(entry.closing),
      }));
      
      setRawMaterialEntries(mappedRmEntries);
      cacheRawMaterialEntries(mappedRmEntries);
    } catch (error) {
      console.error('Error fetching stock entries, using cached data:', error);
      loadCachedData();
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load cached data first for instant display
        loadCachedData();
        
        const [masterIngredientsData, recipesData] = await Promise.all([
          fetchMasterIngredients(),
          fetchRecipesWithIngredients()
        ]);
        setMasterIngredients(masterIngredientsData);
        setRecipes(recipesData);
        
        // Fetch stock entries from database
        await fetchStockEntries();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
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

  const handleAddPodiEntry = async () => {
    if (!podiName || !podiOpeningStock || !podiProduction || !podiSales) return;

    const closingStock = calculatePodiClosingStock();
    
    try {
      const { data, error } = await supabase
        .from('podi_stock_entries')
        .insert({
          entry_date: format(selectedDate, 'yyyy-MM-dd'),
          podi_name: podiName,
          opening_stock: parseFloat(podiOpeningStock),
          production: parseFloat(podiProduction),
          sales: parseFloat(podiSales),
          closing_stock: closingStock,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: PodiEntry = {
        id: data.id,
        date: new Date(data.entry_date),
        podiName: data.podi_name,
        openingStock: Number(data.opening_stock),
        production: Number(data.production),
        sales: Number(data.sales),
        closingStock: Number(data.closing_stock),
      };

      const updatedEntries = [...podiEntries, newEntry];
      setPodiEntries(updatedEntries);
      cachePodiEntries(updatedEntries);
      
      toast.success('Podi entry added successfully');
    } catch (error) {
      console.error('Error adding podi entry:', error);
      // Fallback to local-only entry
      const newEntry: PodiEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        podiName,
        openingStock: parseFloat(podiOpeningStock),
        production: parseFloat(podiProduction),
        sales: parseFloat(podiSales),
        closingStock,
      };
      const updatedEntries = [...podiEntries, newEntry];
      setPodiEntries(updatedEntries);
      cachePodiEntries(updatedEntries);
      toast.error('Saved locally - will sync when online');
    }

    setPodiName("");
    setPodiOpeningStock("");
    setPodiProduction("");
    setPodiSales("");
  };

  const handleAddRawMaterialEntry = async () => {
    if (!ingredient || !rmOpening || !rmPurchased || !rmUsed) return;

    const closing = calculateRmClosing();
    
    try {
      const { data, error } = await supabase
        .from('raw_material_entries')
        .insert({
          entry_date: format(selectedDate, 'yyyy-MM-dd'),
          ingredient,
          opening: parseFloat(rmOpening),
          purchased: parseFloat(rmPurchased),
          used: parseFloat(rmUsed),
          closing,
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: RawMaterialEntry = {
        id: data.id,
        date: new Date(data.entry_date),
        ingredient: data.ingredient,
        opening: Number(data.opening),
        purchased: Number(data.purchased),
        used: Number(data.used),
        closing: Number(data.closing),
      };

      const updatedEntries = [...rawMaterialEntries, newEntry];
      setRawMaterialEntries(updatedEntries);
      cacheRawMaterialEntries(updatedEntries);
      
      toast.success('Raw material entry added successfully');
    } catch (error) {
      console.error('Error adding raw material entry:', error);
      // Fallback to local-only entry
      const newEntry: RawMaterialEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        ingredient,
        opening: parseFloat(rmOpening),
        purchased: parseFloat(rmPurchased),
        used: parseFloat(rmUsed),
        closing,
      };
      const updatedEntries = [...rawMaterialEntries, newEntry];
      setRawMaterialEntries(updatedEntries);
      cacheRawMaterialEntries(updatedEntries);
      toast.error('Saved locally - will sync when online');
    }

    setIngredient("");
    setRmOpening("");
    setRmPurchased("");
    setRmUsed("");
  };

  // Edit handlers
  const openEditPodiDialog = (entry: PodiEntry) => {
    setEditingPodiEntry(entry);
    setEditPodiDate(entry.date);
    setEditPodiOpeningStock(entry.openingStock.toString());
    setEditPodiProduction(entry.production.toString());
    setEditPodiSales(entry.sales.toString());
  };

  const openEditRmDialog = (entry: RawMaterialEntry) => {
    setEditingRmEntry(entry);
    setEditRmDate(entry.date);
    setEditRmOpening(entry.opening.toString());
    setEditRmPurchased(entry.purchased.toString());
    setEditRmUsed(entry.used.toString());
  };

  const calculateEditPodiClosing = () => {
    const opening = parseFloat(editPodiOpeningStock) || 0;
    const production = parseFloat(editPodiProduction) || 0;
    const sales = parseFloat(editPodiSales) || 0;
    return opening + production - sales;
  };

  const calculateEditRmClosing = () => {
    const opening = parseFloat(editRmOpening) || 0;
    const purchased = parseFloat(editRmPurchased) || 0;
    const used = parseFloat(editRmUsed) || 0;
    return opening + purchased - used;
  };

  const handleUpdatePodiEntry = async () => {
    if (!editingPodiEntry) return;

    const closingStock = calculateEditPodiClosing();
    
    try {
      const { error } = await supabase
        .from('podi_stock_entries')
        .update({
          entry_date: format(editPodiDate, 'yyyy-MM-dd'),
          opening_stock: parseFloat(editPodiOpeningStock),
          production: parseFloat(editPodiProduction),
          sales: parseFloat(editPodiSales),
          closing_stock: closingStock,
        })
        .eq('id', editingPodiEntry.id);

      if (error) throw error;

      const updatedEntries = podiEntries.map(e => 
        e.id === editingPodiEntry.id 
          ? { ...e, date: editPodiDate, openingStock: parseFloat(editPodiOpeningStock), production: parseFloat(editPodiProduction), sales: parseFloat(editPodiSales), closingStock }
          : e
      );
      setPodiEntries(updatedEntries);
      cachePodiEntries(updatedEntries);
      toast.success('Entry updated successfully');
    } catch (error) {
      console.error('Error updating podi entry:', error);
      toast.error('Failed to update entry');
    }

    setEditingPodiEntry(null);
  };

  const handleUpdateRmEntry = async () => {
    if (!editingRmEntry) return;

    const closing = calculateEditRmClosing();
    
    try {
      const { error } = await supabase
        .from('raw_material_entries')
        .update({
          entry_date: format(editRmDate, 'yyyy-MM-dd'),
          opening: parseFloat(editRmOpening),
          purchased: parseFloat(editRmPurchased),
          used: parseFloat(editRmUsed),
          closing,
        })
        .eq('id', editingRmEntry.id);

      if (error) throw error;

      const updatedEntries = rawMaterialEntries.map(e => 
        e.id === editingRmEntry.id 
          ? { ...e, date: editRmDate, opening: parseFloat(editRmOpening), purchased: parseFloat(editRmPurchased), used: parseFloat(editRmUsed), closing }
          : e
      );
      setRawMaterialEntries(updatedEntries);
      cacheRawMaterialEntries(updatedEntries);
      toast.success('Entry updated successfully');
    } catch (error) {
      console.error('Error updating raw material entry:', error);
      toast.error('Failed to update entry');
    }

    setEditingRmEntry(null);
  };

  // Delete handlers
  const handleDeletePodiEntry = async () => {
    if (!deletingPodiEntry) return;

    try {
      const { error } = await supabase
        .from('podi_stock_entries')
        .delete()
        .eq('id', deletingPodiEntry.id);

      if (error) throw error;

      const updatedEntries = podiEntries.filter(e => e.id !== deletingPodiEntry.id);
      setPodiEntries(updatedEntries);
      cachePodiEntries(updatedEntries);
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting podi entry:', error);
      toast.error('Failed to delete entry');
    }

    setDeletingPodiEntry(null);
  };

  const handleDeleteRmEntry = async () => {
    if (!deletingRmEntry) return;

    try {
      const { error } = await supabase
        .from('raw_material_entries')
        .delete()
        .eq('id', deletingRmEntry.id);

      if (error) throw error;

      const updatedEntries = rawMaterialEntries.filter(e => e.id !== deletingRmEntry.id);
      setRawMaterialEntries(updatedEntries);
      cacheRawMaterialEntries(updatedEntries);
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting raw material entry:', error);
      toast.error('Failed to delete entry');
    }

    setDeletingRmEntry(null);
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
              ${filteredPodiEntries.map((entry, index) => `
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
              ${filteredRawMaterialEntries.map((entry, index) => `
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-16 z-10 bg-white py-4 -mx-4 px-4">
          <h1 className="text-3xl font-bold text-gray-800">Stock Register</h1>
          
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint}
              className="flex items-center gap-2"
              disabled={filteredPodiEntries.length === 0 && filteredRawMaterialEntries.length === 0}
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
            {/* Podi Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-600 font-medium">Total Opening</p>
                  <p className="text-2xl font-bold text-blue-800">{podiSummary.totalOpening.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-600 font-medium">Total Production</p>
                  <p className="text-2xl font-bold text-green-800">{podiSummary.totalProduction.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-orange-600 font-medium">Total Sales</p>
                  <p className="text-2xl font-bold text-orange-800">{podiSummary.totalSales.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-purple-600 font-medium">Total Closing</p>
                  <p className="text-2xl font-bold text-purple-800">{podiSummary.totalClosing.toFixed(2)} kg</p>
                </CardContent>
              </Card>
            </div>

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
            {filteredPodiEntries.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Podi's Register - {format(selectedMonth, "MMMM yyyy")}</CardTitle>
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
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPodiEntries.map((entry, index) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                            <td className="p-2">{entry.podiName}</td>
                            <td className="p-2">{entry.openingStock}</td>
                            <td className="p-2">{entry.production}</td>
                            <td className="p-2">{entry.sales}</td>
                            <td className="p-2 font-medium">{entry.closingStock.toFixed(1)}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditPodiDialog(entry)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeletingPodiEntry(entry)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No entries for {format(selectedMonth, "MMMM yyyy")}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="raw-materials" className="space-y-6">
            {/* Raw Material Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-600 font-medium">Total Opening</p>
                  <p className="text-2xl font-bold text-blue-800">{rmSummary.totalOpening.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-600 font-medium">Total Purchased</p>
                  <p className="text-2xl font-bold text-green-800">{rmSummary.totalPurchased.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-orange-600 font-medium">Total Used</p>
                  <p className="text-2xl font-bold text-orange-800">{rmSummary.totalUsed.toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-purple-600 font-medium">Total Closing</p>
                  <p className="text-2xl font-bold text-purple-800">{rmSummary.totalClosing.toFixed(2)} kg</p>
                </CardContent>
              </Card>
            </div>

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
            {filteredRawMaterialEntries.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Raw Material Inventory - {format(selectedMonth, "MMMM yyyy")}</CardTitle>
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
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRawMaterialEntries.map((entry, index) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                            <td className="p-2">{entry.ingredient}</td>
                            <td className="p-2">{entry.opening}</td>
                            <td className="p-2">{entry.purchased}</td>
                            <td className="p-2">{entry.used}</td>
                            <td className="p-2 font-medium">{entry.closing.toFixed(1)}</td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditRmDialog(entry)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeletingRmEntry(entry)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No entries for {format(selectedMonth, "MMMM yyyy")}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Podi Entry Dialog */}
        <Dialog open={!!editingPodiEntry} onOpenChange={(open) => !open && setEditingPodiEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Podi Entry - {editingPodiEntry?.podiName}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editPodiDate, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editPodiDate} onSelect={(date) => date && setEditPodiDate(date)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Opening Stock (kg)</Label>
                <Input type="number" value={editPodiOpeningStock} onChange={(e) => setEditPodiOpeningStock(e.target.value)} />
              </div>
              <div>
                <Label>Production (kg)</Label>
                <Input type="number" value={editPodiProduction} onChange={(e) => setEditPodiProduction(e.target.value)} />
              </div>
              <div>
                <Label>Sales (kg)</Label>
                <Input type="number" value={editPodiSales} onChange={(e) => setEditPodiSales(e.target.value)} />
              </div>
              <div>
                <Label>Closing Stock (kg)</Label>
                <Input type="number" value={calculateEditPodiClosing().toFixed(1)} disabled />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPodiEntry(null)}>Cancel</Button>
              <Button onClick={handleUpdatePodiEntry}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Raw Material Entry Dialog */}
        <Dialog open={!!editingRmEntry} onOpenChange={(open) => !open && setEditingRmEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Raw Material Entry - {editingRmEntry?.ingredient}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editRmDate, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editRmDate} onSelect={(date) => date && setEditRmDate(date)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Opening (kg)</Label>
                <Input type="number" value={editRmOpening} onChange={(e) => setEditRmOpening(e.target.value)} />
              </div>
              <div>
                <Label>Purchased (kg)</Label>
                <Input type="number" value={editRmPurchased} onChange={(e) => setEditRmPurchased(e.target.value)} />
              </div>
              <div>
                <Label>Used (kg)</Label>
                <Input type="number" value={editRmUsed} onChange={(e) => setEditRmUsed(e.target.value)} />
              </div>
              <div>
                <Label>Closing (kg)</Label>
                <Input type="number" value={calculateEditRmClosing().toFixed(1)} disabled />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRmEntry(null)}>Cancel</Button>
              <Button onClick={handleUpdateRmEntry}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Podi Entry Confirmation */}
        <AlertDialog open={!!deletingPodiEntry} onOpenChange={(open) => !open && setDeletingPodiEntry(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the entry for {deletingPodiEntry?.podiName} on {deletingPodiEntry && format(deletingPodiEntry.date, "dd/MM/yyyy")}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePodiEntry} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Raw Material Entry Confirmation */}
        <AlertDialog open={!!deletingRmEntry} onOpenChange={(open) => !open && setDeletingRmEntry(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the entry for {deletingRmEntry?.ingredient} on {deletingRmEntry && format(deletingRmEntry.date, "dd/MM/yyyy")}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRmEntry} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StockRegisterComponent;
