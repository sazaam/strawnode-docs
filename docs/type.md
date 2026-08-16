## Type

*Essential classes and packages for JavaScript.* The **class and package system** at the bottom of the whole stack — a pre-ES6 OOP layer offering classes, packages, interfaces, mixins, and named inheritance, built on a single `Type.define()` call. Every class in StrawExpress and BetweenJS is defined through it.

Loaded through StrawNode, and must evaluate before strawexpress/betweenjs. Exposes `window.Type` and `window.Pkg`. No dependencies.

### What it gives you

- **`Type.define()`** — one-call class definition: `inherits`, `interfaces`, `mixins`, `statics`, `protoinit`, `domain`, `constructor`.
- **Packages** — `Pkg.write('org.libspark.straw', …)` scopes definitions under fully-qualified names like `org.libspark.straw::Step`.
- **Named inheritance** — subclasses keep a live `base`/`factory` link to their superclass; interfaces are enforced at definition time.
- **Reflection** — look classes up by name or hash; ask an instance its qualified class name.
- **Domain attach** — classes declaring `domain: Type.appdomain` land on `window` under their simple name.

### Why it's the foundation

Both `strawexpress.js` and `betweenjs.js` wrap their body in `Pkg.write('org.libspark.straw', …)` and define every class with `domain: Type.appdomain`. That single convention is why you get `window.Express`, `window.Step`, `window.Response`, `window.BJS`, the easing families, and more — all for free, with the class registry (`Type.getDefinitionByName`) as a discoverable side table.

```js
Type.define({
  pkg: 'org.libspark.straw::step',
  name: 'Step',
  domain: window,
  inherits: EventDispatcher,
  constructor: function Step(id, commandOpen, commandClose){ /* … */ }
});
// → window.Step, fullqualifiedclassname 'org.libspark.straw::step::Step'
```

### Where it fits

- **StrawNode** loads `type.js` first; `require()` can even resolve classes by type name.
- **StrawExpress** — all classes (`Step`, `Response`, `Request`, `Express`, …) are `Type.define`.
- **BetweenJS** — all classes (tweens, eases, tickers, color) are `Type.define`.

### Full documentation

The complete README lives with the source:

- [Type on GitHub](https://github.com/sazaam/Type)
