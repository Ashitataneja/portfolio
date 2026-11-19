# Ashita Taneja — Interactive Portfolio

A static, dependency-free site (HTML + CSS + ES modules). Built from the Figma file's **"For Claude"** page.

## Run it

Any static server works (ES modules don't load from `file://`):

```bash
cd portfolio
python3 -m http.server 8080
```

Then open http://localhost:8080. To deploy, upload the folder as-is to Netlify, GitHub Pages, Vercel or any static host.

## Screen map

| # | Route | Figma image | Interaction |
|---|---|---|---|
| 01–03 | `#/` | image 62, 63, 64 | Aperture opens → zoom through the lens → camera prints a photo. Waits for a click, then the photo slides out and expands into Home. |
| 04 | `#/home` | image 65 | Rotary dial: drag, arrow keys, curved-arrow buttons, or click a label (it rotates under the pointer, then opens). |
| 05 | `#/navigate` | image 66 | Opened from the camera sticker on Home. Same dial; the centre lens opens the selection. |
| 06–07 | `#/work` | image 67, 68 | Clotheslines: hover/arrows highlight, click → peg opens, photo unclips and flies forward ("Project unclipped!"). |
| 08 | `#/work/:id` | image 69 | Open case study / Back to work. |
| 09 | `#/work/:id/overview` | — | Case-study intro (no design supplied; uses the same visual language). Remembers your stage. |
| 10 | `#/work/:id/case/:n` | image 70 | 8-stage index, shutter (iris + click sound) → next, Previous, Evidence panel. Keys: ←/→, 1–8, E, Esc. |
| 12–13 | `#/archive`, `#/archive/:photo` | image 71, 72 | Photo pile → lift + expand → film roll; prev/next, swipe, click active frame for full view. |
| 14–15 | `#/notes`, `#/notes/:slug` | image 73, 74 | Notebook opens; page-turn into articles; prev/next; back keeps position. |
| 16 | `#/about` | image 75 | Scratch tiles (mouse/touch/pen, or Enter/Space). All revealed → emoji rain + downloadable keepsake. |
| 17 | `#/about/profile` | image 76 | Section nav, Download Resume. |
| 18 | `#/contact` | image 77 | 4-way dial moves the pointer; the camera's screen shows the matching action. |
| 19 | overlay | image 78 | Exit intent (cursor leaves through the top) after 3+ screens, once per session. Mobile: "Postcard" button. |
| 20–21 | `#/postcard`, `#/postcard/:photo` | image 79, 80/81/83 | Pick a photo (Continue disabled until chosen) → postcard drawn on canvas → 3600×2250 PNG download (artwork only). |

## Colour-vision control (bottom of every screen)

- **One control for the whole site**, mounted once and persisted in `localStorage`.
- Pick a type (Protanopia, Deuteranopia or Tritanopia), then slide from **Original** → **Colour-friendly**. **Reset** returns to 0%.
- **0% is exactly your design's colours** (sampled from the screens). The friendly end is the *smallest* change to your accent colours that makes them distinguishable for that vision type. Background, grid, cream surfaces and ink never change.
- Implemented as colour tokens (`--c-*` CSS variables) blended in linear light by `js/theme.js`. No page filter. Photographs are never altered.
- Palettes were found with `dev/optimise.mjs` and are verified by `dev/run-check.mjs` (Machado 2009 CVD simulation + WCAG contrast measured on the simulated colours):

```bash
cd portfolio/dev && node run-check.mjs
```

- Colour is never the only signal. Selected dial segments get a hatch pattern, an underline and an "Open" chip; selected photos get a ✓ badge; clips have distinct shapes; stages show ✓ when done.

## Content to fill in — `js/content.js`

The designs use template copy in places, and the site keeps it rather than inventing details:

- **Projects:** "Project Title", the short description and "Team details" (categories, role, duration and year come from the design).
- **Case study:** stage 01 (Context) is the real content from the design and is used for every project. Stages 02–08 have template text.
- **Profile:** "Degree Name / Institution Name", "Organisation Name / Role Title".
- **Journal:** only "Designing for Joy" has body text. The other four show title, subtitle, date, read time and image.
- **`CONTACT.linkedin`:** empty, so the button opens a LinkedIn people search for your name.
- **`CONTACT.email`:** `ashita.taneja@gmail.com`, as printed on the Contact screen design.
- **Resume:** drop the PDF at `assets/Ashita-Taneja-Resume.pdf`. Until then, Resume buttons become "Request Resume" (an email).

## Assets

All photos in `assets/img/` are cropped from your supplied screen images (they only exist there). They're limited to roughly 300–650 px wide, so supplying the original photos at full resolution would noticeably sharpen the postcard and keepsake downloads. The portrait cutout comes from Page 1. Fonts (Titan One, Outfit, Caveat) are self-hosted under the SIL Open Font License.

## Tests

`dev/e2e.test.cjs` drives the whole flow in Playwright: intro → dials → unclip → case stages/evidence → archive/film roll → journal → scratch + keepsake download → colour persistence/reset → postcard download → exit intent. Serve on port 8765, then:

```bash
node dev/e2e.test.cjs /tmp
```
