import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Upload a photo to the private "garments" bucket and return a long-lived signed URL. */
export async function uploadPhoto(file: Blob, code: string, index: number, ext = "jpg") {
  const path = `items/${code}/${Date.now()}-${index}.${ext}`;
  const { error } = await supabase.storage.from("garments").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from("garments")
    .createSignedUrl(path, TEN_YEARS);
  if (signError) throw signError;
  return { path, url: data.signedUrl };
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
