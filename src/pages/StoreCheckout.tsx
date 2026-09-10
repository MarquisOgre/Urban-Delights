import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  History,
  Home,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { fetchRecipePricing, type RecipePricing } from "@/services/pricingService";
import { useStoreSettings, type StoreSettings } from "@/hooks/useStoreSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type CheckoutItem = { key: string; productName: string; pack: string; quantity: number; price: number; image: string };

const defaultProductImages: Record<string, string> = {
  "Chicken Masala": "/assets/chicken-masala.jpg", "Garam Masala": "/assets/garam-masala.jpg", "Sambar Podi": "/assets/sambar-powder.jpg", "Rasam Podi": "/assets/rasam-powder.jpg", "Karvepaku Podi": "/assets/karvepaku-podi.jpg", "Kobari Podi": "/assets/kobari-powder.jpg", "Palli Podi": "/assets/palli-podi.jpg", "Putnalu Podi": "/assets/putnalu-podi.jpg", "Idly Podi": "/assets/idly-podi.jpg",
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const findImage = (name: string, settings: StoreSettings) => settings.productMedia.find((item) => normalize(item.name) === normalize(name))?.imageUrl || defaultProductImages[name] || "/placeholder.svg";

const StoreCheckout = () => {
  const navigate = useNavigate();
  const { data: settings = {} as StoreSettings } = useStoreSettings();
  const { data: pricing = [] } = useQuery({ queryKey: ["store-pricing"], queryFn: fetchRecipePricing });
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("urban-delights-checkout-cart");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch { setItems([]); }
  }, []);

  const pricingLookup = useMemo(() => new Map<string, RecipePricing>(pricing.map((entry) => [`${normalize(entry.recipe_name)}|${normalize(entry.quantity_type)}`, entry])), [pricing]);
  const hydratedItems = useMemo(() => items.map((item) => ({ ...item, price: pricingLookup.get(`${normalize(item.productName)}|${normalize(item.pack)}`)?.price ?? item.price, image: item.image || findImage(item.productName, settings) })), [items, pricingLookup, settings]);
  const subtotal = hydratedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= Number(settings.freeShippingAbove || 0) ? 0 : Number(settings.shippingFee || 0);
  const total = subtotal + shipping;

  const upiPaymentUri = useMemo(() => {
    const pa = String(settings.upiId || "").trim();
    if (!pa || total <= 0) return "";
    const payee = String(settings.upiPayeeName || settings.storeName || "Urban Delights").trim();
    return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(payee)}&am=${total.toFixed(2)}&cu=INR`;
  }, [settings.upiId, settings.upiPayeeName, settings.storeName, total]);

  const dynamicQrCodeUrl = useMemo(() => {
    if (!upiPaymentUri) return "";
    return `https://quickchart.io/qr?size=320&margin=2&ecLevel=M&text=${encodeURIComponent(upiPaymentUri)}`;
  }, [upiPaymentUri]);

  const valid = Boolean(form.name.trim() && form.phone.trim() && form.address.trim() && hydratedItems.length > 0 && transactionId.trim());
  const changeQuantity = (key: string, delta: number) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (key: string) => setItems((current) => current.filter((item) => item.key !== key));
  const goHome = () => navigate("/?preview=1");

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const orderItems = hydratedItems.map((item) => ({ recipe_name: item.productName, quantity_type: item.pack, quantity: item.quantity, amount: item.price * item.quantity }));
      const { data, error } = await supabase.rpc("place_storefront_order" as never, {
        p_customer_name: form.name.trim(), p_phone_number: form.phone.trim(), p_address: form.address.trim(), p_total_amount: total, p_payment_status: "pending",
        p_notes: [form.email.trim() ? `Email: ${form.email.trim()}` : "", "Payment Method: UPI", form.notes.trim(), `UPI Transaction: ${transactionId.trim()}`].filter(Boolean).join(" | ") || null,
        p_items: orderItems,
      } as never);
      if (error) throw error;
      sessionStorage.removeItem("urban-delights-checkout-cart");
      setSuccess(String(data || ""));
    } catch (error: any) {
      window.alert(error?.message || "Could not place the order. Please try again.");
    } finally { setSubmitting(false); }
  };

  const CheckoutBrand = () => (
    <button type="button" onClick={goHome} className="flex items-center gap-3" aria-label="Urban Delights home">
      <img src={settings.logoUrl || "/logo.png"} alt="Urban Delights" className="h-10 w-auto object-contain sm:h-12" />
    </button>
  );

  if (success) return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f4] text-slate-900">
      <header className="shrink-0 mx-auto flex w-full max-w-[1680px] items-center justify-between px-5 py-3 sm:px-8"><CheckoutBrand /><button type="button" onClick={goHome} aria-label="Return to store" className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-800 shadow-sm transition hover:bg-stone-50"><History className="h-5 w-5" /></button></header>
      <main className="flex min-h-0 flex-1 items-center"><div className="mx-auto w-full max-w-3xl px-4 py-12"><Card className="w-full rounded-2xl border-stone-200 p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" /><h1 className="mt-5 font-serif text-3xl font-bold text-[#2f6b45]">Order Placed Successfully</h1><p className="mt-2 text-stone-500">Your order has been received successfully.</p><div className="mt-5 rounded-xl bg-stone-100 p-4 text-sm">Order ID: <span className="font-mono font-bold">{success.slice(0, 8).toUpperCase()}</span><div className="mt-1">Total: <span className="font-bold">₹{total.toFixed(0)}</span></div></div><div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={goHome}><Home className="h-4 w-4" />Back to Home</Button><Button variant="outline" onClick={() => navigate("/?preview=1#products")}><ShoppingBag className="h-4 w-4" />Continue Shopping</Button></div></Card></div></main>
      <Footer />
    </div>
  );

  if (!hydratedItems.length) return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f4] text-slate-900">
      <header className="shrink-0 mx-auto flex w-full max-w-[1680px] items-center justify-between px-5 py-3 sm:px-8"><CheckoutBrand /><button type="button" onClick={goHome} aria-label="Return to store" className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-800 shadow-sm transition hover:bg-stone-50"><History className="h-5 w-5" /></button></header>
      <main className="flex min-h-0 flex-1 items-center"><div className="mx-auto max-w-3xl px-4 py-10"><Card className="rounded-2xl border-stone-200 p-10 text-center shadow-sm"><ShoppingBag className="mx-auto h-14 w-14 text-stone-300" /><h2 className="mt-4 font-serif text-2xl font-bold">Your basket is empty</h2><p className="mt-2 text-stone-500">Add products before opening checkout.</p><Button className="mt-6 bg-[#2f6b45] hover:bg-[#255536]" onClick={() => navigate("/?preview=1#products")}><Home className="h-4 w-4" />Back to Store</Button></Card></div></main><Footer />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f4] text-slate-900">
      <header className="shrink-0 mx-auto flex w-full max-w-[1680px] items-center justify-between px-5 py-3 sm:px-8">
        <CheckoutBrand />
        <div className="flex items-center gap-3"><h1 className="font-serif text-3xl font-bold tracking-tight text-[#2f6b45] sm:text-4xl">Checkout</h1><button type="button" onClick={goHome} aria-label="Return to store" className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-800 shadow-sm transition hover:bg-stone-50"><History className="h-5 w-5" /></button></div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 flex-col px-5 pb-12 pt-5 sm:px-8">
        <form onSubmit={submitOrder} className="grid min-h-0 flex-1 items-stretch gap-7 lg:grid-cols-3">
          <Card className="min-h-0 h-full rounded-2xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-7 pb-4 pt-8"><CardTitle className="font-serif text-xl font-bold">Order Summary</CardTitle></CardHeader><CardContent className="px-7 pb-8"><div className="space-y-5">{hydratedItems.map((item) => <div key={item.key} className="grid grid-cols-[52px_1fr_auto] gap-3 border-b border-stone-200 pb-5"><img src={item.image} alt={item.productName} className="h-14 w-14 rounded-md object-cover" onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }} /><div className="min-w-0"><p className="truncate text-[15px] font-medium">{item.productName}</p><div className="mt-2 flex items-center gap-2"><button type="button" onClick={() => changeQuantity(item.key, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50"><Minus className="h-3.5 w-3.5" /></button><span className="w-5 text-center text-sm">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.key, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50"><Plus className="h-3.5 w-3.5" /></button><button type="button" onClick={() => removeItem(item.key)} aria-label={`Remove ${item.productName}`} className="ml-1 text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></div><div className="pt-1 text-sm font-semibold">₹{(item.price * item.quantity).toFixed(0)}</div></div>)}</div><div className="mt-6 border-t border-stone-200 pt-5"><div className="space-y-3 text-sm"><div className="flex items-center justify-between"><span className="text-stone-500">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div><div className="flex items-center justify-between"><span className="text-stone-500">Shipping</span><span className="font-medium">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span></div></div><div className="mt-4 border-t border-stone-200 pt-4"><div className="flex items-center justify-between"><span className="font-serif text-xl font-bold">Total</span><span className="font-serif text-xl font-bold text-[#2f6b45]">₹{total.toFixed(2)}</span></div></div></div></CardContent></Card>

          <Card className="min-h-0 h-full rounded-2xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-7 pb-2 pt-8"><CardTitle className="font-serif text-xl font-bold">Your Details</CardTitle></CardHeader><CardContent className="px-7 pb-8"><div className="space-y-5"><div><Label className="text-sm font-medium">Full Name<span className="text-red-500">*</span></Label><div className="relative mt-2"><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enter your name" className="h-12 rounded-xl border-stone-200 bg-[#fbfcf8] pr-11" required /><UserRound className="absolute right-3 top-3.5 h-5 w-5 text-stone-400" /></div></div><div><Label className="text-sm font-medium">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Enter email (optional)" className="mt-2 h-12 rounded-xl border-stone-200 bg-[#fbfcf8]" /></div><div><Label className="text-sm font-medium">Phone Number<span className="text-red-500">*</span></Label><div className="relative mt-2"><Input inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" className="h-12 rounded-xl border-stone-200 bg-[#fbfcf8] pr-11" required /><Phone className="absolute right-3 top-3.5 h-5 w-5 text-stone-400" /></div></div><div><Label className="text-sm font-medium">Delivery Address<span className="text-red-500">*</span></Label><div className="relative mt-2"><Textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Enter full address" className="min-h-[100px] rounded-xl border-stone-200 bg-[#fbfcf8] pr-11" required /><MapPin className="absolute right-3 top-3.5 h-5 w-5 text-stone-400" /></div></div></div></CardContent></Card>

          <Card className="min-h-0 h-full rounded-2xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-7 pb-2 pt-8"><CardTitle className="font-serif text-xl font-bold">UPI Payment</CardTitle></CardHeader><CardContent className="px-7 pb-8"><div className="flex min-h-[390px] flex-col justify-center"><div className="rounded-xl border border-[#2f6b45] bg-[#f4faf6] p-5"><div className="rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm"><div className="text-sm font-medium text-stone-700">Scan QR Code to Pay ₹{total.toFixed(2)}</div>{dynamicQrCodeUrl ? <img src={dynamicQrCodeUrl} alt="Dynamic UPI payment QR code" className="mx-auto mt-3 h-48 w-48 rounded-lg object-contain" /> : <div className="mx-auto mt-3 flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 text-sm text-stone-500">UPI ID has not been configured in Admin Settings.</div>}<div className="mt-3 text-xs text-stone-500">{settings.upiId || "UPI ID not configured"}</div>{settings.upiPayeeName && <div className="mt-1 text-xs text-stone-400">Payee: {settings.upiPayeeName}</div>}{upiPaymentUri && <a href={upiPaymentUri} className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2f6b45] px-5 text-sm font-semibold text-white transition hover:bg-[#255536]">Open UPI App to Pay ₹{total.toFixed(2)}</a>}</div><div className="mt-4"><Label className="text-left text-sm">UPI Transaction ID<span className="text-red-500">*</span></Label><Input className="mt-2 h-12 rounded-xl border-stone-200 bg-white" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter transaction reference after payment" required /></div></div></div><div className="border-t border-stone-200 pt-3"><Button type="submit" size="lg" className="h-12 w-full rounded-xl bg-[#2f6b45] text-white hover:bg-[#255536]" disabled={!valid || submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Placing Order...</> : "Place Order"}</Button></div></CardContent></Card>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default StoreCheckout;
