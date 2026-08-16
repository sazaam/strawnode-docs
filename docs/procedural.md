## Procedural

*Creation workflows that are generative and dynamic.* **Not crafted by hand — computed through mathematics and physics.** Instead of placing every detail manually, a rule or algorithm builds the result, so the same logic can produce infinite variations.

The opposite of hand-modelling: you write the process once and let it generate the shape.

### What it gives you

- **Generative output** — a recipe that produces geometry, materials or whole scenes from parameters (seeds, sliders, inputs) rather than from manual placement.
- **Variation for free** — change a seed or a value and get a new but consistent result; perfect for iteration and exploration.
- **Physics and math as tools** — forces, noise, growth rules and constraints shape the outcome instead of the artist's hand.
- **Repeatability** — the same process run twice gives the same (or deliberately varied) result, which is great for series and systems.

### Why it's the approach here

Tools like **Ashina** — an Asian-architecture generator built on Blender Geometry Nodes — are a good example of this approach: instead of modelling each roof or pagoda by hand, the tool encodes the rules of the architecture and generates the forms from them.

```python
# the idea, in pseudo-code
def roof(config):
    # a rule describes how a roof builds itself
    return [
        generate_curve(config["width"], config["curvature"]),
        extrude_along(curve),
        tile_surfaces()          # then material & shader take over
    ]

for seed in range(10):
    build(roof(roofs(seed)))     # ten variations, one recipe
```

### Where it fits

- **Ashina** — the rooftop generator: architectural rules as data.
- **Shaders** — shaders themselves are procedural: the fragment program *is* the rule that generates the pixels.
- **Works** — series that explore a form family rather than a single object.

### Full documentation

The procedural tools and generators live with the source:

- [Ashina on GitHub](https://github.com/sazaam)
