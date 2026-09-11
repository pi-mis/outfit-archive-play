import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, LockOpen } from "lucide-react";
import type { Item, ItemType } from "@/lib/catalog";
import { itemHeightPx } from "@/lib/catalog";
import { GarmentImage } from "./GarmentImage";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.7 };

export function ZoneRow({
  label,
  allLabel,
  noneLabel,
  types,
  selectedType,
  onSelectType,
  items,
  index,
  onIndexChange,
  locked,
  onToggleLock,
  onOpenItem,
}: {
  label: string;
  allLabel: string;
  noneLabel: string;
  types: ItemType[];
  selectedType: string;
  onSelectType: (value: string) => void;
  items: Item[];
  index: number;
  onIndexChange: (i: number) => void;
  locked: boolean;
  onToggleLock: () => void;
  onOpenItem: (item: Item) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const x = useMotionValue(0);
  const empty = selectedType === "none" || items.length === 0;
  const current = items[Math.min(index, Math.max(items.length - 1, 0))];
  const slide = Math.max(140, width * 0.68);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    setWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = width / 2 - slide / 2 - index * slide;
  useEffect(() => {
    const controls = animate(x, target, SPRING);
    return () => controls.stop();
  }, [target, x]);

  const rowHeight = empty || !current ? 0 : itemHeightPx(current) + 12;

  const step = (delta: number) => {
    if (!items.length) return;
    onIndexChange(Math.min(items.length - 1, Math.max(0, index + delta)));
  };

  return (
    <motion.section
      layout
      animate={{ height: rowHeight + 34 }}
      transition={SPRING}
      className="relative w-full overflow-visible"
      aria-label={label}
    >
      <div className="mb-1 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="eyebrow">{label}</span>
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs tracking-wide text-foreground outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Tipo ${label}`}
          >
            <option value="all">{allLabel}</option>
            {types.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
            <option value="none">{noneLabel}</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Precedente"
            className="hidden size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Successivo"
            className="hidden size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggleLock}
            aria-pressed={locked}
            aria-label={locked ? "Sblocca" : "Blocca"}
            className={`flex size-7 items-center justify-center rounded-full transition-colors ${
              locked ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {locked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
          </button>
        </div>
      </div>

      <div ref={ref} className="relative w-full overflow-hidden" style={{ height: rowHeight }}>
        {!empty && (
          <motion.div
            className="absolute inset-y-0 left-0 flex cursor-grab items-end active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const delta = info.offset.x < -40 || info.velocity.x < -400 ? 1 : info.offset.x > 40 || info.velocity.x > 400 ? -1 : 0;
              step(delta);
              animate(x, width / 2 - slide / 2 - Math.min(items.length - 1, Math.max(0, index + delta)) * slide, SPRING);
            }}
          >
            {items.map((item, i) => {
              const near = Math.abs(i - index) <= 1;
              return (
                <div key={item.id} className="flex items-end justify-center" style={{ width: slide }}>
                  <motion.button
                    type="button"
                    onClick={() => i === index && onOpenItem(item)}
                    animate={{ opacity: i === index ? 1 : 0.35, scale: i === index ? 1 : 0.9 }}
                    transition={SPRING}
                    className="flex items-end justify-center"
                  >
                    {near ? <GarmentImage item={item} eager /> : <GarmentImage item={item} />}
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
