# Compass

A beginner astrology instrument. Enter birth data and explore your chart — Swiss Ephemeris, warm, visual, entirely in the browser.

| | |
|---|---|
| **Status** | instrument |
| **House** | Oracle |
| **Stack** | TypeScript, Vite, Swiss Ephemeris (Moshier / WASM) |

## Standalone (recommended)

One self-contained HTML file. Offline. No server.

```bash
npm install
npm run build:standalone
```

Open `dist/compass.html` in any modern browser.

## Development

```bash
npm run dev
```

## What’s inside

- Planetary positions via Swiss Ephemeris (Moshier mode, WASM)
- Interactive chart wheel: natal positions and current transits
- The Big Three with balanced interpretations
- Live sky view with personal transits
- Body & Sky — traditional somatic correspondences
- Guided reflection prompts with private auto-saving notes
- Save and load multiple charts locally

All data stays in the browser (`localStorage`). The standalone build uses `vite-plugin-singlefile`.

## License

MIT — free for personal and exploratory use.
