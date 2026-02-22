# Collab Board Lite

An interaction-heavy, static React board app (Miro-lite) built with Vite + React + Tailwind v4.

## What it includes

- Pan and zoom canvas (drag background, wheel zoom, zoom controls)
- Object creation: sticky notes, rectangles, and arrows
- Object interactions: drag, sticky-note resize, and multi-select
- Properties editing: color, text, width/height, arrow stroke width
- Selection actions: duplicate and delete
- Undo/redo history (20+ steps) with keyboard shortcuts
- localStorage persistence with schema versioning and demo-board seed on first run
- Responsive UI:
  - Mobile: bottom toolbar + slide-up properties sheet + selection list
  - Desktop: full toolbar + right-side properties panel
- Accessibility basics: focus rings, aria labels, and keyboard actions
- Dark mode using `html.dark` with persisted preference
- Toast notifications and first-run empty hint overlay

## Keyboard shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `N`: Add sticky note
- `Delete` / `Backspace`: Delete selection

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Build output is static and suitable for GitHub Pages deployment. The Vite base path is configured for this repository.

## Project structure

```text
src/
  app/
    AppShell.jsx
  components/
    ui/
      Button.jsx
      Modal.jsx
      Sheet.jsx
      Toast.jsx
      Tooltip.jsx
  features/
    board/
      BoardPage.jsx
      Canvas.jsx
      Toolbar.jsx
      PropertiesPanel.jsx
      objects.js
      reducer.js
  lib/
    geometry.js
    ids.js
    storage.js
  index.css
  main.jsx
```

Built by Hesam Khorshidi
https://hesamkhorshidi.github.io
