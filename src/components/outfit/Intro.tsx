import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useI18n } from "@/lib/i18n";
import { rememberIntro } from "@/lib/intro";

const STEPS = [
  { label: "introEyebrow1", title: "introTitle1", body: "introBody1" },
  { label: "introEyebrow2", title: "introTitle2", body: "introBody2" },
  { label: "introEyebrow3", title: "introTitle3", body: "introBody3" },
  { label: "introEyebrow4", title: "introTitle4", body: "introBody4" },
];

const ink = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Ogni scena si disegna a inchiostro: le linee compaiono come tratte a mano. */
function useDraw(reduce: boolean | null) {
  return (delay: number, duration = 0.9) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { duration, delay, ease: "easeInOut" as const },
            opacity: { duration: 0.2, delay },
          },
        };
}

function Scene({ step, reduce }: { step: number; reduce: boolean | null }) {
  const draw = useDraw(reduce);
  const drop = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: -14, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { type: "spring" as const, stiffness: 180, damping: 16, delay },
        };

  if (step === 0) {
    // Un'asta da guardaroba: i capi scendono sulla stanga uno dopo l'altro.
    const hangers = [
      {
        x: 76,
        delay: 0.25,
        body: "M60 52 L76 48 L92 52 L90 116 L62 116 Z",
        detail: "M76 48 V116",
      },
      {
        x: 160,
        delay: 0.45,
        body: "M144 52 L160 48 L176 52 L186 114 q-26 9 -52 0 Z",
        detail: "M147 76 q13 5 26 0",
      },
      {
        x: 244,
        delay: 0.65,
        body: "M228 52 L244 48 L260 52 L258 96 L230 96 Z",
        detail: "M238 50 L244 57 L250 50",
      },
    ];
    return (
      <>
        <motion.path d="M24 40 H296" {...ink} {...draw(0, 0.8)} />
        <motion.path d="M24 32 V48" {...ink} {...draw(0.1, 0.3)} />
        <motion.path d="M296 32 V48" {...ink} {...draw(0.1, 0.3)} />
        {hangers.map((h) => (
          <motion.g key={h.x} {...drop(h.delay)}>
            <path d={`M${h.x} 50 V44 a5 5 0 1 1 5 -4`} {...ink} />
            <path d={`M${h.x - 16} 50 H${h.x + 16}`} {...ink} />
            <motion.path d={h.body} {...ink} {...draw(h.delay + 0.15, 0.7)} />
            <motion.path d={h.detail} {...ink} {...draw(h.delay + 0.5, 0.4)} />
          </motion.g>
        ))}
      </>
    );
  }

  if (step === 1) {
    // Tre capi che scorrono e un lucchetto che si chiude sulla scelta.
    return (
      <>
        <motion.g
          initial={reduce ? false : { x: 26, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.1 }}
        >
          <rect x="30" y="40" width="54" height="78" rx="6" {...ink} opacity={0.4} />
          <path d="M44 52 L57 46 L70 52 L68 108 L46 108 Z" {...ink} opacity={0.4} />
        </motion.g>
        <motion.g
          initial={reduce ? false : { x: 18, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.2 }}
        >
          <rect x="96" y="34" width="62" height="90" rx="7" {...ink} />
          <path d="M112 48 L127 41 L142 48 L148 112 q-21 7 -42 0 Z" {...ink} />
        </motion.g>
        <motion.g
          initial={reduce ? false : { x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.3 }}
        >
          <rect x="170" y="40" width="54" height="78" rx="6" {...ink} opacity={0.4} />
          <path d="M184 52 L197 46 L210 52 L208 96 L186 96 Z" {...ink} opacity={0.4} />
        </motion.g>

        {/* il gesto: un dito che scorre sotto i capi */}
        <motion.path
          d="M92 142 H206"
          {...ink}
          strokeDasharray="2 7"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        />
        {!reduce && (
          <motion.circle
            r="4"
            cy="142"
            fill="currentColor"
            initial={{ cx: 206, opacity: 0 }}
            animate={{ cx: [206, 92, 206], opacity: [0, 1, 0] }}
            transition={{
              duration: 2.4,
              delay: 0.7,
              times: [0, 0.55, 1],
              repeat: Infinity,
              repeatDelay: 0.6,
            }}
          />
        )}

        <g className="text-brass">
          <motion.path
            d="M248 70 V60 a13 13 0 0 1 26 0 V70"
            {...ink}
            initial={reduce ? false : { d: "M248 70 V60 a13 13 0 0 1 26 -8 V60" }}
            animate={{ d: "M248 70 V60 a13 13 0 0 1 26 0 V70" }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.9 }}
          />
          <motion.rect x="240" y="70" width="42" height="34" rx="5" {...ink} {...draw(0.7, 0.5)} />
          <motion.circle
            cx="261"
            cy="85"
            r="3.5"
            {...ink}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.15, type: "spring", stiffness: 300, damping: 16 }}
          />
          <motion.path d="M261 88 V94" {...ink} {...draw(1.25, 0.25)} />
        </g>
      </>
    );
  }

  if (step === 2) {
    // Il manichino e il cartellino: un solo esemplare.
    return (
      <>
        <motion.path d="M150 36 a10 12 0 1 1 0.1 0" {...ink} {...draw(0.1, 0.5)} />
        <motion.path d="M150 48 V56" {...ink} {...draw(0.4, 0.2)} />
        <motion.path
          d="M150 56 c-17 2 -26 9 -28 20 -3 17 2 31 4 46 2 15 -2 20 -2 26 h52 c0 -6 -4 -11 -2 -26 2 -15 7 -29 4 -46 -2 -11 -11 -18 -28 -20 Z"
          {...ink}
          {...draw(0.5, 1.1)}
        />
        <motion.path d="M150 148 V168" {...ink} {...draw(1.3, 0.3)} />
        <motion.path
          d="M128 172 a22 5 0 1 0 44 0 a22 5 0 1 0 -44 0"
          {...ink}
          {...draw(1.45, 0.5)}
        />

        <motion.g
          className="text-brass"
          initial={reduce ? false : { opacity: 0, rotate: -18, y: -8 }}
          animate={{ opacity: 1, rotate: -7, y: 0 }}
          style={{ originX: 204, originY: 78 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.5 }}
        >
          <path d="M182 72 q12 -10 22 -6" {...ink} />
          <rect x="204" y="60" width="62" height="36" rx="4" {...ink} />
          <circle cx="212" cy="68" r="2.6" {...ink} />
          <text
            x="240"
            y="84"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="20"
            fill="currentColor"
            stroke="none"
          >
            1 / 1
          </text>
        </motion.g>
      </>
    );
  }

  // Ago e filo: la cura con cui ogni capo viene scelto e descritto.
  return (
    <>
      <motion.path
        d="M26 128 q32 -42 64 -12 q32 30 64 -14 q30 -42 62 -12"
        {...ink}
        {...draw(0.15, 1.3)}
      />
      <motion.g
        className="text-brass"
        initial={reduce ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <path d="M216 90 L252 56" {...ink} />
        <path d="M219 87 a3 5 0 1 0 4 -4" {...ink} />
      </motion.g>
      <motion.g
        initial={reduce ? false : { opacity: 0, rotate: -14, y: 10 }}
        animate={{ opacity: 1, rotate: -6, y: 0 }}
        style={{ originX: 96, originY: 63 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.7 }}
      >
        <path d="M96 34 h74 a5 5 0 0 1 5 5 v48 a5 5 0 0 1 -5 5 h-74 l-14 -29 Z" {...ink} />
        <circle cx="92" cy="63" r="3.5" {...ink} />
        <path d="M112 52 h50" {...ink} opacity={0.5} />
        <path d="M112 64 h50" {...ink} opacity={0.5} />
        <path d="M112 76 h30" {...ink} opacity={0.5} />
      </motion.g>
    </>
  );
}

export function Intro({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const last = step === STEPS.length - 1;

  const close = useCallback(() => {
    rememberIntro();
    onClose();
  }, [onClose]);

  const go = useCallback((delta: number) => {
    setDirection(delta);
    setStep((prev) => Math.min(STEPS.length - 1, Math.max(0, prev + delta)));
  }, []);

  const next = useCallback(() => {
    if (step === STEPS.length - 1) close();
    else go(1);
  }, [close, go, step]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDirection(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [close, go, next, open]);

  const current = STEPS[step];
  if (!current) return null;
  const slide = reduce ? 0 : 28;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bg-ink/50 fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 backdrop-blur-[3px] sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <motion.div
            className="bg-card relative w-full max-w-[26rem] overflow-hidden rounded-[1.75rem] p-7 pb-6 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.6)] sm:p-9 sm:pb-7"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            drag={reduce ? false : "x"}
            dragElastic={0.1}
            dragMomentum={false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -55) next();
              else if (info.offset.x > 55) go(-1);
            }}
          >
            {/* cornice interna in ottone, come il filo di un cartellino */}
            <span
              aria-hidden="true"
              className="border-brass/35 pointer-events-none absolute inset-[9px] rounded-[1.4rem] border"
            />

            {/* la stanga del guardaroba fa da indicatore di avanzamento */}
            <nav aria-hidden="true" className="relative mx-1 flex items-center justify-between">
              <span className="bg-border absolute inset-x-0 top-[5px] h-px" />
              {STEPS.map((s, i) => (
                <span key={s.title} className="relative flex size-3 items-center justify-center">
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      i === step
                        ? "bg-brass size-2.5 ring-card ring-4"
                        : i < step
                          ? "bg-foreground/55 size-1.5"
                          : "bg-border size-1.5"
                    }`}
                  />
                </span>
              ))}
            </nav>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-2 h-44"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 35%, color-mix(in oklab, var(--brass) 16%, transparent), transparent 70%)",
                }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction * slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -slide }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
                >
                  <div className="text-foreground/85 h-[186px] pt-3">
                    <svg viewBox="0 0 320 186" className="h-full w-full" role="presentation">
                      <Scene step={step} reduce={reduce} />
                    </svg>
                  </div>

                  <div className="min-h-[186px] sm:min-h-[172px]">
                    <p className="text-brass text-[0.6875rem] tracking-[0.22em] uppercase">
                      {t(current.label)}
                    </p>
                    <h2
                      id="intro-title"
                      className="font-display mt-2.5 text-[1.9rem] leading-[1.12] tracking-tight text-balance"
                    >
                      {t(current.title)}
                    </h2>
                    <p className="text-muted-foreground mt-3.5 text-sm leading-[1.75]">
                      {t(current.body)}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={close}
                className="text-muted-foreground hover:text-foreground text-xs tracking-[0.18em] uppercase underline-offset-4 transition-colors hover:underline"
              >
                {last ? t("close") : t("introSkip")}
              </button>
              <button
                type="button"
                onClick={next}
                className="bg-foreground text-background rounded-full px-7 py-3.5 text-xs tracking-[0.18em] uppercase transition-transform active:scale-95"
              >
                {last ? t("introStart") : t("introNext")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
