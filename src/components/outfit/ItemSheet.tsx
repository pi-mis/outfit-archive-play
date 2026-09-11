import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Item } from "@/lib/catalog";
import { MEASURE_LABELS, SHOP, formatPrice } from "@/lib/catalog";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 32 };

export function ItemSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setError(null);
    const { error: err } = await supabase.from("reservations").insert({
      item_id: item.id,
      customer_name: name,
      contact,
      message: `Richiesta 24h per ${item.name} (${item.code})`,
    });
    if (err) setError("Non siamo riusciti a inviare la richiesta. Riprova.");
    else setSent(true);
  };

  const waLink = item
    ? `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(
        `Ciao ${SHOP.name}! Sono interessata a ${item.name} (codice ${item.code}).`,
      )}`
    : "#";

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px]"
          />
          <motion.aside
            key={item.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-6 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{item.code}</p>
                <h2 className="mt-1 text-3xl leading-tight">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[item.era, item.brand, item.size && `Taglia ${item.size}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button onClick={onClose} aria-label="Chiudi" className="rounded-full p-1 hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 flex items-end justify-center rounded-lg bg-background p-6">
              <img
                src={item.processed_image_url ?? ""}
                alt={item.name}
                className="garment-shadow max-h-64 object-contain"
              />
            </div>
            <p className="mt-2 text-center text-[11px] tracking-widest text-muted-foreground uppercase">
              Immagine elaborata
            </p>

            {item.original_photos.length > 0 && (
              <div className="mt-5">
                <p className="eyebrow">Foto originali</p>
                <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {item.original_photos.map((src) => (
                    <img key={src} src={src} alt={`Foto originale di ${item.name}`} className="h-28 rounded-md object-cover" />
                  ))}
                </div>
              </div>
            )}

            <dl className="mt-6 space-y-2 text-sm">
              {Object.entries(item.measurements ?? {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-border/60 pb-1">
                  <dt className="text-muted-foreground">{MEASURE_LABELS[key] ?? key}</dt>
                  <dd>{value} cm</dd>
                </div>
              ))}
              {item.condition && (
                <div className="flex justify-between border-b border-border/60 pb-1">
                  <dt className="text-muted-foreground">Condizione</dt>
                  <dd>{item.condition}</dd>
                </div>
              )}
              {item.flaws && (
                <div className="flex justify-between gap-6 border-b border-border/60 pb-1">
                  <dt className="text-muted-foreground">Difetti</dt>
                  <dd className="text-right">{item.flaws}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <dt className="text-muted-foreground">Stato</dt>
                <dd className="capitalize">{item.status}</dd>
              </div>
            </dl>

            <p className="mt-5 font-display text-3xl">{formatPrice(item.price)}</p>

            {item.status !== "venduto" && (
              <div className="mt-5 space-y-2">
                {!showForm && !sent && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full rounded-full bg-primary py-3 text-sm tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Tienimelo 24h
                  </button>
                )}
                {showForm && !sent && (
                  <form onSubmit={submit} className="space-y-2 rounded-lg border border-border p-3">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Il tuo nome"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Telefono o email"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <button className="w-full rounded-full bg-primary py-2.5 text-sm text-primary-foreground">
                      Invia richiesta
                    </button>
                  </form>
                )}
                {sent && (
                  <p className="rounded-lg bg-secondary p-3 text-center text-sm">
                    Richiesta inviata: ti scriviamo a breve per confermare.
                  </p>
                )}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-full border border-primary py-3 text-center text-sm tracking-wide transition-colors hover:bg-secondary"
                >
                  Scrivici su WhatsApp
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(SHOP.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2 text-center text-sm text-muted-foreground underline underline-offset-4"
                >
                  Vieni a provarlo
                </a>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
