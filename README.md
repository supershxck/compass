# Compass

A simple yet powerful astrology tool for beginners.

Enter your birth data and explore your chart — accurate (Swiss Ephemeris), warm, visual, and genuinely useful. Everything runs locally in your browser.

## Using the Standalone Version (Recommended)

This is the intended way to use Compass:

1. Clone or download the repository
2. Install dependencies:
   ```bash
   cd "Projects/Astro Projects/compass"
   npm install
   ```
3. Build the single-file version:
   ```bash
   npm run build:standalone
   ```
4. Open `dist/compass.html` in any modern browser (double-click the file or drag it into your browser).

You now have one self-contained HTML file (~866 KB) that works completely offline. No server, no installation required for end users.

## Development

For active development:

```bash
npm run dev
```

This starts the normal Vite dev server with hot reloading.

## What’s Inside

- Accurate planetary positions via Swiss Ephemeris (Moshier mode, runs in the browser via WebAssembly)
- Interactive chart wheel showing both natal positions and current transits
- The Big Three with thoughtful, balanced interpretations
- Live sky view with personal transits relative to your chart
- Body & Sky — traditional somatic correspondences
- Guided reflection prompts with private auto-saving notes
- Save and load multiple charts locally
- Calm, beginner-friendly learning reference

## Notes

- All data stays in your browser (localStorage).
- The standalone build uses `vite-plugin-singlefile` to produce one HTML file.
- For maximum self-containment, a few small assets are inlined during the standalone build.

## License

MIT — Free for personal and exploratory use.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
