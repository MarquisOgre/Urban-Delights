import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreCategory { title: string; subtitle: string; theme: "orange" | "green" | "gold" | "rose" | "plum"; imageUrl: string; productNames: string[]; }
export interface StoreBenefit { icon: "truck" | "shield" | "leaf" | "cart"; title: string; subtitle: string; }
export interface StoreWhyUs { icon: "shield" | "sparkles" | "check" | "cart"; title: string; description: string; theme: "orange" | "green" | "gold" | "rose"; }
export interface StoreProductMedia { name: string; imageUrl: string; }
export interface StoreSettings {
  storeName: string; businessName: string; phone: string; email: string; address: string; gstNumber: string; upiId: string; upiPayeeName: string;
  freeShippingAbove: number; shippingFee: number; heroEyebrow: string; heroTitle: string; heroTitleAccent: string; heroDescription: string; heroImageUrl: string;
  heroPrimaryButtonText: string; heroSecondaryButtonText: string; showHero: boolean; showBenefits: boolean; showCategories: boolean; showFeatured: boolean; showWhyUs: boolean;
  showFooterLinks: boolean; showAdminLogin: boolean; showBasket: boolean; footerCopyright: string; footerLinks: { label: string; path: string; enabled: boolean }[];
  featuredProductNames: string[]; productMedia: StoreProductMedia[]; categories: StoreCategory[]; benefits: StoreBenefit[]; whyUs: StoreWhyUs[];
}

export const DEFAULT_PRODUCT_MEDIA: StoreProductMedia[] = [
  { name: "Chicken Masala", imageUrl: "/assets/chicken-masala.jpg" },
  { name: "Garam Masala", imageUrl: "/assets/garam-masala.jpg" },
  { name: "Sambar Podi", imageUrl: "/assets/sambar-powder.jpg" },
  { name: "Rasam Podi", imageUrl: "/assets/rasam-powder.jpg" },
  { name: "Karvepaku Podi", imageUrl: "/assets/karvepaku-podi.jpg" },
  { name: "Kobari Podi", imageUrl: "/assets/kobari-powder.jpg" },
  { name: "Palli Podi", imageUrl: "/assets/palli-podi.jpg" },
  { name: "Putnalu Podi", imageUrl: "/assets/putnalu-podi.jpg" },
  { name: "Idly Podi", imageUrl: "/assets/idly-podi.jpg" },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Urban Delights", businessName: "Urban Delights", phone: "", email: "", address: "", gstNumber: "", upiId: "", upiPayeeName: "Urban Delights",
  freeShippingAbove: 999, shippingFee: 60, heroEyebrow: "SMALL-BATCH • SOUTH INDIAN FLAVOURS", heroTitle: "The taste of", heroTitleAccent: "home, ground fresh.",
  heroDescription: "Authentic podis and masalas made in small batches with carefully selected ingredients — full of aroma, warmth and the flavours you grew up with.", heroImageUrl: "/hero.png",
  heroPrimaryButtonText: "Shop our blends", heroSecondaryButtonText: "Why Urban Delights?", showHero: true, showBenefits: true, showCategories: true, showFeatured: true, showWhyUs: true,
  showFooterLinks: true, showAdminLogin: true, showBasket: true, footerCopyright: "Crafted with ❤️ by Dexorzo Creations.",
  footerLinks: [
    { label: "About Us", path: "/about-us", enabled: true }, { label: "Shipping Policy", path: "/shipping-policy", enabled: true }, { label: "Returns & Refunds", path: "/returns-refunds", enabled: true },
    { label: "Terms & Conditions", path: "/terms-and-conditions", enabled: true }, { label: "Privacy Policy", path: "/privacy-policy", enabled: true }, { label: "FAQs", path: "/faq", enabled: true },
  ],
  featuredProductNames: ["Chicken Masala", "Garam Masala", "Sambar Podi", "Palli Podi"],
  productMedia: DEFAULT_PRODUCT_MEDIA,
  categories: [
    { title: "Masalas", subtitle: "Aromatic blends for everyday cooking", theme: "orange", imageUrl: "/hero.png", productNames: ["Chicken Masala", "Garam Masala", "Sambar Podi", "Rasam Podi"] },
    { title: "Podis", subtitle: "Roasted South Indian favourites", theme: "green", imageUrl: "/hero.png", productNames: ["Karvepaku Podi", "Kobari Podi", "Palli Podi", "Putnalu Podi", "Idly Podi"] },
  ],
  benefits: [
    { icon: "truck", title: "Fast Delivery", subtitle: "Across India" }, { icon: "shield", title: "Quality Tested", subtitle: "Safe & Reliable" }, { icon: "leaf", title: "Thoughtfully Made", subtitle: "Small Batch" }, { icon: "cart", title: "Easy Ordering", subtitle: "Simple Checkout" },
  ],
  whyUs: [
    { icon: "shield", title: "Quality You Can Trust", description: "Carefully selected ingredients and balanced recipes.", theme: "green" }, { icon: "sparkles", title: "Made for Everyday Meals", description: "Traditional flavour designed for modern kitchens.", theme: "orange" },
    { icon: "check", title: "Honest Pricing", description: "Great food without unnecessary premium pricing.", theme: "gold" }, { icon: "cart", title: "Easy Ordering", description: "Choose your pack, add to basket and checkout.", theme: "rose" },
  ],
};

const SETTING_TYPE = "storefront";
const mapSettings = (data: any): StoreSettings => {
  const raw = data?.setting_data ?? {};
  const rawCategories = Array.isArray(raw.categories) ? raw.categories : DEFAULT_STORE_SETTINGS.categories;
  const rawBenefits = Array.isArray(raw.benefits) ? raw.benefits : DEFAULT_STORE_SETTINGS.benefits;
  const rawWhyUs = Array.isArray(raw.whyUs) ? raw.whyUs : DEFAULT_STORE_SETTINGS.whyUs;
  const rawProductMedia = Array.isArray(raw.productMedia) ? raw.productMedia : DEFAULT_PRODUCT_MEDIA;
  return {
    ...DEFAULT_STORE_SETTINGS, ...raw,
    productMedia: rawProductMedia.map((item: any, index: number) => ({ ...DEFAULT_PRODUCT_MEDIA[index % DEFAULT_PRODUCT_MEDIA.length], ...item })).filter((item: any) => item?.name),
    footerLinks: Array.isArray(raw.footerLinks) ? raw.footerLinks : DEFAULT_STORE_SETTINGS.footerLinks,
    featuredProductNames: Array.isArray(raw.featuredProductNames) ? raw.featuredProductNames : DEFAULT_STORE_SETTINGS.featuredProductNames,
    categories: rawCategories.map((item: any, index: number) => ({ ...DEFAULT_STORE_SETTINGS.categories[index % DEFAULT_STORE_SETTINGS.categories.length], ...item, productNames: Array.isArray(item?.productNames) ? item.productNames : Array.isArray(item?.productSlugs) ? item.productSlugs : [] })),
    benefits: rawBenefits.map((item: any, index: number) => ({ ...DEFAULT_STORE_SETTINGS.benefits[index % DEFAULT_STORE_SETTINGS.benefits.length], ...item })),
    whyUs: rawWhyUs.map((item: any, index: number) => ({ ...DEFAULT_STORE_SETTINGS.whyUs[index % DEFAULT_STORE_SETTINGS.whyUs.length], ...item })),
    freeShippingAbove: Number(raw.freeShippingAbove ?? DEFAULT_STORE_SETTINGS.freeShippingAbove), shippingFee: Number(raw.shippingFee ?? DEFAULT_STORE_SETTINGS.shippingFee),
  };
};

export const useStoreSettings = () => useQuery({ queryKey: [SETTING_TYPE], queryFn: async (): Promise<StoreSettings> => {
  const { data, error } = await supabase.from("settings" as any).select("setting_data").eq("setting_type", SETTING_TYPE).is("user_id", null).maybeSingle();
  if (error) throw error; return mapSettings(data);
}, initialData: DEFAULT_STORE_SETTINGS, staleTime: 30_000 });

export const useSaveStoreSettings = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (settings: StoreSettings) => {
    const { data: existing, error: readError } = await supabase.from("settings" as any).select("id").eq("setting_type", SETTING_TYPE).is("user_id", null).maybeSingle();
    if (readError) throw readError;
    if (existing?.id) { const { error } = await supabase.from("settings" as any).update({ setting_data: settings }).eq("id", existing.id); if (error) throw error; }
    else { const { error } = await supabase.from("settings" as any).insert({ setting_type: SETTING_TYPE, user_id: null, setting_data: settings }); if (error) throw error; }
    return settings;
  }, onSuccess: (settings) => { qc.setQueryData([SETTING_TYPE], settings); qc.invalidateQueries({ queryKey: [SETTING_TYPE] }); } });
};
