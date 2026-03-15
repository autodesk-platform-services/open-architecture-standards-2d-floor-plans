# OAS-Geometry

OAS-Geometry defines the **geometric rules, data structures, and numerical conventions** used throughout all Open Architecture Standards (OAS) modules.  
These requirements ensure that all spatial data is precise, consistent, and easy to process by humans, LLMs, solvers, and renderers.

Geometry in OAS is strictly **2D**, integer-based, and expressed in **millimeters** to avoid floating-point ambiguity and maintain architectural accuracy.

---

## 1. Coordinate System

All OAS geometry uses a unified 2D Cartesian coordinate space:

- **X axis → right**
- **Y axis → up**
- **Units: millimeters (`mm`)**
- **Type: integer values only**
- **Origin `(0,0)`** is arbitrary but must remain consistent within the plan

### Example

```json
{ "x": 2400, "y": 900 }
```

This represents the point *(2400 mm, 900 mm)*.

### 1.1 Plan-local Coordinates

OAS does **not** define a global geographic coordinate system.  
Coordinates are **local to the plan**.

Extensions such as **OAS-Site** may define global transforms (e.g., geospatial mapping).

---

## 2. Numerical Conventions

### 2.1 Integer-only Geometry

All *geometric* values must be integers representing millimeters:

- Room polygon coordinates  
- Wall endpoints  
- Wall thickness  
- Door/window widths & heights  
- Distances and offsets  
- Opening positions along walls  

### Valid

```json
{ "x": 5000, "y": 3000 }
"width_mm": 900
```

### Invalid

```json
{ "x": 5.0, "y": 3.2 }
"width_mm": 900.5
```

---

### 2.2 Derived Decimal Values

Decimals are allowed only for **derived** or **non-geometric** values, such as:

- Areas in m² (`area_m2`)
- Percentages
- Angles (optional decimal)

Example:

```json
"area_m2": 15.75
```

### 2.3 Unit Summary

| Concept | Unit | Type |
|--------|------|-------|
| Length | `mm` | integer (required) |
| Angle | `deg` | integer or decimal |
| Area (raw) | `mm2` | integer |
| Area (display) | `m2` | decimal allowed |

---

## 3. Points

A point is defined as:

```json
{ "x": 0, "y": 3000 }
```

### Point Rules

- Both `x` and `y` must be present
- Both must be integers
- Values represent millimeters
- An optional `z` (integer, mm) may be present for elements that require 3D paths (e.g., railings following stair geometry). When omitted, the point is treated as 2D.

```json
{ "x": 2400, "y": 900, "z": 3200 }
```

---

## 4. Line Segments

Walls and other linear elements use a standard line segment:

```json
{
  "from": { "x": 0, "y": 0 },
  "to":   { "x": 5000, "y": 0 },
  "unit": "mm"
}
```

### Line Rules

- Both endpoints must be valid OAS points  
- `unit` must always be `"mm"`  
- Lines should not self-intersect  
- Lines used for walls should align with associated room boundaries  

---

## 5. Polygons

Rooms and other closed shapes are defined using polygons.

### Example

```json
{
  "unit": "mm",
  "closed": true,
  "points": [
    { "x": 0, "y": 0 },
    { "x": 5000, "y": 0 },
    { "x": 5000, "y": 3000 },
    { "x": 0, "y": 3000 }
  ]
}
```

### Polygon Rules

- Must have **at least three points** (two for open paths)
- Must use integer-mm coordinates
- Must explicitly set `closed: true` for closed polygons
- Points must follow a consistent order (CW or CCW) for closed polygons
- Self-intersecting polygons are not valid

### Open Paths

Some elements (e.g., railings) use **open paths** instead of closed polygons. Open paths use the same polygon structure but with `closed: false`:

```json
{
  "unit": "mm",
  "closed": false,
  "points": [
    { "x": 0, "y": 0 },
    { "x": 3000, "y": 0 },
    { "x": 3000, "y": 2000 }
  ]
}
```

Open paths require at least two points and do not form a closed shape.

---

## 6. Curves and Complex Shapes

OAS-Geometry supports curved shapes through specific primitives and properties. These allow for the definition of circles, arcs, rounded corners, and spirals while maintaining the integer-mm coordinate system.

### 6.1 Circles

Defined by a center point and a radius.

```json
{
  "type": "circle",
  "center": { "x": 1000, "y": 2000 },
  "radius_mm": 500
}
```

### 6.2 Arcs

Defined by a center, radius, and start/end angles.

```json
{
  "type": "arc",
  "center": { "x": 1000, "y": 2000 },
  "radius_mm": 500,
  "start_angle_deg": 0,
  "end_angle_deg": 90
}
```

*   **Direction**: Always counter-clockwise from start to end.

### 6.3 Rounded Corners (Fillets)

Polygons support an optional `fillet_radius_mm` property on each point. This creates a rounded corner at that vertex.

```json
{
  "unit": "mm",
  "closed": true,
  "points": [
    { "x": 0, "y": 0, "fillet_radius_mm": 0 },
    { "x": 5000, "y": 0, "fillet_radius_mm": 500 },
    { "x": 5000, "y": 3000, "fillet_radius_mm": 0 },
    { "x": 0, "y": 3000, "fillet_radius_mm": 0 }
  ]
}
```

*   **Rule**: The fillet radius must be small enough to fit within the adjacent segments.

### 6.4 Spirals

Defined for use cases like spiral staircases.

```json
{
  "type": "spiral",
  "center": { "x": 0, "y": 0 },
  "start_radius_mm": 200,
  "end_radius_mm": 1500,
  "start_angle_deg": 0,
  "end_angle_deg": 360,
  "clockwise": false
}
```

---

## 7. Dimensional Fields

OAS supports **two formats** for dimensions.

### 7.1 Object Format

```json
{
  "value": 200,
  "unit": "mm"
}
```

### 7.2 Short Format (preferred)

```json
"thickness_mm": 200
"width_mm": 900
"height_mm": 2100
```

### Rules

- Values must always represent millimeters  
- No decimals allowed  
- Short format is recommended for common fields  

---

## 8. Angle Fields

Angles are always expressed in degrees.

```json
{ "angle_deg": 90 }
```

### Rules

- Integers preferred, decimals allowed  
- Must explicitly specify `"deg"`  
- Radians are not allowed  
- Positive rotation is **counterclockwise**  

---

## 9. Derived Values

Derived values may use alternative units.

### 9.1 Areas

```json
"area_mm2": 15000000
```

or

```json
"area_m2": 15.0
```

### 9.2 Unit Conversion Rules

- 1 m = 1000 mm  
- 1 cm = 10 mm  
- 1 m² = 1,000,000 mm²  

All conversions must remain exact.

---

## 10. Precision Requirements

With mm-integer geometry:

- No floating-point rounding drift  
- Perfect reproducibility across tools  
- Reliable snapping to grids (e.g. 100 mm, 300 mm)  
- Predictable LLM manipulation  
- Cleaner diffs and patches  

---

## 11. Summary

OAS-Geometry establishes the strict numerical and geometric rules that make OAS:

- precise
- consistent
- predictable
- LLM-safe
- renderer-friendly

These conventions form the **mathematical foundation** of the entire Open Architecture Standards ecosystem.