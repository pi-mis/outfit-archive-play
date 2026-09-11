# Vintage Style Studio

Build a minimal, single-page website for a women's vintage clothing shop: an interactive "outfit builder" game that doubles as a browsable showcase of the entire archive. Visual presentation of the garments is the #1 priority.

## Visual direction

- Extract a palette of 3–5 colors, the textures and the overall mood from the attached reference images. Be inspired by them, don't copy them.

- Minimal and editorial: generous white space, no clutter, the clothes are the protagonists.

- Typography: an elegant editorial serif for the shop name and item names, a clean sans-serif for UI and prices.

- Every garment is shown as a cut-out on a clean background with one consistent, subtle soft shadow (applied in CSS, not baked into the image), so all items look like part of the same photoshoot.

- Motion: smooth, tactile, spring-based; nothing flashy.

- All UI text in Italian.

## Layout (single page, mobile-first)

- Minimal header: shop name/logo placeholder. Small footer: address, opening hours, Instagram, WhatsApp.

- Center of the screen: a vertical "outfit stack" with 5 zones aligned like a paper doll:

  1. Hat

  2. Necklace

  3. Top / jacket

  4. Bottom

  5. Shoes

- Next to each zone, a compact, elegant dropdown to choose the item type:

  - Hat: Tutti, Cappello, Basco, Foulard/fascia, Nessuno

  - Necklace: Tutte, Choker, Corta, Lunga, Nessuna

  - Top: Tutti, Maglietta, Top, Camicia, Maglione, Giacca, Cappotto

  - Bottom: Tutti, Jeans, Pantaloni, Gonna corta, Gonna lunga, Shorts

  - Shoes: Tutte, Basse, Tacco, Stivali, Sandali

  Categories and types must be editable from the admin panel, not hard-coded.

- "Nessuno/Nessuna" leaves the zone empty and the outfit closes up gracefully.

- Dresses and jumpsuits occupy zones 3 and 4 together: when one is selected, the two zones merge into one.

## Game interaction

- Each zone is a horizontal carousel: the user swipes left/right with a finger (drag with the mouse or arrow buttons on desktop) to cycle through available items of the selected type. Items snap into place with a light spring animation; neighboring items peek slightly at the edges.

- Lock icon on each zone: locked items stay fixed when shuffling.

- "Sorprendimi" button: randomizes all unlocked zones with a quick slot-machine-like animation.

- Global "La mia taglia" filter: shows only items in the chosen size.

- Live total price of the current outfit, shown discreetly.

- "Salva / condividi outfit": exports the current outfit as an image in 9:16 story format with the shop's branding.

- Preload adjacent items so swiping is always instant; lazy load everything else. Target 60fps on mid-range phones.

## Proportions and alignment (very important)

- All garments are rendered on one shared scale (pixels per cm), based on real measurements entered in the admin, so a mini skirt looks shorter than a maxi skirt and a cropped top shorter than a long cardigan.

- Each category has an anchor point relative to an invisible body template: hat at head top, necklace at neckline, top at shoulder line, bottom at waistline, shoes at floor line. Items are positioned by their anchor, so any combination lines up naturally.

- Admin can fine-tune scale and offset per item with sliders, previewing it inside a sample outfit.

## Item detail

Tapping a garment opens an elegant bottom sheet (side panel on desktop) with:

- Name, era/decade, brand (if known), size, flat measurements (shoulders, bust, waist, hips, length as relevant), condition and any declared flaws, price.

- Gallery with the REAL original photos, clearly labeled, next to the processed image.

- Buttons: "Tienimelo 24h" (reservation request), "Scrivici su WhatsApp" with a prefilled message containing the item name and code, "Vieni a provarlo".

- Status: disponibile / prenotato / venduto. Sold items are hidden by default; a toggle "Mostra anche l'archivio venduto" shows them with an elegant "Venduto" label.

## Admin panel (for the shop owner, password-protected, phone-first)

Designed for a non-technical user: big buttons, photo-first, minimal typing.

1. Guided camera: an overlay frame per category showing how to shoot (front-facing, flat lay from above, full garment in frame, neutral background, natural light) plus a quick checklist before shooting.

2. Upload of 1 main photo plus optional extra photos (details, label, flaws).

3. Automatic processing pipeline (Supabase Edge Function calling an external image API, provider configurable, API key stored in secrets):

   a. Background removal with clean edges (including hair-thin details like fringe and lace).

   b. Auto-crop to the garment's bounding box and straighten it.

   c. Exposure, white balance and contrast normalization so all items share the same look. Never alter the garment's real colors.

   d. Scaling to the shared px/cm scale using the entered measurements; placement on a transparent canvas with the category's anchor point.

   e. Export as transparent WebP in two sizes (thumbnail + high-res). Always keep the original.

4. Optional "Rifinitura AI" step (e.g. ghost-mannequin effect or wrinkle cleanup) that preserves the real garment: prints, logos, buttons, stitching and flaws must remain unchanged. Show original and result side by side; nothing is published without explicit approval.

5. Short form: category, type, size, measurements, price, era, condition/flaws, notes. Fields prefilled where possible (e.g. AI suggestion of type and era from the photo, editable).

6. Inventory list with search and filters, quick status change (disponibile/prenotato/venduto), reservation requests list.

## Tech

- React + TypeScript + Tailwind, Supabase (Lovable Cloud) for database, storage, auth for the admin.

- Items table: id, code, category, type, name, era, brand, size, measurements (json), condition, flaws, price, status, original_photos[], processed_image_url, thumbnail_url, scale, offset_x, offset_y, created_at.

- Seed the catalog with ~10 placeholder items per zone (simple flat illustrations are fine) so the game can be tested before real photos are uploaded.

Build order: first the single-page outfit builder with seed data and the item detail sheet; then the admin panel with guided upload; then the image processing pipeline and the AI refinement step.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://outfit-archive-play.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54f626d2-9c9e-411f-bae3-0874599acc8c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
