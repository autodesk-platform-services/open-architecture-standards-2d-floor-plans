# OAS SVG Viewer

A dependency-free, single-page SVG viewer for [Open Architecture Standards](../docs/index.md) (OAS) JSON floor plans. Renders rooms, walls, doors, and windows from the OAS schema.

## Run it

No build, no install, no server. Open `index.html` in any modern browser, then click **Upload JSON** and select a plan file.

```bash
open index.html       # macOS
xdg-open index.html   # Linux
start index.html      # Windows
```

If your browser blocks local file access for some reason, serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Try the example

[examples/apartment_50m2.json](examples/apartment_50m2.json) is a 50 m² apartment with entry hall, living/kitchen, bedroom, and bathroom. Load it via **Upload JSON** to see the renderer in action.

## Controls

- **Upload JSON** — load an OAS plan file
- **Mouse drag** — pan
- **Mouse wheel** — zoom around cursor
- **+ / − buttons** — zoom in / out
- **Fit** — fit plan to screen

## Editing plans

This viewer is read-only by design. To create or edit OAS JSON, use the OAS skills in [.claude/skills/](../.claude/skills/) with Claude Code — describe what you want in natural language and Claude will produce schema-correct JSON you can drop here.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page markup, header, viewer container, zoom controls |
| `app.js` | Plain-JS renderer (rooms, walls, openings) plus pan/zoom |
| `style.css` | Styling for the viewer chrome and SVG primitives |
| `examples/` | Sample OAS JSON plans |
