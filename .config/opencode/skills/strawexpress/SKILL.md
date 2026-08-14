# StrawExpress — Skill File

Hash-based routing and tree-navigation step system for client-side Express-like front-end simulation. Raw ES5 with custom `require()` polyfill.

## Quick Reference

- **Source**: `/home/saz/Sites/github/strawAI/public/js/strawnode_app/strawnode_modules/strawexpress.js` (3232 lines)
- **Mirror**: `/home/saz/Sites/github/strawnode-docs/public/js/strawnode_app/strawnode_modules/strawexpress.js`
- **Server**: Express 4.16 + Pug (Jade) + i18next + Strapi headless CMS (GraphQL)
- **CSS**: Tailwind CSS v4 via `npm run css`
- **License**: MIT

## Architecture

```
AddressChanger (hashchange listener)
  └─ AddressHierarchy (singleton, manages navigation state)
       ├─ HierarchyChanger (path state: currentPath, temporaryPath)
       └─ Hierarchy.factory (commands: formulate, openCommand, closeCommand, reloadCommand)
            └─ CommandQueue (serial execution of commands)
                 ├─ Command (async, returns truthy to signal async)
                 └─ Step (tree node with open/close lifecycle)

Express.app (route registration)
  └─ Response (extends Step, adds template rendering)
       └─ handler (function with @toggle, @focus event handlers attached as properties)
```

### Step Lifecycle

```
play() ──► open() ──► commandOpen.execute() ──► dispatchOpening() ──► @toggle opening
     │                                                        └─► @focus focusIn
     │
close() ◄── kill() ◄── commandClose.execute() ◄── dispatchClosing() ◄── @toggle closing
                                                                   └─► @focus focusOut
```

## Command Queue Contract

Every async command MUST return a truthy value. The `Command.execute()` method checks:
- Closure returns **truthy** → `execute()` returns `this` (the Command) → queue binds to `c.depth` event on the Command, waits for `c.dispatchComplete()`
- Closure returns **falsy** → `execute()` returns `undefined` → queue advances synchronously, destroying command context

```javascript
// CORRECT: signals async to the queue
closeCommand: function closeCommand(path, c) {
    // ... setup async work (bind step_close, call kill) ...
    return st;  // truthy → execute() returns this → queue waits
}

// WRONG: queue treats as sync, destroys context before callbacks fire
brokenCommand: function brokenCommand(path, c) {
    // ... setup async work ...
    // NO RETURN → falsy → queue immediately completes → callbacks fire into destroyed state
}
```

### Built-in Commands

| Command | Method | Returns | Async? |
|---------|--------|---------|--------|
| Open | `openCommand` | `st` | Yes — waits for `step_open` |
| Close | `closeCommand` | `st` | Yes — waits for `step_close` |
| Error | `openErrorCommand` | `st` | Yes — waits for `step_open` |
| Reload | `reloadCommand` | `st` | Yes — waits for `step_open` after `reload()` |

## `formulate()` Path-Matching Structure

At `strawexpress.js:~2252`. The core routing logic:

```javascript
var currentpath = hh.changer.getCurrentPath();  // where we ARE
var temppath = hh.changer.getTemporaryPath();    // where we're GOING
var tempreg = new RegExp('^' + currentpath + '\/?');
var remainpath = temppath.replace(tempreg, '');  // remaining segments

if (tempreg.test(temppath)) {
    // SAME path tree (or sub-path) → descend, match children, or create 404
    
    // Check if navigating to same path as a defined step
    if (PathUtil.endslash(path) && hh.getDeep(PathUtil.trimlast(path)))
        return hh.createCommandOpen(path);
    
    // Check if current is default step (empty id)
    if (current.id == '') return hh.createCommandClose(current.path);
    
    // Match children against remainpath
    while (l--) { /* ... child matching ... */ }
    
    // No child matched
    if (remainpath) {
        // Create 404 step for remaining path segments
        return hh.createCommandOpen(failedPath);
    }
    
    // SAME exact path, no children — handle locale change
    if (current.is404) return hh.createCommandReload(current.path);
    
    // (falls through to close)
}

// DIFFERENT path → close current step
hh.state = 'ascending';
return hh.createCommandClose(current.path);
```

### Guard Placement Rules

| Guard | Placement | Purpose |
|-------|-----------|---------|
| `current.is404` reload | **Inside** `tempreg.test` block | Only triggers on same-path (locale change) |
| `createCommandClose` | **Outside** `tempreg.test` block | Only triggers on different-path (navigation away) |
| `treatSequence` `current.is404` check | In `treatSequence` | Prevents descending into 404 children |

## 404 Step Lifecycle

### Creation (in `formulate`)

```javascript
if (remainpath) {
    var failedSegment = remainpath.split('/')[0];
    var failedPath = PathUtil.ensurelast(current.path) + failedSegment;
    
    handler = function (req, res) {
        if (res.opening) {
            res.userData.urljade = '/jade/404.jade';
            res.userData.parameters = { response: res };
        }
        return res;
    };
    handler['@toggle'] = function (e) { /* hide content, render 404 */ };
    handler['@focus'] = function (e) { /* update lang switch links */ };
    
    Express.app.get(failedSegment, handler, current);
    resp.is404 = true;
    resp.userData.failedPath = temppath;
}
```

### `@toggle` Opening Handler

```javascript
$('.navzone, .contentzone').addClass('hidden');
res.render(res.userData.urljade, res.userData.parameters, function () {
    var container = Express.app.get('404container') || '.zoneall';
    res.template.appendTo(container);
    res.ready();
});
```

### `@toggle` Closing Handler

```javascript
$('.navzone, .contentzone').removeClass('hidden');
if (res.template) res.template.remove();
res.ready();
```

## `reloadCommand` Pattern (Locale Change)

When the user changes language while on a 404 step, `formulate` detects same-path + `is404` and returns `createCommandReload` instead of `createCommandClose`.

```javascript
reloadCommand: function reloadCommand(path, c) {
    var hh = c.context;
    var st = hh.getDeep(path);
    if (!st) { c.dispatchComplete(); return; }
    var parent = st.parentStep;
    var doReload = function () {
        var st_reload;
        st.bind('step_open', st_reload = function (e) {
            st.unbind('step_open', st_reload);
            c.dispatchComplete();  // signals command queue completion
        });
        st.reload();
    };
    // Re-render parent templates FIRST (while 404 is open, parent hidden)
    if (parent && parent.userData && parent.userData.urljade) {
        parent.render(parent.userData.urljade, parent.userData.parameters, function () {
            var $section = parent.template;
            $('.navzone').html($section.find('.navzone').html());
            $('.contentzone').html($section.find('.contentzone').html());
            if (parent.templateB) {
                parent.render('/jade/artists/contenttest.jade', parent.userData.parameters, function () {
                    var oldB = parent.templateB;
                    var newB = parent.template;
                    if (oldB && oldB.length) oldB.replaceWith(newB);
                    parent.templateB = newB;
                    doReload();
                });
            } else {
                doReload();
            }
        });
    } else {
        doReload();
    }
    return st;  // CRITICAL: signals async to command queue
}
```

### `Step.prototype.reload()` Flow

At `strawexpress.js:~1618`:

```
st.reload()
  └─ st.close()
       ├─ st.commandClose.execute() → res.responseAct (no-op on close)
       ├─ dispatchClosing() → @toggle closing → res.ready()
       │    └─ commandClose.dispatchComplete()
       └─ triggers $complete handler → st.open()
            ├─ st.commandOpen.execute() → res.responseAct (sets urljade/params)
            ├─ dispatchOpening() → @toggle opening → render() → res.ready()
            │    └─ commandOpen.dispatchComplete() → checkOpenNDispatch() → dispatchOpen()
            └─ triggers step_open → reloadCommand's handler → c.dispatchComplete()
```

## `Formulate` → `launchDeep` Flow

```
redistribute(value)
  └─ launchDeep(path)
       ├─ formulate(path) → returns array of Commands
       ├─ new CommandQueue(commands)
       ├─ hh.command = queue
       ├─ current.dispatchFocusOut()
       │    └─ @focus focusOut → res.focusReady() → dispatchCleared() → focus_clear
       └─ focus_clear → queue.execute()
            └─ next() → c.execute() → async → bind c.depth → wait for dispatchComplete
                 └─ onCommandComplete → hh.clear()
```

## `liveautoremove` Behavior

At `strawexpress.js:~2503` inside `closeCommand`'s `step_close` handler:

```javascript
if (Express.app.get('liveautoremove') == true)
    if (st.is404 || (!!st.regexp && /[^\w]/.test(st.regexp.source)))
        Express.app.removeResponse(st);
```

Dynamically created steps (regex-matched and 404) are automatically removed from the hierarchy when navigated away from. Default: `true`. Set via `Express.app.set('liveautoremove', false)`.

### `removeResponse` clean-up

- Unbinds all `@` event handlers (`@toggle`, `@focus`, etc.)
- Recursively removes and destroys all child steps
- Removes step from parent's children array
- Destroys the step object

## `treatSequence()` Post-Navigation Logic

At `strawexpress.js:~2540`. Called after each command completes:

```javascript
treatSequence: function treatSequence(closure) {
    var current = hh.currentStep;
    var currentpath = hh.changer.getCurrentPath();
    var temppath = hh.changer.getTemporaryPath();
    var remainpath = temppath.replace(new RegExp('^' + currentpath + '\/?'), '');
    var cond = remainpath == '' || current.is404;
    
    if (cond) {
        if (!!current.defaultStep && !current.is404)
            hh.checkRunning(current.defaultStep.path);
        else
            current.dispatchFocusIn();  // triggers @focus focusIn
    } else {
        hh.checkRunning(temppath);  // continue navigation
    }
    closure();
}
```

## Known Bugs Fixed

| Bug | Fix | Location |
|-----|-----|----------|
| `trace()` calls unguarded | Wrapped with `typeof trace !== 'undefined'` | 9 call sites |
| `throw ''` in AddressChanger.enable() | Replaced with `return;` after `location.href` | `strawexpress.js:~2678` |
| Double `focusOut` event binding | try/catch unpadded pattern | Hierarchy |
| `packResponse` HTML branch `$(resp)` | Corrected to `$(t)` | `strawexpress.js:~2918` |
| 404 `formulate('404')` | Replaced with `createCommandError(path)` | `formulate` |
| `openErrorCommand` deadlock | No-op `commandClose` and `c.dispatchComplete()` on `step_open` | Hierarchy |
| `openCommand`/`closeCommand` fatal hangs | Both wrapped in try/catch with listener cleanup | `strawexpress.js:~2458` |
| `Step.prototype.reload()` typo `s.open()` → `st.open()` | Fixed variable name | `strawexpress.js:~1625` |
| `liveautoremove` race | `removeResponse(st)` moved out of `treatSequence` callback | `closeCommand` |
| `HierarchyChanger.getHome()` | Uses `PathUtil.trimlast` correctly | `strawexpress.js:~2118` |
| 404 duplication on locale change | Replaced i18next listener with command queue `reloadCommand` | `formulate` + new `reloadCommand` |
| Back-nav from 404 reloaded 404 template | `current.is404` guard moved inside `tempreg.test` block | `formulate:~2377` |
| `reloadCommand` missing `return st` | Added to signal async to command queue | `reloadCommand` |
| Parent templates not re-rendered on locale change | Parent render chain added to `reloadCommand` | `reloadCommand` |
| Template render error deadlock | Error callback + Jade `err` check + idempotent `ready()` | `render`/`packResponse`/`ready` |
| AJAX request hanging | `r.timeout` + `setTimeout` fallback | `Request.load()` |
| No route params (`/user/:id`) | `paramNames` regex generation + extraction | `Response` ctor + `formulate` |
| `Express.use()` was no-op | Functional before/after middleware pipeline | `launchDeep` + `onCommandComplete` |
| No logging infrastructure | `Logger` utility with levels, replaces `trace()` guards | Logger |
| Intermittent lang-switch failure (`defaultStep` boot error) | Moved `hh.setAncestor(uniqueClass.getInstance(), ch)` **before** the `_ensureHashRoute` early-return | `strawexpress.js:3878` (`enable()`) |
| `defaultStep` console error on boot | Same `enable()` reorder — ancestor must exist before `_ensureHashRoute` short-circuits | `strawexpress.js:3872-3884` |
| Language change not applied (`setLang` no-op) | `setLang` now sets `location.hash` (drives hashchange → command queue) | `reactive-i18n.js:110-119` |

## Key JavaScript Utilities

| Utility | Purpose | Used At |
|---------|---------|---------|
| `PathUtil.ensurelast(p)` | Adds trailing `/` | Step path construction |
| `PathUtil.trimlast(p)` | Removes trailing `/` | Hierarchy path comparison |
| `PathUtil.trimfirst(p)` | Removes leading `/` | setCurrentPath |
| `PathUtil.ensureall(p)` | Adds leading and trailing `/` | hash construction |
| `PathUtil.endslash(p)` | Checks trailing `/` | formulate path matching |
| `CodeUtil.overwritesafe(o, k, v)` | Safe property assignment | Step.settings |
| `Type.is(o, c)` | instanceof check | Command queue guards |
| `Type.of(o, t)` | typeof check | function/string checks |

## RegExp Step Pattern

Steps can be created with regex patterns by wrapping the `id` in slashes:

```javascript
Express.app.get('/[a-z]+/', handler, parent);
// res.regexp = new RegExp(PathUtil.trimall(pattern));
// Matches any single-segment path under parent
```

The `id` is extracted from the pattern by removing leading/trailing slashes.

## Gesture Hook Types (`@swipe`, `@drag`, `@pinch`, `@rotate`)

Added in `gesture.js` via runtime patching of `attachHandler`. The GestureManager intercepts these hook types and manages their lifecycle independently:

| Hook | Type direction | Dispatched |
|------|---------------|------------|
| `@swipe` | general | All swipe directions |
| `@swipeLeft` | specific | Only left swipes |
| `@swipeRight` | specific | Only right swipes |
| `@swipeUp` | specific | Only up swipes |
| `@swipeDown` | specific | Only down swipes |
| `@drag` | general | All drag directions (real-time) |
| `@dragLeft` / `@dragRight` / `@dragUp` / `@dragDown` | specific | Per-direction drag |
| `@dragstart` | — | On pointer capture start |
| `@dragend` | — | On slow release |
| `@tap` | — | Quick press-release |
| `@pinch` | — | 2-finger scale |
| `@rotate` | — | 2-finger rotation |

**Lifecycle**: GestureManager binds `focusIn`/`focusOut` on the Response automatically. On `focusIn`: sets up pointer listeners on the gesture element, applies `touch-action: none`, respects `[data-gesture-scroll]` children for native scroll zones. On `focusOut`: tears down all listeners.

## `@toggle` / `@focus` Handler Call Convention

`@toggle` and `@focus` handlers are attached via `attachHandler` (line 3861) which binds them to `step_opening` + `step_closing` (for `@toggle`) or `focusIn` + `focusOut` (for `@focus`) on the Response object.

**Handler signature**: `function(e)` — called with a single event argument. The event `e.target` is the Response object.

**IMPORTANT**: The handler does NOT receive a closure name or step name as a second argument. If your `Helper.toggle` pattern expects `(e, closure)`, the closure argument will be `undefined`. The closure name must be determined through a different mechanism:

```javascript
// WRONG: Helper.toggle expects (e, closure) but attachHandler calls handler(e)
handler['@toggle'] = graphics.toggle;  // graphics.toggle(e, closure) → closure = undefined

// RIGHT: Use a wrapper that knows the closure name, or reference it another way
handler['@toggle'] = function(e) {
    graphics.toggle(e, 'section');  // pass closure name explicitly
};
```

The `Closure` constructor auto-registers named closures which can be looked up by string name. The starter project uses `Closure('section', ...)` and `Helper.create('section', res)` to find the registered closure — this works because the `Closure` constructor stores itself on a registry that `Helper.create` can access.

## DOMNodeProxy (`prox.hookup`)

**Source**: `strawexpress.js` — ~line 3400+.

DOMNodeProxy wraps a DOM element in a `Proxy` that intercepts get/set/has traps, enabling reactive data binding via `data-*` attributes.

### Proxy Get Trap Behavior

The get trap (`strawexpress.js:3458`) resolves property reads in this order:

1. **DOMNodeProxy instance method** (e.g., `.val()`, `.set()`, `.html()`) — if the key exists on the proxy instance
2. **`__`-prefixed escape** — strips the prefix, bypasses attribute fallback
3. **`data-` attribute value** — returns the parsed value (number, boolean, null, or string) from the matching `data-` attribute
4. **Attribute fallback function** — if no `data-` attribute matches, returns a **getter/setter function** that reads/writes a regular attribute:
   ```javascript
   function (v) {
       if (v === undefined) return el.getAttribute(key);
       el.setAttribute(key, v);
       return v;
   }
   ```

**CRITICAL**: The attribute fallback (step 4) returns a **function**, not the attribute value directly. Calling `domScope.__reactive` through the proxy returns this getter/setter function (always truthy) — NOT `null` or `undefined`. This means you cannot use `if (domScope.__reactive)` as a guard check through the proxy.

### `__target__` — Raw DOM Node Access

The `__target__` escape prefix (`domScope.__target__`) returns the underlying raw DOM element, bypassing ALL proxy traps. Use this for:
- Reading metadata flags stored on the DOM node with `__`-prefixed properties (e.g., `node.__reactive`)
- Calling native DOM methods without proxy interception
- Checking `getAttribute` directly without the getter/setter wrapper

```javascript
var node = domScope.__target__;  // raw DOM element, no proxy traps
if (node.__reactive) { ... }    // works correctly — no attribute fallback
```

### Reactive Integration

`Reactive.enhance(domScope)` attaches reactive state to the raw DOM node:

```javascript
var node = domScope.__target__;
node.__reactive = {
    state: {},        // key → value storage
    computed: {},     // key → { fn, depKeys }
    watching: {},     // key → Set<watcherFn>
    effectFns: []     // effect functions
};
```

The `enhance()` function at `reactive.js:123` checks `node.__reactive` directly on the raw node (NOT through the proxy) to avoid the attribute-fallback truthy trap. Returns the existing proxy if already enhanced, creates a new reactive scope otherwise.

### Key Insight

The attribute-fallback function return is a deliberate design choice (preserves backward compatibility with existing attribute-based binding), but it creates a subtle pitfall: **any non-standard property read through the proxy that doesn't match a `data-` attribute returns a truthy function, not the stored value.** Always use `__target__` or `__`-prefix to bypass proxy traps for metadata flags.

## Enhancements

### Logger (`strawexpress.js:245`)

Structured logging replacing `typeof trace !== 'undefined'` guards at 6+ sites:

```javascript
Logger.error(msg);   // Always shown
Logger.warn(msg);    // Default level
Logger.info(msg);    // Shown at 'info' level
Logger.debug(msg);   // Shown at 'debug' level only
Express.app.set('loglevel', 'warn');  // suppresses info/debug
```

Delegates to `trace()` if available, otherwise uses `console.error/warn/log`. All 7 guarded `trace()` calls replaced with appropriate level calls.

### AJAX Request Timeout (`strawexpress.js:376`)

`Request` and `AjaxRequest` now have configurable 10s timeout:

```javascript
request.setTimeout(5000);  // per-request override
// Default: 10000ms (via this._timeout)
```

Uses native `r.timeout` + `r.ontimeout` when available (XHR2+), falls back to `setTimeout`. On timeout: calls error callback, or complete with empty response if no error callback set.

### Render Error Recovery (`strawexpress.js:2925`)

Three safety net changes:

- **`res.ready()` idempotent**: `_readyCalled` guard prevents double-dispatch if both success and timeout fire. Reset in `open()` and `close()`.
- **`render()` error callback**: XHR failure calls `packResponse('', ...)` then callback — template is empty `$([])`, command queue does not deadlock.
- **`packResponse()` Jade error check**: `err` param from `jade.render(t, params, callback)` is checked — logs error, passes empty template instead of crashing.

### Scroll State Management (`strawexpress.js:2820`)

Per-step scroll position saved/restored:

- `focusOut`: saves `$(window).scrollTop()` to `step.userData._scrollTop`
- `focusIn`: restores via `setTimeout(…, 0)` after DOM render
- Opt-out: `Express.app.set('savescroll', false)`
- Default: `true`

### Route Parameters (`strawexpress.js:2908`)

Named parameter routes ala Express.js:

```javascript
Express.app.get('/user/:id/', handler, parent);
// res.regexp = /^([^/]+)$/
// res.paramNames = ['id']
```

At match time, `formulate` extracts values via capture groups and stores on `resp.userData.params`:

```javascript
// In handler:
function handler(req, res) {
    if (res.opening) {
        var userId = res.userData.params.id;
        // ...
    }
    return res;
}
```

Supports multiple params (`/user/:id/:tab`), mixed static+param (`/user/:id/profile`), and coexists with existing `/regex/` step patterns.

### Navigation Guards & Middleware (`strawexpress.js:3113`)

`Express.use()` now functional with three types:

```javascript
// Global before-guard (return false to cancel navigation)
Express.app.use(function(path, hierarchy) {
    if (dirtyForm && !confirm('Discard changes?')) return false;
});

// Path-scoped guard
Express.app.use('/admin', function(path, hierarchy) {
    if (!isAdmin) { location.hash = '#/login/'; return false; }
});

// Post-navigation hook
Express.app.use('after', function(path, currentStep) {
    analytics.track('pageview', path);
});
```

Before-guards run in `launchDeep()` before `formulate()`. After-hooks run in `onCommandComplete()` after navigation completes.

### `AddressChanger.enable()` Refactor

~113-line `enable()` method split into 4 focused private helpers:

| Method | Purpose |
|--------|---------|
| `_extractUrlParts(loc)` | Creates Address from URL, stores in `_baseAddress` |
| `_ensureHashRoute(a, initLocale)` | Redirects to `/#/` format if missing, returns `true` if redirected |
| `_initLocale(a, initLocale)` | Falls back to document lang attribute |
| `_bindHashChange()` | Binds jQuery `hashchange` listener |
| `_initialNavigate()` | Opens root step and triggers first hashchange |

`enable()` reduced from ~113 lines to ~14. No behavior changes.

### `enable()` Boot-Order Fix (defaultStep + lang-switch)

At `strawexpress.js:3872-3884`. The root step's ancestor **must** be registered before the `_ensureHashRoute` early-return, or the boot breaks:

```javascript
enable: function enable(loc, hierarchy, uniqueClass) {
  var ch = this;
  ch.weretested = false;
  var hh = ch.hierarchy = hierarchy;
  var initLocale = document.documentElement.getAttribute('lang') || AddressHierarchy.parameters.defaultLocale;
  var a = ch._extractUrlParts(loc);
  hh.setAncestor(uniqueClass.getInstance(), ch);   // MUST be before the early return
  if (ch._ensureHashRoute(a, initLocale)) return;
  ch._initLocale(a, initLocale);
  ch._bindHashChange();
  ch._initialNavigate();
  return true;
},
```

**Why**: `_ensureHashRoute` returns `true` when a `#/` redirect is required, causing `enable()` to `return` early. If `setAncestor` was AFTER that early return, the ancestor step was never registered on first load. Symptoms:
- Intermittent `defaultStep` error logged to console at boot (`[..] requested step ... is not child of parent...` from `strawexpress.js:2962`)
- Intermittent lang-switch failures — the first route/open fired before the hierarchy was wired, so language changes / initial navigation raced.

**Verification**: 5/5 clean boots (no `defaultStep` console errors) via an error-capturing Playwright script (`/tmp/opencode/errverify.js`); lang-switch regression (`/tmp/opencode/repro7.js`) confirms both `NATIVE` and `HANDLER-ACTIVE` hash-change paths resolve the visible text change.

### `ReactiveI18n.setLang()` — Language Switch Fix

At `reactive-i18n.js:110-119`. `setLang(lng)` now drives navigation through the hash (instead of just calling the i18n backend), so the language change flows through the command queue:

```javascript
setLang: function (lng) {
  // ...
  var hash = location.hash.replace(/^#\/[^\/]+(?=\/)/, '#/' + lng);
  if (hash === location.hash) return;
  location.hash = hash;   // triggers hashchange → AddressChanger → reload/route
}
```

The regex rewrites only the leading `/xx/` locale segment of the hash, preserving the rest of the route path.
