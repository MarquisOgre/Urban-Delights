import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, PackageCheck, Search, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings, type StoreSettings } from "@/hooks/useStoreSettings";

type OrderItem = { recipe_name: string; quantity_type: string; quantity: number; amount: number };
type GuestOrder = { order_id: string; order_date: string; created_at: string; status: string; payment_status: string; total_amount: number; items: OrderItem[] };

// Exactly five customer-facing order steps, matching Admin.
const steps = [
  { key: "received", label: "Received", icon: Clock3 },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const normalizeStatus = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

const OrderStatus = () => {
  const navigate = useNavigate();
  const { data: settings = {} as StoreSettings } = useStoreSettings();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async (id: string, mobile: string, showError = true) => {
    const cleanedOrderId = id.trim().toUpperCase();
    const cleanedPhone = normalizePhone(mobile);
    try {
      const { data, error: rpcError } = await supabase.rpc("fetch_guest_order_status" as never, { p_order_id: cleanedOrderId, p_phone_number: cleanedPhone } as never);
      if (rpcError) throw rpcError;
      if (!data) throw new Error("Order not found. Please check your Order ID and 10-digit phone number.");
      setOrder(data as unknown as GuestOrder);
      if (showError) setError("");
    } catch (err: any) {
      if (showError) setError(err?.message || "Order not found. Please check your Order ID and 10-digit phone number.");
    }
  };

  const trackOrder = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setOrder(null);
    const cleanedOrderId = orderId.trim().toUpperCase(); const cleanedPhone = normalizePhone(phone);
    if (!/^UD-[0-9]{4}-[0-9]{4,}$/.test(cleanedOrderId)) { setError("Please enter a valid Order ID, for example UD-2026-0001."); return; }
    if (!/^\d{10}$/.test(cleanedPhone)) { setError("Phone Number must be exactly 10 digits."); return; }
    setLoading(true);
    try { await fetchOrder(cleanedOrderId, cleanedPhone); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!order?.order_id || !phone) return;
    const interval = window.setInterval(() => fetchOrder(order.order_id, phone, false), 10000);
    return () => window.clearInterval(interval);
  }, [order?.order_id, phone]);

  const status = normalizeStatus(order?.status || "received");
  const cancelled = status === "cancelled" || status === "canceled";
  const currentIndex = steps.findIndex((step) => step.key === status);
  const progressIndex = currentIndex >= 0 ? currentIndex : 0;
  const scrollHome = () => navigate("/");
  const scrollToSection = (id: string) => navigate(`/#${id}`);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8f4] text-slate-900">
      <header className="sticky top-0 z-40 shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6">
          <button type="button" onClick={scrollHome} className="flex shrink-0 items-center" aria-label="Urban Delights home">
            <img src={settings.logoUrl || "/logo.png"} alt={settings.storeName || "Urban Delights"} className="h-12 w-auto max-w-[230px] object-contain" />
          </button>
          <nav className="hidden items-center gap-6 sm:flex" aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection("products")} className="text-sm font-semibold text-stone-600 hover:text-orange-700">Shop</button>
            {settings.showCategories && settings.categories.length > 0 && <button type="button" onClick={() => scrollToSection("categories")} className="text-sm font-semibold text-stone-600 hover:text-orange-700">Categories</button>}
            {settings.showWhyUs && <button type="button" onClick={() => scrollToSection("why-us")} className="text-sm font-semibold text-stone-600 hover:text-orange-700">Why Us</button>}
            <button type="button" onClick={() => navigate("/order-status")} className="text-sm font-bold text-orange-700">Track Order</button>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            {settings.showAdminLogin && <Button variant="outline" size="icon" onClick={() => navigate("/login")} className="h-10 w-10 rounded-full" aria-label="Admin Login"><span className="sr-only">Admin Login</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></Button>}
            <Button variant="outline" onClick={scrollHome} className="h-10 rounded-xl px-3 text-sm"><ArrowLeft className="mr-2 h-4 w-4" /> Store</Button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700">Guest Order Tracking</p>
          </div>

          <Card className="mx-auto mt-4 max-w-4xl rounded-2xl border-stone-200 bg-white shadow-sm">
            <CardHeader className="hidden"><CardTitle>Find your order</CardTitle></CardHeader>
            <CardContent className="px-5 py-4 sm:px-6">
              <form onSubmit={trackOrder} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label className="text-xs" htmlFor="order-id">Order ID</Label>
                  <Input id="order-id" value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} placeholder="UD-2026-0001" className="mt-1 h-10 rounded-lg text-sm" autoComplete="off" />
                </div>
                <div>
                  <Label className="text-xs" htmlFor="order-phone">Phone Number</Label>
                  <Input id="order-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} className="mt-1 h-10 rounded-lg text-sm" autoComplete="tel" />
                </div>
                <Button type="submit" disabled={loading} className="h-10 rounded-lg bg-[#2f6b45] px-6 text-sm text-white hover:bg-[#255536] sm:mb-0">
                  <Search className="mr-1.5 h-3.5 w-3.5" />{loading ? "Checking..." : "Track Order"}
                </Button>
              </form>
              {error && <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
            </CardContent>
          </Card>

          {order && <div className="mx-auto mt-4 max-w-4xl space-y-4">
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-[10px] text-stone-500">Order ID</p><p className="mt-0.5 font-mono text-lg font-black tracking-tight text-stone-900">{order.order_id}</p><p className="mt-1 text-[10px] text-stone-500">Placed {new Date(order.created_at || order.order_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Current Status</p><p className="mt-0.5 text-sm font-black capitalize text-emerald-800">{cancelled ? "Cancelled" : String(order.status || "Received").replace(/_/g, " ")}</p></div>
                </div>
                <div className="mt-5 overflow-x-auto"><div className="flex min-w-[560px] items-start">
                  {cancelled ? <div className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"><XCircle className="h-6 w-6 shrink-0" /><div><p className="text-sm font-bold">This order has been cancelled.</p><p className="mt-0.5 text-xs">Please contact Urban Delights if you need assistance with this order.</p></div></div> : steps.map((step, index) => { const Icon = step.icon; const complete = index <= progressIndex; return <div key={step.key} className="flex flex-1 items-start"><div className="flex min-w-0 flex-1 flex-col items-center text-center"><div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${complete ? "border-[#2f6b45] bg-[#2f6b45] text-white" : "border-stone-200 bg-white text-stone-300"}`}><Icon className="h-4 w-4" /></div><p className={`mt-1.5 text-[10px] font-bold ${complete ? "text-[#2f6b45]" : "text-stone-400"}`}>{step.label}</p></div>{index < steps.length - 1 && <div className={`mt-4 h-0.5 flex-1 ${index < progressIndex ? "bg-[#2f6b45]" : "bg-stone-200"}`} />}</div>; })}
                </div></div>
              </CardContent>
            </Card>
            <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
              <Card className="rounded-2xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-4 pb-1 pt-4 sm:px-5"><CardTitle className="text-base">Order Items</CardTitle></CardHeader><CardContent className="px-4 pb-4 sm:px-5"><div className="divide-y divide-stone-100">{(order.items || []).map((item, index) => <div key={`${item.recipe_name}-${index}`} className="flex items-center justify-between gap-4 py-2.5"><div><p className="text-sm font-semibold text-stone-900">{item.recipe_name}</p><p className="mt-0.5 text-xs text-stone-500">{item.quantity_type} × {item.quantity}</p></div><p className="text-sm font-bold">₹{Number(item.amount || 0).toFixed(2)}</p></div>)}</div></CardContent></Card>
              <Card className="h-fit rounded-2xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-4 pb-1 pt-4"><CardTitle className="text-base">Payment</CardTitle></CardHeader><CardContent className="px-4 pb-4"><div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3"><span className="text-xs text-stone-500">Payment Status</span><span className="text-xs font-semibold capitalize">{String(order.payment_status || "pending").replace(/_/g, " ")}</span></div><div className="flex items-center justify-between gap-3 pt-3"><span className="font-serif text-sm font-bold">Total</span><span className="text-base font-black text-[#2f6b45]">₹{Number(order.total_amount || 0).toFixed(2)}</span></div></CardContent></Card>
            </div>
          </div>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatus;
