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
  // intro del primo accesso
  introHowItWorks: { it: "Come funziona", en: "How it works" },
  introSkip: { it: "Salta", en: "Skip" },
  introNext: { it: "Avanti", en: "Next" },
  introStart: { it: "Entra nel guardaroba", en: "Enter the wardrobe" },
  introEyebrow1: { it: "Benvenuta", en: "Welcome" },
  introTitle1: {
    it: "Il guardaroba è aperto, e nessuno ti guarda provare",
    en: "The wardrobe is open, and nobody is watching you try",
  },
  introBody1: {
    it: "Cappello, collana, capo, pantaloni, scarpe: cinque ripiani da combinare con un dito. Accosta quello che non avresti mai accostato — qui l'azzardo non si paga.",
    en: "Hat, necklace, top, trousers, shoes: five shelves to combine with one finger. Put together what you would never have put together — here, daring costs nothing.",
  },
  introEyebrow2: { it: "Come funziona", en: "How it works" },
  introTitle2: {
    it: "Scorri, chiudi il lucchetto, lascia che sia il caso a vestirti",
    en: "Swipe, close the padlock, let chance dress you",
  },
  introBody2: {
    it: "Il menù sceglie il tipo, il dito cambia il capo, il lucchetto difende quello su cui hai già deciso. «Sorprendimi» ha opinioni forti e gusto incostante. Tocca un capo per taglia, misure e prezzo.",
    en: "The menu picks the type, your finger changes the piece, the padlock defends what you have already settled on. “Surprise me” holds strong opinions and uneven taste. Tap a piece for size, measurements and price.",
  },
  introEyebrow3: { it: "Perché è diverso", en: "Why it's different" },
  introTitle3: {
    it: "Un solo esemplare, nessuna seconda taglia",
    en: "One of each, and no second size",
  },
  introBody3: {
    it: "Niente scaffali con quattrocento magliette uguali: ogni pezzo qui è sopravvissuto a qualche decennio e a più di un trasloco, ed è rimasto uno. Per questo lo vedi su un manichino, nelle sue proporzioni vere.",
    en: "No shelf of four hundred identical t-shirts: every piece here has survived a few decades and more than one move, and only one is left. That is why you see it on a mannequin, in its true proportions.",
  },
  introEyebrow4: { it: "In cosa crediamo", en: "What we believe" },
  introTitle4: {
    it: "Il lusso migliore non si fabbrica: si ritrova",
    en: "The finest luxury isn't manufactured: it's found again",
  },
  introBody4: {
    it: "Capi scelti a mano, misure prese davvero, difetti dichiarati con la stessa cura dei pregi. Scegli qui con calma, poi passa a provarli: certe stoffe vanno toccate.",
    en: "Pieces chosen by hand, measurements actually taken, flaws declared with the same care as the merits. Choose here at your own pace, then come and try them on: some fabrics have to be touched.",
  }};

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

  const value = useMemo<Ctx>(
    () =>
      buildValue(lang, (l: Lang) => {
        setLangState(l);
        if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
      }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
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
