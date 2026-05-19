# Open Architecture Standards (OAS)

**Version:** 1.1.0
**Status:** Draft

Open Architecture Standards (OAS) defines an open, extensible, JSON-based
representation for architectural layouts, programmatic intent, geometry,
and semantic relationships. OAS is designed to be:

- **LLM-friendly**: simple, predictable, integer-based JSON
- **Human-friendly**: readable and editable by architects and developers
- **Renderer-friendly**: easy to visualize in SVG, Canvas, or WebGL
- **Extensible**: additional modules can define furniture, MEP, 3D, site, etc.

All coordinates are expressed in **millimeters** using **integer** values
for precision and simplicity.

---

## Structure of OAS

OAS is divided into several core modules:

- **OAS-Core** — metadata, units, levels, rooms, walls, openings, curtain walls, roofs, floor slabs, furniture, railings
- **OAS-Geometry** — polygon, line, and numeric conventions  
- **OAS-Program** — high-level intent (areas, adjacency, constraints)  
- **OAS-Layout** — fully resolved geometry  
- **OAS-Render** — mapping OAS to visualization formats  
- **OAS-Extensions** — optional modules (machinery, autodesk, MEP, materials, site)

---

## Quick Example (OAS-Core)

```json
{
  "oas": "1.0.0",
  "plan_id": "simple_plan_01",
  "title": "Simple Layout",
  "units": { "length": "mm", "angle": "deg" },

  "rooms": [
    {
      "id": "room_living_01",
      "name": "Living Room",
      "usage": "living",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": 0, "y": 0 },
          { "x": 5000, "y": 0 },
          { "x": 5000, "y": 3000 },
          { "x": 0, "y": 3000 }
        ]
      },
      "area_m2": 15.0
    }
  ]
}
```