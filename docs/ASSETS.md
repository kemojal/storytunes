# StoryTunes — Image Asset Spec

Every image the website needs, with size, format, where it's used, and a
ready-to-use AI generation prompt. Drop finished files into
`apps/web/public/` at the paths below (referenced as `/filename`).

## Brand palette (for designers / prompts)

Approximate hex of the warm theme (`apps/web/src/styles.css`):

| Token | Hex (approx) | Use |
| --- | --- | --- |
| Cream background | `#FBF7F0` | page surface |
| Card | `#FEFDFB` | cards |
| Espresso ink | `#3B2F27` | text |
| Primary (espresso-plum) | `#43332B` | buttons, logo bg |
| Soft gold | `#D2A24C` | accents, highlights |
| Warm rose | `#C96B62` | emphasis, hearts |
| Sand / border | `#E7DFD3` | borders, dividers |

**House style for all imagery:** warm, soft, premium, emotional, family-friendly.
Cream/golden light, gentle film grain, soft shadows, rounded shapes, editorial.
Avoid: cold tech/AI aesthetics, neon, harsh contrast, stock-photo cheesiness,
real celebrities, copyrighted characters.

Fonts: **Fraunces** (display) + **Manrope** (body) — for any baked-in text.

---

## 1. Brand & icons (required)

| File | Size | Format | Purpose / used in |
| --- | --- | --- | --- |
| `logo-mark.svg` | 96×96 (scalable) | SVG | App mark. ✅ starter included — replace if desired. Source for favicons/app icons. |
| `logo-wordmark.svg` | ~640×160 | SVG | "StoryTunes" wordmark (Fraunces, espresso + gold note). Footer / email header. |
| `favicon.ico` | 16/32/48 multi | ICO | Browser tab. Replace cta default. |
| `favicon.svg` | 32×32 | SVG | Modern favicon. |
| `apple-touch-icon.png` | 180×180 | PNG | iOS home screen. |
| `icon-192.png` | 192×192 | PNG | PWA (manifest). Replaces `logo192.png`. |
| `icon-512.png` | 512×512 | PNG | PWA (manifest). Replaces `logo512.png`. |
| `icon-maskable-512.png` | 512×512 (safe-zone padded) | PNG | Android maskable. |

> Generate the PNGs/ICO from the SVG mark (e.g. `npx pwa-asset-generator` or
> realfavicongenerator.net). Keep the espresso rounded-square + gold note.

**Prompt (if regenerating the mark):** "Minimal app icon, rounded square in deep
espresso brown, a single elegant gold music note centered, tiny warm-rose accent
dot, flat, premium, no text, soft."

---

## 2. Social / SEO (required)

| File | Size | Format | Used in |
| --- | --- | --- | --- |
| `og-image.png` | 1200×630 | PNG | Open Graph (link previews, FB/iMessage/LinkedIn). Wire in `__root.tsx` head `meta`. |
| `og-image-twitter.png` | 1200×600 | PNG | Twitter/X `summary_large_image`. |

**Content:** cream background, Fraunces headline "Turn your story into a song they'll
never forget.", small logo mark, a hint of a vinyl/handwritten letter, soft gold glow.

**Prompt:** "Open Graph banner 1200×630, warm cream background with soft gold corner
glow, elegant serif headline space on the left, a softly lit vinyl record and a
handwritten letter on the right, premium, emotional, minimal, film-grain."

---

## 3. Home / marketing (recommended)

| File | Size | Format | Used in (route) |
| --- | --- | --- | --- |
| `hero-art.webp` | 1600×1200 | WebP | Optional hero visual beside/behind headline (`routes/index.tsx`). |
| `texture-grain.png` | 600×600 (tileable) | PNG (transparent) | Subtle global grain overlay (optional). |
| `step-1.svg` … `step-5.svg` | 64×64 | SVG | "How it works" step icons (replace the numbered circles) — pen, heart, music note, waveform, gift. |
| `occasion-anniversary.webp` … | 400×300 each | WebP | Optional thumbnails for occasion chips (anniversary, birthday, wedding, proposal, mothers-day, fathers-day, long-distance, apology, friendship, just-because). |
| `moment-1/2/3.webp` | 800×600 | WebP | Optional imagery for the 3 "reaction moment" cards. |

**Hero prompt:** "Warm, cinematic still life: a phone showing a song playing, resting
on a handwritten letter, soft morning light, cream and gold tones, shallow depth of
field, emotional, premium, no text."

**Occasion thumb prompt (template):** "{occasion} moment, warm cream and gold palette,
soft and intimate, a couple/family suggested not shown in detail, gentle film grain,
premium editorial, no text, no faces in sharp focus."

**Step icon prompt:** "Set of 5 minimalist line icons, single warm-gold stroke on
transparent, rounded, consistent weight: 1) pen writing, 2) heart, 3) music note,
4) sound wave, 5) wrapped gift."

---

## 4. Artists (recommended — currently a gray placeholder)

`routes/artists.tsx` and the wizard's artist step render a gray circle. Replace with
real avatars.

| File | Size | Format | Notes |
| --- | --- | --- | --- |
| `artists/maya.webp` | 512×512 (square) | WebP | Soulful, warm female vocalist. |
| `artists/theo.webp` | 512×512 | WebP | Earthy, folk male vocalist. |
| `artists/zara.webp` | 512×512 | WebP | Bright, celebratory vocalist. |
| `artists/_placeholder.webp` | 512×512 | WebP | Fallback avatar. |

Store the public URL in `artists.image_url` (DB column already exists). The card reads
`a.image_url`.

**Prompt (template):** "Portrait of a {warm soulful / earthy folk / bright modern}
musician, soft studio light, cream and gold tones, intimate and friendly, premium,
shallow depth of field, square crop. Fictional person, not a real celebrity."

---

## 5. Samples & delivered songs (recommended)

| File | Size | Format | Used in |
| --- | --- | --- | --- |
| `samples/cover-anniversary.webp` … | 800×800 (square) | WebP | Cover art per sample (`routes/samples.tsx`); store in a `cover_url`. |
| `share-cover-default.webp` | 1200×1200 | WebP | Default cover on the private share page (`routes/song.$token.tsx`) when an order has no custom art. |
| `share-watermark.svg` | — | SVG | Subtle brand watermark/footer on the gift page. |

**Cover art prompt (template):** "Square album cover, abstract warm artwork evoking
{occasion/mood}, cream and gold with a rose accent, soft gradients and grain,
elegant, no text, no faces."

---

## 6. States & email (nice to have)

| File | Size | Format | Used in |
| --- | --- | --- | --- |
| `empty-songs.svg` | 240×180 | SVG | Dashboard empty state (`routes/dashboard.index.tsx`). |
| `404.svg` | 320×240 | SVG | Not-found page. |
| `email-logo.png` | 320×80 (2×) | PNG | Header in transactional emails. **Must be an absolute hosted URL** (emails can't use relative paths) — upload to R2/CDN and reference in `apps/api/app/services/email_templates.py`. |

**Empty-state prompt:** "Minimal warm illustration, a single music note drifting from
an open envelope, gold line art on transparent, gentle, friendly."

---

## Suggested directory layout

```
apps/web/public/
├── logo-mark.svg            ✅ included
├── logo-wordmark.svg
├── favicon.ico / favicon.svg
├── apple-touch-icon.png
├── icon-192.png / icon-512.png / icon-maskable-512.png
├── og-image.png / og-image-twitter.png
├── hero-art.webp
├── texture-grain.png
├── icons/ (step-1..5.svg)
├── occasions/ (occasion-*.webp)
├── moments/ (moment-1..3.webp)
├── artists/ (maya.webp, theo.webp, zara.webp, _placeholder.webp)
├── samples/ (cover-*.webp)
├── share-cover-default.webp / share-watermark.svg
└── states/ (empty-songs.svg, 404.svg)
```

## Priority order

1. **Brand + favicons + OG image** — needed before any public launch.
2. **Artist avatars** — biggest visual upgrade (kills the gray circles).
3. **Sample covers + share default cover** — makes audio feel like real records.
4. **Step icons, occasion/moment imagery** — polish.
5. **Empty/404/email logo** — finishing touches.

## Wiring notes (where code expects them)

- OG/Twitter meta + favicon links: add to `head()` in `apps/web/src/routes/__root.tsx`.
- PWA icons: update `apps/web/public/manifest.json` to the new icon paths.
- Artist images: `artists.image_url` (DB) → rendered in `routes/artists.tsx` + `StepArtist.tsx`.
- Sample covers: add a `cover_url` field (api `samples` model + schema) → `routes/samples.tsx`.
- Email logo: hosted absolute URL in `email_templates.py`.

## Formats

- **SVG** for logos, icons, line illustrations (crisp, tiny).
- **WebP** for photos/covers (smaller than PNG/JPG; add a PNG fallback only if needed).
- **PNG** for favicons/app icons/OG (broad compatibility).
- Target ≤ 200 KB per photo; run through an optimizer (squoosh / `sharp`).

---

## Realistic occasion & moment image prompts

These should feel like **real, candid, emotional moments** — not abstract
illustrations. Faces soft/secondary, warm grade, no text.

**Shared style suffix — paste after every prompt:**

> — candid documentary photograph, warm cream-and-gold color grade, soft
> golden-hour light, shallow depth of field, gentle film grain, premium and
> emotional, photorealistic, no text, no logos, no watermark, fictional ordinary
> people (not celebrities), diverse, family-friendly, 4:3 aspect.

Keep the **same grade/lighting/seed across the whole set** so the grid feels
cohesive. Generate at 2×, downscale, crop to 4:3.

Pipeline used in repo: drop source PNGs in `assets/`, then
`sips -s format jpeg -Z 1200 -s formatOptions 80 in.png --out apps/web/public/occasions/occasion-<slug>.jpg`
(≈240 KB each). The home grid + occasion tiles read `/occasions/occasion-<slug>.jpg`.

### Occasion tiles → `apps/web/public/occasions/occasion-<slug>.jpg`

| slug | subject |
| --- | --- |
| `anniversary` | A long-together couple slow-dancing barefoot in a sunlit living room, foreheads touching, eyes closed. |
| `birthday` | Hands carrying a small glowing birthday cake toward a softly-lit smiling person at a dinner table. |
| `wedding` | A couple's first dance, string-light bokeh, blurred guests clapping around them. |
| `proposal` | Someone on one knee at a quiet beach at sunset; partner's hands to their mouth, surprised and tearful. |
| `mothers-day` | A grown child hugging their mother from behind in a warm kitchen, both laughing. |
| `fathers-day` | A father and his adult child laughing on a porch at golden hour, coffee mugs in hand. |
| `long-distance` | A person smiling at a phone video call by a rain-streaked window, soft warm lamp light. |
| `friendship` | Two best friends laughing, arms around each other's shoulders, walking outdoors in afternoon sun. |
| `apology` | Two people reconciling on a couch, one a gentle hand on the other's shoulder, tender, soft window light. |
| `just-because` | A couple sharing one pair of earbuds, heads leaning together, quiet smiles. |

### Reaction-moment cards → `apps/web/public/moments/moment-{1,2,3}.webp`

| file | line on card | subject |
| --- | --- | --- |
| `moment-1` | "Her name, in the chorus" | A woman in headphones, eyes closed, hand over heart, a single tear, warm window light. |
| `moment-2` | "The memory he thought you forgot" | A middle-aged man on earbuds, nostalgic half-smile, looking off-frame. |
| `moment-3` | "Played at the wedding" | A bride and groom mid-embrace on the dance floor, guests blurred, fairy-light bokeh. |
