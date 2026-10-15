import { supabase } from "@/integrations/supabase/client";

/** Carica una foto nel bucket pubblico "garments" e restituisce il suo URL. */
export async function uploadPhoto(file: Blob, code: string, index: number, ext = "jpg") {
  const path = `items/${code}/${Date.now()}-${index}.${ext}`;
  const { error } = await supabase.storage.from("garments").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("garments").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

/** Downscale a captured photo before upload so mobile uploads stay fast. */
export async function shrinkImage(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.9),
  );
}

/** Read a blob as a data URL (used to send photos to the cut-out service). */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lettura del file non riuscita"));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return await (await fetch(dataUrl)).blob();
}

export function suggestCode(typeKey: string) {
  const prefix = typeKey.slice(0, 3).toUpperCase();
  const stamp = Date.now().toString().slice(-5);
  return `${prefix}-${stamp}`;
}

/**
 * Rimuove il fondo bianco lasciato dal ritaglio AI e ritaglia i bordi vuoti,
 * così il capo riempie l'immagine e si appoggia sullo sfondo del sito.
 */
export async function stripWhiteBackground(dataUrl: string): Promise<Blob> {
  const bitmap = await createImageBitmap(await dataUrlToBlob(dataUrl));
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return await dataUrlToBlob(dataUrl);
  ctx.drawImage(bitmap, 0, 0);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = image.data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] ?? 0;
    const g = px[i + 1] ?? 0;
    const b = px[i + 2] ?? 0;
    const min = Math.min(r, g, b);
    const spread = Math.max(r, g, b) - min;
    if (min > 244 && spread < 12) {
      px[i + 3] = 0;
    } else if (min > 226 && spread < 16) {
      px[i + 3] = Math.round(((244 - min) / 18) * (px[i + 3] ?? 255));
    }
    if ((px[i + 3] ?? 0) > 24) {
      const p = i / 4;
      const x = p % canvas.width;
      const y = (p - x) / canvas.width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  ctx.putImageData(image, 0, 0);

  if (maxX <= minX || maxY <= minY) {
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  }

  const pad = 1;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(canvas.width - sx, maxX - minX + pad * 2);
  const sh = Math.min(canvas.height - sy, maxY - minY + pad * 2);

  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const octx = out.getContext("2d");
  if (!octx) return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return await new Promise<Blob>((resolve) => out.toBlob((b) => resolve(b!), "image/png"));
}
