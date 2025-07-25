import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

interface PodiEntry {
  id: string;
  date: Date;
  podiName: string;
  openingStock: number;
  inward: number;
  outward: number;
  wastage: number;
  closingStock: number;
  notes: string;
}

interface RawMaterialEntry {
  id: string;
  date: Date;
  ingredient: string;
  opening: number;
  purchased: number;
  used: number;
  wastage: number;
  closing: number;
  remarks: string;
}

const StockRegister = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Podi Register State
  const [podiName, setPodiName] = useState<string>("");
  const [podiOpeningStock, setPodiOpeningStock] = useState<string>("");
  const [podiInward, setPodiInward] = useState<string>("");
  const [podiOutward, setPodiOutward] = useState<string>("");
  const [podiWastage, setPodiWastage] = useState<string>("");
  const [podiNotes, setPodiNotes] = useState<string>("");
  const [podiEntries, setPodiEntries] = useState<PodiEntry[]>([]);
  
  // Raw Material Register State
  const [ingredient, setIngredient] = useState<string>("");
  const [rmOpening, setRmOpening] = useState<string>("");
  const [rmPurchased, setRmPurchased] = useState<string>("");
  const [rmUsed, setRmUsed] = useState<string>("");
  const [rmWastage, setRmWastage] = useState<string>("");
  const [rmRemarks, setRmRemarks] = useState<string>("");
  const [rawMaterialEntries, setRawMaterialEntries] = useState<RawMaterialEntry[]>([]);

  const calculatePodiClosingStock = () => {
    const opening = parseFloat(podiOpeningStock) || 0;
    const inward = parseFloat(podiInward) || 0;
    const outward = parseFloat(podiOutward) || 0;
    const wastage = parseFloat(podiWastage) || 0;
    return opening + inward - outward - wastage;
  };

  const calculateRmClosing = () => {
    const opening = parseFloat(rmOpening) || 0;
    const purchased = parseFloat(rmPurchased) || 0;
    const used = parseFloat(rmUsed) || 0;
    const wastage = parseFloat(rmWastage) || 0;
    return opening + purchased - used - wastage;
  };

  const handleAddPodiEntry = () => {
    if (!podiName || !podiOpeningStock || !podiInward || !podiOutward) return;

    const newEntry: PodiEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      podiName,
      openingStock: parseFloat(podiOpeningStock),
      inward: parseFloat(podiInward),
      outward: parseFloat(podiOutward),
      wastage: parseFloat(podiWastage) || 0,
      closingStock: calculatePodiClosingStock(),
      notes: podiNotes,
    };

    setPodiEntries([...podiEntries, newEntry]);
    setPodiName("");
    setPodiOpeningStock("");
    setPodiInward("");
    setPodiOutward("");
    setPodiWastage("");
    setPodiNotes("");
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
      wastage: parseFloat(rmWastage) || 0,
      closing: calculateRmClosing(),
      remarks: rmRemarks,
    };

    setRawMaterialEntries([...rawMaterialEntries, newEntry]);
    setIngredient("");
    setRmOpening("");
    setRmPurchased("");
    setRmUsed("");
    setRmWastage("");
    setRmRemarks("");
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
                <th>Inward (kg)</th>
                <th>Outward (kg)</th>
                <th>Wastage (kg)</th>
                <th>Closing Stock (kg)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${podiEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${format(entry.date, "dd/MM/yyyy")}</td>
                  <td>${entry.podiName}</td>
                  <td>${entry.openingStock}</td>
                  <td>${entry.inward}</td>
                  <td>${entry.outward}</td>
                  <td>${entry.wastage}</td>
                  <td>${entry.closingStock.toFixed(1)}</td>
                  <td>${entry.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Raw Materials Register</h2>
          <table>
            <thead>
              <tr>
                <th>Sl.No</th>
                <th>Date</th>
                <th>Ingredient</th>
                <th>Opening (kg)</th>
                <th>Purchased (kg)</th>
                <th>Used (kg)</th>
                <th>Wastage (kg)</th>
                <th>Closing (kg)</th>
                <th>Remarks</th>
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
                  <td>${entry.wastage}</td>
                  <td>${entry.closing.toFixed(1)}</td>
                  <td>${entry.remarks}</td>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="text-sm"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Stock Register</h1>
            <Button 
              onClick={handlePrint}
              className="flex items-center gap-2"
              disabled={podiEntries.length === 0 && rawMaterialEntries.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print Monthly Report
            </Button>
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
              <TabsTrigger value="podi">Podi's Register</TabsTrigger>
              <TabsTrigger value="raw-materials">Raw Materials Register</TabsTrigger>
            </TabsList>

            <TabsContent value="podi" className="space-y-6">
              {/* Podi Entry Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Podi Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
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

                    <div>
                      <Label htmlFor="podiName">Podi Name</Label>
                      <Input
                        id="podiName"
                        value={podiName}
                        onChange={(e) => setPodiName(e.target.value)}
                        placeholder="Enter podi name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="podiOpeningStock">Opening Stock (kg)</Label>
                      <Input
                        id="podiOpeningStock"
                        type="number"
                        value={podiOpeningStock}
                        onChange={(e) => setPodiOpeningStock(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="podiInward">Inward (kg)</Label>
                      <Input
                        id="podiInward"
                        type="number"
                        value={podiInward}
                        onChange={(e) => setPodiInward(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label htmlFor="podiOutward">Outward (kg)</Label>
                      <Input
                        id="podiOutward"
                        type="number"
                        value={podiOutward}
                        onChange={(e) => setPodiOutward(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="podiWastage">Wastage (kg)</Label>
                      <Input
                        id="podiWastage"
                        type="number"
                        value={podiWastage}
                        onChange={(e) => setPodiWastage(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="podiNotes">Notes</Label>
                      <Input
                        id="podiNotes"
                        value={podiNotes}
                        onChange={(e) => setPodiNotes(e.target.value)}
                        placeholder="Enter notes"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button onClick={handleAddPodiEntry} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>
                  </div>

                  {/* Closing Stock Display */}
                  {(podiOpeningStock || podiInward || podiOutward || podiWastage) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Closing Stock: {calculatePodiClosingStock().toFixed(1)} kg
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (Opening + Inward - Outward - Wastage)
                      </p>
                    </div>
                  )}
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
                            <th className="text-left p-2 font-medium">Inward (kg)</th>
                            <th className="text-left p-2 font-medium">Outward (kg)</th>
                            <th className="text-left p-2 font-medium">Wastage (kg)</th>
                            <th className="text-left p-2 font-medium">Closing Stock (kg)</th>
                            <th className="text-left p-2 font-medium">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {podiEntries.map((entry, index) => (
                            <tr key={entry.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                              <td className="p-2">{entry.podiName}</td>
                              <td className="p-2">{entry.openingStock}</td>
                              <td className="p-2">{entry.inward}</td>
                              <td className="p-2">{entry.outward}</td>
                              <td className="p-2">{entry.wastage}</td>
                              <td className="p-2 font-medium">{entry.closingStock.toFixed(1)}</td>
                              <td className="p-2">{entry.notes}</td>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
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

                    <div>
                      <Label htmlFor="ingredient">Ingredient</Label>
                      <Input
                        id="ingredient"
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)}
                        placeholder="Enter ingredient name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rmOpening">Opening (kg)</Label>
                      <Input
                        id="rmOpening"
                        type="number"
                        value={rmOpening}
                        onChange={(e) => setRmOpening(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rmPurchased">Purchased (kg)</Label>
                      <Input
                        id="rmPurchased"
                        type="number"
                        value={rmPurchased}
                        onChange={(e) => setRmPurchased(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label htmlFor="rmUsed">Used (kg)</Label>
                      <Input
                        id="rmUsed"
                        type="number"
                        value={rmUsed}
                        onChange={(e) => setRmUsed(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rmWastage">Wastage (kg)</Label>
                      <Input
                        id="rmWastage"
                        type="number"
                        value={rmWastage}
                        onChange={(e) => setRmWastage(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rmRemarks">Remarks</Label>
                      <Input
                        id="rmRemarks"
                        value={rmRemarks}
                        onChange={(e) => setRmRemarks(e.target.value)}
                        placeholder="Enter remarks"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button onClick={handleAddRawMaterialEntry} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>
                  </div>

                  {/* Closing Stock Display */}
                  {(rmOpening || rmPurchased || rmUsed || rmWastage) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">
                        Closing Stock: {calculateRmClosing().toFixed(1)} kg
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        (Opening + Purchased - Used - Wastage)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Raw Material Entries Table */}
              {rawMaterialEntries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Raw Materials Register</CardTitle>
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
                            <th className="text-left p-2 font-medium">Wastage (kg)</th>
                            <th className="text-left p-2 font-medium">Closing (kg)</th>
                            <th className="text-left p-2 font-medium">Remarks</th>
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
                              <td className="p-2">{entry.wastage}</td>
                              <td className="p-2 font-medium">{entry.closing.toFixed(1)}</td>
                              <td className="p-2">{entry.remarks}</td>
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
      
      <Footer />
    </div>
  );
};

export default StockRegister;