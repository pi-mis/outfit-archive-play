import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PROMPT = [
  "Isola il capo di abbigliamento fotografato e restituisci SOLO il capo ritagliato",
  "su sfondo bianco puro e uniforme (#FFFFFF), senza alcuna ombra, gradiente o riflesso sul fondo.",
  "Rimuovi sfondo, gruccia, mani, manichino, pavimento e ogni oggetto estraneo.",
  "Inquadratura strettissima: il capo deve riempire completamente il fotogramma, perfettamente centrato,",
  "toccando quasi i bordi in alto e in basso, senza margini o spazio bianco superfluo.",
  "Mantieni identici forma, colore, tessuto, stampe e dettagli originali: non ridisegnare,",
  "non stilizzare. Raddrizza leggermente il capo e correggi luce e bilanciamento del bianco in modo naturale.",
].join(" ");

export const cutoutGarment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dataUrl: string }) => {
    if (!input?.dataUrl?.startsWith("data:image/")) throw new Error("Immagine non valida");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Accesso riservato");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Elaborazione immagini non configurata");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: data.dataUrl } },
            ],
          },
        ],
      }),
    });

    if (response.status === 429) throw new Error("Troppe elaborazioni in poco tempo, riprova tra un minuto");
    if (response.status === 402) throw new Error("Crediti AI esauriti");
    if (!response.ok) throw new Error(`Elaborazione non riuscita (${response.status})`);

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const url = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("Nessuna immagine restituita");
    return { dataUrl: url };
  });
