import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Clock3, Heart, Leaf, Mail, MapPin, ShieldCheck, Sparkles, Truck, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

type PageData = {
  title: string;
  eyebrow: string;
  intro: string;
  accent: string;
  icon: React.ElementType;
  sections: [string, string][];
};

const content: Record<string, PageData> = {
  "/about-us": { title: "Made to taste like home.", eyebrow: "Our story", intro: "Urban Delights brings familiar South Indian flavours into everyday kitchens through thoughtfully made podis and masalas.", accent: "A little tradition. A lot of flavour.", icon: Heart, sections: [["Our approach", "We focus on traditional podis and masalas, thoughtful ingredient selection and balanced recipes for everyday cooking."], ["Small-batch mindset", "Our store experience is designed around freshness, care and consistency."], ["Our promise", "We aim to provide clear product information, dependable service and a straightforward buying experience."]] },
  "/privacy-policy": { title: "Your privacy matters.", eyebrow: "Privacy", intro: "A clear, simple explanation of how information may be collected and used when you use Urban Delights.", accent: "Straightforward by design.", icon: ShieldCheck, sections: [["Information we collect", "We may collect information you provide when ordering or contacting us, including your name, contact details, delivery address and order information."], ["How we use information", "Information may be used to process orders, provide support, communicate about transactions, improve the website and meet legal obligations."], ["Payments and security", "Payment credentials should be processed by the payment provider used at checkout. We do not intend to store full card or banking credentials on the store unless expressly stated."], ["Cookies", "Essential cookies or similar technologies may be used to keep the website functional, remember preferences and understand usage."]] },
  "/terms-and-conditions": { title: "Simple, fair terms.", eyebrow: "Terms", intro: "These terms explain the rules for using the Urban Delights website and placing orders through the online store.", accent: "Good food. Clear expectations.", icon: CheckCircle2, sections: [["Orders", "Orders are subject to product availability, price confirmation and successful payment where applicable. We may correct obvious listing or pricing errors."], ["Products", "We aim to keep product information accurate. Food products may naturally vary in colour, texture and appearance."], ["Pricing", "Prices are shown in Indian Rupees unless stated otherwise. Applicable delivery charges or taxes will be communicated where relevant before completion."], ["Website use", "You must not misuse the website, attempt unauthorized access, interfere with its operation or use it for unlawful purposes."]] },
  "/shipping-policy": { title: "From our kitchen to your door.", eyebrow: "Shipping", intro: "We aim to deliver your order safely and promptly. Delivery timing depends on destination, availability and the delivery partner.", accent: "Packed with care. Delivered with care.", icon: Truck, sections: [["Processing", "Orders are processed after confirmation and successful payment where applicable. Processing may take longer during holidays or high-demand periods."], ["Delivery", "Estimated delivery timelines are communicated where available. Delays may occur because of weather, logistics or circumstances outside our control."], ["Delivery address", "Customers are responsible for providing a complete and accurate address and reachable contact details."], ["Damaged packages", "Please document visible damage and contact customer support promptly with your order details and photographs."]] },
  "/returns-refunds": { title: "Returns & refunds, made clear.", eyebrow: "Returns", intro: "Because our products are food items, returns are handled with additional care and subject to applicable law.", accent: "If something isn't right, tell us.", icon: ShieldCheck, sections: [["Damaged or incorrect orders", "If you receive an incorrect, damaged or materially defective product, contact us promptly with order details and photographs so the issue can be reviewed."], ["Returns", "Opened or used food products are generally not eligible for return for hygiene and food-safety reasons, subject to applicable law."], ["Cancellations", "Request cancellation as early as possible. Once an order has been processed or dispatched, cancellation may no longer be possible."], ["Refunds", "Approved refunds are normally initiated through the original payment method or another permitted method. Provider processing times may vary."]] },
  "/contact-us": { title: "Need a hand? We're here.", eyebrow: "Contact", intro: "Have a question about an order, product or delivery? Reach out and our team will help you get sorted.", accent: "Let's make it easy.", icon: Mail, sections: [["Customer support", "When contacting support, please keep your order number, registered contact details and a short description of the issue ready."], ["Order issues", "For damaged, missing or incorrect items, contact support promptly after delivery and include clear photographs where relevant."], ["Business information", "Official business address, customer-care contact details and legal entity information should be added here before public launch."]] },
  "/faq": { title: "Questions? We've got answers.", eyebrow: "FAQ", intro: "Quick answers to common questions about shopping with Urban Delights.", accent: "Everything you need before you order.", icon: Sparkles, sections: [["How do I choose a pack size?", "Select an available pack size on the product card before adding the item to your basket."], ["Why is a price unavailable?", "A product shows Price unavailable when an enabled selling price has not been configured in Pricing Manager."], ["Can I change my order?", "Contact support as soon as possible. Changes depend on whether the order has already been processed or dispatched."], ["What if my order arrives damaged?", "Keep the packaging, take photographs and contact support promptly with your order details."]] },
};

const quickLinks = [
  ["About Us", "/about-us"], ["Shipping Policy", "/shipping-policy"], ["Returns & Refunds", "/returns-refunds"],
  ["Terms & Conditions", "/terms-and-conditions"], ["Privacy Policy", "/privacy-policy"], ["FAQs", "/faq"],
] as const;

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = content[pathname] ?? content["/privacy-policy"];
  const Icon = page.icon;
  const isFaq = pathname === "/faq";
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return <div className="min-h-screen bg-[#fffaf2] text-stone-900 pb-8">
    <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-[#fffaf2]/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="shrink-0"><img src="/logo.png" alt="Urban Delights" className="h-10 w-auto" /></Link>
        <Button asChild variant="outline" className="rounded-full border-orange-200 bg-white/70 px-4 hover:border-orange-400 hover:bg-white"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link></Button>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-br from-[#fff7e9] via-[#fffaf2] to-[#ffe9d2]">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="container relative mx-auto grid min-h-[360px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_360px] lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-800 shadow-sm"><Icon className="h-4 w-4" /> {page.eyebrow}</div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{page.intro}</p>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-600 to-amber-400 blur-2xl opacity-25" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white/75 p-7 shadow-2xl backdrop-blur">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><Icon className="h-8 w-8" /></div>
              <p className="mt-7 text-2xl font-black tracking-tight">{page.accent}</p>
              <div className="mt-6 flex gap-2"><span className="h-2 w-16 rounded-full bg-orange-600" /><span className="h-2 w-8 rounded-full bg-amber-400" /><span className="h-2 w-3 rounded-full bg-stone-300" /></div>
            </div>
          </div>
        </div>
      </section>

      {isFaq ? <section className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><UtensilsCrossed className="h-5 w-5 text-orange-600" /><p className="mt-3 font-bold">Made for everyday meals</p></div><div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><Truck className="h-5 w-5 text-orange-600" /><p className="mt-3 font-bold">Delivery support</p></div><div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><Mail className="h-5 w-5 text-orange-600" /><p className="mt-3 font-bold">Friendly help</p></div></div>
        <div className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-lg">{page.sections.map(([heading, body], index) => <div key={heading} className="border-b border-orange-100 last:border-b-0"><button className="flex w-full items-center justify-between gap-6 p-6 text-left font-bold sm:p-7" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{heading}</span><ChevronDown className={`h-5 w-5 shrink-0 text-orange-600 transition-transform ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <div className="px-6 pb-7 text-sm leading-7 text-stone-600 sm:px-7">{body}</div>}</div>)}</div>
      </section> : <section className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 md:grid-cols-2">{page.sections.map(([heading, body], index) => <article key={heading} className="group relative overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-8"><div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-50 blur-2xl transition group-hover:bg-orange-100" /><div className="relative"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-sm font-black text-orange-700">{String(index + 1).padStart(2, "0")}</span><h2 className="text-xl font-black tracking-tight">{heading}</h2></div><p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">{body}</p></div></article>)}</div>
        <div className="mt-10 rounded-[1.5rem] border border-orange-200 bg-gradient-to-r from-orange-600 to-amber-400 p-[1px] shadow-lg"><div className="rounded-[1.45rem] bg-white/95 p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Explore more</p><h2 className="mt-1 text-2xl font-black">Looking for something else?</h2></div><Button asChild className="rounded-full bg-stone-900 px-6 hover:bg-orange-700"><Link to={pathname === "/contact-us" ? "/faq" : "/contact-us"}>{pathname === "/contact-us" ? "Read FAQs" : "Need Help?"}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></div></div>
      </section>}

      <section className="border-t border-orange-100 bg-white"><div className="container mx-auto px-4 py-10 sm:px-6"><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">{quickLinks.map(([label, href]) => <Link key={href} to={href} className={`font-semibold transition hover:text-orange-700 ${href === pathname ? "text-orange-700" : "text-stone-500"}`}>{label}</Link>)}</div></div></section>
    </main>
    <Footer showTopButton />
  </div>;
}
