import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Hand, Leaf, Shirt, Sparkles } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { rememberIntro } from "@/lib/intro";

const STEPS = [
  { eyebrow: "introEyebrow1", title: "introTitle1", body: "introBody1", Icon: Sparkles },
  { eyebrow: "introEyebrow2", title: "introTitle2", body: "introBody2", Icon: Hand },
  { eyebrow: "introEyebrow3", title: "introTitle3", body: "introBody3", Icon: Shirt },
  { eyebrow: "introEyebrow4", title: "introTitle4", body: "introBody4", Icon: Leaf },
];

export function Intro({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
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
  const { Icon } = current;
  const slide = reduceMotion ? 0 : 36;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bg-ink/45 fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <motion.div
            className="border-border bg-card relative w-full max-w-md overflow-hidden rounded-3xl border p-6 pb-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] sm:p-8 sm:pb-6"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            drag={reduceMotion ? false : "x"}
            dragElastic={0.12}
            dragMomentum={false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60) go(-1);
            }}
          >
            <div className="flex gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span key={s.title} className="bg-border h-0.5 flex-1 overflow-hidden rounded-full">
                  <motion.span
                    className="bg-foreground block h-full"
                    initial={false}
                    animate={{ scaleX: i <= step ? 1 : 0 }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: reduceMotion ? 0 : 0.35 }}
                  />
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * slide }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -slide }}
                transition={{ duration: reduceMotion ? 0 : 0.28 }}
                className="min-h-[256px] pt-7 sm:min-h-[240px]"
              >
                <motion.span
                  className="bg-secondary text-foreground mb-4 flex size-11 items-center justify-center rounded-full"
                  initial={reduceMotion ? false : { scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <Icon className="size-5" strokeWidth={1.5} />
                </motion.span>

                <p className="eyebrow">{t(current.eyebrow)}</p>
                <h2
                  id="intro-title"
                  className="font-display mt-2 text-[1.75rem] leading-[1.15] tracking-tight"
                >
                  {t(current.title)}
                </h2>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {t(current.body)}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={close}
                className="text-muted-foreground text-xs tracking-[0.2em] uppercase underline underline-offset-4"
              >
                {last ? t("close") : t("introSkip")}
              </button>
              <button
                type="button"
                onClick={next}
                className="bg-foreground text-background rounded-full px-6 py-3 text-xs tracking-[0.2em] uppercase transition-transform active:scale-95"
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
