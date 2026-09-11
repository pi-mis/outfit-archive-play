import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Circle, RotateCcw, X } from "lucide-react";
import type { Item, Zone } from "@/lib/catalog";
import { BODY_HEIGHT_CM, fittingHeightCm, formatPrice } from "@/lib/catalog";

/**
 * Manichino bianco a proporzioni reali: 170 cm mappati su 340 unità (2 unità = 1 cm).
 * Testa 0–23 cm, spalle 30 cm, vita 85 cm, fianchi 100 cm, terra 170 cm.
 */
function Mannequin({ height }: { height: number }) {
  return (
    <svg
      viewBox="0 0 100 340"
      style={{ height }}
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      aria-hidden
    >
      <defs>
        <linearGradient id="mq-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dcd7d0" />
          <stop offset="28%" stopColor="#ffffff" />
          <stop offset="72%" stopColor="#f4f1ec" />
          <stop offset="100%" stopColor="#d3cec6" />
        </linearGradient>
        <radialGradient id="mq-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(60,45,35,0.35)" />
          <stop offset="100%" stopColor="rgba(60,45,35,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="336" rx="34" ry="7" fill="url(#mq-shadow)" />

      <g fill="url(#mq-body)">
        {/* testa e collo */}
        <path d="M50 2c8.5 0 14 7.4 14 17 0 5.4-1.3 10.4-3.6 14-2.3 3.6-6 6-10.4 6s-8.1-2.4-10.4-6C37.3 29.4 36 24.4 36 19 36 9.4 41.5 2 50 2Z" />
        <path d="M45 36h10v13c0 4 3 6 3 6H42s3-2 3-6V36Z" />
        {/* busto: spalle 30cm (y60), vita 85cm (y170), fianchi 100cm (y200) */}
        <path d="M50 53c9 0 18 2.6 23 6.4 4 3 5.6 8.6 6 15.4.5 9-1 20-3 30-1.6 8-3 15.6-3.4 23.4-.4 8 .4 16 2 24.6 1.6 8.6 3.4 17 3.4 24.2 0 9-2.6 15.6-7 19.6-4.6 4.2-12.4 6.4-21 6.4s-16.4-2.2-21-6.4c-4.4-4-7-10.6-7-19.6 0-7.2 1.8-15.6 3.4-24.2 1.6-8.6 2.4-16.6 2-24.6-.4-7.8-1.8-15.4-3.4-23.4-2-10-3.5-21-3-30 .4-6.8 2-12.4 6-15.4C32 55.6 41 53 50 53Z" />
        {/* braccia lungo i fianchi */}
        <path d="M27 62c-3.6 3.4-5.6 10-6.6 18.6-1 8.6-1.4 18-2.2 27.4-.8 9.4-2 18.4-2 27.4 0 6.6.6 12.4 1.4 17.4.5 3.2 4.6 3 4.8-.4.4-5.6.8-11.6 1.8-18.6 1-7 2.6-15 3.6-23.6 1-8.6 1.2-17.4 1-25.4-.2-8 .3-15.2-1.8-22.8Z" />
        <path d="M73 62c3.6 3.4 5.6 10 6.6 18.6 1 8.6 1.4 18 2.2 27.4.8 9.4 2 18.4 2 27.4 0 6.6-.6 12.4-1.4 17.4-.5 3.2-4.6 3-4.8-.4-.4-5.6-.8-11.6-1.8-18.6-1-7-2.6-15-3.6-23.6-1-8.6-1.2-17.4-1-25.4.2-8-.3-15.2 1.8-22.8Z" />
        {/* gambe */}
        <path d="M31 196h17.2c.6 14 .4 28.6-.4 43.4-.8 15-2 30-2.6 44.6-.4 11-.6 21.6-.6 31H31.4c.4-10.4.2-21-.4-32-.8-14.6-2-29.4-2-44 0-15.6.8-29.6 2-43Z" />
        <path d="M51.8 196H69c1.2 13.4 2 27.4 2 43 0 14.6-1.2 29.4-2 44-.6 11-.8 21.6-.4 32H55.4c0-9.4-.2-20-.6-31-.6-14.6-1.8-29.6-2.6-44.6-.8-14.8-1-29.4-.4-43.4Z" />
        {/* piedi */}
        <path d="M30.6 318h14.8c.2 5 .4 9.6.8 14H30c.2-4.4.4-9 .6-14Z" />
        <path d="M54.6 318h14.8c.2 5 .4 9.6.6 14H53.8c.4-4.4.6-9 .8-14Z" />
      </g>
    </svg>
  );
}

/** Sagome degli specchi vintage ispirate alla parete del negozio. */
const MIRROR_SHAPES = {
  /* grande cartouche barocca dorata, cimasa a foglia d'acanto */
  barocco:
    "M50 1c3 5 6 7 10 9 6 3 9-1 13 3 4 4 1 8 5 11 5 4 11 2 14 8 3 6-1 11 1 17 2 7 6 10 6 18 0 7-4 11-5 18-1 6 2 11 0 17-2 7-8 8-11 14-3 6-1 12-7 15-6 3-11-1-16 1-5 2-7 7-10 7s-5-5-10-7c-5-2-10 2-16-1-6-3-4-9-7-15-3-6-9-7-11-14-2-6 1-11 0-17-1-7-5-11-5-18 0-8 4-11 6-18 2-6-2-11 1-17 3-6 9-4 14-8 4-3 1-7 5-11 4-4 7 0 13-3 4-2 7-4 10-9Z",
  /* specchio a goccia/foglia appuntito */
  goccia:
    "M50 2c13 8 26 24 30 42 4 19-4 38-16 47-8 6-20 6-28 0C24 82 16 63 20 44 24 26 37 10 50 2Z",
  /* ovale nero intagliato con corona e volute */
  ovaleIntagliato:
    "M50 1c4 5 8 6 11 11 3 4 8 3 12 7 4 4 2 8 6 11 5 4 11 5 13 12 2 6-1 11 0 18 1 8 4 12 4 20s-3 12-4 20c-1 7 2 12 0 18-2 7-8 8-13 12-4 3-2 7-6 11-4 4-9 3-12 7-3 5-7 6-11 11-4-5-8-6-11-11-3-4-8-3-12-7-4-4-2-8-6-11-5-4-11-5-13-12-2-6 1-11 0-18-1-8-4-12-4-20s3-12 4-20c1-7-2-12 0-18 2-7 8-8 13-12 4-3 2-7 6-11 4-4 9-3 12-7 3-5 7-6 11-11Z",
  /* esagono allungato in stile déco */
  esagono: "M50 2 92 22v56L50 98 8 78V22Z",
  /* ovale liscio dorato */
  ovale: "M50 2c21 0 37 21 37 48S71 98 50 98 13 77 13 50 29 2 50 2Z",
  /* specchio rettangolare sagomato con cimasa */
  cimasa:
    "M50 1c2 5 6 7 11 8-4 3-5 6-4 10 6-1 14 1 19 4 3 12 2 26 2 40s1 27-2 37c-6 3-14 4-20 6-2 2-4 3-6 5-2-2-4-3-6-5-6-2-14-3-20-6-3-10-2-23-2-37s-1-28 2-40c5-3 13-5 19-4 1-4 0-7-4-10 5-1 9-3 11-8Z",
} as const;

function WallMirror({
  className,
  shape,
  tone = "oro",
}: {
  className: string;
  shape: keyof typeof MIRROR_SHAPES;
  tone?: "oro" | "bronzo" | "nero";
}) {
  const frame =
    tone === "oro" ? "oklch(0.72 0.1 78)" : tone === "bronzo" ? "oklch(0.45 0.05 52)" : "oklch(0.22 0.01 60)";
  const frameLight =
    tone === "oro" ? "oklch(0.9 0.08 90)" : tone === "bronzo" ? "oklch(0.62 0.05 56)" : "oklch(0.4 0.01 60)";
  const id = `${shape}-${tone}`;
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`f-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={frameLight} />
            <stop offset="45%" stopColor={frame} />
            <stop offset="100%" stopColor={frameLight} />
          </linearGradient>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.008 88)" />
            <stop offset="40%" stopColor="oklch(0.89 0.016 82)" />
            <stop offset="55%" stopColor="oklch(0.96 0.01 86)" />
            <stop offset="100%" stopColor="oklch(0.86 0.02 78)" />
          </linearGradient>
        </defs>
        <path
          d={MIRROR_SHAPES[shape]}
          fill={`url(#g-${id})`}
          stroke={`url(#f-${id})`}
          strokeWidth={8}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 12px 18px rgba(70,50,35,0.4))" }}
        />
        <path
          d={MIRROR_SHAPES[shape]}
          fill="none"
          stroke={frameLight}
          strokeWidth={2}
          strokeLinejoin="round"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}

/** Macchina da cucire Singer d'epoca: volantino a raggi, braccio curvo, base in legno. */
function SewingMachine({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <svg viewBox="0 0 200 150" className="size-full">
        <defs>
          <linearGradient id="sm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.38 0.02 60)" />
            <stop offset="100%" stopColor="oklch(0.19 0.01 50)" />
          </linearGradient>
          <linearGradient id="sm-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.68 0.07 62)" />
            <stop offset="100%" stopColor="oklch(0.5 0.06 55)" />
          </linearGradient>
        </defs>

        {/* piano in legno con bordo smussato e plinto scuro */}
        <path d="M14 104h172l-10 14H24Z" fill="oklch(0.42 0.05 55)" />
        <path d="M8 96h184l-6 8H14Z" fill="url(#sm-wood)" />
        <rect x="20" y="118" width="160" height="16" rx="2" fill="oklch(0.26 0.02 50)" />

        {/* letto della macchina (piastra) */}
        <rect x="34" y="84" width="132" height="12" rx="2" fill="url(#sm-body)" />
        <ellipse cx="146" cy="88" rx="12" ry="4" fill="oklch(0.7 0.02 80)" opacity="0.6" />

        {/* colonna a sinistra, braccio curvo e testa a destra */}
        <path
          d="M46 84V54c0-14 10-22 24-24 12-2 28 0 44 2 14 2 26 6 30 16 3 8 2 18 2 26v10h-18V64c0-8-6-12-16-14-12-2-26-3-34 0-6 2-8 6-8 12v22Z"
          fill="url(#sm-body)"
        />
        {/* testa con barra ago */}
        <rect x="128" y="52" width="26" height="34" rx="6" fill="url(#sm-body)" />
        <rect x="139" y="30" width="5" height="22" rx="2" fill="oklch(0.32 0.02 50)" />
        <rect x="139" y="86" width="3" height="10" fill="oklch(0.85 0.02 90)" />
        <circle cx="155" cy="70" r="5" fill="oklch(0.3 0.02 50)" />

        {/* volantino a raggi con manovella */}
        <circle cx="40" cy="52" r="22" fill="none" stroke="oklch(0.3 0.02 50)" strokeWidth="6" />
        <g stroke="oklch(0.3 0.02 50)" strokeWidth="4">
          <path d="M40 32v40M20 52h40M26 38l28 28M54 38 26 66" />
        </g>
        <circle cx="40" cy="52" r="7" fill="oklch(0.26 0.02 50)" />
        <path d="M40 60c-6 6-10 10-12 18" stroke="oklch(0.3 0.02 50)" strokeWidth="5" fill="none" />
        <rect x="20" y="76" width="12" height="6" rx="3" fill="oklch(0.5 0.06 55)" />

        {/* decori dorati */}
        <path d="M60 74h56" stroke="oklch(0.74 0.09 78)" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M70 62c6-4 14-4 20 0" stroke="oklch(0.74 0.09 78)" strokeWidth="1.6" fill="none" opacity="0.7" />
        {/* rocchetto di filo */}
        <rect x="98" y="26" width="4" height="12" fill="oklch(0.74 0.09 78)" />
        <ellipse cx="100" cy="24" rx="7" ry="4" fill="oklch(0.62 0.12 28)" />
      </svg>
    </div>
  );
}


const SPRING = { type: "spring" as const, stiffness: 210, damping: 24 };

export function FittingRoom({
  open,
  onClose,
  outfit,
  zones,
  total,
  onOpenItem,
}: {
  open: boolean;
  onClose: () => void;
  outfit: Item[];
  zones: Zone[];
  total: number;
  onOpenItem?: (item: Item) => void;
}) {
  const [stage, setStage] = useState(520);
  const [zoom, setZoom] = useState<Item | null>(null);
  const [back, setBack] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressed = useRef<Item | null>(null);
  const moved = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const faceOf = (item: Item) =>
    (back ? (item.back_image_url ?? item.processed_image_url) : item.processed_image_url) ??
    item.thumbnail_url ??
    "";

  const itemAt = (x: number, y: number): Item | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const id = el?.dataset?.["itemId"];
    return id ? (outfit.find((i) => i.id === id) ?? null) : null;
  };

  const endPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!zoom && !moved.current && pressed.current) onOpenItem?.(pressed.current);
    pressed.current = null;
    setZoom(null);
  };

  useEffect(() => {
    if (!open) {
      setZoom(null);
      setBack(false);
      pressed.current = null;
      if (timer.current) clearTimeout(timer.current);
    }
  }, [open]);

  useEffect(() => {
    const measure = () => setStage(Math.max(300, Math.min(600, window.innerHeight - 250)));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const k = stage / BODY_HEIGHT_CM;
  const zoneOf = (key: string) => zones.find((z) => z.key === key);
  const order = ["cappello", "collana", "bottom", "top", "scarpe"];
  const sorted = [...outfit].sort((a, b) => order.indexOf(a.zone_key) - order.indexOf(b.zone_key));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,oklch(0.97_0.012_88),oklch(0.9_0.018_82))]"
        >
          {/* battiscopa e pavimento */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(to_bottom,oklch(0.88_0.022_78),oklch(0.82_0.03_74))]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-[26%] h-2 bg-[oklch(0.75_0.04_74)]" />

          <div className="relative flex items-center justify-between px-5 py-4">
            <p className="eyebrow">Camerino</p>
            <button
              onClick={onClose}
              aria-label="Esci dal camerino"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative flex flex-1 items-end justify-center pb-[6%]">
            {/* specchi vintage sulla parete, ai lati */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="pointer-events-none absolute inset-0"
            >
              <WallMirror shape="barocco" className="left-[1%] top-[3%] h-[30%] w-[30%]" />
              <WallMirror shape="goccia" tone="bronzo" className="left-[3%] top-[36%] h-[16%] w-[16%]" />
              <WallMirror shape="cimasa" className="left-[6%] top-[54%] h-[14%] w-[14%]" />
              <WallMirror shape="ovaleIntagliato" tone="nero" className="right-[4%] top-[4%] h-[26%] w-[26%]" />
              <WallMirror shape="ovale" className="right-[3%] top-[33%] h-[18%] w-[14%]" />
              <WallMirror shape="esagono" tone="bronzo" className="right-[6%] top-[53%] h-[12%] w-[16%]" />

            </motion.div>

            <SewingMachine className="bottom-[6%] left-[2%] h-[18%] w-[30%]" />


            {/* luci vintage sopra la parete */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-7">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="size-2.5 rounded-full bg-[oklch(0.97_0.05_86)] shadow-[0_0_26px_10px_oklch(0.92_0.07_86/0.6)]"
                />
              ))}
            </div>

            <motion.div
              className="relative touch-none"
              animate={{ rotateY: back ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: stage, width: Math.max(160, stage * 0.42), transformStyle: "preserve-3d" }}
              onPointerDown={(e) => {
                moved.current = false;
                start.current = { x: e.clientX, y: e.clientY };
                pressed.current = itemAt(e.clientX, e.clientY);
                if (timer.current) clearTimeout(timer.current);
                if (pressed.current) {
                  const target = pressed.current;
                  timer.current = setTimeout(() => setZoom(target), 260);
                }
              }}
              onPointerMove={(e) => {
                if (zoom) {
                  const next = itemAt(e.clientX, e.clientY);
                  if (next && next.id !== zoom.id) setZoom(next);
                  return;
                }
                const dx = e.clientX - start.current.x;
                const dy = e.clientY - start.current.y;
                if (Math.hypot(dx, dy) > 14) {
                  moved.current = true;
                  if (timer.current) {
                    clearTimeout(timer.current);
                    timer.current = null;
                  }
                }
              }}
              onPointerUp={endPress}
              onPointerCancel={endPress}
              onPointerLeave={endPress}
            >
              <div className="absolute inset-0" style={{ transform: back ? "scaleX(-1)" : undefined }}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <Mannequin height={stage} />
              </motion.div>

              {sorted.map((item, i) => {
                const zone = zoneOf(item.zone_key);
                const anchor = zone?.anchor_y_cm ?? 0;
                const shoes = item.zone_key === "scarpe";
                const h = Math.min(
                  fittingHeightCm(item) * k * (shoes ? 1.3 : 1),
                  Math.max(24, stage - anchor * k + (shoes ? 40 * k : 0)),
                );
                const top = shoes ? stage - h : anchor * k;
                return (
                  <motion.img
                    key={item.id}
                    data-item-id={item.id}
                    draggable={false}
                    src={faceOf(item)}
                    alt={item.name}
                    initial={{
                      opacity: 0,
                      y: 120 + i * 26,
                      x: i % 2 === 0 ? -70 : 70,
                      rotate: i % 2 === 0 ? -14 : 14,
                      scale: 0.7,
                      filter: "blur(6px)",
                    }}
                    animate={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ ...SPRING, delay: 0.25 + i * 0.12 }}
                    className="garment-shadow absolute left-1/2 -translate-x-1/2 object-contain"
                    style={{
                      height: h,
                      top,
                      marginLeft: item.offset_x,
                      marginTop: item.offset_y,
                    }}
                  />
                );
              })}
              </div>
            </motion.div>

            <AnimatePresence>
              {zoom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-[oklch(0.95_0.012_86)]/92 backdrop-blur-sm"
                >
                  <img
                    src={faceOf(zoom)}
                    alt={zoom.name}
                    className="max-h-[70vh] w-auto max-w-[88vw] object-contain"
                  />
                  <p className="mt-3 font-display text-lg">{zoom.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(Number(zoom.price))}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          <div className="relative mx-auto w-full max-w-md px-4 pb-3">
            <p className="mb-2 text-center text-[11px] text-muted-foreground">
              Proporzioni reali · figura di {BODY_HEIGHT_CM} cm · tocca un capo per la scheda, tieni premuto per ingrandire
            </p>
            <div className="flex items-center justify-between gap-3 rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur">
              <span className="text-sm">
                <span className="eyebrow mr-2">Totale</span>
                {formatPrice(total)}
              </span>
              <button
                onClick={() => setBack((v) => !v)}
                aria-label={back ? "Mostra il fronte" : "Gira il manichino e vedi il retro"}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-[11px] tracking-wide transition-colors hover:bg-secondary"
              >
                <RotateCcw className="size-4" />
                {back ? "Fronte" : "Retro"}
              </button>
              <button
                onClick={onClose}
                aria-label="Torna alla selezione"
                className="relative flex size-11 items-center justify-center rounded-full bg-[var(--sand)] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.2)] ring-2 ring-primary/25 transition-transform hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-1.5 rounded-full border border-primary/20" />
                <span className="grid grid-cols-2 gap-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Circle key={i} className="size-1.5 fill-primary/70 text-primary/70" />
                  ))}
                </span>
              </button>
            </div>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              Premi il bottone per tornare alla selezione
            </p>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
}
