import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface StockExcelDialogProps {
  title: string;
  description: string;
  entityLabel: string;
  templateLabel: string;
  requiredColumns: string[];
  onExport: () => void;
  onDownloadTemplate: () => void;
  onImport: (file: File) => Promise<void> | void;
  inputId: string;
}

const StockExcelDialog = ({
  title,
  description,
  entityLabel,
  templateLabel,
  requiredColumns,
  onExport,
  onDownloadTemplate,
  onImport,
  inputId,
}: StockExcelDialogProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      toast.error("Please select an Excel (.xlsx/.xls) or CSV file");
      return;
    }
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      await onImport(selectedFile);
      setSelectedFile(null);
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      if (input) input.value = "";
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet size={16} className="mr-2" />
          Import / Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download size={20} />
                Export Current {entityLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Download the entries recorded for the selected month.
              </p>
              <Button onClick={onExport} variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Download {entityLabel}
              </Button>
              <p className="text-sm text-gray-600">
                Or download a blank template pre-filled with {templateLabel} and opening stock.
              </p>
              <Button onClick={onDownloadTemplate} variant="outline" className="w-full">
                <FileSpreadsheet size={16} className="mr-2" />
                Download Template ({templateLabel})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload size={20} />
                Upload {entityLabel} Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <input
                    id={inputId}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <h4 className="font-medium text-yellow-800">Required Format:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    {requiredColumns.map((c, i) => (
                      <li key={i}>{`Column ${i + 1}: ${c}`}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleImport} disabled={isLoading || !selectedFile} className="flex-1" variant="outline">
              <Upload size={16} className="mr-2" />
              {isLoading ? "Importing..." : `Import ${entityLabel}`}
            </Button>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockExcelDialog;
