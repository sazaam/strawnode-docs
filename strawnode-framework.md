# StrawNode — The Framework That Gets Out of Your Way

---

## The Manifesto

Building for the web should feel like sketching on paper.

Instead, we've buried ourselves under ceremony. Build tools. Config files. Hot-reload pipelines. Dependency graphs that take thirty seconds to untangle before you can see a single pixel. The page load has become a *deployment*.

This is insane.

You had an idea ten seconds ago. An animation, a layout, a navigation flow. By the time Webpack finishes chewing through `node_modules`, the spark is gone. The momentum is gone. The *you* who wanted to try it is on Twitter instead.

StrawNode restores the original promise of the web: **write code, reload, see it.**

No bundler. No build step. No `npm run dev`. No CLI. No config files that require their own README.

A browser. An editor. `require()`. That's it.

This isn't a framework you learn. It's a framework that **gets out of your way** — so you can stay in the flow, iterate at the speed of thought, and ship prototypes that *feel* like production because they are.

---

## What It Is

StrawNode is a **browser-side CommonJS module system** that loads and evaluates JavaScript modules directly — no bundler, no transpiler, no magic. It ships with three sister libraries that together form a complete client-side web framework:

| Library | Role |
|---------|------|
| **StrawNode** | CommonJS `require()` in the browser. Loads modules via async pre-fetch + sync XHR fallback. |
| **StrawExpress** | Express-like routing, hash-based navigation, locale-aware address management, step lifecycle (`@focus` / `@toggle`). |
| **StrawJade** | Client-side Jade (Pug) template engine. Same syntax you know from Node.js, rendering in the browser. |
| **BetweenJS** | Zero-dependency tweening engine. Bezier curves, physics, serial/parallel chains, CSS transforms, color interpolation. |

Four files. Four thousand lines total. No dependencies. No `node_modules` ocean.

---

## Best Features

### Live `require()` — No Build Step

```javascript
var express = require('strawexpress');
var myModule = require('./my-thing');
var data = require('./data');
```

This just works. In the browser. No webpack, no vite, no rollup, no esbuild. The module loader pre-fetches the dependency tree on page load, and if something isn't cached yet — `require(path)` with a variable? no problem — it falls back to a synchronous XHR fetch transparently.

You edit your code, you refresh the browser, you see it. **Zero latency iteration.**

### Express-in-the-Browser

```javascript
var app = require('strawexpress')();

app.get('/', function(req, res) {
  res.render('home', { title: 'My Site' });
});

app.listen('JSAddress', function() {
  app.createClient().get('/', app.routes).initJSAddress();
});
```

Hash-based routing. Locale-aware (`/en/about`, `/fr/about`). Named parameters. Middleware. Step lifecycle callbacks for animated transitions. It's Express — but in the browser.

### StrawJade — Client-Side Templates

```jade
//- jade/home.jade
section.hero
  h1= title
  p.tagline A full-width gradient hero section
  a.cta(href="#/pricing") See Pricing
```

Rendered client-side from `jade/` files. Same syntax. No server round-trip for HTML.

### BetweenJS — Animation Without the Bloat

```javascript
BetweenJS.serial(
  BetweenJS.to(el, { opacity: 1, left: 500 }, 1, Back.easeOut),
  BetweenJS.func(function() { console.log('done'); })
).play();
```

4000 lines of pure tweening engine. Bezier physics. Serial and parallel chains. CSS transforms. Color interpolation. Easing families. Zero dependencies. One `requestAnimationFrame` loop drives everything.

### Modular by Nature, Not by Convention

No forced file structure. No pages directory. No `_app.tsx`. Just modules that `require()` each other like Node.js intended. Your app is a tree of small, focused files — each one easy to read, easy to test, easy to throw away when the prototype evolves.

### Debug — `require.resolve()` and `require.getGraph()`

Open the console. Type `require.resolve('./my-module')` to see exactly where StrawNode will look for a module. Type `require('./strawnode_modules/modgraph')` to render a live SVG of the entire loaded module tree — cache entries, dependency edges, and the current evaluation stack. Click any node to inspect its source.

Console `require()` resolves relative to the app directory, so you can load or inspect any module at runtime without digging through source files.

### What You Don't Need

| You don't need… | Because… |
|----------------|----------|
| A bundler | StrawNode loads modules natively |
| A build step | Edit → refresh → see |
| `npm install` (mostly) | All core libs ship as JS modules |
| A CLI | There is no CLI. There is an editor. |
| A config file | There is no config. There is `require()`. |
| Hot module reloading | A refresh is 50ms. You don't need HMR. |

---

## Getting Started — Stellar Design Studio

Let's build a real three-section website: **Home**, **About**, and **Pricing**. Responsive. Animated. CSS-only gradients and shapes. No images. No build step. Total code: ~80 lines of JS + 50 lines of templates + 60 lines of CSS.

### Project Structure

```
project/
├── index.html              ← loads strawnode.js with your app as starter
├── strawnode.js            ← the loader (drop it in)
├── app/
│   ├── index.js            ← entry point: routes, listen
│   └── graphics.js         ← @focus/@toggle BetweenJS animations
├── jade/
│   ├── home.jade
│   ├── about.jade
│   └── pricing.jade
├── strawnode_modules/
│   ├── strawexpress.js
│   ├── strawjade.js
│   ├── betweenjs.js
│   └── (any other modules you need)
└── css/
    └── style.css
```

### Step 1 — `index.html`

```html
<script src="strawnode.js?starter=./app/"></script>
```

That's it. One `<script>` tag. It loads Strawnode, which pre-fetches `app/index.js` and all its dependencies, then evaluates the tree and boots your app.

### Step 2 — `app/index.js`

```javascript
var express = require('strawexpress');
var app = express();

app.set('view engine', 'jade');
app.set('views', './jade/');

var graphics = require('./graphics');

// ── Home ──
app.get('/', function(req, res) {
    res.render('home', {
        title: 'Stellar — Design Studio',
        headline: 'We craft digital experiences',
        tagline: 'Minimal. Elegant. Fast.'
    });
});

// ── About ──
app.get('/about', function(req, res) {
    res.render('about', {
        title: 'About — Stellar',
        mission: 'Beauty lives in the details.',
        team: [
            { name: 'Ana Voss', role: 'Creative Director' },
            { name: 'Marc Liu',  role: 'Lead Engineer' },
            { name: 'Yuki Sato', role: 'Design Lead' }
        ]
    });
});

// ── Pricing ──
app.get('/pricing', function(req, res) {
    res.render('pricing', {
        title: 'Pricing — Stellar',
        plans: [
            { name: 'Starter',  price: 19,  features: ['3 projects', 'Basic analytics', 'Email support'] },
            { name: 'Pro',      price: 49,  features: ['15 projects', 'Advanced analytics', 'Priority support', 'Custom domain'] },
            { name: 'Enterprise', price: 149, features: ['Unlimited projects', 'Real-time analytics', '24/7 support', 'White-label', 'API access'] }
        ]
    });
});

app.get('*', function(req, res) {
    res.render('home', { title: 'Stellar', headline: 'Page not found', tagline: 'Let\'s get you back home.' });
});

// ── Boot ──
app.listen('JSAddress', function() {
    app.createClient()
        .get('/', app.routes)
        .initJSAddress();
});
```

26 lines. Three routes. A 404 fallback. Ready.

### Step 3 — Templates

**`jade/home.jade`**
```jade
section.hero
    .hero-bg
    .hero-content
        h1= headline
        p.tagline= tagline
        a.cta-btn(href="#/pricing") View Plans
```

**`jade/about.jade`**
```jade
section.about
    .mission
        h2 Our Mission
        p= mission
    .team
        each member in team
            .card
                .avatar
                    .avatar-initials= member.name.charAt(0) + member.name.split(' ').pop().charAt(0)
                h3= member.name
                p.role= member.role
```

**`jade/pricing.jade`**
```jade
section.pricing
    h2 Choose Your Plan
    .plans
        each plan in plans
            .plan-card(class= plan.name === 'Pro' ? 'featured' : '')
                h3.plan-name= plan.name
                .plan-price
                    span.currency $
                    span.amount= plan.price
                    span.period /mo
                ul.features
                    each feature in plan.features
                        li= feature
                a.cta-btn(href="#/pricing") Get Started
```

### Step 4 — `app/graphics.js` (Animations)

```javascript
var BJS = require('strawnode_modules/betweenjs');

exports.focus = function(res) {
    var el = res.template;
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    BJS.to(el, { opacity: 1, transform: { translateY: 0 } }, 0.6, Quart.easeOut).play();
};

exports.toggle = function(res) {
    if (res.opening) {
        exports.focus(res);
    } else {
        var el = res.template;
        BJS.to(el, { opacity: 0, transform: { translateY: -20 } }, 0.4, Quart.easeIn).play();
    }
};
```

### Step 5 — `css/style.css`

```css
/* ── Reset & Base ── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
       background: #0a0a0f; color: #e0e0e8; line-height: 1.6; }

/* ── Hero ── */
.hero { min-height: 80vh; display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden; }
.hero-bg { position: absolute; inset: 0;
           background: linear-gradient(135deg, #1a0533 0%, #0d1b3e 40%, #001f1f 100%); }
.hero-bg::after { content: ''; position: absolute; inset: 0;
                  background: radial-gradient(ellipse at 30% 50%, rgba(100, 60, 255, .15) 0%, transparent 60%),
                              radial-gradient(ellipse at 70% 50%, rgba(0, 200, 180, .1) 0%, transparent 60%); }
.hero-content { position: relative; text-align: center; padding: 2rem; }
.hero-content h1 { font-size: 3.5rem; font-weight: 700;
                   background: linear-gradient(135deg, #c084fc, #60a5fa, #2dd4bf);
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; }
.tagline { font-size: 1.25rem; color: #8888a0; margin: 1rem 0 2rem; }

/* ── CTA ── */
.cta-btn { display: inline-block; padding: .8rem 2rem; border-radius: 40px;
           background: linear-gradient(135deg, #7c3aed, #2563eb);
           color: #fff; text-decoration: none; font-weight: 600;
           transition: transform .2s, box-shadow .2s; }
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124, 58, 237, .4); }

/* ── Section Common ── */
section { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
h2 { font-size: 2rem; margin-bottom: 2rem; text-align: center;
     background: linear-gradient(135deg, #c084fc, #60a5fa);
     -webkit-background-clip: text; -webkit-text-fill-color: transparent;
     background-clip: text; }

/* ── About - Team Cards ── */
.mission { text-align: center; max-width: 600px; margin: 0 auto 3rem; color: #8888a0; font-size: 1.15rem; }
.team { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
.card { background: linear-gradient(145deg, #141422, #1a1a2e); border-radius: 16px;
        padding: 2rem; text-align: center; border: 1px solid rgba(255,255,255,.06); }
.avatar { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 1rem;
          display: flex; align-items: center; justify-content: center; }
.card:nth-child(1) .avatar { background: linear-gradient(135deg, #7c3aed, #c084fc); }
.card:nth-child(2) .avatar { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.card:nth-child(3) .avatar { background: linear-gradient(135deg, #0d9488, #2dd4bf); }
.avatar-initials { color: #fff; font-weight: 700; font-size: 1.4rem; }
.card h3 { margin-bottom: .3rem; }
.role { color: #8888a0; font-size: .9rem; }

/* ── Pricing ── */
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;
         align-items: start; }
.plan-card { background: linear-gradient(145deg, #141422, #1a1a2e); border-radius: 16px;
             padding: 2rem; border: 1px solid rgba(255,255,255,.06); text-align: center; }
.plan-card.featured { border-color: rgba(124, 58, 237, .3);
                      box-shadow: 0 0 30px rgba(124, 58, 237, .1);
                      transform: scale(1.05); }
.plan-price { margin: 1rem 0; }
.currency { font-size: 1.2rem; vertical-align: top; color: #8888a0; }
.amount { font-size: 3rem; font-weight: 700; background: linear-gradient(135deg, #c084fc, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.period { color: #8888a0; font-size: .9rem; }
.features { list-style: none; margin: 1.5rem 0; text-align: left; }
.features li { padding: .5rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
.features li::before { content: '✓ '; color: #2dd4bf; }
```

### Run It

```bash
node app.js
# → listening on port 3000
open http://localhost:3000
```

Click between Home, About, and Pricing. Watch sections animate in with a smooth fade-slide. Everything renders client-side. The hash changes. The back button works. You just built a three-page animated website in **~25 lines of JS**.

Now change the headline. Refresh. Change the colors. Refresh. Add a route. Refresh. **Zero latency iteration.**

---

## The Flow — How It All Connects

```
index.html
  <script src="strawnode.js?starter=./app/">
    │
    ├─ Strawnode pre-fetches the entire dependency tree
    │  (async XHR, regex-extracts require() calls)
    │    │
    │    ├─ ./app/index.js
    │    ├─ strawnode_modules/strawexpress.js
    │    ├─ strawnode_modules/strawjade.js
    │    ├─ strawnode_modules/betweenjs.js
    │    └─ ./app/graphics.js
    │
    ├─ Evaluates the tree (sync, from cache)
    │    └─ app/index.js runs:
    │         ├─ require('strawexpress') → creates Express app
    │         ├─ app.get('/', ...)       → registers routes
    │         ├─ app.set('view engine')  → configures Jade
    │         └─ app.listen()            → boots AddressChanger
    │
    ├─ User clicks link → hash changes → AddressChanger fires
    │    └─ app.get('/about') handler → res.render('about', data)
    │         └─ StrawJade compiles template → injects HTML
    │              └─ @focus hook → graphics.js → BetweenJS animates it in
    │
    └─ Dynamic routes (variable paths) → sync XHR fallback
         └─ require(path) → ModuleLoader.fetchSource(url) → works transparently

    └─ Debug from console:
         ├─ require.resolve('./module') → prints resolved URL
         ├─ require.getGraph() → returns {cache, edges, stack}
         └─ require('./strawnode_modules/modgraph') → renders SVG graph
```

### Module Graph

```javascript
// After bootstrap, open console:
require('./strawnode_modules/modgraph')
// → Appends an interactive dependency graph SVG to document.body
// Click any node to inspect its source
```

---

## Who This Is For

**Prototypers** who need to show a client a working, animated interface — not a Figma file, not a static mockup — in an afternoon.

**Designers who code** and want to iterate layout, animation, and navigation at the speed of thought — without waiting for a build pipeline to catch up.

**Developers tired of tooling** who remember when the web was just HTML, CSS, and JS in a folder, and want that back — but with modules, routing, and templates.

**Anyone** who has ever thought *"I bet I could build this UI in an hour if I didn't have to set up a project first."*

---

## The Vision

The web is the most powerful prototyping platform ever built. Billions of people have a browser in their pocket. Every browser is a runtime. Every tab is a fresh canvas.

StrawNode is just the thinnest possible layer that lets you use it — without someone else's build tool, without someone else's CLI, without someone else's idea of how your project should be structured.

**Write code. Reload. See it.**

That's the entire framework.

Now go build something. The browser is waiting.
