## Shaders

*Programs that run on the GPU.* **A display system common for 3D artists** : dynamic textures applied to objects, computed on the fly, per-fragment, in parallel. Instead of pre-baking colors, a shader computes the color of every pixel every frame — which is what makes animated, responsive, procedural visuals possible.

This site's background itself runs on a custom WebGL2 shader system with dozens of navigable programs.

### What a shader is made of

- **Vertex shader** — runs once per vertex, decides where each point of a geometry lands on screen (position, and variables passed down the pipeline).
- **Fragment shader** — runs once per pixel, decides the final color from those interpolated variables, uniforms, textures and math.
- **Uniforms** — values set from the CPU side per draw call (time, mouse, resolution), shared by every pixel of the draw.
- **Attributes / varyings** — per-vertex inputs from the geometry, interpolated across the surface between vertex and fragment stages.

### Why shaders matter here

Every visual this site relies on — the animated background, transitions, grain, and generative surfaces — is a shader running in real time. A custom system lets us ship dozens of navigable programs and swap between them live, instead of shipping one static baked look.

```glsl
// a minimal fragment shader — a background that shifts with time
#version 300 es
precision highp float;
uniform float uTime;
out vec4 outColor;
void main(){
    float wave = 0.5 + 0.5 * sin(uTime * 2.0 + gl_FragCoord.x * 0.01);
    outColor = vec4(vec3(wave, 0.4, 0.6), 1.0);
}
```

### Where it fits

- **Background programs** — the shaders you see on this page, switched through the navigation.
- **Transitions & surfaces** — effects layered over content sections.
- **Export** — same GLSL ideas carry over to real-time engines and renderers.

### Full documentation

The shader system source and programs live with the site:

- [WebGL2 shader system on GitHub](https://github.com/sazaam)
