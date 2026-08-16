## StrawNode & StrawExpress

*Write code, reload, see it.* No bundler. No build step. No `npm run dev`. A browser, an editor, and `require()`.

StrawNode is a **browser-side CommonJS module system**: it loads and evaluates JavaScript directly — no bundler, no transpiler. StrawExpress is its sister library: an **Express-style web framework that runs entirely in the browser**, with hash routing, middleware, and a Step-navigation tree.

### One script tag

<pre><code>&lt;script src=&quot;strawnode.js?starter=./app/&quot;&gt;&lt;/script&gt;</code></pre>

StrawNode reads its own script URL, locates the project root, pre-fetches `app/` (resolving `package.json` → `main`), recursively scans every module for `require(...)` calls, pre-fetches the whole dependency tree **asynchronously**, then evaluates it **synchronously** from cache and boots your app.

```js
// app/index.js — plain Node-style modules
var express = require('strawexpress');
var myThing = require('./my-thing');

var app = express();
app.get('/', function(req, res) {
  res.render('home', { title: 'My Site' });
});
app.listen('JSAddress', function() {
  app.createClient().get('/', app.routes).initJSAddress();
});
```

### How `require()` behaves

- **Module resolution** — `./file`, `./dir/` (via `package.json` `main`/`index` → `index.js`), and bare `strawnode_modules/name` ids (the browser analog of `node_modules`).
- **Module context** — each module evaluates with `module`, `require`, `exports`, `__filename`, `__dirname`, `__parameters`, `__public_root`, `__script_root` set for it; `require()` calls inside resolve relative to that module's directory.
- **Params** — `require(id, newparams)` merges a `?key=value` querystring into `__parameters`/`module.params`.
- **Debug** — `require.resolve(id)` prints the resolved URL; `require.getGraph()` returns `{cache, edges, stack}`.

### Routing, Express-style

- `app.get('/path', handler)` registers a route; `:param` segments compile to regexp matches; `app.get('*')` is the 404 catch-all.
- `app.use(fn)` is before-middleware (global or scoped to `/path`); `app.use('after', fn)` is a post-navigation hook.
- `app.listen('JSAddress')` boots the hash-URL listener chain.
- **Step lifecycle hooks** — `@focus`, `@toggle`, `@open`, `@close` on the Response are where you drop your animations.

```js
app.get('/about', function(req, res){
  res.render('about', { title: 'About' });
});
```

### Navigation as a tree

Steps form a nested tree with a singleton root (id `'@'`). `Step.play(child)`, `next()`, `prev()`, `handleUp()`, `handleDown()` walk it, and `Hierarchy` drives it from the URL:

```
AddressChanger (hashchange) → Hierarchy.redistribute(value)
   → formulate(path)        → route matching (regexp / :param / 404)
   → CommandQueue           → Step.open() / Step.close()
   → res.render()           → StrawJade template into the page
```

That tree is why deep sections (like this site's project steps) behave like real routes.

### Locale-aware addresses

`AddressHierarchy` + `AddressChanger` parse `#/xx/path/` routes where `xx` is a 2-letter locale (`en`, `ko`, …). Switching locale re-binds translations via `i18next.changeLanguage` without leaving the node.

### Where it fits

- **StrawNode** loads everything: `require('strawexpress')` returns the Express singleton; `require('strawnode_modules/betweenjs')` returns `BJS`.
- **StrawExpress** owns navigation and rendering — every module, template and route of this site is wired through it.
- **Type** is the substrate below both (see [Type](/#/{{lang}}/docs/code/type/)); **BetweenJS** animates the transitions (see [BetweenJS](/#/{{lang}}/docs/code/betweenjs/)).

### Full documentation

The complete READMEs live with the source:

- [StrawNode on GitHub](https://github.com/sazaam/strawnode)
- [StrawExpress on GitHub](https://github.com/sazaam/strawexpress)
