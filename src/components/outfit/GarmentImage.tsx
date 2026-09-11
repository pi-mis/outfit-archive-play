import type { Item } from "@/lib/catalog";
import { itemHeightPx } from "@/lib/catalog";

export function GarmentImage({
  item,
  eager = false,
  className = "",
  height,
}: {
  item: Item;
  eager?: boolean;
  className?: string;
  /** Altezza forzata in px (fase di scelta). Senza, si usano le proporzioni reali. */
  height?: number;
}) {
  return (
    <img
      src={item.processed_image_url ?? item.thumbnail_url ?? ""}
      alt={item.name}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`garment-shadow pointer-events-none select-none object-contain ${className}`}
      style={{
        height: height ?? itemHeightPx(item),
        ...(height
          ? {}
          : { transform: `translate(${item.offset_x}px, ${item.offset_y}px)` }),
        maxWidth: "100%",
      }}
    />
  );
}
