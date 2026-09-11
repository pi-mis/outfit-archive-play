import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchItemTypes,
  fetchItems,
  fetchZones,
  formatPrice,
  MEASURE_LABELS,
  type Item,
  type ItemStatus,
} from "@/lib/catalog";
import { blobToDataUrl, dataUrlToBlob, shrinkImage, suggestCode, uploadPhoto } from "@/lib/admin";
import { cutoutGarment } from "@/lib/imaging.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Gestione archivio · Baci & Bottoni" },
      { name: "description", content: "Pannello riservato per caricare e gestire i capi dell'archivio." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Gestione archivio · Baci & Bottoni" },
      { property: "og:description", content: "Pannello riservato per caricare e gestire i capi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const STATUSES: ItemStatus[] = ["disponibile", "prenotato", "venduto"];
const MEASURE_KEYS = Object.keys(MEASURE_LABELS);

const field =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base text-foreground outline-none focus:border-foreground/40";
const labelCls = "eyebrow text-muted-foreground";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"nuovo" | "archivio" | "prenotazioni">("nuovo");

  const zones = useQuery({ queryKey: ["zones"], queryFn: fetchZones });
  const types = useQuery({ queryKey: ["item_types"], queryFn: fetchItemTypes });
  const items = useQuery({ queryKey: ["items"], queryFn: fetchItems });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-8 sm:px-8">
      <header className="mx-auto flex max-w-3xl items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Area riservata</p>
          <h1 className="font-serif text-3xl text-foreground">Gestione archivio</h1>
        </div>
        <button onClick={signOut} className="text-xs uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4">
          Esci
        </button>
      </header>

      <nav className="mx-auto mt-6 flex max-w-3xl gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            ["nuovo", "Nuovo capo"],
            ["archivio", "Archivio"],
            ["prenotazioni", "Prenotazioni"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${
              tab === key
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mx-auto mt-8 max-w-3xl">
        {tab === "nuovo" ? (
          <NewItemWizard zones={zones.data ?? []} types={types.data ?? []} />
        ) : null}
        {tab === "archivio" ? <ArchiveList items={items.data ?? []} loading={items.isLoading} /> : null}
        {tab === "prenotazioni" ? <Reservations /> : null}
      </div>
    </main>
  );
}

/* ------------------------------- new item ------------------------------- */

type Photo = { file: File; preview: string };

function NewItemWizard({
  zones,
  types,
}: {
  zones: { key: string; label: string }[];
  types: { key: string; label: string; zone_key: string }[];
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [zoneKey, setZoneKey] = useState("");
  const [typeKey, setTypeKey] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    era: "",
    brand: "",
    size: "",
    condition: "",
    flaws: "",
    price: "",
    height_cm: "60",
    status: "disponibile" as ItemStatus,
    notes: "",
  });
  const [measures, setMeasures] = useState<Record<string, string>>({});
  const [cutout, setCutout] = useState<{ blob: Blob; preview: string } | null>(null);
  const [cutting, setCutting] = useState(false);
  const runCutout = useServerFn(cutoutGarment);

  async function makeCutout() {
    const source = photos[mainIndex] ?? photos[0];
    if (!source) return;
    setCutting(true);
    try {
      const small = await shrinkImage(source.file, 1200);
      const dataUrl = await blobToDataUrl(small);
      const result = await runCutout({ data: { dataUrl } });
      const blob = await dataUrlToBlob(result.dataUrl);
      if (cutout) URL.revokeObjectURL(cutout.preview);
      setCutout({ blob, preview: URL.createObjectURL(blob) });
      toast.success("Capo scontornato, controlla l'anteprima");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scontorno non riuscito");
    } finally {
      setCutting(false);
    }
  }

  const zoneTypes = useMemo(() => types.filter((t) => t.zone_key === zoneKey), [types, zoneKey]);

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    if (cutout) URL.revokeObjectURL(cutout.preview);
    setCutout(null);
    setMainIndex(0);
    setZoneKey("");
    setTypeKey("");
    setStep(0);
    setMeasures({});
    setForm({
      code: "",
      name: "",
      era: "",
      brand: "",
      size: "",
      condition: "",
      flaws: "",
      price: "",
      height_cm: "60",
      status: "disponibile",
      notes: "",
    });
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next]);
  }

  async function save() {
    setSaving(true);
    try {
      const code = form.code.trim() || suggestCode(typeKey);
      const uploaded: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const blob = await shrinkImage(photos[i]!.file);
        const { url } = await uploadPhoto(blob, code, i);
        uploaded.push(url);
      }
      let main = uploaded[mainIndex] ?? uploaded[0] ?? null;
      if (cutout) {
        const { url } = await uploadPhoto(cutout.blob, code, 900, "png");
        main = url;
      }

      const cleanMeasures: Record<string, number> = {};
      for (const key of MEASURE_KEYS) {
        const value = Number(measures[key]);
        if (measures[key] && !Number.isNaN(value)) cleanMeasures[key] = value;
      }

      const { error } = await supabase.from("items").insert({
        code,
        zone_key: zoneKey,
        type_key: typeKey,
        name: form.name.trim() || "Capo vintage",
        era: form.era.trim() || null,
        brand: form.brand.trim() || null,
        size: form.size.trim() || null,
        measurements: cleanMeasures,
        condition: form.condition.trim() || null,
        flaws: form.flaws.trim() || null,
        price: Number(form.price) || 0,
        status: form.status,
        original_photos: uploaded,
        processed_image_url: main,
        thumbnail_url: main,
        height_cm: Number(form.height_cm) || 60,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(`Capo ${code} aggiunto all'archivio`);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <ol className="flex gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
        {["Categoria", "Foto", "Dettagli"].map((label, i) => (
          <li
            key={label}
            className={`flex-1 border-t-2 pt-2 ${i <= step ? "border-foreground text-foreground" : "border-border"}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="space-y-6">
          <div>
            <p className={labelCls}>Dove si indossa</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {zones.map((zone) => (
                <button
                  key={zone.key}
                  onClick={() => {
                    setZoneKey(zone.key);
                    setTypeKey("");
                  }}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    zoneKey === zone.key ? "border-foreground bg-foreground text-background" : "border-border bg-card"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {zoneKey ? (
            <div>
              <p className={labelCls}>Tipo di capo</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {zoneTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => {
                      setTypeKey(type.key);
                      setForm((f) => ({ ...f, code: f.code || suggestCode(type.key) }));
                    }}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      typeKey === type.key ? "border-foreground bg-foreground text-background" : "border-border bg-card"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <StepNav
            nextLabel="Passa alle foto"
            disabled={!zoneKey || !typeKey}
            onNext={() => setStep(1)}
          />
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Appendi il capo su fondo chiaro e uniforme, inquadralo intero e tieni il telefono dritto.
            Scatta una foto frontale, una del retro e un dettaglio di tessuto o etichetta.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-border bg-card py-8 text-sm uppercase tracking-[0.2em] text-muted-foreground"
          >
            Scatta o scegli foto
          </button>

          {photos.length ? (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={photo.preview} className="relative">
                  <button onClick={() => setMainIndex(i)} className="block w-full">
                    <img
                      src={photo.preview}
                      alt={`Foto ${i + 1}`}
                      className={`aspect-[3/4] w-full rounded-xl object-cover ${
                        mainIndex === i ? "ring-2 ring-foreground" : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(photo.preview);
                      setPhotos((prev) => prev.filter((_, idx) => idx !== i));
                      setMainIndex(0);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-background/90 px-2 py-0.5 text-xs"
                  >
                    ×
                  </button>
                  {mainIndex === i ? (
                    <span className="mt-1 block text-center text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                      principale
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {photos.length ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Scontorna la foto principale: lo sfondo viene rimosso e il capo raddrizzato,
                pronto per il gioco degli abbinamenti.
              </p>
              <button
                onClick={makeCutout}
                disabled={cutting}
                className="w-full rounded-full bg-foreground py-3 text-sm uppercase tracking-[0.2em] text-background disabled:opacity-50"
              >
                {cutting ? "Elaborazione…" : cutout ? "Riprova lo scontorno" : "Scontorna con AI"}
              </button>
              {cutout ? (
                <div className="flex items-center gap-4">
                  <img
                    src={cutout.preview}
                    alt="Capo scontornato"
                    className="h-32 w-24 rounded-xl bg-secondary object-contain p-1"
                  />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(cutout.preview);
                      setCutout(null);
                    }}
                    className="text-xs uppercase tracking-[0.18em] text-muted-foreground underline"
                  >
                    Usa la foto originale
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <StepNav
            onBack={() => setStep(0)}
            nextLabel="Aggiungi i dettagli"
            disabled={photos.length === 0}
            onNext={() => setStep(2)}
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome del capo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Codice" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
            <Field label="Epoca" value={form.era} onChange={(v) => setForm({ ...form, era: v })} placeholder="Anni '70" />
            <Field label="Marca" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="Taglia" value={form.size} onChange={(v) => setForm({ ...form, size: v })} placeholder="M / 42" />
            <Field label="Prezzo (€)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
            <Field
              label="Altezza reale del capo (cm)"
              value={form.height_cm}
              onChange={(v) => setForm({ ...form, height_cm: v })}
              type="number"
            />
            <div>
              <span className={labelCls}>Stato</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ItemStatus })}
                className={field}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className={labelCls}>Misure (cm)</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MEASURE_KEYS.map((key) => (
                <input
                  key={key}
                  type="number"
                  placeholder={MEASURE_LABELS[key]}
                  value={measures[key] ?? ""}
                  onChange={(e) => setMeasures({ ...measures, [key]: e.target.value })}
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-base"
                />
              ))}
            </div>
          </div>

          <Field label="Condizioni" value={form.condition} onChange={(v) => setForm({ ...form, condition: v })} />
          <Field label="Difetti" value={form.flaws} onChange={(v) => setForm({ ...form, flaws: v })} />
          <Field label="Note interne" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

          <StepNav
            onBack={() => setStep(1)}
            nextLabel={saving ? "Salvataggio…" : "Salva nell'archivio"}
            disabled={saving}
            onNext={save}
          />
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </label>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  disabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {onBack ? (
        <button onClick={onBack} className="rounded-full border border-border px-5 py-3 text-xs uppercase tracking-[0.2em]">
          Indietro
        </button>
      ) : null}
      <button
        onClick={onNext}
        disabled={disabled}
        className="flex-1 rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  );
}

/* -------------------------------- archive -------------------------------- */

function ArchiveList({ items, loading }: { items: Item[]; loading: boolean }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Item> }) => {
      const { error } = await supabase.from("items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Modifica non riuscita"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Capo eliminato");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Eliminazione non riuscita"),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.name, item.code, item.brand, item.size].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [items, query]);

  if (loading) return <p className="text-sm text-muted-foreground">Carico l'archivio…</p>;

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca per nome, codice, marca…"
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base"
      />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{filtered.length} capi</p>

      <ul className="space-y-3">
        {filtered.slice(0, 200).map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt={item.name} className="h-16 w-14 rounded-lg object-contain" />
            ) : (
              <div className="h-16 w-14 rounded-lg bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.code} · {formatPrice(item.price)} {item.size ? `· ${item.size}` : ""}
              </p>
            </div>
            <select
              value={item.status}
              onChange={(e) => update.mutate({ id: item.id, patch: { status: e.target.value as ItemStatus } })}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (confirm(`Eliminare ${item.name}?`)) remove.mutate(item.id);
              }}
              className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- reservations ----------------------------- */

type Reservation = {
  id: string;
  item_id: string;
  customer_name: string;
  contact: string;
  message: string | null;
  handled: boolean;
  created_at: string;
};

function Reservations() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("reservations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (rows ?? []) as Reservation[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      const { error } = await supabase.from("reservations").update({ handled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carico le richieste…</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">Nessuna prenotazione al momento.</p>;

  return (
    <ul className="space-y-3">
      {data.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-lg text-foreground">{r.customer_name}</p>
              <p className="text-sm text-muted-foreground">{r.contact}</p>
              {r.message ? <p className="mt-1 text-sm text-foreground/80">{r.message}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString("it-IT")}
              </p>
            </div>
            <button
              onClick={() => toggle.mutate({ id: r.id, handled: !r.handled })}
              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.15em] ${
                r.handled ? "border-border text-muted-foreground" : "border-foreground bg-foreground text-background"
              }`}
            >
              {r.handled ? "Gestita" : "Segna gestita"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
