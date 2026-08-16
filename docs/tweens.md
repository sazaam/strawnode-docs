## Tweens

*Animating objects for a graphical result.* **Interpolating values over time** — from position and size to color and opacity, a tween takes a start and an end and produces every value in between, so motion reads smooth instead of jumping.

That's the core of BetweenJS on this site: tweening is how the site itself moves.

### What a tween is made of

- **From / to values** — the start and end of the animated property (position, opacity, rotation, color).
- **Duration** — how long the interpolation runs.
- **Easing** — the curve that shapes the motion: ease in, ease out, quint, bounce, elastic.
- **Ticker** — the engine that advances time and re-applies the interpolated values every frame.

### Why tweens matter here

BetweenJS is built around tweening — and this site runs on it. Sections slide, fade, scale and swap using tweens and *parallel* tween chains driven by the site's own animation system.

```js
// a tween, the way the site drives its own motion
BJS.tween(
    $section,                 // the element
    { marginTop: 0, opacity: 100 },   // to
    { marginTop: 150, opacity: 0 },   // from
    0.08,                     // seconds
    Quint.easeOut
);
```

### Where it fits

- **BetweenJS** — tweens, delays, serial/parallel chains, easing families and color interpolation.
- **Transitions** — the section and deck motion you see while navigating the site.
- **Any interface** — hover states, reveals, and micro-interactions all reduce to the same idea.

### Full documentation

The complete BetweenJS tweening API lives with the source:

- [BetweenJS on GitHub](https://github.com/sazaam)
