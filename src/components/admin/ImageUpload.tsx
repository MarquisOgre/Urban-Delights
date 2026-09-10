import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: "hero" | "categories";
  hint?: string;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUpload({ label, value, onChange, folder, hint }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isLogo = label.toLowerCase().includes("logo");

  const upload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Use JPG, PNG, WEBP or GIF images only");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || "image";
      const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage.from("storefront").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("storefront").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success(`${safeName} uploaded`);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium leading-none">{label}</label>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="h-8 text-red-600" onClick={() => onChange("")} disabled={uploading}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />Remove
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-slate-50">
        {value ? (
          <div className={`${isLogo ? "min-h-28" : "aspect-[16/7]"} relative bg-white`}>
            <img src={value} alt={isLogo ? "Store logo preview" : "Storefront preview"} className={isLogo ? "mx-auto h-28 max-w-full object-contain p-4" : "h-full w-full object-cover"} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <div className="absolute bottom-3 left-3 right-3 flex justify-end">
              <Button type="button" size="sm" className="bg-orange-600 shadow hover:bg-orange-700" onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Replace image
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" className="flex min-h-40 w-full flex-col items-center justify-center gap-2 p-6 text-slate-500 transition hover:bg-white hover:text-orange-600" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImagePlus className="h-8 w-8" />}
            <span className="font-semibold">{uploading ? "Uploading…" : "Upload an image"}</span>
            <span className="text-xs">JPG, PNG, WEBP or GIF · max 5 MB</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
