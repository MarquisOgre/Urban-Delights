import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fetchRecipePricing, type RecipePricing } from "@/services/pricingService";
import chickenMasala from "@/assets/chicken-masala.jpg";
import garamMasala from "@/assets/garam-masala.jpg";
import sambarPodi from "@/assets/sambar-powder.jpg";
import rasamPodi from "@/assets/rasam-powder.jpg";
import karvepakuPodi from "@/assets/karvepaku-podi.jpg";
import kobariPodi from "@/assets/kobari-powder.jpg";
import palliPodi from "@/assets/palli-podi.jpg";
import putnaluPodi from "@/assets/putnalu-podi.jpg";
import idlyPodi from "@/assets/idly-podi.jpg";

type Category = "All" | "Masala" | "Podi";
interface StoreProduct { id: string; name: string; category: Exclude<Category, "All">; image: string; description: string; aliases: string[]; }
interface CartItem { key: string; product: StoreProduct; pack: string; price: number; quantity: number; }
const products: StoreProduct[] = [
  { id: "chicken-masala", name: "Chicken Masala", category: "Masala", image: chickenMasala, description: "A robust, aromatic blend for deeply flavoured chicken dishes.", aliases: ["chicken masala"] },
  { id: "garam-masala", name: "Garam Masala", category: "Masala", image: garamMasala, description: "A warming finishing spice with whole-spice depth and aroma.", aliases: ["garam masala"] },
  { id: "sambar-podi", name: "Sambar Podi", category: "Masala", image: sambarPodi, description: "A balanced lentil and spice blend for homestyle sambar.", aliases: ["sambar podi", "sambar powder"] },
  { id: "rasam-podi", name: "Rasam Podi", category: "Masala", image: rasamPodi, description: "Peppery, tangy and fragrant for a comforting bowl of rasam.", aliases: ["rasam podi", "rasam powder"] },
  { id: "karvepaku-podi", name: "Karvepaku Podi", category: "Podi", image: karvepakuPodi, description: "Earthy curry leaves ground with lentils and traditional spices.", aliases: ["karvepaku podi", "curry leaf"] },
  { id: "kobari-podi", name: "Kobari Podi", category: "Podi", image: kobariPodi, description: "A savoury coconut blend with a gently roasted finish.", aliases: ["kobari podi", "kobari powder", "coconut"] },
  { id: "palli-podi", name: "Palli Podi", category: "Podi", image: palliPodi, description: "Roasted peanut podi with a satisfying nutty flavour.", aliases: ["palli podi", "peanut"] },
  { id: "putnalu-podi", name: "Putnalu Podi", category: "Podi", image: putnaluPodi, description: "Classic roasted gram podi, simple and full of flavour.", aliases: ["putnalu podi", "roasted gram"] },
  { id: "idly-podi", name: "Idly Podi", category: "Podi", image: idlyPodi, description: "The everyday South Indian companion for idli and dosa.", aliases: ["idly podi", "idli podi"] },
];
const fallbackPacks = ["100 g", "250 g"];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const findPricing = (product: StoreProduct, pricing: RecipePricing[]) => pricing.filter((entry) => entry.is_enabled && product.aliases.some((alias) => normalize(entry.recipe_name).includes(normalize(alias))));

const Store = () => {
  const [category, setCategory] = useState<Category>("All");
  const [selectedPacks, setSelectedPacks] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { data: pricing = [] } = useQuery({ queryKey: ["store-pricing"], queryFn: fetchRecipePricing });
  const visibleProducts = category === "All" ? products : products.filter((product) => product.category === category);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const productPricing = useMemo(() => new Map(products.map((product) => [product.id, findPricing(product, pricing)])), [pricing]);
  const getPack = (product: StoreProduct) => { const entries = productPricing.get(product.id) ?? []; return selectedPacks[product.id] || entries[0]?.quantity_type || fallbackPacks[0]; };
  const addToCart = (product: StoreProduct) => { const entries = productPricing.get(product.id) ?? []; const pack = getPack(product); const price = entries.find((entry) => entry.quantity_type === pack)?.price ?? 0; if (price <= 0) return; const key = `${product.id}-${pack}`; setCart((current) => { const existing = current.find((item) => item.key === key); if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item); return [...current, { key, product, pack, price, quantity: 1 }]; }); setCartOpen(true); };
  const updateQuantity = (key: string, change: number) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity: item.quantity + change } : item).filter((item) => item.quantity > 0));

  return <div className="min-h-screen bg-store-canvas text-store-ink">
    <header className="sticky top-0 z-40 border-b border-store-border bg-background/95 backdrop-blur"><div className="container flex h-16 items-center justify-between gap-4 px-4">
      <Link to="/" aria-label="Urban Delights home"><img src="/logo.png" alt="Urban Delights" className="h-9 w-auto sm:h-11" /></Link>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}><SheetTrigger asChild><Button variant="outline" className="relative border-store-primary text-store-primary hover:bg-store-soft hover:text-store-primary"><ShoppingBag /> Basket <span className="rounded-full bg-store-primary px-2 py-0.5 text-xs text-primary-foreground">{itemCount}</span></Button></SheetTrigger>
        <SheetContent className="flex w-full flex-col bg-background sm:max-w-md"><SheetHeader><SheetTitle>Your basket</SheetTitle><SheetDescription>{itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"} selected` : "Your basket is ready for something delicious."}</SheetDescription></SheetHeader>
          <div className="mt-5 flex-1 space-y-4 overflow-y-auto">{cart.length === 0 && <div className="border-y border-store-border py-10 text-center text-sm text-store-muted">Your basket is empty.</div>}{cart.map((item) => <div key={item.key} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-store-border pb-4"><img src={item.product.image} alt="" className="h-16 w-16 rounded-md object-cover" /><div><p className="font-semibold">{item.product.name}</p><p className="text-xs text-store-muted">{item.pack} · ₹{item.price.toFixed(0)}</p><div className="mt-2 flex items-center gap-1"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, -1)}><Minus /></Button><span className="w-8 text-center text-sm font-semibold">{item.quantity}</span><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.key, 1)}><Plus /></Button></div></div><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setCart((current) => current.filter((entry) => entry.key !== item.key))}><Trash2 /></Button></div>)}</div>
          <div className="border-t border-store-border pt-5"><div className="mb-4 flex items-center justify-between text-lg font-bold"><span>Total</span><span>₹{cartTotal.toFixed(0)}</span></div><Button variant="outline" className="w-full border-store-primary text-store-primary hover:bg-store-soft hover:text-store-primary" disabled={!cart.length}>Proceed to order</Button></div>
        </SheetContent></Sheet>
    </div></header>
    <main><section className="border-b border-store-border bg-store-hero"><div className="container grid gap-6 px-4 py-8 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-store-primary">Traditional flavours · thoughtfully made</p><h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">The taste of home, ground fresh.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-store-muted sm:text-base">Small-batch podis and masalas made to bring honest South Indian flavour to every meal.</p></div><div className="flex gap-2" aria-label="Product categories">{(["All", "Masala", "Podi"] as Category[]).map((item) => <Button key={item} variant="outline" size="sm" onClick={() => setCategory(item)} className={category === item ? "border-store-primary bg-store-soft text-store-primary" : "border-store-border text-store-muted"}>{item}{item !== "All" ? "s" : ""}</Button>)}</div></div></section>
      <section className="container px-4 py-8 sm:py-12"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-store-primary">Shop the collection</p><h2 className="mt-1 text-2xl font-bold">{category === "All" ? "All favourites" : `${category}s`}</h2></div><p className="text-sm text-store-muted">{visibleProducts.length} products</p></div><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => { const entries = productPricing.get(product.id) ?? []; const pack = getPack(product); const price = entries.find((entry) => entry.quantity_type === pack)?.price ?? 0; const packOptions = entries.length ? entries.map((entry) => entry.quantity_type) : fallbackPacks; return <article key={product.id} className="group overflow-hidden rounded-lg border border-store-border bg-background shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"><div className="relative aspect-square overflow-hidden bg-store-soft"><img src={product.image} alt={`${product.name} spice blend`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-store-primary shadow-sm">{product.category}</span></div><div className="p-3 sm:p-5"><h3 className="text-base font-bold sm:text-lg">{product.name}</h3><p className="mt-1 hidden min-h-10 text-xs leading-relaxed text-store-muted sm:block">{product.description}</p><div className="mt-3 flex items-center justify-between gap-2"><Select value={pack} onValueChange={(value) => setSelectedPacks((current) => ({ ...current, [product.id]: value }))}><SelectTrigger className="h-9 w-[96px] border-store-border text-xs"><SelectValue /></SelectTrigger><SelectContent>{packOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><span className="text-lg font-bold text-store-price">{price > 0 ? `₹${price.toFixed(0)}` : "—"}</span></div><Button variant="outline" className="mt-3 w-full border-store-primary text-store-primary hover:bg-store-soft hover:text-store-primary" disabled={price <= 0} onClick={() => addToCart(product)}><ShoppingBag /> {price > 0 ? "Add to Basket" : "Price unavailable"}</Button></div></article>; })}</div></section>
    </main><footer className="border-t border-store-border bg-background py-8"><div className="container flex flex-col items-center justify-between gap-3 px-4 text-center text-xs text-store-muted sm:flex-row sm:text-left"><img src="/logo.png" alt="Urban Delights" className="h-8 w-auto" /><p>© {new Date().getFullYear()} Urban Delights. Traditional flavour, made with care.</p></div></footer>
  </div>;
};
export default Store;
