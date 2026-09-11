import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "it" | "en";

const STORAGE_KEY = "bb-lang";

type Dict = Record<string, { it: string; en: string }>;

const DICT: Dict = {
  tagline: { it: "Authentic pre-loved", en: "Authentic pre-loved" },
  hours: {
    it: "Mar 10:30–19:00 · Mer–Sab 10:30–13:00 e 15:30–19:00",
    en: "Tue 10:30–19:00 · Wed–Sat 10:30–13:00 and 15:30–19:00",
  },
  loading: { it: "Stiamo aprendo l'armadio…", en: "Opening the wardrobe…" },
  sizeAll: { it: "La mia taglia · tutte", en: "My size · all" },
  size: { it: "Taglia", en: "Size" },
  showSold: { it: "Mostra anche l'archivio venduto", en: "Show the sold archive too" },
  total: { it: "Totale", en: "Total" },
  download: { it: "Scarica la foto dell'outfit", en: "Download the outfit photo" },
  surprise: { it: "Sorprendimi", en: "Surprise me" },
  enterRoom: { it: "Entra nel camerino", en: "Enter the fitting room" },
  pressToEnter: { it: "Premi il bottone per entrare nel camerino", en: "Press the button to enter the fitting room" },
  postcardReady: { it: "Cartolina pronta", en: "Postcard ready" },
  postcardError: {
    it: "Non è stato possibile salvare la foto. Riprova.",
    en: "We couldn't save the photo. Please try again.",
  },
  previous: { it: "Precedente", en: "Previous" },
  next: { it: "Successivo", en: "Next" },
  lock: { it: "Blocca", en: "Lock" },
  unlock: { it: "Sblocca", en: "Unlock" },
  type: { it: "Tipo", en: "Type" },
  // fitting room
  fittingRoom: { it: "Camerino", en: "Fitting room" },
  exitFittingRoom: { it: "Esci dal camerino", en: "Leave the fitting room" },
  fittingHint: {
    it: "tocca un capo per la scheda, tieni premuto per ingrandire",
    en: "tap a piece for its details, press and hold to zoom",
  },
  realProportions: { it: "Proporzioni reali · figura di", en: "Real proportions · figure of" },
  front: { it: "Fronte", en: "Front" },
  back: { it: "Retro", en: "Back" },
  showFront: { it: "Mostra il fronte", en: "Show the front" },
  showBack: { it: "Gira il manichino e vedi il retro", en: "Turn the mannequin and see the back" },
  backToSelection: { it: "Torna alla selezione", en: "Back to the selection" },
  pressToReturn: { it: "Premi il bottone per tornare alla selezione", en: "Press the button to go back" },
  // item sheet
  close: { it: "Chiudi", en: "Close" },
  noBackPhoto: { it: "Foto del retro non disponibile", en: "Back photo not available" },
  originalPhotos: { it: "Foto originali", en: "Original photos" },
  originalPhotoOf: { it: "Foto originale di", en: "Original photo of" },
  condition: { it: "Condizione", en: "Condition" },
  flaws: { it: "Difetti", en: "Flaws" },
  status: { it: "Stato", en: "Status" },
  hold24: { it: "Tienimelo 24h", en: "Hold it for 24h" },
  yourName: { it: "Il tuo nome", en: "Your name" },
  phoneOrEmail: { it: "Telefono o email", en: "Phone or email" },
  sendRequest: { it: "Invia richiesta", en: "Send request" },
  requestSent: {
    it: "Richiesta inviata: ti scriviamo a breve per confermare.",
    en: "Request sent: we'll write to you shortly to confirm.",
  },
  requestError: {
    it: "Non siamo riusciti a inviare la richiesta. Riprova.",
    en: "We couldn't send the request. Please try again.",
  },
  writeWhatsapp: { it: "Scrivici su WhatsApp", en: "Message us on WhatsApp" },
  comeTryIt: { it: "Vieni a provarlo", en: "Come and try it on" },
  waMessage: {
    it: "Ciao Baci & Bottoni! Sono interessata a",
    en: "Hi Baci & Bottoni! I'm interested in",
  },
  holdRequest: { it: "Richiesta 24h per", en: "24h hold request for" },
  langLabel: { it: "Lingua", en: "Language" },
};

const ZONE_LABELS_EN: Record<string, { label: string; all: string; none: string }> = {
  cappello: { label: "Hat", all: "All", none: "None" },
  collana: { label: "Accessories", all: "Accessories · all", none: "None" },
  top: { label: "Top / Jacket", all: "All", none: "None" },
  bottom: { label: "Bottom", all: "All", none: "None" },
  scarpe: { label: "Shoes", all: "All", none: "None" },
};

const TYPE_LABELS_EN: Record<string, string> = {
  jeans: "Jeans",
  pantaloni: "Trousers",
  "gonna-corta": "Short skirt",
  "gonna-lunga": "Long skirt",
  shorts: "Shorts",
  cappello: "Hat",
  basco: "Beret",
  foulard: "Scarf / headband",
  choker: "Choker",
  corta: "Short necklace",
  lunga: "Long necklace",
  orecchini: "Earrings",
  basse: "Flats",
  tacco: "Heels",
  stivali: "Boots",
  sandali: "Sandals",
  maglietta: "T-shirt",
  top: "Top",
  camicia: "Shirt",
  maglione: "Jumper",
  giacca: "Jacket",
  cappotto: "Coat",
  abito: "Dress",
  tuta: "Jumpsuit",
};

const STATUS_EN: Record<string, string> = {
  disponibile: "available",
  prenotato: "reserved",
  venduto: "sold",
};

const MEASURE_EN: Record<string, string> = {
  spalle: "Shoulders",
  petto: "Chest",
  vita: "Waist",
  fianchi: "Hips",
  lunghezza: "Length",
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
  zoneLabel: (key: string, italian: string) => string;
  zoneAll: (key: string, italian: string) => string;
  zoneNone: (key: string, italian: string) => string;
  typeLabel: (key: string, italian: string) => string;
  statusLabel: (value: string) => string;
  measureLabel: (key: string, italian: string) => string;
};

function buildValue(lang: Lang, setLang: (l: Lang) => void): Ctx {
  return {
    lang,
    setLang,
    t: (key) => DICT[key as string]?.[lang] ?? (key as string),
    zoneLabel: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.label ?? italian)),
    zoneAll: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.all ?? italian)),
    zoneNone: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.none ?? italian)),
    typeLabel: (key, italian) => (lang === "it" ? italian : (TYPE_LABELS_EN[key] ?? italian)),
    statusLabel: (value) => (lang === "it" ? value : (STATUS_EN[value] ?? value)),
    measureLabel: (key, italian) => (lang === "it" ? italian : (MEASURE_EN[key] ?? italian)),
  };
}

const FALLBACK: Ctx = buildValue("it", () => {});

const LangContext = createContext<Ctx>(FALLBACK);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "en" || stored === "it") setLangState(stored);
    else if (typeof navigator !== "undefined" && !navigator.language.toLowerCase().startsWith("it")) {
      setLangState("en");
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
    };
    return {
      lang,
      setLang,
      t: (key) => DICT[key as string]?.[lang] ?? (key as string),
      zoneLabel: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.label ?? italian)),
      zoneAll: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.all ?? italian)),
      zoneNone: (key, italian) => (lang === "it" ? italian : (ZONE_LABELS_EN[key]?.none ?? italian)),
      typeLabel: (key, italian) => (lang === "it" ? italian : (TYPE_LABELS_EN[key] ?? italian)),
      statusLabel: (value) => (lang === "it" ? value : (STATUS_EN[value] ?? value)),
      measureLabel: (key, italian) => (lang === "it" ? italian : (MEASURE_EN[key] ?? italian)),
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("langLabel")}
      className={`inline-flex overflow-hidden rounded-full border border-border bg-card text-[11px] tracking-widest uppercase ${className}`}
    >
      {(["it", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-3 py-1 transition-colors ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
