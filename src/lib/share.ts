import type { Item, Zone } from "./catalog";
import { BODY_HEIGHT_CM, SHOP, fittingHeightCm, formatPrice } from "./catalog";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Manichino bianco: stesse proporzioni del camerino (170 cm su 340 unità). */
const MANNEQUIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 340" width="200" height="680">
<defs>
<linearGradient id="b" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="#dcd7d0"/><stop offset="28%" stop-color="#ffffff"/>
<stop offset="72%" stop-color="#f4f1ec"/><stop offset="100%" stop-color="#d3cec6"/>
</linearGradient>
<radialGradient id="s" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="rgba(60,45,35,0.35)"/><stop offset="100%" stop-color="rgba(60,45,35,0)"/>
</radialGradient>
</defs>
<ellipse cx="50" cy="336" rx="34" ry="7" fill="url(#s)"/>
<g fill="url(#b)">
<path d="M50 2c8.5 0 14 7.4 14 17 0 5.4-1.3 10.4-3.6 14-2.3 3.6-6 6-10.4 6s-8.1-2.4-10.4-6C37.3 29.4 36 24.4 36 19 36 9.4 41.5 2 50 2Z"/>
<path d="M45 36h10v13c0 4 3 6 3 6H42s3-2 3-6V36Z"/>
<path d="M50 53c9 0 18 2.6 23 6.4 4 3 5.6 8.6 6 15.4.5 9-1 20-3 30-1.6 8-3 15.6-3.4 23.4-.4 8 .4 16 2 24.6 1.6 8.6 3.4 17 3.4 24.2 0 9-2.6 15.6-7 19.6-4.6 4.2-12.4 6.4-21 6.4s-16.4-2.2-21-6.4c-4.4-4-7-10.6-7-19.6 0-7.2 1.8-15.6 3.4-24.2 1.6-8.6 2.4-16.6 2-24.6-.4-7.8-1.8-15.4-3.4-23.4-2-10-3.5-21-3-30 .4-6.8 2-12.4 6-15.4C32 55.6 41 53 50 53Z"/>
<path d="M27 62c-3.6 3.4-5.6 10-6.6 18.6-1 8.6-1.4 18-2.2 27.4-.8 9.4-2 18.4-2 27.4 0 6.6.6 12.4 1.4 17.4.5 3.2 4.6 3 4.8-.4.4-5.6.8-11.6 1.8-18.6 1-7 2.6-15 3.6-23.6 1-8.6 1.2-17.4 1-25.4-.2-8 .3-15.2-1.8-22.8Z"/>
<path d="M73 62c3.6 3.4 5.6 10 6.6 18.6 1 8.6 1.4 18 2.2 27.4.8 9.4 2 18.4 2 27.4 0 6.6-.6 12.4-1.4 17.4-.5 3.2-4.6 3-4.8-.4-.4-5.6-.8-11.6-1.8-18.6-1-7-2.6-15-3.6-23.6-1-8.6-1.2-17.4-1-25.4.2-8-.3-15.2 1.8-22.8Z"/>
<path d="M31 196h17.2c.6 14 .4 28.6-.4 43.4-.8 15-2 30-2.6 44.6-.4 11-.6 21.6-.6 31H31.4c.4-10.4.2-21-.4-32-.8-14.6-2-29.4-2-44 0-15.6.8-29.6 2-43Z"/>
<path d="M51.8 196H69c1.2 13.4 2 27.4 2 43 0 14.6-1.2 29.4-2 44-.6 11-.8 21.6-.4 32H55.4c0-9.4-.2-20-.6-31-.6-14.6-1.8-29.6-2.6-44.6-.8-14.8-1-29.4-.4-43.4Z"/>
<path d="M30.6 318h14.8c.2 5 .4 9.6.8 14H30c.2-4.4.4-9 .6-14Z"/>
<path d="M54.6 318h14.8c.2 5 .4 9.6.6 14H53.8c.4-4.4.6-9 .8-14Z"/>
</g></svg>`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

/**
 * Esporta l'outfit come "fotografia" scattata nel camerino: manichino a
 * proporzioni reali, capi indossati e nome di ogni prodotto affianco.
 */
export async function exportOutfit(items: Item[], total: number, zones: Zone[] = []) {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // parete e pavimento del camerino
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#f8f4ec");
  wall.addColorStop(1, "#eae2d5");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  const floorTop = H - 420;
  const floor = ctx.createLinearGradient(0, floorTop, 0, H);
  floor.addColorStop(0, "#e6dbc9");
  floor.addColorStop(1, "#d8cbb5");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorTop, W, H - floorTop);
  ctx.fillStyle = "#c8b79c";
  ctx.fillRect(0, floorTop - 8, W, 8);

  // intestazione
  ctx.textAlign = "center";
  ctx.fillStyle = "#3a2a20";
  ctx.font = "300 72px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText(SHOP.name, W / 2, 140);
  ctx.font = "300 24px Jost, sans-serif";
  ctx.fillStyle = "#8a7a6a";
  ctx.fillText("C A M E R I N O   D I G I T A L E", W / 2, 184);

  // manichino
  const stage = 1200;
  const stageTop = 300;
  const k = stage / BODY_HEIGHT_CM;
  const mq = await loadImage(`data:image/svg+xml;utf8,${encodeURIComponent(MANNEQUIN_SVG)}`);
  const mqW = (mq.naturalWidth / mq.naturalHeight) * stage;
  ctx.drawImage(mq, W / 2 - mqW / 2, stageTop, mqW, stage);

  const order = ["cappello", "collana", "bottom", "top", "scarpe"];
  const sorted = [...items].sort((a, b) => order.indexOf(a.zone_key) - order.indexOf(b.zone_key));
  const loaded = await Promise.all(
    sorted.map(async (item) => {
      try {
        return { item, img: await loadImage(item.processed_image_url ?? item.thumbnail_url ?? "") };
      } catch {
        return { item, img: null as HTMLImageElement | null };
      }
    }),
  );

  const offsetScale = stage / 520;
  const labels: { name: string; price: string; y: number; side: 1 | -1; edge: number }[] = [];

  loaded.forEach(({ item, img }, i) => {
    if (!img) return;
    const anchor = zones.find((z) => z.key === item.zone_key)?.anchor_y_cm ?? 0;
    const shoes = item.zone_key === "scarpe";
    const h = Math.min(
      fittingHeightCm(item) * k * (shoes ? 1.3 : 1),
      Math.max(80, stage - anchor * k + (shoes ? 40 * k : 0)),
    );
    const w = (img.naturalWidth / img.naturalHeight) * h;
    const top = stageTop + (shoes ? stage - h : anchor * k) + (item.offset_y ?? 0) * offsetScale;
    const x = W / 2 - w / 2 + (item.offset_x ?? 0) * offsetScale;
    ctx.drawImage(img, x, top, w, h);

    const side: 1 | -1 = i % 2 === 0 ? -1 : 1;
    labels.push({
      name: item.name,
      price: formatPrice(Number(item.price)),
      y: top + h / 2,
      side,
      edge: side === -1 ? x : x + w,
    });
  });

  // nomi dei prodotti affianco ai capi
  let lastY = -Infinity;
  labels
    .sort((a, b) => a.y - b.y)
    .forEach((l) => {
      const y = Math.max(l.y, lastY + 96);
      lastY = y;
      const tx = l.side === -1 ? 46 : W - 46;
      ctx.textAlign = l.side === -1 ? "left" : "right";

      ctx.strokeStyle = "rgba(58,42,32,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.side === -1 ? tx + 6 : tx - 6, y);
      ctx.lineTo(l.edge - l.side * 12, l.y);
      ctx.stroke();

      ctx.fillStyle = "#3a2a20";
      ctx.font = "300 38px 'Cormorant Garamond', Georgia, serif";
      const lines = wrap(ctx, l.name, 300);
      lines.forEach((line, li) => ctx.fillText(line, tx, y + li * 42 - (lines.length - 1) * 21));
      ctx.font = "300 24px Jost, sans-serif";
      ctx.fillStyle = "#8a7a6a";
      ctx.fillText(l.price, tx, y + (lines.length - 1) * 21 + 40);
    });

  ctx.textAlign = "center";
  ctx.fillStyle = "#3a2a20";
  ctx.font = "300 44px 'Cormorant Garamond', Georgia, serif";
  ctx.fillText(`Totale outfit ${formatPrice(total)}`, W / 2, H - 110);
  ctx.font = "300 24px Jost, sans-serif";
  ctx.fillStyle = "#8a7a6a";
  ctx.fillText(`${SHOP.instagramHandle} · ${SHOP.address}`, W / 2, H - 62);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const file = new File([blob], "outfit-baci-e-bottoni.png", { type: "image/png" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);

}
