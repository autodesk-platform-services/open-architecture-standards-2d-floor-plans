# OAS-Core

OAS-Core defines the **fundamental building blocks** of the Open Architecture Standards.
Every valid OAS document must follow the structures and conventions described in this module.

The purpose of OAS-Core is to provide a **minimal, stable, and consistent schema** for describing architectural layouts using simple, millimeter-precise JSON. All other OAS modules—Program, Geometry, Layout, Render, and Extensions—build upon the definitions established here.

OAS-Core specifies the following primary components:

- **Metadata** (plan identifiers, titles, descriptions)
- **Units** (standardizing all geometry to millimeter integers)
- **Levels** (building stories defining the vertical structure)
- **Rooms** (functional spaces defined by polygons)
- **Walls** (straight boundary segments between points, with optional height and profile)
- **Openings** (doors and windows located along walls)
- **Roofs** (roof elements with boundary polygon, slope, and overhang)
- **Floor Slabs** (physical floor elements with boundary polygon)
- **Annotations** (human or LLM-generated notes and comments)

These entities form the essential structure of an architectural plan, ensuring that both humans and automated tools (LLMs, layout solvers, renderers, and editors) interpret plans in a consistent and predictable manner.

### Common Optional Fields

The following fields are available on **all** core entities (rooms, walls, openings, levels, and entities defined in later sections):

- `type_name` (string, optional) — A tool-independent type classification for the element. This follows the IFC Type-Occurrence pattern where a type defines a template and occurrences are instances. Examples: `"200mm Brick"`, `"Double Glazed Window"`, `"Reinforced Concrete Slab"`. Tool-specific type systems (e.g., Revit Family/Type) should be defined in the corresponding extension (e.g., oas-autodesk).

OAS-Core does **not** include:

- High-level programmatic intent (see **OAS-Program**)
- Resolved geometric layouts (see **OAS-Layout**)
- Rendering/visualization rules (see **OAS-Render**)
- Domain-specific modules like machinery, MEP, or site plans (see **OAS-Extensions**)

Instead, OAS-Core serves as the **foundation** of the standard, defining the core concepts and structures that all OAS-compliant tools are expected to support.
