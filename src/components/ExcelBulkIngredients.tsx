import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Upload, Download, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { upsertMasterIngredient, getAllIngredients } from "@/services/database";

interface ExcelBulkIngredientsProps {
  onRefresh: () => void;
}

interface IngredientRow {
  name: string;
  brand: string;
  price: number;
}

const ExcelBulkIngredients = ({ onRefresh }: ExcelBulkIngredientsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{ success: boolean; name: string; error?: any }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // ✅ Download all ingredients from DB
  const downloadTemplate = async () => {
    try {
      const allIngredients = await getAllIngredients();

      const exportData = allIngredients.map((ingredient) => ({
        Name: ingredient.name,
        Brand: ingredient.brand || "",
        Price: ingredient.price_per_kg,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ingredients");

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'all_ingredients.xlsx');

      toast({
        title: "Export Complete",
        description: `Downloaded ${allIngredients.length} ingredients from your database.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to fetch ingredients.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        !file.name.endsWith('.xlsx')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel (.xlsx) file",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const processExcelFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (data.length === 0) {
        throw new Error("Excel file is empty or has no valid data");
      }

      const ingredientRows: IngredientRow[] = data.map((row, index) => {
        const name = row.Name || row.name || row.Ingredient || row.ingredient;
        const brand = row.Brand || row.brand || "";
        const price = parseFloat(row.Price || row.price || "0");

        if (!name || price <= 0) {
          throw new Error(`Invalid data in row ${index + 2}: Name and valid price are required`);
        }

        return { name, brand, price };
      });

      const allResults = [];
      const totalIngredients = ingredientRows.length;

      for (let i = 0; i < totalIngredients; i++) {
        const ingredient = ingredientRows[i];
        try {
          await upsertMasterIngredient(ingredient.name, ingredient.price, ingredient.brand);
          allResults.push({ success: true, name: ingredient.name });
        } catch (error) {
          allResults.push({ success: false, name: ingredient.name, error });
        }

        const currentProgress = ((i + 1) / totalIngredients) * 100;
        setProgress(currentProgress);
      }

      setResults(allResults);
      setProgress(100);

      const successCount = allResults.filter(r => r.success).length;
      const failureCount = allResults.filter(r => !r.success).length;

      toast({
        title: "Excel Import Complete",
        description: `Successfully imported ${successCount} ingredients. ${failureCount} failed.`,
        variant: failureCount > 0 ? "destructive" : "default"
      });

      onRefresh();
      setSelectedFile(null);
      const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast({
        title: "Error Processing File",
        description: error instanceof Error ? error.message : "Failed to process Excel file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 border-blue-200">
          <FileSpreadsheet size={16} className="mr-2" />
          Import / Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Excel Bulk Import</DialogTitle>
          <DialogDescription>
            Import ingredients from an Excel file. Download the full ingredient list from your database or upload new ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download size={20} />
                Export Current Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Download all ingredients currently stored in your database.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Download All Ingredients
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload size={20} />
                Upload Ingredients Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <input
                    id="excel-file-input"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-800">Required Format:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    <li>Column 1: Name (required)</li>
                    <li>Column 2: Brand (optional)</li>
                    <li>Column 3: Price (required, number)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing ingredients...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={result.success ? "text-green-700" : "text-red-700"}>
                        {result.name} - {result.success ? "Success" : "Failed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              onClick={processExcelFile}
              disabled={isLoading || !selectedFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Processing..." : "Import Ingredients"}
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              disabled={isLoading}
            >
              {results.length > 0 ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelBulkIngredients;
