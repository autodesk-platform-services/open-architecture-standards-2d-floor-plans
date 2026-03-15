# OAS-Extensions

OAS-Extensions defines the **modular expansion system** for the Open Architecture Standards.  
While OAS-Core establishes the essential schema, Extensions allow projects to add **domain-specific functionality** without altering the core standard.

Extensions ensure that OAS can evolve to support:
- furniture
- MEP (mechanical, electrical, plumbing)
- 3D geometry
- site plans
- materials
- environmental data
- accessibility metadata
- custom organization-specific modules

Each extension is versioned independently and integrates cleanly with OAS-Core and OAS-Geometry.

---

## 1. Purpose of OAS Extensions

Extensions serve to:

- Add optional capabilities  
- Remain backward-compatible  
- Avoid bloating the core specification  
- Enable specialized workflows  
- Allow communities to define their own modules  

OAS encourages a **modular ecosystem**, similar to:
- OpenAPI extensions  
- IFC partial schemas  
- Web standards “levels”  

Extensions must never break the guarantees provided by OAS-Core.

---

## 2. Extension Naming & Versioning

Extensions use the following naming pattern:

```
oas-{domain}-{version}
```

Examples:

- `oas-furniture-1.0.0`
- `oas-mep-1.0.0`
- `oas-3d-1.0.0`
- `oas-materials-1.1.0`
- `oas-site-0.9.0`

### Versioning Rules
- Must follow **semantic versioning** (semver).  
- Must specify compatibility with `oas` core version.  
- Minor versions may add fields.  
- Major versions may break extension internals, but never OAS-Core rules.

---

## 3. Extension Declaration

An OAS document may include extensions via the `extensions` field.

### Dictionary Format (recommended, OAS ≥ 1.1.0)

Extensions are declared as a **dictionary** keyed by extension name. This allows direct lookup by name and is the recommended format for new documents.

```json
{
  "oas": "1.1.0",
  "extensions": {
    "oas-machinery": { "version": "1.0.0" },
    "oas-autodesk": { "version": "1.0.0" }
  }
}
```

### Array Format (legacy, OAS 1.0.0)

The original OAS 1.0.0 format used an array of objects. Parsers should accept both formats for backward compatibility.

```json
{
  "oas": "1.0.0",
  "extensions": [
    { "name": "oas-furniture", "version": "1.0.0" },
    { "name": "oas-3d", "version": "1.0.0" }
  ]
}
```

The presence of an extension implies:

- Additional fields may be used on core entities
- Additional entity arrays may be present at the top level
- Renderers/editors should load the relevant extension handlers

Documents must still remain valid OAS regardless of extensions.

---

## 4. Extension Structure Requirements

Every extension must include:

### 4.1 Metadata
- extension name  
- version  
- description  
- authors (optional)

### 4.2 Entities
The extension must define its own entities using OAS-style patterns:
- JSON objects  
- snake_case keys  
- mm-based coordinates (when geometric)  
- integer geometry rules must be respected

### 4.3 Integration Rules
Extensions must define:
- what core entities they modify or reference  
- how they interact with layout or render modules  
- any conflicts or invariants  

---

## 5. Official OAS Extensions (Initial Set)

Below are recommended baseline extensions that the ecosystem may adopt.

---

### ~~5.1 OAS-Furniture~~ (moved to Core)

!!! note "Moved to OAS-Core"
    Furniture fields such as `position`, `rotation_deg`, `dimensions`, `type`, `in_room`, `footprint`, and `level` are now part of OAS-Core (on Furniture entities). This extension is no longer needed.

---

### 5.2 OAS-MEP

Mechanical, electrical, plumbing representations.

May include:
- ducts  
- pipes  
- electrical circuits  
- fixtures  
- mechanical units  
- diagrams for drainage or supply  

All geometry still uses mm integer rules.

---

### ~~5.3 OAS-3D~~ (moved to Core)

!!! note "Moved to OAS-Core"
    3D fields such as `wall_height_mm`, `base_offset_mm`, `height_at_start_mm`, `height_at_end_mm`, and `top_profile_points` are now part of OAS-Core (on Walls). Level elevations (`elevation_mm`) provide the vertical reference system. This extension is no longer needed.

---

### 5.4 OAS-Materials

Describes materials, finishes, and construction types.

Examples:
- wall materials  
- flooring types  
- reflectivity parameters  
- thermal properties  

Example:

```json
{
  "material_id": "wall_paint_white",
  "type": "paint",
  "color_hex": "#ffffff",
  "reflectance": 0.72
}
```

---

### 5.5 OAS-Site

Defines the building context:

- property boundaries  
- setbacks  
- orientation (north arrow)  
- slope data  
- topography  
- access points  

Example:

```json
{
  "north_angle_deg": 0,
  "site_boundary_polygon": { ... }
}
```

---

### 5.6 OAS-Machinery

Defines industrial equipment and production machinery. IFC does not have a dedicated entity for machinery (it is explicitly out of scope), so OAS fills this gap for manufacturing and industrial use cases.

**Extension declaration:**

```json
{
  "extensions": {
    "oas-machinery": { "version": "1.0.0" }
  }
}
```

**Top-level array:** `machinery`

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Machine name |
| `category` | string | yes | One of: `cnc`, `robot`, `conveyor`, `assembly`, `inspection`, `storage`, `other` |
| `position` | Point | yes | Placement point (x, y in mm) |
| `rotation_deg` | number | no | Rotation angle in degrees (counterclockwise) |
| `rotation_x_deg` | number | no | Rotation around X axis in degrees |
| `rotation_y_deg` | number | no | Rotation around Y axis in degrees |
| `dimensions` | object | yes | Bounding box: `width_mm`, `depth_mm`, `height_mm` |
| `in_room` | string | no | Reference to a Room ID |
| `level` | string | no | Reference to a Level ID |
| `geometry_ref` | string | no | URI or path to external 3D geometry |
| `manufacturer` | string | no | Manufacturer name |
| `model_number` | string | no | Model/part number |
| `description` | string | no | Free-text description |
| `type_name` | string | no | Type classification |

#### Example

```json
{
  "id": "cnc_01",
  "name": "CNC Mill XR-500",
  "category": "cnc",
  "position": { "x": 5000, "y": 3000 },
  "rotation_deg": 0,
  "dimensions": {
    "width_mm": 2500,
    "depth_mm": 1800,
    "height_mm": 2200
  },
  "in_room": "room_production_01",
  "level": "level_00",
  "manufacturer": "DMG Mori",
  "model_number": "XR-500"
}
```

#### Categories

| Category | Description |
|----------|-------------|
| `cnc` | CNC machines (milling, turning, grinding) |
| `robot` | Industrial robots and cobots |
| `conveyor` | Material handling and conveyors |
| `assembly` | Assembly stations and workbenches |
| `inspection` | Quality inspection equipment |
| `storage` | Storage systems and racks |
| `other` | Other production equipment |

---

## 6. Custom Extensions

Projects may define custom extensions:

Example:

```
oas-hospital
oas-retail
oas-lab
oas-classroom
```

Custom modules should:

- follow naming conventions  
- use semver  
- not break OAS-Core invariants  
- provide clear documentation  

---

## 7. Render Integrations

Extensions may include *render hints*, such as:

```json
{
  "color_hex": "#55aaff",
  "icon": "furniture-bed"
}
```

These are optional and renderer-specific.

---

## 8. Interaction With OAS-Core, Geometry, Layout

### Extensions **may not**:

- override core geometry rules  
- change mm-integer coordinate rules  
- redefine base types (room, wall, opening)

### Extensions **may**:

- attach metadata to core entities  
- introduce new entity types  
- define reference relationships  
- add new layers for visualization  

---

## 9. Summary

OAS-Extensions provide a structured, modular way to expand the core Open Architecture Standards without breaking compatibility.

Extensions:
- add optional capabilities  
- define specialized behavior  
- support complex domains (furniture, MEP, 3D, site)  
- keep OAS lean, stable, and future-proof  

Extensions empower OAS to support both simple layouts and highly complex architectural models.
