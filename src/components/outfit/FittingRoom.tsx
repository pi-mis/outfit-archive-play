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

/** Specchi vintage appesi alla parete, di forme e dimensioni diverse. */
function WallMirror({
  className,
  shape,
}: {
  className: string;
  shape: "arco" | "ovale" | "tondo" | "rettangolo";
}) {
  const radius =
    shape === "arco"
      ? "999px 999px 14px 14px"
      : shape === "ovale"
        ? "50%"
        : shape === "tondo"
          ? "50%"
          : "10px";
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        borderRadius: radius,
        border: "7px solid oklch(0.72 0.06 76)",
        background:
          "linear-gradient(150deg, oklch(0.97 0.008 88) 0%, oklch(0.9 0.016 82) 38%, oklch(0.95 0.01 86) 52%, oklch(0.87 0.02 78) 100%)",
        boxShadow:
          "0 18px 30px -18px rgba(70,50,35,0.55), inset 0 0 22px rgba(255,255,255,0.7)",
      }}
      aria-hidden
    />
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
              <WallMirror shape="arco" className="left-[3%] top-[6%] h-[34%] w-[18%]" />
              <WallMirror shape="ovale" className="left-[6%] top-[46%] h-[22%] w-[13%]" />
              <WallMirror shape="tondo" className="right-[5%] top-[9%] size-[15%]" />
              <WallMirror shape="rettangolo" className="right-[3%] top-[32%] h-[30%] w-[17%]" />
            </motion.div>

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
                const h = item.height_cm * (item.scale || 1) * k;
                const anchor = zone?.anchor_y_cm ?? 0;
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
