import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Upload } from "lucide-react";
import { addAllIngredients } from "@/utils/addIngredients";
import { useToast } from "@/hooks/use-toast";

interface BulkAddIngredientsProps {
  onRefresh: () => void;
}

const BulkAddIngredients = ({ onRefresh }: BulkAddIngredientsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{ success: boolean; name: string; error?: any }>>([]);
  const { toast } = useToast();

  const handleBulkAdd = async () => {
    setIsLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const allResults = await addAllIngredients();
      setResults(allResults);
      setProgress(100);
      
      const successCount = allResults.filter(r => r.success).length;
      const failureCount = allResults.filter(r => !r.success).length;
      
      toast({
        title: "Bulk Add Complete",
        description: `Successfully added/updated ${successCount} ingredients. ${failureCount} failed.`,
        variant: failureCount > 0 ? "destructive" : "default"
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-50 hover:bg-green-100 border-green-200">
          <Upload size={16} className="mr-2" />
          Bulk Add Ingredients
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Ingredients</DialogTitle>
          <DialogDescription>
            Add/update 25 ingredients with their brands and current market prices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ingredients to Add/Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  <p>• Roasted Chana Dal (Reliance) - ₹186</p>
                  <p>• Chana Dal (Reliance) - ₹186</p>
                  <p>• Toor Dal (Reliance) - ₹108</p>
                  <p>• Urad Dal (Reliance) - ₹102</p>
                  <p>• Groundnut (Reliance) - ₹174</p>
                  <p>• Dry Coconut (Reliance) - ₹612</p>
                  <p>• Sesame Seeds (Reliance) - ₹330</p>
                  <p>• White Sesame Seeds (Reliance) - ₹330</p>
                  <p>• Garlic (Local Market) - ₹60</p>
                  <p>• Byadagi Chilli (Reliance) - ₹260</p>
                  <p>• Guntur Chilli (Reliance) - ₹260</p>
                  <p>• Cumin Seeds (Reliance) - ₹415</p>
                  <p>• Coriander Seeds (Reliance) - ₹186</p>
                </div>
                <div className="space-y-1">
                  <p>• Fenugreek Seeds (Reliance) - ₹160</p>
                  <p>• Curry Leaves (Local Market) - ₹50</p>
                  <p>• Tamarind (Reliance) - ₹290</p>
                  <p>• Salt (Tata) - ₹30</p>
                  <p>• Hing (LG) - ₹1100</p>
                  <p>• Turmeric (Good Life) - ₹285</p>
                  <p>• Cinnamon (Surya) - ₹358</p>
                  <p>• Cardamom (Amazon Brand) - ₹4200</p>
                  <p>• Black Pepper (Aashirwaad) - ₹800</p>
                  <p>• Marathi Moggu (Amazon - Hansi) - ₹600</p>
                  <p>• Raati Puvu (Amazon) - ₹2200</p>
                  <p>• Cooking Oil (Soffola Gold) - ₹157</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adding ingredients...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
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
              onClick={handleBulkAdd} 
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Adding..." : "Start Bulk Add"}
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

export default BulkAddIngredients;