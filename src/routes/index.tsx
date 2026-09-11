import { createFileRoute } from "@tanstack/react-router";
import { OutfitBuilder } from "@/components/outfit/OutfitBuilder";
import { SHOP } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baci & Bottoni — Vintage donna a Milano" },
      {
        name: "description",
        content:
          "Compone il tuo outfit vintage pezzo per pezzo e scopri l'archivio di Baci & Bottoni, abbigliamento donna authentic pre-loved a Milano.",
      },
      { property: "og:title", content: "Baci & Bottoni — Vintage donna a Milano" },
      {
        property: "og:description",
        content: "Gioca con l'archivio: cappelli, collane, capi e scarpe vintage da comporre come una paper doll.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 pb-3 pt-5 text-center">
        <h1 className="font-display text-3xl tracking-tight">{SHOP.name}</h1>
        <p className="eyebrow mt-1">{SHOP.tagline}</p>
      </header>

      <main className="flex-1 pb-6">
        <OutfitBuilder />
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs leading-relaxed text-muted-foreground">
        <p>{SHOP.address}</p>
        <p>{SHOP.hours}</p>
        <p className="mt-2 flex justify-center gap-4">
          <a className="underline underline-offset-4" href={SHOP.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a
            className="underline underline-offset-4"
            href={`https://wa.me/${SHOP.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </p>
      </footer>
    </div>
  );
}
