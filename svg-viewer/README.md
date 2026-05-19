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

This viewer is read-only by design. To create or edit OAS JSON, use the OAS skills under [.claude/skills/](../.claude/skills/) with Claude Code — describe what you want in natural language and Claude will produce schema-correct JSON you can drop into [examples/](examples/).

Most relevant skills for plans you'd load here:

- [`oas-layout`](../.claude/skills/oas-layout/SKILL.md) — multi-room plans with walls, doors, windows, and circulation
- [`oas-core`](../.claude/skills/oas-core/SKILL.md) — single-room work or the basic entity vocabulary
- [`oas-geometry`](../.claude/skills/oas-geometry/SKILL.md) — coordinate conventions, polygon rules, unit gotchas

See the [root README](../README.md#skills-for-claude-code) for the full skill index.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page markup, header, viewer container, zoom controls |
| `app.js` | Plain-JS renderer (rooms, walls, openings) plus pan/zoom |
| `style.css` | Styling for the viewer chrome and SVG primitives |
| `examples/` | Sample OAS JSON plans |
