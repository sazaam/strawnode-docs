## Modelling

*The workflows used to create a shape.* **From box modelling to sculpting, retopology and beyond** — a set of disciplines for building the geometry behind the site's works, from concept cars to architectural forms.

Each project tends to pick the workflow that fits its shape: hard-surface objects get box-modelled, organic or detailed pieces get sculpted, and anything that needs clean topology for deformation gets retopologized.

### The main workflows

- **Box modelling** — starting from a primitive (cube, sphere, cylinder) and shaping it with extrude, bevel, loop cuts and transforms. Fast, predictable, great for hard surfaces and product forms.
- **Sculpting** — working a dense mesh like clay, pushing and pulling surface details. Best for organic shapes, characters, and high-detail forms.
- **Retopology** — rebuilding a clean, animation-friendly mesh over a sculpted or scanned surface, so the final model deforms and renders well.
- **UV mapping & layout** — unwrapping the surface so textures, materials and shaders know where they live on the shape.

### Why it matters here

Modelling is where every work on this site begins — a roof form, a body line, a concept shape. The geometry you build determines everything downstream: topology, UVs, materials, and how it behaves in a render or a real-time scene.

```blender
# example — a box-modelled workflow
1. Add a cube primitive
2. Loop cut (Ctrl+R) to add resolution
3. Bevel edges for softened forms
4. Extrude (E) to build outwards
5. Apply a subdivision modifier for smoothness
```

### Where it fits

- **Works** — the car, the rooftops, the concept pieces all start as modelled geometry.
- **Procedural** — some shapes are generated instead of hand-built, then surfaced and textured through the same pipeline.
- **Shaders** — the final mesh is what a shader runs on; topology and UVs decide how materials land.

### Full documentation

The modelling sources and scene files live with the projects:

- [Modelling on GitHub](https://github.com/sazaam)
