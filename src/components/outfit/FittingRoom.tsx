import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { Item, Zone } from "@/lib/catalog";
import { BODY_HEIGHT_CM, formatPrice } from "@/lib/catalog";

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

/** Sagome degli specchi vintage: barocco, goccia, ovale intagliato, esagono, ovale dorato. */
const MIRROR_SHAPES = {
  barocco:
    "M50 2c9 6 15 4 21 10 7 7 3 14 8 20 6 7 15 9 15 22 0 10-8 14-8 24 0 11 6 14 6 24 0 12-9 16-13 24-4 8-2 16-9 21-7 5-14 1-20 5-6 4-9 10-16 6-7-4-7-11-13-15-6-4-14-2-18-9-4-7 0-14-3-21-3-7-10-10-10-20 0-10 7-13 7-23 0-10-6-14-3-23 3-9 12-9 17-16 5-7 3-15 11-20 8-5 17 0 28-9Z",
  goccia:
    "M50 2c16 0 30 18 34 42 4 24-4 46-16 56-8 7-28 7-36 0C20 90 12 68 16 44 20 20 34 2 50 2Z",
  ovaleIntagliato:
    "M50 2c6 4 10 2 14 6 5 5 2 9 7 12 6 3 12 4 15 12 4 9 2 20 2 32s2 23-2 32c-3 8-9 9-15 12-5 3-2 7-7 12-4 4-8 2-14 6-6-4-10-2-14-6-5-5-2-9-7-12-6-3-12-4-15-12-4-9-2-20-2-32s-2-23 2-32c3-8 9-9 15-12 5-3 2-7 7-12 4-4 8-2 14-6Z",
  esagono: "M50 2 96 27v46L50 98 4 73V27Z",
  ovale: "M50 2c22 0 38 21 38 48S72 98 50 98 12 77 12 50 28 2 50 2Z",
} as const;

function WallMirror({
  className,
  shape,
  tone = "oro",
}: {
  className: string;
  shape: keyof typeof MIRROR_SHAPES;
  tone?: "oro" | "bronzo";
}) {
  const frame = tone === "oro" ? "oklch(0.74 0.09 78)" : "oklch(0.42 0.05 52)";
  const frameLight = tone === "oro" ? "oklch(0.9 0.08 90)" : "oklch(0.6 0.05 56)";
  const id = `${shape}-${tone}`;
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" className="size-full overflow-visible" preserveAspectRatio="none">
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
          strokeWidth={7}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 12px 18px rgba(70,50,35,0.4))" }}
        />
      </svg>
    </div>
  );
}

/** Macchina da cucire vintage appoggiata su un tavolino di legno. */
function SewingMachine({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <svg viewBox="0 0 140 120" className="size-full">
        <defs>
          <linearGradient id="sm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.42 0.03 60)" />
            <stop offset="100%" stopColor="oklch(0.24 0.02 50)" />
          </linearGradient>
          <linearGradient id="sm-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.06 62)" />
            <stop offset="100%" stopColor="oklch(0.45 0.05 55)" />
          </linearGradient>
        </defs>
        {/* tavolino */}
        <rect x="4" y="86" width="132" height="10" rx="3" fill="url(#sm-wood)" />
        <rect x="14" y="96" width="8" height="24" fill="oklch(0.45 0.05 55)" />
        <rect x="118" y="96" width="8" height="24" fill="oklch(0.45 0.05 55)" />
        {/* base macchina */}
        <rect x="16" y="74" width="108" height="12" rx="4" fill="url(#sm-body)" />
        {/* braccio */}
        <path
          d="M28 74V44c0-11 8-19 19-19h44c11 0 19 8 19 19v12c0 6-5 10-11 10h-8c-5 0-8 3-8 8v0h-9V44H55v30Z"
          fill="url(#sm-body)"
        />
        {/* ago */}
        <rect x="85" y="66" width="3" height="9" fill="oklch(0.85 0.02 90)" />
        {/* volantino */}
        <circle cx="112" cy="52" r="11" fill="oklch(0.3 0.02 50)" />
        <circle cx="112" cy="52" r="4" fill="oklch(0.74 0.09 78)" />
        {/* rocchetto di filo */}
        <rect x="50" y="18" width="4" height="10" fill="oklch(0.74 0.09 78)" />
        <ellipse cx="52" cy="16" rx="7" ry="4" fill="oklch(0.62 0.12 28)" />
        {/* decorazione dorata */}
        <path d="M40 60h34" stroke="oklch(0.74 0.09 78)" strokeWidth="1.5" fill="none" />
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
}: {
  open: boolean;
  onClose: () => void;
  outfit: Item[];
  zones: Zone[];
  total: number;
}) {
  const [stage, setStage] = useState(520);

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
              <WallMirror shape="barocco" className="left-[2%] top-[5%] h-[36%] w-[22%]" />
              <WallMirror shape="goccia" tone="bronzo" className="left-[8%] top-[47%] h-[20%] w-[10%]" />
              <WallMirror shape="ovaleIntagliato" tone="bronzo" className="right-[6%] top-[7%] h-[26%] w-[17%]" />
              <WallMirror shape="ovale" className="right-[4%] top-[38%] h-[22%] w-[10%]" />
              <WallMirror shape="esagono" tone="bronzo" className="right-[16%] top-[56%] h-[12%] w-[13%]" />
            </motion.div>

            <SewingMachine className="bottom-[8%] left-[3%] h-[16%] w-[24%]" />

            {/* luci vintage sopra la parete */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-7">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="size-2.5 rounded-full bg-[oklch(0.97_0.05_86)] shadow-[0_0_26px_10px_oklch(0.92_0.07_86/0.6)]"
                />
              ))}
            </div>

            <div className="relative" style={{ height: stage, width: Math.max(160, stage * 0.42) }}>
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
                const h = Math.min(
                  item.height_cm * (item.scale || 1) * k,
                  Math.max(24, stage - anchor * k),
                );
                const top = item.zone_key === "scarpe" ? stage - h : anchor * k;
                return (
                  <motion.img
                    key={item.id}
                    src={item.processed_image_url ?? item.thumbnail_url ?? ""}
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
          </div>

          <div className="relative px-5 pb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Proporzioni reali · figura di {BODY_HEIGHT_CM} cm
            </p>
            <p className="font-display text-2xl">{formatPrice(total)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
