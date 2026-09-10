import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Home, Loader2, MapPin, Phone, ShoppingBag, UserRound } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => { try { const raw = sessionStorage.getItem("urban-delights-checkout-cart"); const parsed = raw ? JSON.parse(raw) : []; if (Array.isArray(parsed)) setItems(parsed); } catch { setItems([]); } }, []);
  const pricingLookup = useMemo(() => new Map<string, RecipePricing>(pricing.map((entry) => [`${normalize(entry.recipe_name)}|${normalize(entry.quantity_type)}`, entry])), [pricing]);
  const hydratedItems = useMemo(() => items.map((item) => ({ ...item, price: pricingLookup.get(`${normalize(item.productName)}|${normalize(item.pack)}`)?.price ?? item.price, image: item.image || findImage(item.productName, settings) })), [items, pricingLookup, settings]);
  const subtotal = hydratedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= Number(settings.freeShippingAbove || 0) ? 0 : Number(settings.shippingFee || 0);
  const total = subtotal + shipping;
  const valid = Boolean(form.name.trim() && form.phone.trim() && form.address.trim() && hydratedItems.length > 0 && (paymentMethod !== "upi" || transactionId.trim()));

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault(); if (!valid || submitting) return; setSubmitting(true);
    try {
      const orderItems = hydratedItems.map((item) => ({ recipe_name: item.productName, quantity_type: item.pack, quantity: item.quantity, amount: item.price * item.quantity }));
      const { data, error } = await supabase.rpc("place_storefront_order" as never, {
        p_customer_name: form.name.trim(), p_phone_number: form.phone.trim(), p_address: form.address.trim(), p_total_amount: total, p_payment_status: "pending",
        p_notes: [form.email.trim() ? `Email: ${form.email.trim()}` : "", form.notes.trim(), paymentMethod === "upi" && transactionId.trim() ? `UPI Transaction: ${transactionId.trim()}` : ""].filter(Boolean).join(" | ") || null,
        p_items: orderItems,
      } as never);
      if (error) throw error;
      const orderId = String(data || ""); sessionStorage.removeItem("urban-delights-checkout-cart"); setSuccess(orderId);
    } catch (error: any) { window.alert(error?.message || "Could not place the order. Please try again."); } finally { setSubmitting(false); }
  };

  if (success) return <div className="min-h-screen bg-stone-50 text-stone-900"><main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12"><Card className="w-full p-8 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" /><h1 className="mt-5 text-3xl font-black">Order Placed Successfully</h1><p className="mt-2 text-stone-500">Your order has been received successfully.</p><div className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm">Order ID: <span className="font-mono font-bold">{success.slice(0, 8).toUpperCase()}</span><div className="mt-1">Total: <span className="font-bold">₹{total.toFixed(0)}</span></div></div><div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={() => navigate("/?preview=1")}><Home className="h-4 w-4" />Back to Home</Button><Button variant="outline" onClick={() => navigate("/?preview=1#products")}><ShoppingBag className="h-4 w-4" />Continue Shopping</Button></div></Card></main><Footer /></div>;
  if (!hydratedItems.length) return <div className="min-h-screen bg-stone-50 text-stone-900"><main className="mx-auto max-w-3xl px-4 py-12"><Card className="p-10 text-center"><ShoppingBag className="mx-auto h-14 w-14 text-stone-300" /><h1 className="mt-4 text-2xl font-black">Your basket is empty</h1><p className="mt-2 text-stone-500">Add products before opening checkout.</p><Button className="mt-6" onClick={() => navigate("/?preview=1#products")}><Home className="h-4 w-4" />Back to Store</Button></Card></main><Footer /></div>;

  return <div className="min-h-screen bg-stone-50 text-stone-900"><header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><Button variant="ghost" onClick={() => navigate("/?preview=1")}><ArrowLeft className="h-4 w-4" />Back to Store</Button><div className="text-sm font-semibold text-stone-500">Secure Checkout</div></div></header><main className="mx-auto max-w-6xl px-4 py-8"><form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_380px]"><section className="space-y-6"><Card><CardHeader><CardTitle>Customer Details</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><Label>Name</Label><div className="relative mt-2"><UserRound className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input className="pl-9" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div></div><div><Label>Phone</Label><div className="relative mt-2"><Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Input className="pl-9" inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></div></div><div className="sm:col-span-2"><Label>Email (optional)</Label><Input className="mt-2" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div><div className="sm:col-span-2"><Label>Delivery Address</Label><div className="relative mt-2"><MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" /><Textarea className="min-h-28 pl-9" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required /></div></div><div className="sm:col-span-2"><Label>Order Notes (optional)</Label><Textarea className="mt-2 min-h-24" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div></CardContent></Card><Card><CardHeader><CardTitle>Payment Method</CardTitle></CardHeader><CardContent className="space-y-4"><label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4"><input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /><div><div className="font-semibold">Cash on Delivery</div><div className="text-sm text-stone-500">Pay when your order is delivered.</div></div></label><label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4"><input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /><div><div className="font-semibold">UPI</div><div className="text-sm text-stone-500">Pay to {settings.upiPayeeName || settings.storeName}{settings.upiId ? ` · ${settings.upiId}` : ""} and enter the transaction ID.</div></div></label>{paymentMethod === "upi" && <div><Label>UPI Transaction ID</Label><Input className="mt-2" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter transaction reference" required /></div>}<div className="flex items-center gap-2 text-sm text-stone-500"><CreditCard className="h-4 w-4" /> Payment status is recorded with your order.</div></CardContent></Card></section><aside><Card className="sticky top-6"><CardHeader><CardTitle>Order Summary</CardTitle></CardHeader><CardContent className="space-y-4">{hydratedItems.map((item) => <div key={item.key} className="flex gap-3 border-b border-stone-100 pb-4"><img src={item.image} alt={item.productName} className="h-16 w-16 rounded-xl object-cover" onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }} /><div className="min-w-0 flex-1"><div className="font-semibold">{item.productName}</div><div className="text-sm text-stone-500">{item.pack} × {item.quantity}</div></div><div className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</div></div>)}<div className="space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(0)}`}</span></div><div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total</span><span>₹{total.toFixed(0)}</span></div></div><Button type="submit" className="w-full bg-stone-900 hover:bg-orange-700" size="lg" disabled={!valid || submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Placing Order...</> : "Place Order"}</Button><p className="text-center text-xs text-stone-400">By placing the order, you confirm that the delivery details are correct.</p></CardContent></Card></aside></form></main><Footer /></div>;
};

export default StoreCheckout;
