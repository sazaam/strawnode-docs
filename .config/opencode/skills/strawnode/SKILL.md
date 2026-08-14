# StrawNode — Loader Skill

Browser-side CommonJS module system with async dependency pre-fetching and sync evaluation. Raw ES5 with custom `require()` polyfill.

Use ONLY when working in `/home/saz/Sites/github/strawAI/public/js/strawnode.js` (renamed from `strawnode_async.js`) or the mirrored `strawnode-docs` path.

## Quick Reference

- **Source**: `/home/saz/Sites/github/strawAI/public/js/strawnode.js` (1212 lines)
- **Mirror**: `/home/saz/Sites/github/strawnode-docs/public/js/strawnode.js`
- **Landing entry**: `/home/saz/Sites/github/strawAI/public/jade/index.jade` (loader boot + shader + `window.strawnodeLogger` config)
- **License**: MIT

## Architecture

Two-phase loading: **async fetch** → **sync evaluation**.

```
fetchModuleTree (Promise, pre-fetches dependency graph bottom-up)
  └─ ModuleLoader.load (XHR/fetch, caches in ModuleLoader.cache)
       └─ extractDependencies (regex-based require() scanning)

evaluateModule (sync, walks dependency graph depth-first)
  └─ cache[id] = modInstance  (eager, handles circular deps)
       └─ simfunc (indirect eval, module wrapper)
            └─ (0, eval)(source) with global backup/restore
```

### Fetch Phase (`fetchModuleTree`)

At `strawnode.js:518`. Recursive promise-based async loading of the entire dependency tree.

```
fetchModuleTree(url, params, asType, base)
  │
  ├─ Check cycle (fetchStack), dedup (fetchCache)
  ├─ ModuleLoader.load → source stored in ModuleLoader.cache[url]
  ├─ extractDependencies → scan for `require('...')` calls
  │     ├─ Strip comments first (/* */, //)
  │     ├─ Detect bundled files (Webpack, Browserify, UMD) → skip
  │     └─ Regex: /require\s*\(\s*(['"])([^'"]+)\1/g
  │
  └─ For each dep → recurse fetchModuleTree(dep, {}, resolvedType, newRoot)
        └─ Promise.all → resolves only after ALL deps fetched
```

### Eval Phase (`evaluateModule`)

At `strawnode.js:637`. Synchronous because all sources are cached after fetch phase.

```javascript
var evaluateModule = function (id, newparams, isRootCall, base) {
    // 1. Check window global cache (pre-loaded modules from <script> tags)
    if (!!(s = window[id])) return (s instanceof Module) ? s.exports : s;

    // 2. Check Type system (legacy)
    if (cte || (cte = checkTypeExists())) {
        if (!!(s = Type.getDefinitionByName(id))) return Type.is(s, Module) ? s.exports : s;
    }

    // 3. Resolve id and check cache
    id = ModuleLoader.concatRoot(id, base);
    if (!!(s = cache[id])) return (s instanceof Module) ? s.exports : s;

    // 4. Resolve module type (file/dir/node_mods), get source from ModuleLoader.cache
    // 5. Create Module instance, eager-cache it (handles circular deps)
    var modInstance = new Module(requestedid);
    cache[id] = modInstance;

    // 6. Run module source via simfunc
    r = simfunc(resp, modInstance, requestedid, params, finalFileUrl.replace(filename_r, ''));

    // 7. Return exports
    s = cache[id];
    return (s instanceof Module) ? s.exports : s;
};
```

### Module Object

At `strawnode.js:340`.

```javascript
var Module = function Module(id, filename, dirname, params) {
    this.id = id;
    this.filename = filename;
    this.dirname = dirname || '';
    this.params = params;
    this.exports = {};
    this.loaded = false;

    this.destroy = function destroy() {
        for (var s in this)
            delete this[s];
        return undefined;
    }
};
```

### `ModuleLoader.cache` vs `fetchCache` vs `cache`

| Cache | Phase | Key | Value |
|-------|-------|-----|-------|
| `ModuleLoader.cache` | Fetch | Resolved URL string | Raw source string |
| `fetchCache` | Fetch | Initial URL string | `Promise` (dedup) |
| `cache` | Eval | Resolved module id | `Module` instance |

### `module.require` and `window.require`

**`module.require`** (created per-module in `simfunc`):
- Delegates to `evaluateModule(id, newparams, false, dirname)`
- Resolves relative to the requiring module's `dirname`

**`window.require`** (the global):
- At `strawnode.js:794`
- Resolves relative to `ModuleLoader.js_root` (the strawnode script's base)
- Used by `startAsync` for initial bootstrap

### Dependency String Conventions

| Prefix | Type | Example |
|--------|------|---------|
| `./` or `../` | Relative file | `./routes.js` |
| No prefix | Directory | `app/` → `app/index.js` or `app/package.json` |
| Ends with `/` | Directory | `components/` |
| `strawnode_modules/` | Node module | `strawnode_modules/express/` |
| Bare name (no `./`, no `../`, no path) | Node module (fallback) | `strawnode_modules/` is automatically prepended |

## `simfunc` — The Module Wrapper

At `strawnode.js:356`. The core function that runs each module's source code.

### Evolution

| Approach | Offset | Mechanism | Era |
|----------|--------|-----------|-----|
| `new Function()` | 4 lines | `new Function(params..., resp)` + invocation | Original |
| Eval IIFE | 1 line | `(0, eval)('(function(...){void 0;\\n' + resp + '})')` with factory call | Previous |
| Global eval | **0 lines** | `(0, eval)(resp + ';\\n//# sourceURL=...')` with window globals | Current |

### Current Implementation

```javascript
var simfunc = function (resp, module, url, params, explicitFilename) {
    var dirname = module.dirname = ModuleLoader.getModuleRoot();
    var filename = module.filename = explicitFilename || ...;
    moduleStack.push(filename || url);

    module.require = function (id, newparams) {
        return evaluateModule(id, newparams, false, dirname);
    };

    var PROLOGUE_LINES = 0;
    module.params = params;

    // Neutralize 'use strict' on the same line (preserves backward compat)
    var source = resp.replace(
        /^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*)*\s*(['"])\s*use\s+strict\s*\1\s*;?\s*/,
        function(m) { return 'void 0;' + m; }
    ) + ';\n//# sourceURL=' + (module.dirname + module.filename);

    // Backup globals, set module context
    var _saved_module = window.module;
    var _saved_require = window.require;
    var _saved_exports = window.exports;
    // ... (save all 8 globals)
    window.module = module;
    window.require = module.require;
    window.exports = module.exports;
    // ... (set all 8 globals)

    try {
        (0, eval)(source);
    } catch (e) {
        moduleStack.pop();
        // Extract V8 line:col from frames[1], adjust by PROLOGUE_LINES
        var loc = '';
        if (e.stack) {
            var frames = e.stack.split('\n');
            if (frames.length > 1) {
                var re = /:(\d+):(\d+)/g, match, lastLine = 0, lastCol = 0;
                while ((match = re.exec(frames[1])) !== null) {
                    lastLine = parseInt(match[1], 10);
                    lastCol = parseInt(match[2], 10);
                }
                if (lastLine) loc = ':' + (lastLine - PROLOGUE_LINES) + ':' + lastCol;
            }
        }
        var err = e.constructor(e.message + '\n    at ' + module.dirname + module.filename + loc + chain);
        throw err;
    } finally {
        // Restore globals (runs on both success and error paths)
        window.module = _saved_module;
        // ... (restore all 8)
    }
    moduleStack.pop();
    module.loaded = true;
};
```

CAUTION: `simfunc` doesn't return anything. The caller `evaluateModule` ignores `r` and reads exports from `cache[id].exports`. Never add a `return module` — it's dead code.

### Key Patterns in `simfunc`

### Pattern: Zero-offset Module Wrapping via Global Eval

**Context**: Module wrappers (IIFE, `new Function()`) add V8 wrapper lines that shift error line numbers, making debugging confusing.

**Implementation**: Instead of wrapping in a function where `module`/`require`/`exports` are parameters, set them as temporary globals on `window`, run the source directly via indirect eval `(0, eval)(source)`, then restore globals in `finally`. This eliminates ALL wrapper-line offset.

**Line mapping**:
- `PROLOGUE_LINES = 0` → error at file line K shows as V8 line K
- Sync errors: adjusted in `simfunc` catch block via `lastLine - PROLOGUE_LINES`
- Async errors (e.g., `dispatchSNEvent("strawnode-ready")` → event handler): browser shows raw V8 line = file line (no adjustment needed)

### Pattern: On-line `'use strict'` Neutralization

**Context**: Modules like `strawjade.js` start with `'use strict'` but rely on implicit globals (`jade = require(...)` without `var`). When running via eval, `'use strict'` at the top enables strict mode for the entire eval scope, which throws ReferenceError.

**Implementation**: Match `'use strict'` at the start of the file (skipping leading comments/whitespace) and prepend `void 0;` on the SAME line. Since `void 0;` is the first expression statement, `'use strict'` gets pushed out of the directive prologue, disabling strict mode without adding extra lines.

```javascript
// The regex handles: whitespace, // line comments, /* block comments */, then 'use strict'
var source = resp.replace(
    /^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*)*\s*(['"])\s*use\s+strict\s*\1\s*;?\s*/,
    function(m) { return 'void 0;' + m; }
);
```

For `strawjade.js` (`/* StrawJade */\n'use strict' ;`):
```
// Before:
/* StrawJade */
'use strict' ;
jade = require('./strawnode_modules/jade_async') ;

// After:
void 0;/* StrawJade */
'use strict' ;
jade = require('./strawnode_modules/jade_async') ;
```

`void 0;` terminates the directive prologue. `'use strict'` on the next line is a regular expression statement (no-op). Strict mode is NOT enabled. Implicit globals work. Line numbers are preserved.

### Pattern: SourceURL for Eval'd Code

**Context**: Indirect `eval()` produces anonymous `<anonymous>` frames in DevTools. Without sourceURL, breakpoints and stack traces show no filename.

**Implementation**: Append `';\n//# sourceURL=' + filename` to the eval string. The `;` terminates the last statement; V8 strips the sourceURL comment line from line numbering.

```javascript
var source = resp + ';\n//# sourceURL=' + (module.dirname + module.filename);
(0, eval)(source);
// Stack trace shows: at eval (filename:line:col) instead of at eval (<anonymous>)
```

V8 behavior: sourceURL REPLACES the resource name. Line numbers are relative to the eval string, excluding the sourceURL line itself.

### Pattern: Global Backup/Restore

**Context**: Module code references `module`, `require`, `exports`, `__filename`, `__dirname` as if they're in scope. Without a function wrapper, these must be available as globals during eval. After eval, they must be cleaned up to prevent pollution.

**Implementation**: Save globals before, restore in `finally` (runs on both success and error):

```javascript
var _saved_module = window.module;
var _saved_require = window.require;
// ... save all 8
window.module = module;
window.require = module.require;
window.exports = module.exports;
// ... set all 8

try {
    (0, eval)(source);
} catch (e) {
    // ... handle error, rethrow
} finally {
    window.module = _saved_module;
    window.require = _saved_require;
    // ... restore all 8
}
```

### Pattern: UMD Libs Don't Create Globals (Consume via `require`)

**Context**: The eval shim injects `window.module`/`window.exports`/`window.require` before `(0, eval)(source)`. UMD bundles (i18next, lazyload, jQuery, etc.) detect `typeof exports === 'object' && typeof module !== 'undefined'` and take the CommonJS branch — populating `module.exports` but **never** assigning `window.i18next`/`window.LazyLoad`. The app then hits `ReferenceError: i18next is not defined`.

- Old-style IIFEs (jQuery 1.8.1) and plain top-level `function` declarations (shadertoylite) still create globals → those keep working as bare identifiers.
- Plain-function modules have empty `module.exports` unless the file ends with `module.exports = MyGlobal;`.

**Fix (app-side, verified 2026-08)**: In `strawnode_app/index.js` bootstrap (after package.json deps are evaluated, before `strawnode-ready`):
```js
window.i18next = require('./strawnode_modules/strawnode_modules/i18next.js') ;
window.LazyLoad = require('./strawnode_modules/strawnode_modules/lazyload.js') ;
```
And in consuming modules (e.g. `sectionbehavior.js`) use `require` locals instead of globals:
```js
var i18next = require('./strawnode_modules/strawnode_modules/i18next.js') ;
var LazyLoad = require('./strawnode_modules/strawnode_modules/lazyload.js') ;
var ShaderToyLite = require('./strawnode_modules/strawnode_modules/shadertoylite.js') ; // requires shadertoylite.js to end with module.exports = ShaderToyLite;
```
**Path convention (critical)**: A package.json dep listed as `"x": "strawnode_modules/x.js"` resolves at fetch time to the DOUBLE-nested `strawnode_modules/strawnode_modules/x.js` (the `strawnode_modules/` prefix makes the loader set baseOverride to the single-nested dir, then node_mods resolution prepends `./strawnode_modules/` again). App-source `require()` of such packages MUST use the same double-nested path — a single-nested `require('./strawnode_modules/x.js')` evaluates fine (instance cache) but fails the PRE-FETCH phase (404 → `failed (fallback to dir)` → `Failed to pre-fetch dependency`, plus circular-dependency warnings in the load logger).

### Pattern: Enriched Error with Require Chain

**Context**: Errors inside eval'd module code have stack traces pointing to the module source but don't show the require chain.

**Implementation**: In the catch block, pop `moduleStack`, format the remaining chain, extract V8 line:col, and throw a new error with the same constructor and a message that includes both the original message and the enriched location:

```javascript
} catch (e) {
    moduleStack.pop();
    var chain = moduleStack.length
        ? '\n  require chain:\n    ' + moduleStack.join('\n    -> ')
        : '';
    var loc = '';
    if (e.stack) {
        var frames = e.stack.split('\n');
        if (frames.length > 1) {
            var re = /:(\d+):(\d+)/g, match, lastLine = 0, lastCol = 0;
            while ((match = re.exec(frames[1])) !== null) {
                lastLine = parseInt(match[1], 10);
                lastCol = parseInt(match[2], 10);
            }
            if (lastLine) loc = ':' + (lastLine - PROLOGUE_LINES) + ':' + lastCol;
        }
    }
    var err = e.constructor(
        e.message + '\n    at ' + module.dirname + module.filename + loc + chain
    );
    throw err;
}
```

### Pattern: Eager Cache for Circular Dependencies

**Context**: Circular requires (`A → B → A`) cause infinite recursion if the cache isn't populated before entering `simfunc`.

**Implementation**: In `evaluateModule`, create the Module instance and store it in `cache[id]` BEFORE calling `simfunc`:

```javascript
var modInstance = new Module(requestedid);
cache[id] = modInstance;  // Eager! Handles circular deps
r = simfunc(resp, modInstance, requestedid, params, ...);
```

When the circular require comes back to the same module, `cache[id]` is found and the `exports` object (possibly partially populated) is returned immediately.

### Pattern: Fetch-Tree Diamonds Are Not Circular (Dedup Before Check)

**Context**: `fetchModuleTree` (pre-fetch phase) used to check `fetchStack` for an in-flight URL BEFORE consulting `fetchCache`. Shared dependencies — a diamond like `app → index.js → i18next` and `app → index.js → routes → sectionbehavior → i18next` — fire a false-positive "Circular dependency detected: ... -> i18next.js" warning whenever a second requester pulls the same URL while the first fetch is still in flight. It is a DAG, not a cycle; `fetchCache` already dedups the in-flight promise correctly.

**Fix (strawnode.js `fetchModuleTree`, verified 2026-08)**: resolve the URL and short-circuit on `fetchCache[initialUrl]` / `ModuleLoader.cache[initialUrl]` BEFORE the `fetchStack` membership check:

```javascript
var fetchModuleTree = function (url, params, asType, base) {
    var finalUrl = resolveModuleUrl(url, asType, base);
    var initialUrl = finalUrl;
    if (fetchCache[initialUrl]) return fetchCache[initialUrl];
    if (ModuleLoader.cache[initialUrl])
        return Promise.resolve({ url: initialUrl, source: ModuleLoader.cache[initialUrl], type: asType, rootUrl: url });
    if (fetchStack.indexOf(url) !== -1)
        console.warn("[StrawNode Loader] Circular dependency detected: " + fetchStack.concat([url]).join(' -> '));
    fetchStack.push(url);
    ...
```

`fetchCache[initialUrl]` is set synchronously at the start of every `fetchModuleTree` call, so any in-flight re-request dedups silently and the diamond warning never fires. Genuine cycles are still safe — the dedup also prevents infinite recursion, and the retained stack check remains a safety net for failed (cleared) cache entries.

## `'use strict'` Neutralization — Why It Matters

Modules that run via `simfunc` eval might start with `'use strict'` as their first statement. In eval, this enables strict mode for the entire eval scope. Some modules rely on sloppy-mode behavior:

| Module | Line | Pattern | Strict mode would cause |
|--------|------|---------|------------------------|
| `strawjade.js` | `jade = require(...)` | Implicit global assignment | `ReferenceError: jade is not defined` |
| Any legacy module | `weretested = true` | Undeclared variable | `ReferenceError` |

The neutralization regex handles all comment/whitespace variants before `'use strict'`:

```
Input                               → Output (line count preserved)
'use strict';                       → void 0;'use strict';
/* license */\n'use strict' ;      → void 0;/* license */\n'use strict' ;
'use strict';\n'use strict';        → void 0;'use strict';\n'use strict';
                                    (second directive not reached)
\n  'use strict';                   → void 0;\n  'use strict';
```

NOTE: In the old IIFE approach, `void 0;` in the IIFE body served the same purpose. The `'use strict'` inside the IIFE was neutralized differently (it was the second statement in the body, after `void 0;`). With the global eval approach, the neutralization must happen in the source code itself.

## Error Line Number Handling

### V8 Line Offsets by Wrapper Type

| Wrapper | PROLOGUE_LINES | Explanation |
|---------|---------------|-------------|
| `new Function(params..., body)` | 4 | 2 V8 wrapper lines + `var` prologue (2 lines for `module`, `require` etc.) |
| Eval IIFE `(function(...){void 0;\\n<resp>})()` | 1 | IIFE declaration line + `void 0;` are on same line, module source starts on line 2 |
| Global eval `(0, eval)(resp + sourceURL)` | **0** | Module source starts at line 1, no wrapper |

### How PROLOGUE_LINES Works

```javascript
// In simfunc catch block:
var re = /:(\d+):(\d+)/g, match, lastLine = 0, lastCol = 0;
while ((match = re.exec(frames[1])) !== null) {
    lastLine = parseInt(match[1], 10);
    lastCol = parseInt(match[2], 10);
}
if (lastLine) loc = ':' + (lastLine - PROLOGUE_LINES) + ':' + lastCol;
```

`frames[1]` = the first stack frame inside the module code (after the `eval` frame). Extract the last line:col from that frame (catches both `line:col` and `file:line:col` patterns).

### Async Errors

Async errors (e.g., from `dispatchSNEvent("strawnode-ready")` → event handlers) are NOT caught by `simfunc`'s try-catch. The browser's `window.onerror` or DevTools shows the raw V8 line. With `PROLOGUE_LINES = 0`, these match the source file directly — no adjustment needed.

## Dependency Extraction

At `strawnode.js:461`.

```javascript
var extractDependencies = function (source) {
    var deps = [];

    // 1. Strip comments
    var cleanSource = source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*/g, ' ');

    // 2. Detect bundled files (skip if Webpack/Browserify/UMD)
    var head = cleanSource.substring(0, 3000);
    var bundlerSignatures = /__webpack_require__|\bdefine\.amd\b|.../;
    if (bundlerSignatures.test(head)) return deps;

    // 3. Extract require() calls
    var reqRegex = /require\s*\(\s*(['"])([^'"]+)\1/g;
    var match;
    while ((match = reqRegex.exec(cleanSource)) !== null) {
        deps.push(match[2]);
    }
    return deps;
};
```

### Comment Stripping

- **Must** strip comments before scanning for `require()` calls to avoid loading commented-out dependencies.
- Multi-line comments → space (not empty) to prevent merging tokens across the removed region.
- Single-line comments → space to prevent merging with the following line.

### Bundler Detection

Pre-bundled files (Webpack, Browserify, UMD) contain their own `require()`-like calls internally. StrawNode skips dependency extraction for files that match bundler signatures in the first 3000 characters. This prevents false-positive pre-fetches.

## Module Resolution Types

At `strawnode.js:441`.

| Type | Detection | Resolution |
|------|-----------|------------|
| `file` | Has extension (`/path/to/mod.js`) or no extension with `./` prefix | `ensureExtension(ModuleLoader.concatRoot(id, base))` |
| `dir` | Ends with `/` or no extension, no `./` prefix | Checks `package.json` → `main` or `index`, falls back to `index.js` |
| `node_mods` | Starts with `strawnode_modules/` or bare name | `ModuleLoader.concatRoot('./strawnode_modules/' + modId, base)` |

### Directory Resolution Fallback Chain

```
file resolve → if failed: try dir resolve
dir resolve → check package.json → index.js
node_mods → resolve relative to strawnode_modules/
```

### `package.json` Support

At `strawnode.js:591`. When a directory resolves to `package.json`, values are used:

```javascript
var pakageJSON = new Function('return ' + resp)();
var index = pakageJSON.main || pakageJSON.index || './' + DEFAULT_JS_NAME + '.js';
```

Extra deps from `package.json` `dependencies` are also pre-fetched:
- Dependencies prefixed with `strawnode_modules/` resolve relative to the module's own `strawnode_modules/` (nesting support)
- Other deps resolve via normal `node_mods` resolution

## Module Loading Event Flow

```
startAsync(starter, params)
  │
  ├─ fetchModuleTree(starter, params, resolvedType, root)
  │    └─ Recursive Promise.all for all deps
  │         └─ ModuleLoader.load (XHR) → ModuleLoader.cache[url]
  │              └─ extractDependencies → recurse
  │
  └─ .then → require(starter, params)
       └─ evaluateModule(starter, params, ...)
            └─ For each dep → module.require(dep)
                 └─ evaluateModule(dep, ...)  (recursive, sync)
                      ├─ cache hit → return exports
                      └─ cache miss → simfunc(source, ...)
                           └─ (0, eval)(source) with globals
```

### Bootstrap Entry

At `strawnode.js:857` (now with `snLifecycle` state + opt-in logger init):

```javascript
var startAsync = function (startId, startParams) {
    if (startParams && startParams.dev) devMode = true;
    if (!STRAWNODE) { /* init baseparams, js_root */ }

    if (startParams && startParams.logger && String(startParams.logger) !== '0')
        Logger.init(window.strawnodeLogger || {});

    var asType = resolveModuleType(startId);
    snLifecycle = 'fetching';
    logLoad(startId, "initiating bootstrap");
    fetchModuleTree(startId, startParams, asType, ModuleLoader.js_root)
        .then(function () {
            logLoad(startId, "bootstrap fetched, evaluating tree...");
            try {
                require(startId, startParams);
            } catch (evalErr) {
                snLifecycle = 'error';
                dispatchSNEvent("strawnode-error", { starter: startId, error: evalErr, ... });
                return;
            }
            logLoad(startId, "bootstrap complete");
            snLifecycle = 'bootstrapped';
            dispatchSNEvent("strawnode-bootstrapped", { starter: startId, graph: require.getGraph() });
            // setModuleRoot(...)
            snLifecycle = 'ready';
            dispatchSNEvent("strawnode-ready", { starter: startId });
        })
        .catch(function (err) {
            snLifecycle = 'error';
            dispatchSNEvent("strawnode-error", { starter: startId, error: err, ... });
        });
};
```

Events dispatched (in order):
- `strawnode-bootstrapped` — app evaluated, dependency graph available (`detail.graph = require.getGraph() = { cache, edges, stack }`)
- `strawnode-ready` — application loaded and evaluated successfully
- `strawnode-error` — fatal error during fetch or eval

Lifecycle state (`snLifecycle`): `idle → fetching → bootstrapped → ready | error`. Consumed by `Logger.init` for late-init placement and by the load logger's state machine.

## AddressChanger `ch.weretested` Fix

**File**: `strawexpress.js:3212` — `AddressChanger` class

### The Problem

`weretested` was an undeclared implicit global used across multiple scopes:

| Location | Code | Issue |
|----------|------|-------|
| `_ensureHashRoute:3276` | `weretested = true;` | Sets implicit global |
| `_initialNavigate:3338` | `if (!!window.opera) weretested = false;` | Reads implicit global |
| `enable` entry | (missing) | No initialization before `_ensureHashRoute` call |

When `AddressChanger` methods were refactored into separate property scopes (via `Type.define`/`HierarchyChanger.base`), the `weretested` variable in `_ensureHashRoute` and `_initialNavigate` no longer shared the same closure — they became separate implicit globals, each reading/writing `window.weretested` independently.

If `enable()` → `_ensureHashRoute()` set `window.weretested = true`, but the `hashchange` event in `_bindHashChange` fired before `_initialNavigate` bound its handler, the redirect detection logic broke.

### The Fix

1. **Qualify all references** to `ch.weretested` (the instance property on `AddressChanger`):

   | Location | Before | After |
   |----------|--------|-------|
   | `_ensureHashRoute:3276` | `weretested = true;` | `ch.weretested = true;` |
   | `_initialNavigate:3338` | `if (!!window.opera) weretested = false;` | `if (!!window.opera) ch.weretested = false;` |

2. **Explicit initialization** in `enable()` (`strawexpress.js:3250`):
   ```javascript
   enable: function enable(loc, hierarchy, uniqueClass) {
       var ch = this;
       ch.weretested = false;  // <-- ensures clean state before _ensureHashRoute
       // ...
       ch._ensureHashRoute(a, initLocale);
       // ...
       ch._initialNavigate();
   }
   ```

3. **`_ensureHashRoute` returns boolean** — `enable()` uses it to conditionally short-circuit:
   ```javascript
   if (ch._ensureHashRoute(a, initLocale)) return;
   ```
   When a redirect is needed (non-hash URL), `_ensureHashRoute` returns `true` and `enable()` exits early without binding hashchange or navigating. On the next page load (with hash URL), it returns `false`, `ch.weretested` stays `false`, and the normal flow proceeds.

### How It Works

```
First load (no hash)
  enable()
    ch.weretested = false;
    _ensureHashRoute() → sets ch.weretested = true, redirects to #/...
    return true (early exit, no binding)
  
Second load (with hash)
  enable()
    ch.weretested = false;
    _ensureHashRoute() → hash present, ch.weretested stays false
    return false (continue)
    _initLocale, setAncestor, _bindHashChange, _initialNavigate
      _initialNavigate → root.open → hashchange event fires
        ch.weretested === false → trigger hashchange → navigate to route
```

## Debug `throw` Removal

**File**: `strawexpress.js:3336` — `_initialNavigate`

A debug `throw` statement was left in `_initialNavigate`, inadvertently terminating the bootstrap after `step_open` fired. Removed to restore normal hash-based navigation flow.

No other debug artifacts remain in the hot path.

## Async Error Verification

With `PROLOGUE_LINES = 0`:

| Error type | Caught by | Line shown | Correct? |
|------------|-----------|------------|----------|
| Sync error in module eval | `simfunc` catch block | `lastLine - PROLOGUE_LINES = file line` | ✓ |
| Async error in event handler (e.g., `hashchange`) | Browser `window.onerror` | Raw V8 line = file line | ✓ |

Verified in DevTools: async errors from `dispatchSNEvent("strawnode-ready")` → event handler show the exact source line with no offset.

## BetweenJS Tweening Engine

**Source**: `/home/saz/Sites/github/strawAI/public/js/strawnode_app/strawnode_modules/betweenjs.classic.js` (5590 lines), also `betweenjs.js`
**Domain**: `org.libspark.betweenjs`

Isolated tweening engine with zero dependencies. Powers animated transitions in the StrawExpress step lifecycle (focus/toggle). Single `requestAnimationFrame` loop (`AnimationTicker`) drives all tweens.

### Architecture Overview

```
BetweenJS.create({options})
  └─ TweenFactory.checkMultipleTargets(options)
       ├─ bulkcreate()  → ParallelTween (multiple targets)
       └─ createBasic() → Tween (single target, value tweening)
       └─ createAction() → *Action (addChild, remove, func, load, timeout, interval, animationframe)
       └─ createDecorator() → *Tween (slice, scale, reverse, repeat, delay)
       └─ createGroup() → ParallelTween / SerialTween
```

### Core Class Hierarchy

```
AbstractTween (base, all lifecycle + event system)
  ├─ Tween (value tweening — the workhorse)
  │    └─ AbstractActionTween (actions, not values)
  │         ├─ AddChildAction
  │         ├─ RemoveFromParentAction
  │         ├─ FunctionAction
  │         ├─ LoadAction
  │         ├─ TimeoutAction
  │         ├─ IntervalAction
  │         └─ AnimationFrameAction
  ├─ TweenDecorator (wraps another tween)
  │    ├─ SlicedTween
  │    ├─ ScaledTween
  │    ├─ ReversedTween
  │    ├─ RepeatedTween
  │    └─ DelayedTween
  └─ TweenGroup (composite)
       ├─ ParallelTween
       └─ SerialTween
```

### Shortcut API

All on the `BetweenJS` object (aliased as `BJS` in modules):

| Method | Signature | Description |
|--------|-----------|-------------|
| `to` | `(target, to, time?, ease?)` | Tween `target` from current → `to` |
| `from` | `(target, from, time?, ease?)` | Tween `target` from `from` → current |
| `tween` | `(target, to, from?, time?, ease?)` | Tween `target` between `from` → `to` |
| `apply` | `(options, applyInBetweenContext?)` | Create + optionally gotoAndStop |
| `instant` | `(target, properties)` | Jump to properties immediately |
| `bezier` | `(target, to, from, cuepoints, time?, ease?)` | Bezier curve tween |
| `bezierTo` | `(target, to, cuepoints, time?, ease?)` | Bezier from current → `to` |
| `bezierFrom` | `(target, from, cuepoints, time?, ease?)` | Bezier from `from` → current |
| `physical` | `(target, to, from, ease?)` | Physics-based tween (spring-like) |
| `physicalTo` | `(target, to, ease?)` | Physics from current → `to` |
| `physicalFrom` | `(target, from, ease?)` | Physics from `from` → current |
| `physicalApply` | `(target, to, from, ease, applyTime?)` | Physics + gotoAndStop |
| `parallel` | `(...tweens)` | Group tweens in parallel |
| `serial` | `(...tweens)` | Chain tweens sequentially |
| `parallelTweens` | `(tweensArray)` | Parallel from array |
| `serialTweens` | `(tweensArray)` | Serial from array |

### Decorator Shortcuts

| Method | Signature | Description |
|--------|-----------|-------------|
| `scale` | `(tween, scale)` | Scale tween duration by factor |
| `slice` | `(tween, begin, end, isPercent?)` | Extract portion of tween |
| `reverse` | `(tween)` | Reverse tween direction |
| `repeat` | `(tween, times?)` | Repeat tween N times |
| `delay` | `(tween, delay)` | Delay tween start |

### Tween Lifecycle

```
create → configure → setHandlers
  │
  play()
    ├─ setup() → register() → EnterFrameTicker.start()
    │    └─ tick(position) → updater.update(position) → draw()
    │
  pause() → unregister() (keeps position)
    │
  resume() → register() (resumes from position)
    │
  stop() → teardown() → unregister() (draws final frame)
    │
  toggle() → if playing: stop() else play()
    │
  start() → rewind().play()
    │
  gotoAndPlay(position, isPercent?) → seek → play
  gotoAndStop(position, isPercent?) → update → stop
  rewind() → seek(0)
  seek(position, isPercent?)
```

### Event System

```javascript
tw.bind('type', function(params) { ... })
tw.unbind('type', func)
tw.fire('type')  // internally fires this['on'+Type](params)
```

Events fired automatically: `play`, `stop`, `complete` (via `stopOnComplete`).

### Animation Frame Callbacks (Animation Class)

**One single `requestAnimationFrame` loop** (`AnimationTicker`) drives all BetweenJS tweens. Custom callbacks can be attached to this same loop via `Animation`:

```javascript
// BJS.$.AnimationTicker.createAnimation(update, draw)
var anim = BetweenJS.$.AnimationTicker.createAnimation(
    function(timestamp) { /* update logic */ },
    function(timestamp) { /* draw logic */ }
) ;
anim.start() ;  // attaches to AnimationTicker loop
// Later:
anim.stop() ;   // detaches and destroys
anim.halt() ;   // detaches without destroying
```

This is the intended way to add custom `requestAnimationFrame` callbacks without creating a second rAF loop — everything stays under the single BJS-controlled frame.

### Color Support

BetweenJS handles tweening of color properties natively:

- **Color modes**: RGB, HSL, HSV
- **Input formats**: hex (`#ff8800`), `rgb()`, `rgba()`, `hsl()`, `hsla()`, CSS color names
- **Color space conversion**: `BJS.$.Color.RGBtoHSV()`, `BJS.$.Color.HSLtoRGB()`, `BJS.$.Color.HSVtoRGB()`
- **Named CSS colors**: `BJS.$.Color.css` — lookup table of ~150 CSS color names to hex

Color tweening is automatic when a property value is a color string. The updater detects color format and tweens each channel (r, g, b, a) independently.

### CSS Transform Support

Recently added — tween CSS transform properties (translate, rotate, scale, skew) via the standard `to`/`from` syntax with transform property names.

### Other Tweenable Properties

- **opacity**: Tweens `element.style.opacity` automatically
- **scroll**: Scroll position tweening (window or element)
- **Any numeric CSS property**: width, height, top, left, margin, padding, etc.
- **Any object property**: Custom objects with numeric properties

### Updaters

The `UpdaterFactory` selects the right updater based on property types:

| Updater Type | When |
|-------------|------|
| Standard numeric updater | Plain numeric properties |
| Color updater | Color string values |
| CSS updater | DOM element style properties |
| Transform updater | CSS transform properties |
| Physical updater | Physics-based (spring dynamics) |

### Integration with StrawExpress

In the step lifecycle, BetweenJS animates transitions:

```
step_open → BetweenJS.to(el, {opacity:1, ...}, time, ease)
             .bind('stop', function() { /* step fully visible */ })

step_close → BetweenJS.to(el, {opacity:0, ...}, time, ease)
              .bind('stop', function() { /* step fully hidden, cleanup */ })
```

The `graphics.js` module in strawberryAI wires `@focus` and `@toggle` handlers to BJS tweens.

## Full Workflow Summary

```
Browser HTML
  <script src="strawnode.js?starter=./strawnode_app/">
    │
    ├─ StrawNode: startAsync → fetchModuleTree (async)
    │    └─ Pre-fetches: index.js, strawexpress.js, routes.js,
    │       graphics.js, strawjade.js, betweenjs.classic.js,
    │       jade_async.js, and all transitive deps
    │
    └─ .then → require('./strawnode_app/index.js')
         │
         ├─ require('strawexpress') → Express / AddressChanger / HierarchyChanger
         ├─ var app = express()
         ├─ app.set('view engine', 'jade')
         ├─ app.set('views', '/js/jade/')
         ├─ app.set('address', { home, base, useLocale, defaultLocale })
         ├─ app.get('/', routes)  → routes.js defines hierarchy
         │    └─ Sections: index, about, projects, studies, docs
         │         └─ Each with @focus/@toggle → graphics.js → BetweenJS
         │
         └─ app.listen('JSAddress', function() {
              app.createClient()
                 .get('/', routes)
                 .initJSAddress()  ← binds AddressChanger hash routing
           })
              .listen('load', function() { /* cleanup */ })
    
    User navigates: hashchange → AddressChanger → HierarchyChanger
      → step_open → BetweenJS.to(el, transitions)
      → jade renders via strawjade → XHR fetch .jade + .json → DOM injection
```

### Pattern: Dynamic `require()` via Sync XHR Fallback

**Context**: Custom module loaders (like Strawnode's `evaluateModule`) pre-fetch the entire dep tree during the async phase via regex-scanning for `require('...')`. If a module uses `require(someVariable)` (dynamic require), the regex doesn't match and the dep is never pre-fetched.

**Implementation**: Add a `ModuleLoader.fetchSource(url)` helper that checks the cache first, then falls back to a synchronous XHR fetch:

```javascript
ModuleLoader.fetchSource = function fetchSource(url) {
  var cached = ModuleLoader.cache[url];
  if (cached) return cached;
  var r = generateXHR();
  r.open('GET', url, false);  // synchronous fallback
  r.send();
  ModuleLoader.cache[url] = r.responseText;
  return r.responseText;
};
```

Replace all `ModuleLoader.cache[url]` reads in `evaluateModule` with `ModuleLoader.fetchSource(url)`. This way, modules pre-fetched during the async phase are instant; modules not pre-fetched (dynamic paths) are fetched on demand via sync XHR. The developer just writes `require(path)` and it works — no `_require` capture, no static pre-fetch tricks needed.

### Pattern: Wrapping JSON as JS Module

**Context**: When a module loader that can't evaluate raw JSON tries to `require('./data.json')`. Strawnode's `simfunc` calls `(0, eval)(source)` on the fetched source — raw JSON evaluates to a value that disappears into the void (no `module.exports` assignment).

**Implementation**: Replace `.json` with `.js` and wrap the data:

```javascript
// examples.js (instead of examples.json)
module.exports = [
  { "id": 1, "name": "intro" },
  { "id": 2, "name": "particles" }
];
```

### Pattern: Dev Cache Debugging for XHR-Fetched Modules

**Context**: The loader pre-fetches modules via XHR/fetch. These resources are subject to the browser's HTTP cache, independent of the page's navigation cache. A "hard refresh" (`Cmd+Shift+R`) does NOT always invalidate XHR-cached resources — especially if ETags match or `max-age` is set.

**Implementation**:
1. Disable caching on the dev server: `express.static(path, { maxAge: 0, etag: false, setHeaders: (res) => res.set('Cache-Control', 'no-store') })`
2. Verify server returns updated content via curl BEFORE testing in browser:
   ```bash
   curl -s http://localhost:3000/path/to/module.js | grep -n "pattern"
   ```
3. Check response headers:
   ```bash
   curl -sI http://localhost:3000/path/to/module.js | grep -i cache
   ```
4. If all else fails, test in an incognito/private window to rule out extensions or service workers.

### BetweenJS `create()` Requires Top-Level `target`

**Context**: `BetweenJS.create(options)` calls `TweenFactory.create()` which throws `"BetweenJS: The target is undefined"` if `options.target` is falsy — even when the options contain only `actions` (e.g., `actions: { addChild: {...} }`, `actions: { timeout: {...} }`).

**Implementation**: Always provide a top-level `target` property to `BetweenJS.create()`:

```javascript
// WRONG — throws "BetweenJS: The target is undefined"
BetweenJS.create({
  actions: { addChild: { target: p, parent: page } }
});

// RIGHT — target at top level
var p = document.createElement('div');
page.appendChild(p);  // or p.appendTo(page);
BetweenJS.create({
  target: p,
  actions: { timeout: { duration: 1, callback: function() { ... } } }
});
```

For `actions.addChild`, prefer direct DOM append and drop `actions.addChild` entirely (it's simpler and avoids the target requirement).

### GestureManager — Cross-Device Gesture Detection

**File**: `strawnode_app/strawnode_modules/gesture.js` (auto-loaded by sectionBehavior.js)

Singleton `GestureManager` that unifies mouse + touch via Pointer Events API. Supports two registration APIs:

**Declarative** (routes.js `@` hooks):
```javascript
handler['@swipeLeft'] = function(e) { /* navigate prev */ };
handler['@swipeRight'] = function(e) { /* navigate next */ };
handler['@drag'] = function(e) { /* real-time delta tracking */ };
handler['@pinch'] = function(e) { /* e.scale */ };
handler['@rotate'] = function(e) { /* e.rotation */ };
```

**Imperative** (sectionBehavior.js):
```javascript
GestureManager.listen(res, {
    swipe: function(e) { /* e.direction, e.velocity */ },
    drag: function(e) { /* e.deltaX, e.deltaY, e.percentX */ }
});
```

**Architecture**:
- `init()` patches `Express.app.attachHandler` to intercept `@swipe*`/`@drag*`/`@pinch`/`@rotate` hook types
- `register(res, type, handler)` stores handlers by `res.path` and auto-binds `focusIn`/`focusOut` on the Response for lifecycle management
- `_bind(res)` on focusIn: resolves gesture element (`res.userData.gestureEl` or `res.template`), sets `touch-action: none`, applies `pan-y`/`pan-x` to `[data-gesture-scroll]` children, binds `pointerdown`
- `_unbind(res)` on focusOut: removes all pointer listeners, clears `touch-action`
- Window `pointermove`/`pointerup` are lazily bound only while a gesture is active, removed on release
- **`pointercancel` (0,0) bug**: All browsers tested report `clientX=0, clientY=0` on `pointercancel` events. `_onPointerUp` falls back to `pointer.currentX/currentY` (last known from `pointermove`) when the end event has `e.clientX===0 && e.clientY===0`.

**Scroll-inside-Gesture**: Add `data-gesture-scroll="y"` to scrollable children within the gesture zone. GestureManager sets `touch-action: pan-y` on them and skips `pointerdown` when the touch starts on a scroll-allowing element (checked via `getComputedStyle(e.target).touchAction`).

**`.touch-action` class caveat**: The CSS rule `.touch-action, .touch-action * { touch-action: none !important; }` is used to prevent native scroll on gesture zones. `.project_zone` is a **shared/global** element (parent template) — class mutations on it persist across child switches. When `project_zone.addClass('touch-action')` is called for a slide child and not removed for a scrolling child, the `!important` overrides the inline `touch-action: pan-y` set by `_bind` on `.scrollingzone`. Always pair `addClass` with `removeClass` in the complementary branch (see `sectionbehavior.js:658–660`).

**Gesture types dispatched**:
| Type | Direction | When |
|------|-----------|------|
| `dragstart` | — | pointerdown |
| `drag` | `left/right/up/down` | pointermove (continuous) |
| `dragend` | — | pointerup (slow) |
| `swipe` | `left/right/up/down` | pointerup (fast + far) |
| `tap` | — | quick press-release (≤5px, ≤500ms) |
| `pinch` | — | 2+ pointers with scale change |
| `rotate` | — | 2+ pointers with angle change |

**Event object properties** (shared): `type`, `direction`, `deltaX`, `deltaY`, `percentX`, `percentY`, `velocityX`, `velocityY`, `distanceX`, `distanceY`, `timeTaken`, `sourceEvent`, `pointer`, `scale` (pinch), `rotation` (rotate).

**Configuration**:
```javascript
GestureManager.config({
    swipeVelocityThreshold: 0.5,    // px/ms
    swipeDistanceThreshold: 30,     // min px
    clickDistanceThreshold: 5,
    pinchScaleThreshold: 0.05
});
```

### KeyboardManager — Declarative `@keydown` Hook

**File**: `strawnode_app/strawnode_modules/keyboard.js` (~130 lines)

KeyboardManager follows the exact same `@`-hook pattern as GestureManager. Routes.js handlers declare `@keydown` (or `@keydown .selector`) and KeyboardManager auto-binds/cleans up the `keydown` listener on `focusIn`/`focusOut`.

**Declarative** (routes.js `@` hooks):
```javascript
// General: fires for ANY keypress while this step is active
handler['@keydown'] = function(e) {
    if (e.key === 'ArrowLeft') navigatePrev();
    if (e.key === 'ArrowRight') navigateNext();
    if (e.key === 'Escape') closeOverlay();
};

// Scoped: only fires when focus is inside the matching element
handler['@keydown .search-input'] = function(e) {
    if (e.key === 'Enter') doSearch(e.target.value);
    e.preventDefault();  // prevents form submission
};
```

**Architecture** (identical to GestureManager):
- `init()` patches `Express.app.attachHandler` to intercept `@keydown` / `@keydown .selector` types; all other `@` hooks pass through unchanged
- `register(res, type, handler)` stores handlers by `res.path`, binds `focusIn`/`focusOut` lifecycle
- `_bind(res)` on focusIn: adds a `window` `keydown` listener (keyboard events need window focus to work reliably)
- `_unbind(res)` on focusOut: removes the listener
- `_unbindAll()` called at the start of every `_bind`, so switching steps properly swaps the active keyboard listener

**Event object** (`e`):
| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | `e.key` value (`'ArrowLeft'`, `'Enter'`, `'Escape'`) |
| `code` | `string` | Physical key code (`'ArrowLeft'`, `'Digit1'`) |
| `ctrlKey` | `boolean` | Ctrl held |
| `shiftKey` | `boolean` | Shift held |
| `altKey` | `boolean` | Alt held |
| `metaKey` | `boolean` | Meta/Cmd held |
| `repeat` | `boolean` | Key held down (auto-repeat) |
| `target` | `Element` | `document.activeElement` (scoped) or `e.target` (general) |
| `preventDefault` | `function` | Call to `e.preventDefault()` |
| `sourceEvent` | `Event` | The raw `KeyboardEvent` |

**Scoped `@keydown .selector`**: When the type includes a CSS selector (e.g., `@keydown .search-input`), the handler only fires if `document.activeElement` matches the selector. This lets you define different keybindings depending on which element has focus:

```javascript
// Different Enter behavior per focused element
handler['@keydown .search-input'] = function(e) {
    if (e.key === 'Enter') performSearch();
};

handler['@keydown .prompt-input'] = function(e) {
    if (e.key === 'Enter') submitPrompt();
};
```

General `@keydown` and scoped `@keydown .selector` can coexist on the same handler. Scoped handlers fire first (and short-circuit if matched), then the general handler fires.

**Stacks with GestureManager**: Both modules independently patch `attachHandler`. Each passes through types it doesn't handle, so they compose naturally:
- `@toggle`, `@focus` → original `attachHandler` → StrawExpress lifecycle
- `@swipeLeft`, `@drag`, `@pinch` → GestureManager
- `@keydown` → KeyboardManager

**Files**:
- NEW: `strawnode_app/strawnode_modules/keyboard.js`
- MODIFIED: `strawnode_app/sectionbehavior.js` (added `require`)

## Load Logger — Framework Feature (`strawnode.logger`)

The loading overlay is now a **framework-owned, opt-in controller** in `strawnode.js` (`Logger`, section "LOAD LOGGER"). The project keeps only the markup skeleton + CSS; strawnode owns drain/emit/pct/finalize/detach. Verify 2026-08 via Playwright (`loggerapi.js`, `loggerfinalize.js`, `loggeroff.js`).

### Opt-in (config flag only — never auto-forced)

- Enable: `?starter=./strawnode_app/&logger=1` → `startParams.logger` truthy → `Logger.init(window.strawnodeLogger || {})` at the top of `startAsync`, or call `require.logger.init(opts)` manually (idempotent; safe late).
- Without the flag the logger is **inert**: `require.logger.active === false`, no DOM access, no `window.console` override, no listeners. The loader model (`window.strawnodeLoadingFeedback`) still fills.
- `require.logger` and `window.strawnode.logger` are always attached (zero side effects).

### Public API

| Method | Purpose |
|--------|---------|
| `init(opts)` | Wire up + drain; snapshots `snLifecycle` so late init places correctly (already-bootstrapped → phase-2, already-error → finalize(false)) |
| `emit(cls, text)` | Immediate styled line (auto-timestamp) |
| `log(status, url, cls)` | Push a feedback entry (drains synchronously; supports `cls` override) |
| `setPct(n)` / `setTitle(t)` | Update bar/percent/title |
| `progress(started, completed)` | Manual phase-2 counts |
| `done()` / `fail(err)` | `finalize(true/false)` |
| `flush()` | Drain now |
| `detach()` | Teardown: restore console/XHR/fetch, remove listeners, clear refs, `active=false` |

### Options (`window.strawnodeLogger` global, defined BEFORE the strawnode.js script tag)

```javascript
window.strawnodeLogger = {
  until: 'bootstrap',       // 'bootstrap' | 'home'  — WHEN loading is considered "done"
                            //   'bootstrap' = all JS modules fetched + evaluated (no phase-2)
                            //   'home'      = also requires homeReady() true (home sections shown)
  homeReady: function(){},  // required when until === 'home'; polled each tick
  halt: {                   // entry gate — forces a click before the overlay leaves
    enabled: false,
    key: 'strawnode-entered', // localStorage key; while unset/empty the gate is ACTIVE
    value: '0',               // value enter() persists to the key (matches need_landing=0)
    hint: 'Click Enter to continue...'  // warn line shown while halted
  },
  titles: { loading: 'LOADING METAVAGRANT', ready: 'METAVAGRANT READY' },
  readyText: 'all required assets loaded — home ready',
  phase2Filter: null,   // fn(url) -> count? ; default excludes media via isMedia regex
  mirror: true,         // console.log→logger override (restored on detach)
  container: '#loadlogger',
  className: 'loadline'
};
```

**`until` — explicit "done" policy** (the dev decides; strawnode never guesses):
- `'bootstrap'` — done when the loader finishes: bootstrap pct maps 0→100, finalize on `strawnode-ready` (respecting `halt`). No phase-2 XHR/fetch tracking.
- `'home'` — done when the app's home is actually usable: bootstrap 0-70%, phase-2 assets 70-100%, finalize only when `homeReady()` returns true (respecting `halt`). This is what MetaVagrant uses (`until: 'home'` + `homeReady` on `.navzone` opacity).

**`halt` — explicit entry gate** (the forced "click Enter" policy):
- Active ⟺ `enabled && localStorage.getItem(key)` is unset/empty. On ready, if active: the logger shows the `hint` warn line once, holds pct at the done level, and defers finalize.
- The framework hint is pushed into `window.strawnodeLoadingFeedback` (`{status: hint, cls: 'warn'}`) and rendered through `drain()`, so it appears both in the canonical log array and the DOM console. Set `hint: null` to disable the auto-hint and emit your own styled line from the project's `strawnode-ready` listener: `require.logger.emit('warn', 'Click Enter to continue...')` (any class works — `emit(cls, text)`).
- The dev calls `require.logger.enter()` from their enter-link handler (project-side). `enter()` persists `localStorage[key] = value` (default `'0'`), lifts the halt, and finalizes once the done policy is met. Returning visitors (key already set) see no halt and no hint.
- MetaVagrant wiring: `halt: { enabled: true, key: 'need_landing', hint: null }`; the `strawnode-ready` listener calls `require.logger.emit('warn', 'Click Enter to continue...')`; the `.enterlink` click calls `require.logger.enter()` (replaced the old inline `localStorage.need_landing = 0`).
- The landing DOM/display logic stays project-side — the framework only gates the overlay.

### Public API

| Method | Purpose |
|--------|---------|
| `init(opts)` | Wire up + drain; snapshots `snLifecycle` so late init places correctly (already-bootstrapped → ready, already-error → finalize(false)) |
| `emit(cls, text)` | Immediate styled line (auto-timestamp) |
| `log(status, url, cls)` | Push a feedback entry (drains synchronously; supports `cls` override) |
| `setPct(n)` / `setTitle(t)` | Update bar/percent/title |
| `progress(started, completed)` | Manual phase-2 counts |
| `enter()` | Pass the `halt` gate: persists `localStorage[key]=value`, lifts halt, finalizes if done |
| `done()` / `fail(err)` | `finalize(true/false)` (bypass the gate — explicit dev call) |
| `flush()` | Drain now |
| `detach()` | Teardown: restore console/XHR/fetch, remove listeners, clear refs, `active=false` |

### Progress Model

- Bootstrap: 0-70% (`until:'home'`) or 0-100% (`until:'bootstrap'`) = `done/known` ratio from `window.strawnodeLoadingFeedback`.
- Home assets (`until:'home'` only): 70-100% = `phase.completed/phase.started` (auto XHR/fetch interception filtered by `phase2Filter`).
- `strawnode-ready` (or late-init snapshot) → `readyDone`, `LOADING...` title; installs phase-2 tracking only when `until === 'home'`; engages the `halt` gate if active.
- `until:'home'` + `homeReady()` true → `finalize(true)` → pct 100%, `READY` title, `.done`, overlay removed, `detach()`.
- `until:'bootstrap'` → finalize on ready (no homeReady needed).
- `halt` active → finalize deferred until `enter()`.
- `strawnode-error` → `finalize(false)` (overlay stays, console shows the error).

### Ordering (fixed)

`logLoad` calls `Logger.flush()` synchronously after each push, so `bootstrap complete → Click Enter → bootstrap complete — ready for entry` render in true order (no async-drain vs sync-mirror mismatch). A 110ms interval remains as a fallback for external array pushes.

### Markup contract (project-owned skeleton, stable class names)

```jade
#loadlogger.glass
  .loadhead
    span.loadtitle STRAWNODE LOADER
    span.loadpct 0%
  .loadbar
    .loadfill
  .loadconsole
```

The logger queries `#loadlogger` + `.loadconsole/.loadfill/.loadpct/.loadtitle`; missing elements degrade gracefully (emit→console no-op). Classes emitted: `loadline .fetching/.fetched/.evaluating/.evaluated/.error/.warn` + no-class (console mirror). `window.emit` is aliased to `Logger.emit` on init.

### CSS — Scrollable Console

`#loadlogger` (fixed, top-right, `z-index:600`, `pointer-events: none` on the shell) with `.loadconsole`:

```css
#loadlogger .loadconsole {
  height: 190px;
  overflow-y: auto;
  padding: 8px 12px;
  /* ... */
  pointer-events: auto;      /* child re-enables interaction under `none` parent */
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, .25) transparent;
}
```

Plus `::-webkit-scrollbar` sizing (8px, translucent thumb). Window height stays fixed at 190px — the log scrolls inside, the widget never grows. Line colors: `artists.css:670-709` — `fetching` dim, `fetched` green, `evaluating` grey `rgba(160,165,175,.55)`, `evaluated` yellow `rgba(255,220,90,.95)`, `error` red, `warn` `#FF6600`. Chat-style auto-scroll only when already near bottom (`-12px` tolerance); old lines are NOT truncated.

### CRITICAL — CSS Build Pipeline

`public/css/allbis.css` is a **generated build artifact** produced by Tailwind v4:

```
npm run css   →  npx @tailwindcss/cli -i ./public/css/all.css -o ./public/css/allbis.css --watch
```

`all.css` (14 lines) is just imports:
```
@import './xapp.css';
@import './contents.css';
@import './artists.css';
@import "tailwindcss";
```

**Any manual edit to `allbis.css` is silently lost on the next rebuild.** All custom CSS (including `#loadlogger` styles) lives in the imported sources — `.loadlogger` rules are in `public/css/artists.css:582-709`. Always edit the source file, then rebuild: `npx @tailwindcss/cli -i ./public/css/all.css -o ./public/css/allbis.css`. The `--watch` process is running during dev, so a source edit is often enough.

## Landing WebGL Shader (`#glcanvas`)

The landing logo is a WebGL2 quad with an inline fragment shader in `public/jade/index.jade` (canvas at line 18, `const fsSource` at ~62). All shader text lives inside a JS template literal → **no backticks and no `${` inside the GLSL** (use string concat if ever needed).

### M-Key Mode Cycle (index.jade:55, 713-719)

```javascript
let animMode = localStorage.animMode = localStorage.animMode || 1;
// keydown handler:
animMode = localStorage.animMode = (animMode + (e.key === 'M' ? -1 : 1)) % 11;
```

Mode order (comments kept in sync at line 55 and the keydown comment):
`1 Prism Surge (default) · 2 original animation · 3 Confetti Mosaic · 4 Mondrian Flow · 5 Halftone Riso · 6 Glitch CRT · 7 Firefly Sparks · 8 VHS Glitch · 9 Liquid Flow · 10 Matrix Rain · 0 static vector`. Lowercase `m` cycles forward, uppercase `M` cycles backward. Persists in `localStorage.animMode`. `trace()` logs the switch.

### Structure & Non-Negotiables

- `map()` SDF (~lines 72-116) is the logo's signed-distance field — must stay **byte-identical** (every mode branches on its result).
- `hash12(vec2)` helper (~line 120) provides per-cell randomness; `vhsContent(vec2)` helper (~line 127) adds the mode-8 VHS texture.
- Each mode `i` contributes an `inner<i>` color and uses `m<i>d = map(p)` to silhouette it: `a = smoothstep(0.004, -0.004, m<i>d); col = mix(bgColor, inner, a);`.
- GLSL ES 3.0 allows dynamic array indexing. Avoid identifier collisions across modes (e.g. `d` vs palette `ph`); mode-specific names are prefixed (`col10`, `rel10`, `drop10`, etc.).
- **Verification technique**: headless Playwright with `--use-gl=swiftshader`; `gl.readPixels` only returns data inside `requestAnimationFrame`; cycle modes by pressing `m` `target-1` times (track the current mode — pressing from the previous mode again lands on the wrong one).

### Mode 10 — Matrix Rain (`% 11` = 10)

Columns `colW10 = 0.04` across the logo; vertical coord `yN10 = fract((p.y + 0.8) * 0.65)`. Per-column speed `speed10 = 0.25 + 0.2 * hash12(...)` (unit per second; scale via the constant). Five interleaved streams per column (`k10 = 0..4`, offset `k*0.2`) so heads/trails cover the full height.

**Closest-head-below trick** — must use `min` over `fract(...)`, NOT `min`/`max` of raw `(yN - head)`:

```glsl
float bestRel10 = 1.0;
for (int k10 = 0; k10 < 5; k10++) {
  float headK10 = fract(r10 + float(k10) * 0.2 - iTime * speed10);
  bestRel10 = min(bestRel10, fract(yN10 - headK10));
}
float rel10 = bestRel10;
```

`fract(yN - head)` is small when a head is just below the fragment, so `min` finds the nearest head below → the fading trail renders above it. `min(yN - head)` picks the head **above** (negative rel) and kills the trail; `max` picks the farthest head below (breaks fade). With 5 streams spaced 0.2 apart, `rel10 ∈ [0, 0.2)` always — full column coverage.

Trail: `trail10 = exp(-rel10 * 30.0) * smoothstep(0.03, 0.0, rel10)`; ~1px head dot `headDot10 = exp(-rel10 * 220.0)`; `drop10 = headDot10 * 2.6 + trail10 * shimmer10 * 1.2`. Palette kept below clipping so drops read blue, not white: `matrixBlue=vec3(0.2,0.5,1.0)`, `matrixDeep=vec3(0.04,0.18,0.55)`, `inner10 = bgColor + mix(matrixDeep, matrixBlue, clamp(drop10*1.2,0.,1.)) * drop10 * 1.9`. No keyline and no glow term (per design). Everything must key off `rel10` (which translates with the falling heads) — a screen-space cell grid (`floor(yN*rows)`) makes particles appear pinned/frozen.

## When to Use This Skill

- Editing `strawnode.js` (the module loader itself)
- Editing `strawexpress.js` (the Express-like framework, including `AddressChanger`)
- Editing `betweenjs.classic.js` or `betweenjs.js` (the tweening engine)
- Writing step routes with animated transitions (`@focus`/`@toggle`)
- Writing keyboard shortcuts for slide navigation, overlays, or form inputs (`@keydown`)
- Debugging module loading errors (incorrect line numbers, require chain issues)
- Adding or modifying the `simfunc` module wrapper
- Fixing errors from modules that rely on sloppy-mode implicit globals
- Understanding the two-phase fetch-then-eval cycle
- Handling circular dependency issues
- Working with `//# sourceURL` and V8 error line mapping
- Troubleshooting hash-based routing / redirect detection issues
- Creating complex tween sequences with BetweenJS (parallel, serial, decorators, bezier, physics)
- Adding custom `requestAnimationFrame` callbacks via `AnimationTicker.createAnimation()`

## Session History

### Session 1: Module Wrapper Evolution (Global Eval → Zero Offset)

**Goal**: Eliminate the V8 wrapper line offset so error line numbers match source files.

**Changes**:
1. `simfunc` — swapped from `new Function()` to eval IIFE `(function(...){void 0;\n<resp>})()` with factory call. Reduced offset from 4 to 1.
2. `simfunc` — swapped from eval IIFE to direct global eval `(0, eval)(source)`. Eliminated ALL offset (`PROLOGUE_LINES = 0`).
3. `return f;` removed from `simfunc` — caller `evaluateModule` reads `cache[id].exports` instead of the return value.
4. `(0, eval)(source)` runs source directly with `module`/`require`/`exports` set as temporary `window` globals (backup/restore in `finally`).
5. Regex neutralization of `'use strict'` — prepend `void 0;` on the same line as the directive, preserving line count.
6. SourceURL appended for DevTools identification.

**Design decision**: Global eval instead of any function wrapper. No wrapper lines → zero offset. Module isolation via global backup/restore instead of closure.

### Session 2: `weretested` Implicit Global Fix (AddressChanger)

**Goal**: Fix broken redirect detection caused by refactored `AddressChanger` method scopes.

**Problem**: After `Type.define` refactor split `AddressChanger` methods into separate scopes, `weretested` became separate implicit globals in `_ensureHashRoute` and `_initialNavigate` — they no longer shared state through a common closure.

**Fix**: Qualified all references to `ch.weretested`, added `ch.weretested = false` initialization in `enable()`, and ensured `_ensureHashRoute` returns a boolean for `enable()` to short-circuit.

**Files**: `strawexpress.js` lines 3216–3348.

### Session 3: Debug Throw Cleanup & Verification

1. Removed debug `throw` from `_initialNavigate` (strawexpress.js:3336).
2. Verified async error display in DevTools — with `PROLOGUE_LINES = 0`, async errors from `dispatchSNEvent("strawnode-ready")` → event handlers show exact source line with no offset.
3. Synced all changes to `strawnode-docs` mirror:
   - `public/js/strawnode.js`
   - `public/js/strawnode_app/strawnode_modules/strawexpress.js`
   - Created `.config/opencode/skills/strawnode/SKILL.md` in mirror

### Session 4: BetweenJS Deep Dive & Skill Compaction

**Goal**: Understand the BetweenJS API surface and compact all strawnode knowledge into the skill.

**What was learned**:
1. **BetweenJS API**: `BJS.create(options)` is the factory entry point. Shortcut methods: `BJS.to()`, `BJS.from()`, `BJS.tween()`, `BJS.bezier()`, `BJS.physical()`, `BJS.parallel()`, `BJS.serial()`. Decorators: `BJS.slice()`, `BJS.scale()`, `BJS.reverse()`, `BJS.repeat()`, `BJS.delay()`.
2. **Tween classes**: `AbstractTween` → `Tween`, `AbstractActionTween`, `TweenDecorator` (Sliced/Scaled/Reversed/Repeated/DelayedTween), `TweenGroup` (Parallel/SerialTween).
3. **Lifecycle**: `play()` → `setup()` → `register()` → `tick()` → `update()` → `draw()`. `pause()`/`resume()` via register/unregister. `stop()` → `teardown()`. `toggle()`, `start()`, `gotoAndPlay()`, `gotoAndStop()`, `seek()`, `rewind()`.
4. **Event system**: `bind('type', fn)`, `unbind('type', fn)`, `fire('type')`. Built-in events: play, stop, complete.
5. **Animation loop**: Single `AnimationTicker` drives all tweens via `requestAnimationFrame`. Custom callbacks attach via `AnimationTicker.createAnimation(update, draw)` → `anim.start()` — no second rAF loop needed.
6. **Color support**: RGB, HSL, HSV color modes. Hex, rgb(), rgba(), hsl(), hsla(), CSS named colors. Automatic color tweening.
7. **CSS transforms**: Recently added — translate, rotate, scale, skew via standard to/from.
8. **Other properties**: opacity, scroll, any numeric CSS property, any object property.
9. **Updaters**: Standard numeric, Color, CSS, Transform, Physical — auto-selected by `UpdaterFactory`.

**Skill updates**:
- Added full BetweenJS API reference (shortcuts, class hierarchy, lifecycle, events, color, transforms, animation frame)
- Added Full Workflow Summary section connecting StrawNode → StrawExpress → BetweenJS → Jade rendering
- Updated Session History with this session
- Added betweenjs to mirror

**Files**: `betweenjs.classic.js` (5590 lines), `SKILL.md` updated to 865+ lines.

### Session 9: KeyboardManager — Declarative `@keydown` Hook

**Goal**: Extend the `@`-hook pattern to keyboard shortcuts, following GestureManager's architecture. Enables per-step keybinding with lifecycle management and scope selectors.

**What was built**:

1. **`keyboard.js` (~130 lines)** — `KeyboardManager` singleton with:
   - **`init()`**: patches `Express.app.attachHandler` to intercept `@keydown` and `@keydown .selector` types; passes through all other `@` hooks
   - **`register(res, type, handler)`**: stores handlers by `res.path`, auto-binds `focusIn`/`focusOut` for lifecycle management
   - **`_bind(res)` on focusIn**: adds a `window` `keydown` listener
   - **`_unbind(res)` on focusOut**: removes the listener
   - **`_unbindAll()`**: called at the start of every `_bind`, ensures clean switch between steps
   - **Scoped dispatch**: `@keydown .selector` only fires when `document.activeElement` matches the selector
   - **General + scoped coexistence**: scoped fires first and short-circuits; general fires for all keypresses

2. **`sectionbehavior.js`**: Added `require('./strawnode_modules/keyboard')` to auto-load the module

**Key architectural decisions**:
- Uses `window.addEventListener('keydown', ...)` instead of element-bound listener (keyboard events need window focus)
- Scoped selectors check `document.activeElement` via `$(el).is(selector)` — same jQuery selector matching used throughout the StrawExpress stack
- `e.preventDefault` exposed as a method on the event object rather than called automatically — handlers control whether to suppress default behavior
- Stacks cleanly with GestureManager: both independently patch `attachHandler` and pass through unrecognized types

**Files**:
- NEW: `strawnode_app/strawnode_modules/keyboard.js`
- MODIFIED: `strawnode_app/sectionbehavior.js`

### Session 8: Touch Gesture Debugging — `pointercancel` + `.touch-action` Class Leak

**Goal**: Fix swipe always classified as UP (every swipe = vertical) and scroll lost when switching between sibling deep sections.

**Changes**:

1. **`gesture.js` — `_onPointerUp` (0,0) fallback**: `pointercancel` events consistently report `clientX=0, clientY=0` in all browsers tested. Added fallback: when `e.clientX === 0 && e.clientY === 0`, uses `pointer.currentX/currentY` (last known position from `_onPointerMove`) instead of the bogus coordinates. Without this, `end=(0,0)` made every delta negative and since `startY` is typically larger than `startX`, dominant axis was always Y → every swipe classified as UP. Trace line enhanced with `e.type`, `isScroll`, `raw`, `current`, `end` values.

2. **`sectionbehavior.js:660` — `project_zone.removeClass('touch-action')`**: `.project_zone` is a **shared/global** element (parent template, not per-child template). `project_zone.addClass('touch-action')` at line 658 (slide children) uses CSS `.touch-action, .touch-action * { touch-action: none !important; }` to prevent native scroll. This class persisted across child switches because it was never removed in the scrolling branch. Returning to a scrolling child left `!important none` on `.project_zone`, overriding the `touch-action: pan-y` that `GestureManager._bind` sets on `.scrollingzone`. Fix: added `project_zone.removeClass('touch-action')` in the `else` branch at line 660, mirroring the `addClass` in the `if` branch.

3. **`.touch-action` CSS class lifecycle** (established earlier, refined here):
   - `project_slides(true)`: `$('.zoneall').addClass('touch-action')` — parent gestures active
   - `deep_slides(true)` (slide child): `$('.zoneall').removeClass('touch-action')` + `project_zone.addClass('touch-action')` — child gestures active
   - `deep_slides(true)` (scroll child): `$('.zoneall').removeClass('touch-action')` + `project_zone.removeClass('touch-action')` — native scroll on `.scrollingzone`
   - `deep_slides(false)`: `$('.zoneall').addClass('touch-action')` — restores parent gestures

**Key insights**:
- `pointercancel` consistently reports (0,0) across all browsers tested. Fallback to last-known pointer position is the reliable fix.
- `.project_zone` is a **shared** element (parent template, not per-child template). Class mutations on it persist across child switches.
- `!important` in CSS `.touch-action, .touch-action * { touch-action: none !important; }` overrides inline `touch-action: pan-y` on deeper elements — class removal is the only defense.
- Global jQuery selectors (`$('.project_zone')`, `$('.scrollingzone')`) are safe because close-before-open step lifecycle guarantees only one template in DOM at any time.
- `events.js` (graphics.js:8) loads with `{touch:{mobile:1, pc:1}}` — `touchstart`/`touchmove`/`touchend` handlers call `stopPropagation()` + `preventDefault()`, potentially triggering `pointercancel`. Lenis smooth scroll (FX_scrolltriggered.js) also calls `preventDefault()` via `virtualScroll`. These are preserved for backward compat but may interfere with pointer event delivery.

**Files**:
- `strawnode_app/strawnode_modules/gesture.js` — `_onPointerUp` (0,0) fallback
- `strawnode_app/sectionbehavior.js` — `project_zone.removeClass('touch-action')` at line 660

### Session 7: Cross-Device GestureManager

**Goal**: Replace the imperative, leaky `GestureDetector` with a lifecycle-managed, cross-device gesture system integrated with StrawExpress `@` hooks.

**What was built**:

1. **`gesture.js` (~280 lines)** — `GestureManager` singleton with:
   - **Pointer Events API** for unified mouse + touch handling
   - **Two registration APIs**: declarative (`@swipeLeft` via routes.js `@` hooks) and imperative (`GestureManager.listen(res, {...})` via sectionBehavior.js)
   - **Lifecycle-managed**: auto-binds `focusIn`/`focusOut` on the Response; sets up pointer listeners on open, tears down on close
   - **Scroll-inside-gesture**: `data-gesture-scroll` attribute → GestureManager sets `touch-action: pan-y`/`pan-x` on scroll children, skips `pointerdown` if touch starts on a scroll-allowing element
   - **Multi-touch**: 2+ pointer tracking for `@pinch` (scale) and `@rotate` (rotation)
   - **Lazy window listeners**: `pointermove`/`pointerup` on window are only bound while a gesture is active, removed on `pointerup`/`pointercancel`

2. **Runtime `attachHandler` patch**: GestureManager.init() patches `Express.app.attachHandler` to intercept `@swipe*`, `@drag*`, `@pinch`, `@rotate`, `@tap` hook types — no modifications to strawexpress.js needed

3. **sectionBehavior.js migration**: Replaced `new GestureDetector(zoneel, {...})` + 5 manual `addEventListener` calls (no cleanup) with `GestureManager.listen(res, {...})` — lifecycle-managed, direction-aware, DRY

**Key architectural decisions**:
- Element targeting: default = `res.template`, override = `res.userData.gestureEl`
- General + specific dispatch: `@swipe` fires for ALL swipes, `@swipeLeft` fires ONLY for left — both can coexist on the same handler
- Global thresholds via `GestureManager.config({...})` — per-step overrides deferred
- Compared to the old GestureDetector: same Pointer Events API, same velocity/distance heuristics, but adds lifecycle binding, direction-specific dispatch, multi-touch, and declarative hooks

**Files created/modified**:
- NEW: `strawnode_app/strawnode_modules/gesture.js`
- MODIFIED: `strawnode_app/sectionbehavior.js` (require + GestureManager.listen)
- NO CHANGES: `strawexpress.js` (patched at runtime)
- NO CHANGES: `gesturedetect.js`, `events.js` (old modules preserved for backward compat)

### Session 6: Live `require()` + Starter Project

**Goal**: Make dynamic `require(path)` work transparently without pre-fetch tricks; create a clean starter project and framework docs.

**Context**: The BetweenJS-examples sandbox relied on static `require('../examples/create.js')` at module top-level and `_require = require` capture to work around the async loader's regex-based dep extraction. These workarounds are invisible to a new developer, break on first use.

**Changes to `strawnode.js` (the loader)**:

1. **Added `ModuleLoader.fetchSource(url)`** (line ~215): Checks `ModuleLoader.cache[url]` first, then falls back to synchronous XHR. All 6 `ModuleLoader.cache[url]` reads in `evaluateModule` now use it:

```javascript
ModuleLoader.fetchSource = function fetchSource(url) {
  var cached = ModuleLoader.cache[url];
  if (cached) return cached;
  var r = generateXHR();
  r.open('GET', url, false);
  r.send();
  ModuleLoader.cache[url] = r.responseText;
  return r.responseText;
};
```

2. **Sync XHR as fallback**: Matches Node.js sync I/O model — developer writes `require(path)`, it just works. Zero ceremony, no `_require` capture.

**Changes to `graphics/index.js`** (BetweenJS-examples sandbox):
- Removed 5 static `require('../examples/*.js')` calls
- Removed `var _require = require` capture
- Restored plain `require(path)` at line 91

**Changes to `create.js`** (BetweenJS-examples sandbox):
- Added `target:page` to the `actions.timeout` `BetweenJS.create` call (second target-less call, detected by the existing error pattern)

**New project created: `strawnode-starter/`** at `/home/saz/Sites/github/strawnode-starter/`:
- Complete three-section demo site (Home, About, Pricing)
- Dark theme with purple-blue-teal gradient accents, CSS-only avatars, all responsive
- BetweenJS animations via `Closure('section')` + `TweenControl` pattern
- `Helper.toggle` wired via `@toggle` lifecycle hook in routes
- All static assets verified returning 200, no-cache headers confirmed

**New doc created: `strawnode-framework.md`** at `/home/saz/Sites/github/strawnode-docs/`:
- 408-line framework overview with Manifesto, full code example, Architecture Flow, Vision
- Documents the StrawNode design philosophy and API conventions

**Key insight**: The `@toggle` handler is called with a single event argument `(e)` — it does NOT receive a closure name as a second parameter. The closure name must be determined differently (in the starter, `Closure('section', ...)` is used, and the `toggle` helper references it via the closure's registered name). The `Closure` constructor auto-registers a named tween closure that `Helper.create()` looks up by the `closure` string argument.

**Files**:
- `strawnode.js` — `ModuleLoader.fetchSource` at line 215
- `graphics/index.js` — line 91, plain `require(path)` restored
- `create.js` — both `BetweenJS.create` calls now have `target`
- All files in `strawnode-starter/` (see Project Locations above)
- `strawnode-docs/strawnode-framework.md`

### Session 5: BetweenJS-Examples Project Fixes (Strawnode Variant)

**Goal**: Fix strawnode bootstrap and navigation/content-rendering in the BetweenJS-examples project at `/home/saz/Sites/github/BetweenJS-examples/`.

**Changes made**:

1. **Fixed `strawnode.js` path typo**: All 6 `strawstrawnode_modules/` → `strawnode_modules/` (wrong directory name blocked dependency pre-fetch).

2. **Fixed wrong betweenjs filename**: `require('../strawnode_modules/betweenjs_b4.js')` → `require('../strawnode_modules/betweenjs.js')` (file didn't exist).

3. **Wrapped JSON as JS module**: Replaced `require('/json/')` with `require('./examples/examples.js')` — new wrapper module exports the JSON data array.

4. **Fixed `parameters` access**: Changed `res.userData.parameters['examples']` → `res.userData.parameters` (intro route had `parameters: {response:res}`, not `parameters: {examples: ...}`).

5. **Static pre-fetch for dynamic requires**: Added `require('../examples/create.js')` calls at module top level; captured `var _require = require`; changed closure from `require(path)` to `_require(path)`.

6. **Added missing `target` to `BetweenJS.create()`**: Both `actions.addChild` and `actions.timeout` calls lacked top-level `target`. Replaced `actions.addChild` with direct DOM append; added `target:page` to the timeout call.

**Key insights**:
- StrawNode's regex-based dep extraction can't see dynamic `require(path)` — static `require()` calls are needed for pre-fetch.
- `_require = require` preserves the correct `dirname` through closures; plain `require` inside a closure resolves relative to the closure's scope, not the module's.
- Even `actions`-only BetweenJS.create() calls need a top-level `target`.
- Browser HTTP cache for XHR resources persists across hard refresh in some cases; `Cache-Control: no-store` is the only reliable dev fix.

**Files**:
- `BetweenJS-examples/public/js/strawnode.js`
- `BetweenJS-examples/public/js/nodeless_app/routes.js`
- `BetweenJS-examples/public/js/nodeless_app/graphics/index.js`
- `BetweenJS-examples/public/js/nodeless_app/graphics/helper.js`
- `BetweenJS-examples/public/js/nodeless_app/examples/examples.js` (new)
- `BetweenJS-examples/public/js/nodeless_app/examples/create.js`
- `BetweenJS-examples/app.js`

### Session 10: Reactive Scope — computed / watch / effect System

**Goal**: Add observable reactive state on top of DOMNodeProxy without modifying strawexpress.js. Create computed properties, watchers, and DOM-updating effects that automatically track dependencies.

**What was built**:

1. **`reactive.js`** (~190 lines) — `Reactive` module in `strawnode_modules/`:
   - `Reactive.enhance(domScope)` — returns a reactive proxy with getter/setter traps. Reads are function calls (`scope.count()`); writes set the value and notify dependents.
   - `scope.computed(key, fn)` — lazy evaluated, auto-tracked, dirty-flag cached. Reading a computed re-evaluates only if deps changed. Multi-level computed chains cascade correctly (e.g., `line1` → `subtotal` → `tax` → `total`).
   - `scope.watch(key, fn)` — fires `fn(newVal, oldVal)` on change.
   - `scope.effect(fn)` — runs fn immediately, collecting dependencies; re-runs when any dep changes. **Returns a teardown function** that removes the watcher from all subscription sets (used by `ReactiveI18n.cleanup`).

2. **Batch notification system** (`reactive.js:notify`):
   - Uses `batchDepth` counter (incremented per `notify()` call). Nested `notify()` calls from computed-propagation increase depth. Effects flush only when the outermost `notify` completes (`--batchDepth === 0`).
   - `pendingBatch` Map deduplicates effect watchers by identity — effects run exactly once even when multiple computed deps change.
   - Without batching: effects ran N times per change (once per computed subscriber), seeing stale values for not-yet-reached computeds.

3. **`prox.hookup()` integration**: `Reactive.enhance()` checks the **raw DOM node** via `domScope.__target__.__reactive` to avoid the DOMNodeProxy attribute-fallback truthy trap (see strawexpress/SKILL.md).

4. **1-arg proxy wrapper fix**: the get trap changed `_v(_a)` → `_v.apply(target, arguments)` so multi-arg methods (e.g. `scope.on('change', fn)`) forward all arguments. 0-arg reads still return the value; 1+ arg calls return `reactive` for chaining.

**Visual demos** (in `test.js`):

| Demo | Computeds | Effects | State |
|------|-----------|---------|-------|
| Counter | double, triple, even | 2 (DOM + log) | count |
| Step wizard | pct, isFirst, isLast | 1 (progress, dots, panels, buttons) | step |
| Timer | mins, secs, cs | 1 (formatted display) | ms |
| Shopping cart | line1, line2, subtotal, tax, total, items | 1 (all cells) | qty1, qty2 |
| Form validation | nameErr, emailErr, ageErr, valid | 1 (errors + submit state) | name, email, age |
| i18n live translations | greeting, welcome, counter_label, about, switch_label | 2 (DOM + counter) | lang, count |

All demos are `Unit.TestCase` entries with a `if (document.getElementById(demoId)) return true` dedup guard for re-runs.

**i18n integration pattern** (demo 6): Each computed translation reads `scope.lang()` as its dependency, then calls a `t(key)` function. Changing language via `scope.lang('ko')` dirties all translation computeds at once (batched). Works with the real `window.i18next` or a local shim.

**Verify script**: `_verify3.mjs` (Playwright) loads `http://localhost:6446/tests/` in a headless browser, runs all test suites, prints pass/fail JSON. Add new test suites to `test.js` — they auto-run. Currently **39/39 passing**.

**Key decisions**:
- Reactive scope is a layered add-on, not a strawexpress.js modification — zero risk to existing SPA routing
- `scope.lang()` / `scope.count()` function-call access pattern mimics the DOMNodeProxy data-bind getter convention
- Batch collect-and-flush (synchronous) avoids microtask/debounce timing issues in tests

**Files**:
- NEW: `strawnode_app/strawnode_modules/reactive.js`
- MODIFIED: `strawnode_app/test.js` (6 demo test cases)
- NEW: `_verify3.mjs` (Playwright test runner)
- DOC: `strawexpress/SKILL.md` (DOMNodeProxy attribute-fallback section)

### Session 11: Reactive i18n — Live Translations in the SPA

**Goal**: Replace the imperative `[i18n]` attribute scan on step navigation with reactive bindings that auto-update on language switch — no step reload needed.

**What was built**:

1. **`reactive-i18n.js`** (~140 lines) — `ReactiveI18n` module in `strawnode_modules/`:
   - `init(opts)` — creates a persistent hidden DOM element (`#__ri18n`) with a reactive scope holding `scope.lang()`. Hooks `i18next.on('languageChanged')` to sync the scope. When `opts.hookLangSwitches !== false` (default), delegates a click handler on `.langchange` links that calls `preventDefault()` and `ReactiveI18n.setLang(lng)` — intercepting hash navigation for in-place translation updates.
   - `bindContainer(container, opts)` — scans `[i18n]` elements, creates a reactive `effect` per element depending on `scope.lang()`. Calls `cleanup()` first to drop the previous step's effects. Skips `jade::` translation keys (async jade.render doesn't fit the synchronous effect model).
   - `setLang(lng)` — sets `document.documentElement.lang`, calls `i18next.changeLanguage(lng)` → fires `languageChanged` → `_scope.lang(lng)` triggers all effects. Updates the URL locale via `history.replaceState()` (no hashchange → AddressChanger stays silent) and rewrites nav link hrefs to match the new locale.
   - `cleanup()` — tears down all effect watchers via each effect's teardown function.

2. **`sectionbehavior.js`** modifications:
   - Module-level `require('./strawnode_modules/reactive')` + `require('./strawnode_modules/reactive-i18n')` added to the pre-fetch chain.
   - In `deep_slides(cond=true)`: after `tt.ensureTranslates(res, project_zone)` → `ReactiveI18n.bindContainer(project_zone, { stepId: res.id })`.
   - In `deep_slides(cond=false)`: `ReactiveI18n.cleanup()` at the top of the teardown branch.

**The dry-run first pattern** (the critical fix):

`scope.effect()` runs synchronously and immediately — it set `$el.html(trans)` before `textAppear`'s `setTimeout(…, 2)` could start its character-by-character animation. By the time `textAppear` ran, the HTML already matched the final translation, so its equality guard (`if(sss == sss2) return;`) skipped the animation entirely.

Fix: `bindContainer` uses a local `needsApply` flag:

```javascript
var needsApply = false;
translates.each(function (i, el) {
    var teardown = _scope.effect(function () {
        var _ = _scope.lang();        // tracks lang() as dependency
        if (!needsApply) return;       // dry run — no DOM write
        var trans = i18next.t(key, i18next.t(defKey));
        if (/^jade::/.test(trans)) return;
        if (hasMarked && window.marked) trans = window.marked.marked(trans);
        $el.html(trans);
    });
    _bound.push(teardown);
});
needsApply = true;                     // enable DOM writes after setup
```

The first run of each effect tracks `scope.lang()` as a dependency but returns early (no DOM mutation), so `textAppear` animates undisturbed. After `needsApply = true`, only subsequent `lang()` changes fire the effects and update the DOM in-place instantly.

**Flow**:
- **Step open**: `deep_slides` → `ensureTranslates` runs the imperative scan + `textAppear` animation (unchanged). Then `bindContainer` creates dry-run effects on the same `[i18n]` elements.
- **Language switch**: click `.langchange` → intercepted → `setLang(lng)` → `i18next.changeLanguage()` fires `languageChanged` → handler sets `scope.lang(lng)` → batched effects re-run → every `[i18n]` element updates in-place. No step reload, no animation replay, URL updated via `replaceState`.
- **Navigation**: old step closes → `deep_slides(cond=false)` → `ReactiveI18n.cleanup()` deregisters effects (prevents orphaned watchers on removed DOM). New step opens → fresh bindings.

**Key design decisions**:
- Persistent scope on hidden `#__ri18n` element survives step open/close cycles. `scope.lang()` is the single source of truth.
- Per-step binding cleaned up on every `bindContainer` AND on step close to prevent watcher accumulation.
- `languageChanged` event-driven: effects fire from the i18next event, not from `setLang` directly.
- `history.replaceState`: updates the URL's locale without triggering hashchange → AddressChanger stays silent.
- `bindContainer` auto-calls `init()` if not yet initialized (defensive; DOMContentLoaded also covers it).

**Edge cases**:
- `jade::` translation keys are skipped by reactive effects (async render doesn't fit the sync effect model); they still work through the imperative `ensureTranslates` + `textAppear` path on full reload.
- Top-level sections (home, about) have no `[i18n]` elements — no reactive bindings created there. Only deep/project sections go through `deep_slides`.

**Files**:
- NEW: `strawnode_app/strawnode_modules/reactive-i18n.js`
- MODIFIED: `strawnode_app/sectionbehavior.js`

### Session 12: Jade 1.11 Parser Gotcha — Double Blank Line in `script.` Blocks

**Problem**: `public/jade/tests/tests.jade` broke with `unexpected token "pipeless-text"` at EOF. The `/tests/` page 500'd and `_verify3.mjs` failed.

**Root cause**: A `script(type="text/javascript").` pipeless-text block with **two consecutive blank lines** after the dot line fails to compile in Jade 1.11. One blank line is fine; zero is fine; two breaks the parser.

**Fix**: Removed the duplicate blank line inside the `script.` block.

**Verification**: `jade.renderFile('public/jade/tests/tests.jade')` compiles; `_verify3.mjs` reports 39/39 passing.

### Session 13: Landing Load Logger Scrollback + Landing Shader Modes

**Goal**: Make the landing `#loadlogger` scrollable without changing its look/feel, and document the M-cycle shader modes.

**What was done**:
1. **Scrollable log console** — `.loadconsole` in `public/css/artists.css` (source) changed from `overflow: hidden` to `overflow-y: auto` with `pointer-events: auto` + thin scrollbar. Removed the 80-line cap in `emit()` (now `Logger.emit`, strawnode.js) so all history is retained. Auto-scroll is now chat-style: only pins to the bottom when the user is already near it.
2. **CSS pipeline gotcha (important)** — `allbis.css` is a Tailwind build artifact. Editing it directly was silently reverted by the `--watch` rebuild. All custom CSS must be edited in the imported sources (`all.css` imports `xapp.css`, `contents.css`, `artists.css`, `tailwindcss`). Rebuilt via `npx @tailwindcss/cli -i ./public/css/all.css -o ./public/css/allbis.css`.
3. **Landing shader mode 10 (Matrix Rain)** — five interleaved streams per column for full-height coverage; fixed the closest-head-below bug: `min(fract(yN - head))` over `min(yN - head)`. Slowed rain to `0.25 + 0.2*hash`, shrank drops to ~1px (`exp(-rel*220)` head, `smoothstep(0.03,0,rel)` glint). Removed white keyline/glow so drops read blue.
4. **Verification** — Playwright probes confirmed: full vertical band coverage, ~1px drops, everything moving (no screen-pinned cells), 0 console errors, HTTP 200, lang-switch regression (repro7) passing.

**Files**: `public/jade/index.jade`, `public/css/artists.css` + `public/css/allbis.css` (rebuilt).

### Key Files
|------|------|-------|---------|
| `strawnode.js` | `public/js/` | 1212 | Module loader with `simfunc`, `evaluateModule`, `fetchModuleTree`, `Logger` |
| `strawexpress.js` | `public/js/strawnode_app/strawnode_modules/` | 4524 | Express-like framework with `AddressChanger` hash routing |
| `betweenjs.classic.js` | `public/js/strawnode_app/strawnode_modules/` | 5590 | Tweening engine — single-rAF-loop animation with color/css/transform support |
| `strawjade.js` | `public/js/strawnode_app/strawnode_modules/` | — | Jade template engine — relies on `'use strict'` neutralization |
| `index.jade` | `public/jade/` | 851 | Landing page: loader boot, `#glcanvas` shader (M-cycle modes), `#loadlogger` skeleton + `window.strawnodeLogger` config |
| `SKILL.md` | `.config/opencode/skills/strawnode/` | — | This file |

### Mirror Paths

| Source | Mirror |
|--------|--------|
| `/home/saz/Sites/github/strawAI/public/js/` | `/home/saz/Sites/github/strawnode-docs/public/js/` |
| `/home/saz/.config/opencode/skills/strawnode/` | `/home/saz/Sites/github/strawnode-docs/.config/opencode/skills/strawnode/` |

### Project Locations

| Project | Path | Purpose |
|---------|------|---------|
| StrawAI | `/home/saz/Sites/github/strawAI/` | Production site (strawAI.com) |
| BetweenJS-examples | `/home/saz/Sites/github/BetweenJS-examples/` | Research/dev sandbox with nodeless_app |
| Strawnode Docs | `/home/saz/Sites/github/strawnode-docs/` | Framework documentation site |
| Strawnode Starter | `/home/saz/Sites/github/strawnode-starter/` | Starter project template (three-section demo) |

### Strawnode Starter Project

At `/home/saz/Sites/github/strawnode-starter/`. A ready-to-run example with Home/About/Pricing sections, BetweenJS animations. Not a mirror — standalone project.

```
strawnode-starter/
├── app.js                          ← Express server (port 3000, no-cache)
├── package.json
├── public/
│   ├── css/starter.css             ← Dark theme, gradients, CSS-only, responsive
│   ├── jade/index.jade + layout.jade
│   └── js/
│       ├── strawnode.js            ← Loader (with fetchSource live require)
│       ├── myapp/
│       │   ├── package.json
│       │   ├── index.js            ← express() → routes → listen('JSAddress')
│       │   ├── routes.js           ← @focus/@toggle lifecycle hooks
│       │   ├── graphics.js         ← Closure('section') with BetweenJS tweens
│       │   ├── graphics/helper.js  ← TweenControl/Closure lifecycle
│       │   └── strawnode_modules/  ← betweenjs, strawexpress, strawjade, type, etc.
│       ├── jade/myapp/             ← home.jade, about.jade, pricing.jade
│       └── json/myapp/             ← home.json, about.json, pricing.json
```

### Strawnode Framework Doc

At `/home/saz/Sites/github/strawnode-docs/strawnode-framework.md` (408 lines). Published framework overview covering: Manifesto, What It Is, Best Features, full Getting Started with three-section demo code, Architecture Flow diagram, Who This Is For, Vision.
