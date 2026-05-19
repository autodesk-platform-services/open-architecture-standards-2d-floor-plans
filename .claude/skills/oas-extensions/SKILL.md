---
name: oas-extensions
description: Use when adding or editing OAS extension blocks — machinery, materials, site, MEP, or Autodesk metadata — that augment a Core or Layout document.
---

# OAS Extensions

## When to use

Use this skill any time the task involves attaching domain-specific data outside the Core/Layout vocabulary: industrial machinery, materials, MEP systems, site context, or vendor metadata (Autodesk/Revit families, APS URNs). If the data fits a Core entity directly (e.g. a `Furniture` placement), keep it in Core — don't reach for an extension.

## Key types

- `Extension` envelope — top-level `extensions` dictionary keyed by extension name
- `Machinery` — industrial equipment with multi-axis rotation and CAD geometry source
- `Material` — material definitions referenced by id from Core/Layout entities
- `Site` — site context (boundaries, orientation, surroundings)
- `AutodeskMetadata` — Revit family names, APS URNs, vendor-specific identifiers

## Critical rules

1. **Dictionary format in OAS 1.1.0+** — `"extensions": { "oas-machinery": { "version": "..." }, "oas-autodesk": { ... } }`. Parsers must still accept the legacy array form, but new documents should emit the dictionary.
2. **Furniture and 3D fields are no longer extensions — they moved into Core.** `oas-furniture` (position, rotation, dimensions, in_room) and `oas-3d` (wall_height_mm, base_offset_mm, top_profile_points, etc.) are deprecated extension names. Put these fields directly on Core entities; do not declare `"oas-furniture"` in `extensions`.
3. **Versioned per extension.** Each extension block carries its own `version` field independent of the OAS document version. Semver applies.
4. **Machinery has three independent rotation axes** — `rotation_deg` (Z, the default), `rotation_x_deg`, `rotation_y_deg`. Separate fields in degrees; don't fold them into one.
5. **Machinery ids must be globally unique** across the entire document, not just within the machinery array.
6. **`geometry_ref` vs `geometry_source`.** Base `oas-machinery` uses a simple `geometry_ref` URI/path string. When `oas-autodesk` is also active, machinery may carry the structured `geometry_source` object (`urn`, `external_id`, `item_id`, `file_name`, `is_y_up`, `import_mode`, `mesh_quality`) for APS Model Derivative / ACC imports.
7. **Vendor-specific names live in their extension, not in Core.** Revit `revit_family` / `revit_type`, APS `external_id`, etc., go under `oas-autodesk`, never inline on Core `Wall.type_name`.
8. **Extensions may not override Core invariants** — no decimal coordinates, no redefining Room/Wall/Opening, no breaking the mm-integer rule.

## Full schema

See [docs/extensions.md](../../../docs/extensions.md) for the full reference, including the dictionary envelope, per-extension schemas (machinery, autodesk, MEP, materials, site), and the 1.0→1.1 migration notes.

## Related skills

- `oas-core` — the document an extension augments
- `oas-layout` — extensions also attach to resolved layouts (e.g. machinery placed on a floor)
