import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { Item, Zone } from "@/lib/catalog";
import { BODY_HEIGHT_CM, formatPrice } from "@/lib/catalog";

/** Manichino bianco, posa naturale, nessun dettaglio del viso. */
function Mannequin({ height }: { height: number }) {
  return (
    <svg
      viewBox="0 0 120 340"
      style={{ height }}
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      aria-hidden
    >
      <defs>
        <linearGradient id="mq" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e9e6e1" />
          <stop offset="35%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dedad4" />
        </linearGradient>
      </defs>
      <g fill="url(#mq)">
        <ellipse cx="60" cy="22" rx="14" ry="18" />
        <rect x="55" y="38" width="10" height="12" rx="5" />
        <path d="M40 52c6-5 34-5 40 0 7 5 9 34 8 52-1 14-4 24-6 32H38c-2-8-5-18-6-32-1-18 1-47 8-52Z" />
        <path d="M36 58c-8 8-12 30-13 52-1 8 5 9 6 1 2-20 6-36 11-43Z" />
        <path d="M84 58c8 8 12 30 13 52 1 8-5 9-6 1-2-20-6-36-11-43Z" />
        <path d="M40 138h16c2 26 2 60 1 90-1 12-2 22-3 30h-14c1-14 2-34 2-60 0-24-1-42-2-60Z" />
        <path d="M64 138h16c-1 18-2 36-2 60 0 26 1 46 2 60H66c-1-8-2-18-3-30-1-30-1-64 1-90Z" />
        <rect x="39" y="256" width="15" height="8" rx="4" />
        <rect x="66" y="256" width="15" height="8" rx="4" />
      </g>
    </svg>
  );
}

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
    const measure = () => setStage(Math.max(320, Math.min(620, window.innerHeight - 260)));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const k = stage / BODY_HEIGHT_CM;
  const zoneOf = (key: string) => zones.find((z) => z.key === key);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[oklch(0.30_0.02_60)]"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[11px] tracking-[0.22em] text-background/70 uppercase">Camerino</p>
            <button
              onClick={onClose}
              aria-label="Esci dal camerino"
              className="flex size-9 items-center justify-center rounded-full border border-background/25 text-background"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative flex flex-1 items-end justify-center overflow-hidden pb-6">
            {/* luci vintage */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-6 px-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="size-3 rounded-full bg-[oklch(0.95_0.06_85)] shadow-[0_0_28px_10px_oklch(0.9_0.08_85/0.55)]"
                />
              ))}
            </div>

            {/* specchio vintage */}
            <div
              className="relative rounded-[999px_999px_28px_28px] border-[10px] border-[oklch(0.62_0.05_75)] bg-[radial-gradient(120%_80%_at_50%_10%,oklch(0.94_0.012_88),oklch(0.86_0.02_80))] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
              style={{ height: stage + 80, width: Math.min(360, stage * 0.66) }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[999px_999px_20px_20px]">
                <div className="absolute inset-x-0 bottom-4" style={{ height: stage }}>
                  <Mannequin height={stage} />
                  {outfit.map((item) => {
                    const zone = zoneOf(item.zone_key);
                    const h = item.height_cm * (item.scale || 1) * k;
                    const anchor = zone?.anchor_y_cm ?? 0;
                    const top = Math.max(
                      0,
                      Math.min(stage - h, item.zone_key === "scarpe" ? stage - h : anchor * k),
                    );
                    return (
                      <img
                        key={item.id}
                        src={item.processed_image_url ?? item.thumbnail_url ?? ""}
                        alt={item.name}
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
            </div>
          </div>

          <div className="px-5 pb-6 text-center">
            <p className="text-sm text-background/80">
              Proporzioni reali · su una figura di {BODY_HEIGHT_CM} cm
            </p>
            <p className="font-display text-2xl text-background">{formatPrice(total)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
