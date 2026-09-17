import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, PackageCheck, Search, Truck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings, type StoreSettings } from "@/hooks/useStoreSettings";

type OrderItem = {
  recipe_name: string;
  quantity_type: string;
  quantity: number;
  amount: number;
};

type GuestOrder = {
  order_id: string;
  order_date: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  items: OrderItem[];
};

const steps = [
  { key: "received", label: "Order Received", icon: Clock3 },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Preparing", icon: PackageCheck },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const normalizePhone = (value: string) => value.replace(/[^0-9+]/g, "");
const normalizeStatus = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "_");

const OrderStatus = () => {
  const navigate = useNavigate();
  const { data: settings = {} as StoreSettings } = useStoreSettings();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setOrder(null);
    const cleanedOrderId = orderId.trim().toUpperCase();
    const cleanedPhone = normalizePhone(phone);

    if (!/^UD-[0-9]{4}-[0-9]{4,}$/.test(cleanedOrderId)) {
      setError("Please enter a valid Order ID, for example UD-2026-0001.");
      return;
    }
    if (cleanedPhone.length < 7 || cleanedPhone.length > 20) {
      setError("Please enter the phone number used when placing the order.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc("fetch_guest_order_status" as never, {
        p_order_id: cleanedOrderId,
        p_phone_number: cleanedPhone,
      } as never);
      if (rpcError) throw rpcError;
      setOrder(data as unknown as GuestOrder);
    } catch (err: any) {
      setError(err?.message || "Order not found. Please check your Order ID and phone number.");
    } finally {
      setLoading(false);
    }
  };

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
            <img src={settings.logoUrl || "/logo.png"} alt={settings.storeName || "Urban Delights"} className="h-12 w-auto max-w-[230px] object-contain sm:h-14" />
          </button>

          <nav className="hidden items-center gap-6 sm:flex" aria-label="Main navigation">
            <button type="button" onClick={() => scrollToSection("products")} className="text-sm font-semibold text-stone-600 transition hover:text-orange-700">Shop</button>
            {settings.showCategories && settings.categories.length > 0 && <button type="button" onClick={() => scrollToSection("categories")} className="text-sm font-semibold text-stone-600 transition hover:text-orange-700">Categories</button>}
            {settings.showWhyUs && <button type="button" onClick={() => scrollToSection("why-us")} className="text-sm font-semibold text-stone-600 transition hover:text-orange-700">Why Us</button>}
            <button type="button" onClick={() => navigate("/order-status")} className="text-sm font-bold text-orange-700 transition hover:text-orange-800">Track Order</button>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {settings.showAdminLogin && <Button variant="outline" size="icon" onClick={() => navigate("/login")} className="h-10 w-10 rounded-full" aria-label="Admin Login" title="Admin Login"><span className="sr-only">Admin Login</span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></Button>}
            <Button variant="outline" onClick={scrollHome} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Store</Button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Guest Order Tracking</p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-[#2f6b45] sm:text-5xl">Track Your Order</h1>
            <p className="mt-3 text-stone-500">Enter your Order ID and the phone number used at checkout. No login is required.</p>
          </div>

          <Card className="mx-auto mt-8 max-w-2xl rounded-3xl border-stone-200 bg-white shadow-sm">
            <CardHeader className="px-6 pb-2 pt-7 sm:px-8"><CardTitle className="text-xl">Find your order</CardTitle></CardHeader>
            <CardContent className="px-6 pb-7 sm:px-8">
              <form onSubmit={trackOrder} className="grid gap-5 sm:grid-cols-2">
                <div><Label htmlFor="order-id">Order ID</Label><Input id="order-id" value={orderId} onChange={(e) => setOrderId(e.target.value.toUpperCase())} placeholder="UD-2026-0001" className="mt-2 h-12 rounded-xl" autoComplete="off" /></div>
                <div><Label htmlFor="order-phone">Phone Number</Label><Input id="order-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" inputMode="tel" className="mt-2 h-12 rounded-xl" autoComplete="tel" /></div>
                <div className="sm:col-span-2"><Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[#2f6b45] text-white hover:bg-[#255536]"><Search className="mr-2 h-4 w-4" />{loading ? "Checking Order..." : "Track Order"}</Button></div>
              </form>
              {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            </CardContent>
          </Card>

          {order && (
            <div className="mx-auto mt-8 max-w-4xl space-y-6">
              <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div><p className="text-sm text-stone-500">Order ID</p><p className="mt-1 font-mono text-2xl font-black tracking-tight text-stone-900">{order.order_id}</p><p className="mt-2 text-sm text-stone-500">Placed {new Date(order.created_at || order.order_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                    <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-center"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Current Status</p><p className="mt-1 text-lg font-black capitalize text-emerald-800">{cancelled ? "Cancelled" : String(order.status || "Received").replace(/_/g, " ")}</p></div>
                  </div>

                  <div className="mt-8 overflow-x-auto pb-2">
                    <div className="flex min-w-[620px] items-start">
                      {cancelled ? <div className="flex w-full items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"><XCircle className="h-8 w-8 shrink-0" /><div><p className="font-bold">This order has been cancelled.</p><p className="mt-1 text-sm">Please contact Urban Delights if you need assistance with this order.</p></div></div> : steps.map((step, index) => { const Icon = step.icon; const complete = index <= progressIndex; return <div key={step.key} className="flex flex-1 items-start"><div className="flex min-w-0 flex-1 flex-col items-center text-center"><div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${complete ? "border-[#2f6b45] bg-[#2f6b45] text-white" : "border-stone-200 bg-white text-stone-300"}`}><Icon className="h-5 w-5" /></div><p className={`mt-2 text-xs font-bold ${complete ? "text-[#2f6b45]" : "text-stone-400"}`}>{step.label}</p></div>{index < steps.length - 1 && <div className={`mt-5 h-0.5 flex-1 ${index < progressIndex ? "bg-[#2f6b45]" : "bg-stone-200"}`} />}</div>; })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <Card className="rounded-3xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-6 pb-2 pt-7 sm:px-8"><CardTitle className="text-xl">Order Items</CardTitle></CardHeader><CardContent className="px-6 pb-7 sm:px-8"><div className="divide-y divide-stone-100">{(order.items || []).map((item, index) => <div key={`${item.recipe_name}-${index}`} className="flex items-center justify-between gap-4 py-4"><div><p className="font-semibold text-stone-900">{item.recipe_name}</p><p className="mt-1 text-sm text-stone-500">{item.quantity_type} × {item.quantity}</p></div><p className="font-bold">₹{Number(item.amount || 0).toFixed(2)}</p></div>)}</div></CardContent></Card>
                <Card className="h-fit rounded-3xl border-stone-200 bg-white shadow-sm"><CardHeader className="px-6 pb-2 pt-7"><CardTitle className="text-xl">Payment</CardTitle></CardHeader><CardContent className="px-6 pb-7"><div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4"><span className="text-sm text-stone-500">Payment Status</span><span className="font-semibold capitalize">{String(order.payment_status || "pending").replace(/_/g, " ")}</span></div><div className="flex items-center justify-between gap-4 pt-5"><span className="font-serif text-lg font-bold">Total</span><span className="text-xl font-black text-[#2f6b45]">₹{Number(order.total_amount || 0).toFixed(2)}</span></div></CardContent></Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatus;
