# Multi-Story Plan Example

This example demonstrates a 2-story building using Levels, Roofs, Floor Slabs, Furniture, and the Extensions dictionary format.

```json
{
  "oas": "1.1.0",
  "plan_id": "multi_story_01",
  "title": "2-Story Office Building",
  "extensions": {
    "oas-machinery": { "version": "1.0.0" },
    "oas-autodesk": { "version": "1.0.0" }
  },

  "levels": [
    { "id": "level_00", "name": "Ground Floor", "elevation_mm": 0, "is_building_story": true },
    { "id": "level_01", "name": "First Floor", "elevation_mm": 3200, "is_building_story": true }
  ],

  "rooms": [
    {
      "id": "room_lobby",
      "name": "Lobby",
      "usage": "circulation",
      "level": "level_00",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": 0, "y": 0 },
          { "x": 4000, "y": 0 },
          { "x": 4000, "y": 6000 },
          { "x": 0, "y": 6000 }
        ]
      },
      "area_m2": 24.0
    },
    {
      "id": "room_office_01",
      "name": "Office 1",
      "usage": "office",
      "level": "level_01",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": 0, "y": 0 },
          { "x": 5000, "y": 0 },
          { "x": 5000, "y": 4000 },
          { "x": 0, "y": 4000 }
        ]
      },
      "area_m2": 20.0
    }
  ],

  "walls": [
    {
      "id": "wall_gf_south",
      "from": { "x": 0, "y": 0 },
      "to": { "x": 10000, "y": 0 },
      "thickness_mm": 300,
      "wall_height_mm": 3000,
      "level": "level_00",
      "structural": true,
      "type_name": "300mm Reinforced Concrete"
    },
    {
      "id": "wall_ff_south",
      "from": { "x": 0, "y": 0 },
      "to": { "x": 10000, "y": 0 },
      "thickness_mm": 200,
      "wall_height_mm": 2800,
      "level": "level_01",
      "type_name": "200mm Brick"
    }
  ],

  "openings": [
    {
      "id": "door_main",
      "opening_type": "door",
      "in_wall": "wall_gf_south",
      "position_along_wall_mm": 1500,
      "width_mm": 1200,
      "height_mm": 2400,
      "level": "level_00"
    },
    {
      "id": "window_ff_01",
      "opening_type": "window",
      "in_wall": "wall_ff_south",
      "position_along_wall_mm": 2000,
      "width_mm": 1500,
      "height_mm": 1200,
      "sill_height_mm": 900,
      "level": "level_01"
    }
  ],

  "roofs": [
    {
      "id": "roof_01",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": -300, "y": -300 },
          { "x": 10300, "y": -300 },
          { "x": 10300, "y": 8300 },
          { "x": -300, "y": 8300 }
        ]
      },
      "level": "level_01",
      "level_offset_mm": 2800,
      "slope_angles": [30.0, 0.0, 30.0, 0.0],
      "defines_slope": [true, false, true, false],
      "eave_overhang_mm": [300, 300, 300, 300]
    }
  ],

  "floor_slabs": [
    {
      "id": "slab_gf",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": 0, "y": 0 },
          { "x": 10000, "y": 0 },
          { "x": 10000, "y": 8000 },
          { "x": 0, "y": 8000 }
        ]
      },
      "level": "level_00",
      "height_above_level_mm": 0,
      "type_name": "Reinforced Concrete Slab"
    },
    {
      "id": "slab_ff",
      "boundary_polygon": {
        "unit": "mm",
        "closed": true,
        "points": [
          { "x": 0, "y": 0 },
          { "x": 10000, "y": 0 },
          { "x": 10000, "y": 8000 },
          { "x": 0, "y": 8000 }
        ]
      },
      "level": "level_01",
      "height_above_level_mm": 0
    }
  ],

  "furniture": [
    {
      "id": "desk_01",
      "position": { "x": 2000, "y": 2000 },
      "rotation_deg": 0,
      "dimensions": {
        "width_mm": 1600,
        "depth_mm": 800,
        "height_mm": 750
      },
      "type": "furniture",
      "in_room": "room_office_01",
      "level": "level_01",
      "type_name": "Office Desk"
    }
  ],

  "machinery": [
    {
      "id": "cnc_01",
      "name": "CNC Mill",
      "category": "cnc",
      "position": { "x": 7000, "y": 3000 },
      "rotation_deg": 0,
      "dimensions": {
        "width_mm": 2500,
        "depth_mm": 1800,
        "height_mm": 2200
      },
      "in_room": "room_lobby",
      "level": "level_00",
      "manufacturer": "DMG Mori"
    }
  ],

  "railings": [
    {
      "id": "railing_01",
      "path": {
        "unit": "mm",
        "closed": false,
        "points": [
          { "x": 4000, "y": 0 },
          { "x": 4000, "y": 6000 }
        ]
      },
      "level": "level_01",
      "host_type": "floor",
      "type_name": "Glass Balustrade"
    }
  ],

  "connections": [
    { "from": "room_lobby", "to": "room_office_01", "type": "through" }
  ],

  "metadata": {
    "generated_by": "zero2model v1.0",
    "timestamp": "2025-06-01T10:00:00Z"
  }
}
```

## Features Demonstrated

- **Levels**: 2-story building with ground floor (0mm) and first floor (3200mm)
- **Walls**: Structural ground floor walls, non-structural upper floor walls with `type_name`
- **Openings**: Door on ground floor, window with `sill_height_mm` on upper floor
- **Roofs**: Gable roof with per-edge slope angles and overhang
- **Floor Slabs**: Separate physical slabs per level
- **Furniture**: Office desk with dimensions on upper floor
- **Machinery**: CNC mill from oas-machinery extension on ground floor
- **Railings**: Glass balustrade on upper floor (open path)
- **Extensions**: Dictionary format with oas-machinery and oas-autodesk
