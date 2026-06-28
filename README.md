StrawNode Docs
==============

Documentation for The STRAW Project
(StrawNode, StrawExpress, StrawJade, and toolkits)

## What is StrawNode?

StrawNode is a **browser-side CommonJS module system** — live `require()` in the browser,
no bundler, no build step. It pre-fetches your dependency tree on page load (async XHR),
evaluates modules from cache, and falls back to sync XHR for on-demand `require()` calls.

Sister libraries:

| Library | Role |
|---------|------|
| **StrawNode** | CommonJS `require()` in the browser |
| **StrawExpress** | Express-like routing, hash navigation, step lifecycle |
| **StrawJade** | Client-side Jade (Pug) template engine |
| **BetweenJS** | Zero-dependency tweening engine |
| **unit.js** | Async test framework with 31 assertions |
| **modgraph.js** | Live module dependency graph visualizer |

## Key Features

- **Live require** — `require('./my-module')` just works, no webpack/vite
- **On-demand fallback** — dynamic `require(path)` triggers sync XHR transparently
- **Debug utilities** — `require.resolve(id)` prints resolved URL; `require.getGraph()` returns `{cache, edges, stack}`
- **Module graph** — open console and run `require('./strawnode_modules/modgraph')` to visualize dependencies
- **Async testing** — `unit.js` supports `done()` callbacks, promises, setup/teardown, deferred summary
- **Type system** — `Type.define`, `Type.is`, `Type.of`, `Type.make` — lightweight OOP
- **GestureManager** — Pointer-based gesture detection (`@swipe`, drag, tap) via `gesture.js`
- **KeyboardManager** — Declarative keyboard shortcuts via `keyboard.js`

## Getting Started

```html
<script src="/js/strawnode.js?starter=./strawnode_app/"></script>
```

That's it. See [`strawnode-framework.md`](strawnode-framework.md) for a full tutorial.


## Project Structure

```
public/
  js/
    strawnode.js          ← the loader (include in your HTML)
    strawnode_app/
      index.js                  ← entry point
      graphics.js               ← animations
      events.js                 ← touch/pointer events
      package.json              ← module dependencies
      strawnode_modules/        ← modules
        strawexpress.js
        strawjade.js
        betweenjs.js
        gesture.js
        keyboard.js
        type.js
        unit.js
        modgraph.js
        trace.js
```

Your app's main module is passed as a query parameter:

```html
<script src="/js/strawnode.js?starter=./strawnode_app/"></script>
```

StrawNode pre-fetches the entire dependency tree, evaluates it, and boots your app.
From the console, `require()` resolves relative to the app directory, so you can
inspect or load modules on demand:

```js
require.resolve('./my-module')        // debug path resolution
require('./strawnode_modules/modgraph')  // render dependency graph
```

## Module Resolution

Supports the same patterns as Node.js:

- `'./my-module.js'` — direct file path
- `'./my-module/'` — looks for `package.json` then `index.js`
- `'strawexpress'` — bare name resolves to `strawnode_modules/`

## Getting Started

A full tutorial with an animated three-page site is in
[`strawnode-framework.md`](strawnode-framework.md).