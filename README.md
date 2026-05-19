# Open Architecture Standards

Open Architecture Standards (OAS) is a lightweight, LLM-friendly schema for describing architectural layouts, programs, rooms, walls, and openings using simple JSON in millimeter coordinates. Designed for generative design, editing by prompts, and easy rendering in web tools.

# Important Note:

This is not an industry standard, but rather one approach to interacting with an LLM to generate more accurate 2D floor plans.

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
