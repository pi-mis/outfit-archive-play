import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { OutfitBuilder } from "@/components/outfit/OutfitBuilder";
import { Intro } from "@/components/outfit/Intro";
import { SHOP } from "@/lib/catalog";
import { LanguageToggle, useI18n } from "@/lib/i18n";
import { shouldShowIntro } from "@/lib/intro";

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
  const { t } = useI18n();
  const [intro, setIntro] = useState(false);

  // Solo lato client: al primo accesso apriamo la presentazione del negozio.
  useEffect(() => {
    if (shouldShowIntro()) setIntro(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative px-6 pb-3 pt-5 text-center">
        <button
          type="button"
          onClick={() => setIntro(true)}
          aria-label={t("introHowItWorks")}
          title={t("introHowItWorks")}
          className="border-border bg-card text-muted-foreground hover:border-brass hover:text-brass absolute left-4 top-4 flex size-7 items-center justify-center rounded-full border transition-colors"
        >
          <Info className="size-3.5" strokeWidth={1.5} />
        </button>
        <div className="absolute right-4 top-4">
          <LanguageToggle />
        </div>
        <h1 className="font-display text-3xl tracking-tight">{SHOP.name}</h1>
        <p className="eyebrow mt-1">{t("tagline")}</p>
      </header>

      <main className="flex-1 pb-6">
        <OutfitBuilder />
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-xs leading-relaxed text-muted-foreground">
        <p>{SHOP.address}</p>
        <p>{t("hours")}</p>
        <p className="mt-2 flex justify-center gap-4">
          <button type="button" onClick={() => setIntro(true)} className="underline underline-offset-4">
            {t("introHowItWorks")}
          </button>
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

      <Intro open={intro} onClose={() => setIntro(false)} />
    </div>
  );
}
