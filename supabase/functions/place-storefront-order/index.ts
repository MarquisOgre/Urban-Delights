import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const ItemSchema = z.object({
  recipe_name: z.string().trim().min(1).max(200),
  quantity_type: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(10000),
  amount: z.number().finite().min(0).max(10_000_000),
});

const OrderSchema = z.object({
  customer_name: z.string().trim().min(1).max(150),
  phone_number: z.string().trim().min(7).max(20).transform((value) => value.replace(/[^0-9+]/g, "")),
  customer_email: z.string().trim().email().max(254).optional().or(z.literal("")),
  address: z.string().trim().min(5).max(1000),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  payment_status: z.enum(["pending", "paid", "failed"]).default("pending"),
  total_amount: z.number().finite().min(0).max(10_000_000),
  discount_percent: z.number().finite().min(0).max(100).default(0),
  tax_rate: z.number().finite().min(0).max(100).default(0),
  items: z.array(ItemSchema).min(1).max(50),
});

const json = (body: unknown, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = OrderSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please check the order details", fields: parsed.error.flatten().fieldErrors }, 400);

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !serviceKey || !anonKey) return json({ error: "Order service is not configured" }, 500);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    let userId: string | null = null;
    const authorization = req.headers.get("Authorization");
    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice(7);
      if (token && token !== anonKey) {
        const { data: authData, error: authError } = await admin.auth.getUser(token);
        if (authError || !authData.user) return json({ error: "Invalid sign-in session" }, 401);
        userId = authData.user.id;
      }
    }

    const order = parsed.data;
    const { data: existingCustomer, error: customerReadError } = await admin
      .from("customers")
      .select("id")
      .eq("phone_number", order.phone_number)
      .maybeSingle();
    if (customerReadError) throw customerReadError;

    const customerPayload = {
      name: order.customer_name,
      phone_number: order.phone_number,
      email: order.customer_email || null,
      address: order.address,
      notes: order.notes || null,
    };
    let customerId = existingCustomer?.id;
    if (customerId) {
      const { error } = await admin.from("customers").update(customerPayload).eq("id", customerId);
      if (error) throw error;
    } else {
      const { data, error } = await admin.from("customers").insert(customerPayload).select("id").single();
      if (error) throw error;
      customerId = data.id;
    }

    const { data: invoiceData, error: invoiceError } = await admin
      .from("orders")
      .select("invoice_number")
      .order("invoice_number", { ascending: false })
      .limit(1);
    if (invoiceError) throw invoiceError;
    const invoiceNumber = Number(invoiceData?.[0]?.invoice_number || 0) + 1;

    const { data: savedOrder, error: orderError } = await admin.from("orders").insert({
      invoice_number: invoiceNumber,
      customer_id: customerId,
      customer_name: order.customer_name,
      customer_email: order.customer_email || null,
      phone_number: order.phone_number,
      address: order.address,
      total_amount: order.total_amount,
      discount_percent: order.discount_percent,
      tax_rate: order.tax_rate,
      notes: order.notes || null,
      status: "received",
      payment_status: order.payment_status,
      order_date: new Date().toISOString().slice(0, 10),
      user_id: userId,
    }).select("id").single();
    if (orderError) throw orderError;

    const { error: itemsError } = await admin.from("order_items").insert(order.items.map((item) => ({
      order_id: savedOrder.id,
      recipe_name: item.recipe_name,
      quantity_type: item.quantity_type,
      quantity: item.quantity,
      amount: item.amount,
    })));
    if (itemsError) {
      await admin.from("orders").delete().eq("id", savedOrder.id);
      throw itemsError;
    }

    return json({ order_id: savedOrder.id }, 201);
  } catch (error) {
    console.error("place-storefront-order failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Could not place the order. Please try again." }, 500);
  }
});
