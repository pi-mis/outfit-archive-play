import type { Item } from "@/lib/catalog";
import { itemHeightPx } from "@/lib/catalog";

export function GarmentImage({
  item,
  eager = false,
  className = "",
}: {
  item: Item;
  eager?: boolean;
  className?: string;
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
        height: itemHeightPx(item),
        transform: `translate(${item.offset_x}px, ${item.offset_y}px)`,
        maxWidth: "100%",
      }}
    />
  );
}
