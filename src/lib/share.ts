import type { Item } from "./catalog";
import { SHOP, formatPrice, itemHeightPx } from "./catalog";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Exports the current outfit as a 9:16 story image with the shop branding. */
export async function exportOutfit(items: Item[], total: number) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f7f2e7";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#3a2a20";
  ctx.textAlign = "center";
  ctx.font = "300 76px Cormorant Garamond, Georgia, serif";
  ctx.fillText(SHOP.name, W / 2, 170);
  ctx.font = "300 26px Jost, sans-serif";
  ctx.fillStyle = "#8a7a6a";
  ctx.fillText("A U T H E N T I C   P R E - L O V E D", W / 2, 218);

  const loaded = await Promise.all(
    items.map(async (item) => ({
      item,
      img: await loadImage(item.processed_image_url ?? item.thumbnail_url ?? ""),
    })),
  );

  const heights = loaded.map(({ item }) => itemHeightPx(item) * 2.1);
  const totalH = heights.reduce((a, b) => a + b + 18, 0);
  const areaTop = 300;
  const areaH = 1340;
  const factor = Math.min(1, areaH / Math.max(totalH, 1));
  let y = areaTop + (areaH - totalH * factor) / 2;

  loaded.forEach(({ img }, i) => {
    const h = (heights[i] ?? 0) * factor;
    const w = (img.naturalWidth / img.naturalHeight) * h;
    ctx.save();
    ctx.shadowColor = "rgba(58,42,32,0.22)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 18;
    ctx.drawImage(img, W / 2 - w / 2, y, w, h);
    ctx.restore();
    y += h + 18 * factor;
  });

  ctx.fillStyle = "#3a2a20";
  ctx.font = "300 44px Cormorant Garamond, Georgia, serif";
  ctx.fillText(`Totale outfit ${formatPrice(total)}`, W / 2, 1750);
  ctx.font = "300 24px Jost, sans-serif";
  ctx.fillStyle = "#8a7a6a";
  ctx.fillText(`${SHOP.instagramHandle} · ${SHOP.address}`, W / 2, 1806);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const file = new File([blob], "outfit-baci-e-bottoni.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Il mio outfit" }).catch(() => undefined);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}
