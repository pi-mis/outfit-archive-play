// Generates simple flat garment illustrations (SVG cut-outs) used as seed data
// until the shop owner uploads real photos.
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/garments";
mkdirSync(OUT, { recursive: true });

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;

const shapes = {
  cappello: (c, c2) =>
    svg(400, 220, `<ellipse cx="200" cy="170" rx="185" ry="42" fill="${c}"/><path d="M105 170c0-70 20-120 95-120s95 50 95 120z" fill="${c}"/><rect x="105" y="140" width="190" height="22" rx="11" fill="${c2}"/>`),
  basco: (c, c2) =>
    svg(400, 200, `<path d="M60 140c0-70 60-110 140-110s140 40 140 110c0 22-60 34-140 34S60 162 60 140z" fill="${c}"/><circle cx="200" cy="26" r="14" fill="${c2}"/>`),
  foulard: (c, c2) =>
    svg(400, 200, `<path d="M40 40h320l-160 140z" fill="${c}"/><path d="M120 40h80l-40 90z" fill="${c2}" opacity=".55"/>`),
  choker: (c, c2) =>
    svg(400, 120, `<path d="M60 30c40 46 240 46 280 0" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="200" cy="66" r="16" fill="${c2}"/>`),
  corta: (c, c2) =>
    svg(400, 200, `<path d="M70 20c30 110 230 110 260 0" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="200" cy="118" r="26" fill="${c2}"/>`),
  lunga: (c, c2) =>
    svg(400, 300, `<path d="M80 20c20 200 220 200 240 0" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="200" cy="214" rx="22" ry="34" fill="${c2}"/>`),
  maglietta: (c, c2) =>
    svg(400, 340, `<path d="M140 30l-95 55 40 65 45-24v184h140V126l45 24 40-65-95-55c-20 26-100 26-120 0z" fill="${c}"/><path d="M140 30c20 26 100 26 120 0" stroke="${c2}" stroke-width="8" fill="none"/>`),
  top: (c, c2) =>
    svg(400, 260, `<path d="M120 20c25 40 135 40 160 0 20 60 22 150 10 210H110C98 170 100 80 120 20z" fill="${c}"/><path d="M120 20c25 40 135 40 160 0" stroke="${c2}" stroke-width="7" fill="none"/>`),
  camicia: (c, c2) =>
    svg(400, 380, `<path d="M145 30l-100 58 42 70 43-24v220h140V134l43 24 42-70-100-58-55 40z" fill="${c}"/><path d="M200 70v250" stroke="${c2}" stroke-width="6"/><path d="M145 30l55 40 55-40" stroke="${c2}" stroke-width="8" fill="none"/>`),
  maglione: (c, c2) =>
    svg(400, 400, `<path d="M135 34l-105 62 30 130 55-26v170h170V200l55 26 30-130-105-62c-24 30-106 30-130 0z" fill="${c}"/><rect x="115" y="336" width="170" height="24" fill="${c2}" opacity=".5"/>`),
  giacca: (c, c2) =>
    svg(400, 420, `<path d="M140 30l-105 60 34 140 46-24v184h170V206l46 24 34-140-105-60-60 54z" fill="${c}"/><path d="M140 30l60 54 60-54" stroke="${c2}" stroke-width="10" fill="none"/><path d="M200 84v306" stroke="${c2}" stroke-width="5"/>`),
  cappotto: (c, c2) =>
    svg(400, 520, `<path d="M140 30l-110 66 34 150 46-26v300h180V220l46 26 34-150-110-66-60 54z" fill="${c}"/><path d="M140 30l60 54 60-54" stroke="${c2}" stroke-width="10" fill="none"/><circle cx="215" cy="230" r="8" fill="${c2}"/><circle cx="215" cy="300" r="8" fill="${c2}"/>`),
  abito: (c, c2) =>
    svg(400, 620, `<path d="M130 30c30 38 110 38 140 0 24 44 30 110 24 160-8 66 26 300 26 400H80c0-100 34-334 26-400-6-50 0-116 24-160z" fill="${c}"/><path d="M130 30c30 38 110 38 140 0" stroke="${c2}" stroke-width="8" fill="none"/>`),
  tuta: (c, c2) =>
    svg(400, 620, `<path d="M130 30c30 38 110 38 140 0 20 50 24 120 20 170l14 400h-90l-14-250-14 250H96l14-400c-4-50 0-120 20-170z" fill="${c}"/><path d="M130 30c30 38 110 38 140 0" stroke="${c2}" stroke-width="8" fill="none"/>`),
  jeans: (c, c2) =>
    svg(400, 560, `<path d="M100 20h200l16 100-22 420h-84l-10-300-10 300H106L84 120z" fill="${c}"/><path d="M100 20h200" stroke="${c2}" stroke-width="14"/><path d="M200 60v180" stroke="${c2}" stroke-width="5" opacity=".6"/>`),
  pantaloni: (c, c2) =>
    svg(400, 560, `<path d="M104 20h192l10 90-26 430h-70l-10-290-10 290H120L94 110z" fill="${c}"/><rect x="104" y="20" width="192" height="20" fill="${c2}" opacity=".6"/>`),
  "gonna-corta": (c, c2) =>
    svg(400, 260, `<path d="M120 20h160l50 220H70z" fill="${c}"/><rect x="120" y="20" width="160" height="20" fill="${c2}" opacity=".6"/>`),
  "gonna-lunga": (c, c2) =>
    svg(400, 520, `<path d="M125 20h150l75 480H50z" fill="${c}"/><rect x="125" y="20" width="150" height="20" fill="${c2}" opacity=".6"/>`),
  shorts: (c, c2) =>
    svg(400, 220, `<path d="M104 20h192l14 190h-96l-14-90-14 90H90z" fill="${c}"/><rect x="104" y="20" width="192" height="18" fill="${c2}" opacity=".6"/>`),
  basse: (c, c2) =>
    svg(400, 150, `<path d="M40 110c0-40 20-70 60-70 30 0 40 26 74 40 40 16 74 8 74 30v20H40z" fill="${c}"/><path d="M226 130h-186" stroke="${c2}" stroke-width="14"/><path d="M212 110c0-40 20-70 60-70 30 0 40 26 74 40 40 16 74 8 74 30v20H212z" fill="${c}" opacity=".85"/>`),
  tacco: (c, c2) =>
    svg(400, 200, `<path d="M50 150c0-70 30-120 90-120 40 0 60 40 110 70 30 18 50 20 50 40v10H50z" fill="${c}"/><path d="M290 150l6 40h16l-8-40z" fill="${c2}"/><path d="M180 150c0-70 30-120 90-120" stroke="${c2}" stroke-width="0" fill="none"/>`),
  stivali: (c, c2) =>
    svg(400, 420, `<path d="M110 20h90v300l70 40v40H110z" fill="${c}"/><path d="M110 360h160" stroke="${c2}" stroke-width="16"/><path d="M230 20h60v340h-60z" fill="${c}" opacity=".85"/>`),
  sandali: (c, c2) =>
    svg(400, 160, `<path d="M60 110h180c14 0 14 28 0 28H60c-14 0-14-28 0-28z" fill="${c}"/><path d="M80 110l60-70M200 110l-50-70" stroke="${c2}" stroke-width="12" stroke-linecap="round"/>`),
};

const palettes = [
  ["#3a2a20", "#c9b49a"],
  ["#8a6a4b", "#efe6d6"],
  ["#c9b49a", "#3a2a20"],
  ["#5c5148", "#d8cdbc"],
  ["#a8503a", "#f0e4d4"],
  ["#2f3a3a", "#c9b49a"],
  ["#6f7a63", "#efe6d6"],
  ["#1c1a19", "#b9a184"],
  ["#d8cdbc", "#8a6a4b"],
  ["#7a4b52", "#efe6d6"],
];

let count = 0;
for (const [type, draw] of Object.entries(shapes)) {
  palettes.forEach(([c, c2], i) => {
    writeFileSync(`${OUT}/${type}-${i + 1}.svg`, draw(c, c2));
    count++;
  });
}
console.log("generated", count, "svg files");
