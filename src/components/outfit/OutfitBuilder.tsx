import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, Download, Circle } from "lucide-react";
import {
  fetchItems,
  fetchItemTypes,
  fetchZones,
  formatPrice,
  zoneDisplayHeight,
  type Item,
} from "@/lib/catalog";
import { exportOutfit } from "@/lib/share";
import { ZoneRow } from "./ZoneRow";
import { ItemSheet } from "./ItemSheet";
import { FittingRoom } from "./FittingRoom";

type Selection = { type: string; index: number; locked: boolean };

export function OutfitBuilder() {
  const zones = useQuery({ queryKey: ["zones"], queryFn: fetchZones });
  const types = useQuery({ queryKey: ["item_types"], queryFn: fetchItemTypes });
  const items = useQuery({ queryKey: ["items"], queryFn: fetchItems });

  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [size, setSize] = useState("all");
  const [showSold, setShowSold] = useState(false);
  const [open, setOpen] = useState<Item | null>(null);
  const [fitting, setFitting] = useState(false);
  const [available, setAvailable] = useState(520);

  useEffect(() => {
    const measure = () => setAvailable(Math.max(340, window.innerHeight - 300));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const sizes = useMemo(
    () => Array.from(new Set((items.data ?? []).map((i) => i.size).filter(Boolean) as string[])).sort(),
    [items.data],
  );

  const selectionFor = useCallback(
    (zoneKey: string): Selection => selections[zoneKey] ?? { type: "all", index: 0, locked: false },
    [selections],
  );

  const itemsFor = useCallback(
    (zoneKey: string) => {
      const sel = selectionFor(zoneKey);
      if (sel.type === "none") return [];
      return (items.data ?? []).filter(
        (item) =>
          item.zone_key === zoneKey &&
          (sel.type === "all" || item.type_key === sel.type) &&
          (size === "all" || item.size === size) &&
          (showSold || item.status !== "venduto"),
      );
    },
    [items.data, selectionFor, size, showSold],
  );

  const spanningTypes = useMemo(
    () => new Set((types.data ?? []).filter((t) => t.spans_two_zones).map((t) => t.key)),
    [types.data],
  );

  const currentOf = useCallback(
    (zoneKey: string) => {
      const list = itemsFor(zoneKey);
      if (!list.length) return null;
      return list[Math.min(selectionFor(zoneKey).index, list.length - 1)] ?? null;
    },
    [itemsFor, selectionFor],
  );

  const topItem = currentOf("top");
  const merged = !!topItem && spanningTypes.has(topItem.type_key);

  const visibleZones = (zones.data ?? []).filter((z) => !(merged && z.key === "bottom"));

  const outfit = visibleZones.map((z) => currentOf(z.key)).filter(Boolean) as Item[];
  const total = outfit.reduce((sum, i) => sum + Number(i.price), 0);

  const update = (zoneKey: string, patch: Partial<Selection>) =>
    setSelections((prev) => ({ ...prev, [zoneKey]: { ...selectionFor(zoneKey), ...patch } }));

  const surprise = () => {
    const spins = 6;
    for (let s = 0; s < spins; s++) {
      setTimeout(() => {
        setSelections((prev) => {
          const next = { ...prev };
          for (const z of zones.data ?? []) {
            const sel = next[z.key] ?? { type: "all", index: 0, locked: false };
            if (sel.locked) continue;
            const count = itemsFor(z.key).length;
            if (!count) continue;
            next[z.key] = { ...sel, index: Math.floor(Math.random() * count) };
          }
          return next;
        });
      }, s * 90);
    }
  };

  if (zones.isLoading || items.isLoading) {
    return <p className="py-24 text-center text-sm text-muted-foreground">Stiamo aprendo l'armadio…</p>;
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="rounded-full border border-border bg-card px-4 py-2 text-xs tracking-wide"
            aria-label="La mia taglia"
          >
            <option value="all">La mia taglia · tutte</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                Taglia {s}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs tracking-wide">
            <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
            Mostra anche l'archivio venduto
          </label>
        </div>

        <div className="flex flex-col items-stretch">
          {visibleZones.map((zone) => (
            <ZoneRow
              key={zone.key}
              label={zone.label}
              allLabel={zone.all_label}
              noneLabel={zone.none_label}
              types={(types.data ?? []).filter((t) => t.zone_key === zone.key)}
              selectedType={selectionFor(zone.key).type}
              onSelectType={(value) => update(zone.key, { type: value, index: 0 })}
              items={itemsFor(zone.key)}
              index={Math.min(selectionFor(zone.key).index, Math.max(itemsFor(zone.key).length - 1, 0))}
              onIndexChange={(i) => update(zone.key, { index: i })}
              locked={selectionFor(zone.key).locked}
              onToggleLock={() => update(zone.key, { locked: !selectionFor(zone.key).locked })}
              onOpenItem={setOpen}
              displayHeight={zoneDisplayHeight(zone.key, available, merged && zone.key === "top")}
            />
          ))}
        </div>

        <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur">
          <span className="text-sm">
            <span className="eyebrow mr-2">Totale</span>
            {formatPrice(total)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportOutfit(outfit, total)}
              aria-label="Salva o condividi outfit"
              className="flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <Download className="size-4" />
            </button>
            <button
              onClick={surprise}
              aria-label="Sorprendimi"
              className="flex size-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <Shuffle className="size-4" />
            </button>
            <button
              onClick={() => setFitting(true)}
              disabled={outfit.length === 0}
              aria-label="Entra nel camerino"
              className="relative flex size-11 items-center justify-center rounded-full bg-[var(--sand)] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.2)] ring-2 ring-primary/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <span className="absolute inset-1.5 rounded-full border border-primary/20" />
              <span className="grid grid-cols-2 gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Circle key={i} className="size-1.5 fill-primary/70 text-primary/70" />
                ))}
              </span>
            </button>
          </div>
        </div>
        <p className="-mt-1 text-center text-[11px] text-muted-foreground">
          Premi il bottone per entrare nel camerino
        </p>
      </div>

      <FittingRoom
        open={fitting}
        onClose={() => setFitting(false)}
        outfit={outfit}
        zones={zones.data ?? []}
        total={total}
      />

      <ItemSheet item={open} onClose={() => setOpen(null)} />
    </>
  );
}
