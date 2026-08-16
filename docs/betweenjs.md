## BetweenJS

*Robust tweens for the browser* — a lightweight, zero-dependency animation engine. Tween any numeric property of any target — DOM elements, canvas objects, Three.js vectors, plain models — with a rich ease system, composable groups, action tweens, full CSS 3D transform interpolation, and color animation.

Loaded like any module: `require('strawnode_modules/betweenjs')`. The static factory lives on `window` as **`BJS`** (also `BTW` / `BetweenJS`).

### Quick start

```js
// One-liner
BJS.to(el, { left: 500 }, 2, Quad.easeOut).play();

// create() — everything as options
BJS.create({
  target: el, to: { left: 500, top: 300 },
  time: 2, ease: Quad.easeOut, delay: 0.5, repeat: 2,
  transform: { translateX: 200, rotate: 45 },
  onComplete: function(){ /* … */ }
}).play();

// Compose — serial / parallel
BJS.serial(
  BJS.to(el, { left: 500 }, 1),
  BJS.func(function(){ console.log('midpoint'); }),
  BJS.to(el, { top: 300 }, 1)
).play();

// Fluent chain
BJS.to(el, { left: 500 }, 2).reverse().delay(0.3).play();
```

### Core concepts

- **Ticker** — one `requestAnimationFrame` loop that starts automatically on first play and auto-halts on tab switch.
- **Tweens** — `AbstractTween` (lifecycle/events) and `Tween` (the concrete numeric tween).
- **Targets & mapping** — anything with numeric properties; updaters handle property reads/writes, CSS dash-conversion, relative values (`$100`), scroll, alpha, color, and transform matrix decompose/recompose.
- **Easing** — 11 families (`Linear`, `Quad`, `Cubic`, `Quart`, `Quint`, `Sine`, `Expo`, `Circ`, `Back`, `Bounce`, `Elastic`) × 4 variants, plus `Custom` and `Physical` eases that compute their own duration.
- **Composition** — `serial()` / `parallel()` groups, and chainable decorators: `reverse`, `slice`, `scale`, `delay`, `repeat`.
- **Action tweens** — `func`, `timeout`, `interval`, `load`, `animationframe`, `addChild`, `removeFromParent` — block serial chains for real sequencing.
- **Color** — `Color` conversions with `ColorMode.RGB/HSV/HSL`, interpolated as `{r,g,b,a}`.
- **Modern layer** — promises/`.then()`, `stagger`, fluent `timeline()`, global controls (`pause`/`resume`/`stopAll`/`clear`), auto-pause on visibility change.

### Events

`start` · `play` · `update` · `change` · `finish` · `stop` · `reverse` · `repeat` · `pause` · `resume` · `complete` — plus the option callbacks `onStart` / `onPlay` / `onUpdate` / `onDraw` / `onStop` / `onComplete` / `onRepeat` / `onReverse` / `onPause` / `onResume`.

### Where it fits

- **StrawExpress** `@focus` / `@toggle` handlers animate page templates with `BJS.*`.
- **DOMNodeProxy** `tween()` / `animate()` delegate straight to `BJS.create`.
- **This site** — `sectionbehavior.js` drives the shader and project-slide transitions with BetweenJS.

### Full documentation

The complete README lives with the source:

- [BetweenJS on GitHub](https://github.com/sazaam/BetweenJS)
