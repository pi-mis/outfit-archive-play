import { supabase } from "@/integrations/supabase/client";

export const PX_PER_CM = 3.1;

export type Zone = {
  id: string;
  key: string;
  label: string;
  all_label: string;
  none_label: string;
  sort_order: number;
  anchor: string;
  anchor_y_cm: number;
};

export type ItemType = {
  id: string;
  zone_key: string;
  key: string;
  label: string;
  sort_order: number;
  spans_two_zones: boolean;
};

export type ItemStatus = "disponibile" | "prenotato" | "venduto";

export type Item = {
  id: string;
  code: string;
  zone_key: string;
  type_key: string;
  name: string;
  era: string | null;
  brand: string | null;
  size: string | null;
  measurements: Record<string, number | string> | null;
  condition: string | null;
  flaws: string | null;
  price: number;
  status: ItemStatus;
  original_photos: string[];
  processed_image_url: string | null;
  thumbnail_url: string | null;
  height_cm: number;
  scale: number;
  offset_x: number;
  offset_y: number;
  notes: string | null;
};

export async function fetchZones(): Promise<Zone[]> {
  const { data, error } = await supabase.from("zones").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Zone[];
}

export async function fetchItemTypes(): Promise<ItemType[]> {
  const { data, error } = await supabase.from("item_types").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as ItemType[];
}

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase.from("items").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []) as unknown as Item[];
}

export function itemHeightPx(item: Item) {
  return item.height_cm * (item.scale || 1) * PX_PER_CM;
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

export const MEASURE_LABELS: Record<string, string> = {
  spalle: "Spalle",
  petto: "Petto",
  vita: "Vita",
  fianchi: "Fianchi",
  lunghezza: "Lunghezza",
};

export const SHOP = {
  name: "Baci & Bottoni",
  tagline: "Authentic pre-loved",
  address: "Via della Spiga 14, Milano",
  hours: "Mar–Sab 10:30–19:00 · Lun 15:00–19:00",
  instagram: "https://instagram.com/bacibottoni",
  instagramHandle: "@bacibottoni",
  whatsapp: "393450000000",
};
