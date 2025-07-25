import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

interface StockEntry {
  id: string;
  date: Date;
  openingStock: number;
  sold: number;
  production: number;
  netAvailable: number;
}

const StockRegister = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [openingStock, setOpeningStock] = useState<string>("");
  const [sold, setSold] = useState<string>("");
  const [production, setProduction] = useState<string>("");
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);

  const calculateNetStock = () => {
    const opening = parseFloat(openingStock) || 0;
    const soldQty = parseFloat(sold) || 0;
    const productionQty = parseFloat(production) || 0;
    return opening + productionQty - soldQty;
  };

  const handleAddEntry = () => {
    if (!openingStock || !sold || !production) return;

    const newEntry: StockEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      openingStock: parseFloat(openingStock),
      sold: parseFloat(sold),
      production: parseFloat(production),
      netAvailable: calculateNetStock(),
    };

    setStockEntries([...stockEntries, newEntry]);
    setOpeningStock("");
    setSold("");
    setProduction("");
  };

  const handlePrint = () => {
    const currentMonth = format(new Date(), "MMMM yyyy");
    const printContent = `
      <html>
        <head>
          <title>Stock Register - ${currentMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Stock Register - ${currentMonth}</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Opening Stock</th>
                <th>Production</th>
                <th>Sold</th>
                <th>Net Available Stock</th>
              </tr>
            </thead>
            <tbody>
              ${stockEntries.map(entry => `
                <tr>
                  <td>${format(entry.date, "dd/MM/yyyy")}</td>
                  <td>${entry.openingStock}</td>
                  <td>${entry.production}</td>
                  <td>${entry.sold}</td>
                  <td>${entry.netAvailable}</td>
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
          <h1 className="text-xl font-semibold text-gray-800">Stock Register</h1>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Stock Register</h1>
            <Button 
              onClick={handlePrint}
              className="flex items-center gap-2"
              disabled={stockEntries.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print Monthly Report
            </Button>
          </div>

          {/* Entry Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add Stock Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
                  <Label htmlFor="openingStock">Opening Stock</Label>
                  <Input
                    id="openingStock"
                    type="number"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                    placeholder="Enter opening stock"
                  />
                </div>

                <div>
                  <Label htmlFor="production">Production</Label>
                  <Input
                    id="production"
                    type="number"
                    value={production}
                    onChange={(e) => setProduction(e.target.value)}
                    placeholder="Enter production"
                  />
                </div>

                <div>
                  <Label htmlFor="sold">Sold</Label>
                  <Input
                    id="sold"
                    type="number"
                    value={sold}
                    onChange={(e) => setSold(e.target.value)}
                    placeholder="Enter sold quantity"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddEntry} className="w-full">
                    Add Entry
                  </Button>
                </div>
              </div>

              {/* Net Available Stock Display */}
              {(openingStock || sold || production) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Net Available Stock: {calculateNetStock().toFixed(2)} units
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Opening Stock + Production - Sales)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Entries Table */}
          {stockEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Date</th>
                        <th className="text-left p-2 font-medium">Opening Stock</th>
                        <th className="text-left p-2 font-medium">Production</th>
                        <th className="text-left p-2 font-medium">Sold</th>
                        <th className="text-left p-2 font-medium">Net Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockEntries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{format(entry.date, "dd/MM/yyyy")}</td>
                          <td className="p-2">{entry.openingStock}</td>
                          <td className="p-2">{entry.production}</td>
                          <td className="p-2">{entry.sold}</td>
                          <td className="p-2 font-medium">{entry.netAvailable.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StockRegister;