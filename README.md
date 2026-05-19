# Open Architecture Standards

Open Architecture Standards (OAS) is a lightweight, LLM-friendly schema for describing architectural layouts, programs, rooms, walls, and openings using simple JSON in millimeter coordinates. Designed for generative design, editing by prompts, and easy rendering in web tools.

# Important Note:

This is not an industry standard, but rather one approach to interacting with an LLM to generate more accurate 2D floor plans.

## Repository contents

This repo combines three things:

| Folder | Purpose |
|--------|---------|
| [`docs/`](docs/) | The OAS specification — Core, Geometry, Program, Layout, Render, Extensions. Built as a static site with MkDocs. |
| [`.claude/skills/`](.claude/skills/) | Six progressive-disclosure Claude Code skills that help an LLM author and edit OAS JSON without ingesting the whole spec. |
| [`svg-viewer/`](svg-viewer/) | A dependency-free, single-page SVG viewer for OAS floor-plan JSON. Open `index.html` in any browser. |

## Skills for Claude Code

The [`.claude/skills/`](.claude/skills/) tree contains six skills, one per OAS module, that follow Anthropic's [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) progressive-disclosure pattern. Each skill is a lean entry point (YAML frontmatter + a short body) that:

- triggers automatically when Claude detects relevant authoring work,
- contains the 3–7 most critical authoring rules for that OAS module,
- links to the full module reference in [`docs/`](docs/) for deep dives.

| Skill | Trigger |
|-------|---------|
| [`oas-core`](.claude/skills/oas-core/SKILL.md) | Authoring rooms, walls, openings, slabs, roofs, furniture, railings |
| [`oas-geometry`](.claude/skills/oas-geometry/SKILL.md) | Points, polygons, arcs, units, coordinate conventions |
| [`oas-program`](.claude/skills/oas-program/SKILL.md) | Design intent: area targets, adjacency, constraints |
| [`oas-layout`](.claude/skills/oas-layout/SKILL.md) | Fully resolved multi-level geometry, connections |
| [`oas-render`](.claude/skills/oas-render/SKILL.md) | SVG / Canvas / WebGL rendering rules |
| [`oas-extensions`](.claude/skills/oas-extensions/SKILL.md) | Machinery, materials, Autodesk metadata, MEP, site |

Skills are auto-discovered when you open this repo in Claude Code — no install step. Describe a plan in natural language ("a 70 m² 2-bedroom apartment with the living areas facing south") and Claude routes through the relevant skills to produce schema-correct JSON you can drop into the viewer.

## SVG Viewer

[`svg-viewer/`](svg-viewer/) is a zero-dependency, no-build viewer for OAS floor-plan JSON. Open [`svg-viewer/index.html`](svg-viewer/index.html) in any modern browser, click **Upload JSON**, and load a plan. See [`svg-viewer/README.md`](svg-viewer/README.md) for controls and the bundled example.

The viewer is read-only by design — pair it with the skills above to author or edit plans.

## Documentation

The full specification documentation is built using [MkDocs](https://www.mkdocs.org/) with the [Material theme](https://squidfunk.github.io/mkdocs-material/).

### Building the Documentation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Build the documentation:
   ```bash
   mkdocs build
   ```

3. Serve the documentation locally:
   ```bash
   mkdocs serve
   ```
   Then open http://127.0.0.1:8000 in your browser.

### Documentation Features

- **Material Theme**: Modern, responsive design with dark/light mode
- **Search**: Full-text search functionality
- **SVG Support**: Native SVG image support for diagrams
- **GLightbox**: Image zoom and gallery functionality
- **Code Highlighting**: Syntax highlighting for JSON and other code blocks
- **Mermaid Diagrams**: Support for Mermaid diagram rendering

### Draw.io Integration (Optional)

The documentation supports Draw.io diagrams via the `mkdocs-drawio-exporter` plugin. To enable it:

1. Install Draw.io desktop application:
   - Download from https://www.diagrams.net/
   - Or install via package manager (e.g., `brew install drawio` on macOS)

2. Uncomment the Draw.io plugin configuration in `mkdocs.yml`:
   ```yaml
   plugins:
     - drawio-exporter:
         drawio_executable: /path/to/drawio
   ```

3. Add `.drawio` files to your docs and reference them in Markdown:
   ```markdown
   ![My Diagram](assets/diagram.drawio)
   ```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## Development with Dev Container

You can use VS Code Dev Containers for a consistent development environment.

- **Open in Container**: In VS Code, run the command "Remote-Containers: Open Folder in Container..." and select the repository root.
- **What it does**: Installs Python, runs `pip install -r requirements.txt` (configured in the devcontainer), and recommends useful extensions.
- **Run docs server**: Inside the container, serve the docs with `mkdocs serve` and open http://127.0.0.1:8000.

If you don't use dev containers, the `.vscode/extensions.json` recommends helpful extensions.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
