import { useEffect, useState } from "react";
import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_PRODUCT_MEDIA, useSaveStoreSettings, useStoreSettings, type StoreProductMedia, type StoreSettings } from "@/hooks/useStoreSettings";
import ImageUpload from "@/components/admin/ImageUpload";

export default function StoreProductImages() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { data, isLoading } = useStoreSettings();
  const saveSettings = useSaveStoreSettings();
  const [items, setItems] = useState<StoreProductMedia[]>(DEFAULT_PRODUCT_MEDIA);

  useEffect(() => { if (data) setItems(data.productMedia ?? DEFAULT_PRODUCT_MEDIA); }, [data]);
  useEffect(() => { if (!loading && !session) navigate("/login", { replace: true }); }, [loading, session, navigate]);

  const update = (index: number, imageUrl: string) => setItems((current) => current.map((item, i) => i === index ? { ...item, imageUrl } : item));
  const save = async () => {
    if (!data) return;
    try {
      const next = { ...data, productMedia: items.map((item) => ({ name: item.name.trim(), imageUrl: item.imageUrl.trim() })).filter((item) => item.name) } as StoreSettings;
      await saveSettings.mutateAsync(next);
      toast.success("Product images saved");
    } catch (error: any) { toast.error(error?.message ?? "Could not save product images"); }
  };

  if (loading || !session || isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">Loading product images…</div>;

  return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6">
    <div className="sticky top-2 z-30 flex flex-col gap-4 rounded-2xl border bg-white/95 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Button variant="outline" size="icon" onClick={() => navigate("/admin/settings")}><ArrowLeft className="h-4 w-4" /></Button><div><div className="flex items-center gap-2"><div className="rounded-xl bg-orange-50 p-2 text-orange-600"><ImageIcon className="h-5 w-5" /></div><h1 className="text-2xl font-black sm:text-3xl">Product Images</h1></div><p className="mt-1 text-sm text-slate-500">Upload and replace the images shown on every product card and in the basket.</p></div></div><Button onClick={save} disabled={saveSettings.isPending} className="gap-2 bg-orange-600 hover:bg-orange-700"><Save className="h-4 w-4" />{saveSettings.isPending ? "Saving…" : "Save Images"}</Button></div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <Card key={item.name} className="overflow-hidden"><CardHeader><CardTitle className="text-lg">{item.name}</CardTitle></CardHeader><CardContent><ImageUpload label="Product image" value={item.imageUrl} onChange={(url) => update(index, url)} folder="categories" hint="Recommended: 1000×1000 square product photo." /></CardContent></Card>)}</div>
  </div></div>;
}
