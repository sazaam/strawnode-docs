/*
 *  strawnode test suite
 *  ─────────────────────────────────────────────────────
 *  usage:  require('./test')
 *
 *  Unit is available globally as window.Unit after
 *  requiring once. Type.js is already loaded by the
 *  framework boot, so Type.is / Type.of back Unit's
 *  instance checks.
 */

var Unit = require('./strawnode_modules/unit');
var Reactive = require('./strawnode_modules/reactive');

Unit.reset();

var is = Unit.Assertions;

var prox = window.prox;
var counterHtml =
	'<div data-scope>' +
	'<h3>Count: <span data-text="count">0</span></h3>' +
	'<button class="inc" data-click="count(count() + 1)">+</button>' +
	'<button class="dec" data-click="count(count() - 1)">-</button>' +
	'<p data-show="count">Count is non-zero</p>' +
	'<p data-hide="count">Count is zero</p>' +
	'<input data-bind="count" class="bind-input">' +
	'</div>';

var appendCounter = function () {
	var el = document.createElement('div');
	el.className = 'counter-demo';
	el.innerHTML = counterHtml;
	document.body.appendChild(el);
	return el;
};

var removeCounter = function (el) {
	if (el && el.parentNode) el.parentNode.removeChild(el);
};

/*
 *  ─── DOMNodeProxy — count example ────────────────────────────
 *  Each test creates its own DOM fragment for full isolation.
 */

Unit.TestCase('DOMNodeProxy basics', {
	'hookup returns scope proxy': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var ok = is.assertNotNull('scope proxy', scope) &&
		         is.assert('has __target__', !!scope.__target__) &&
		         is.assert('has __dispatcher__', !!scope.__dispatcher__);
		removeCounter(root);
		return ok;
	},

	'prox.find returns wrapped element': function () {
		var root = appendCounter();
		var btn = prox.find('.' + root.className + ' .inc');
		var ok = is.assertNotNull('button found', btn) &&
		         is.assertFunction('on is function', btn.on) &&
		         is.assertFunction('off is function', btn.off) &&
		         is.assertFunction('html is function', btn.html) &&
		         is.assertFunction('text is function', btn.text);
		removeCounter(root);
		return ok;
	},

	'read/write count property': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var span = root.querySelector('[data-text="count"]');
		scope.count(42);
		var ok = is.assertEquals('count() returns 42', 42, scope.count()) &&
		         is.assertEquals('span shows 42', '42', span.textContent);
		removeCounter(root);
		return ok;
	},

	'data-bind two-way input syncs to scope': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var input = root.querySelector('.bind-input');
		scope.count(88);
		input.value = '99';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		var ok = is.assertEquals('scope synced from input', '99', scope.count());
		removeCounter(root);
		return ok;
	},

	'on event binding': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var called = false;
		scope.on('change', function () { called = true; });
		scope.count(10);
		var ok = is.assert('change event fired', called);
		removeCounter(root);
		return ok;
	},

	'@-prefix event shorthand': function () {
		var root = appendCounter();
		var btn = prox.find('.' + root.className + ' .inc');
		var stepFired = false;
		btn.on('@open', function () { stepFired = true; });
		btn.trigger('step_opening');
		var ok = is.assert('@open handler fired on step_opening', stepFired);
		removeCounter(root);
		return ok;
	},

	'@toggle maps to both step events': function () {
		var root = appendCounter();
		var btn = prox.find('.' + root.className + ' .inc');
		var count = 0;
		btn.on('@toggle', function () { count++; });
		btn.trigger('step_opening');
		btn.trigger('step_closing');
		// Each trigger fires the handler once -> count should be 2
		var ok = is.assertEquals('both events fired', 2, count);
		removeCounter(root);
		return ok;
	},

	'wrap/unwrap round-trip': function () {
		var root = appendCounter();
		var raw = root.querySelector('.inc');
		var wrapped = prox.wrap(raw);
		var unwrapped = prox.unwrap(wrapped);
		var ok = is.assert('wrapped is proxy', wrapped !== raw) &&
		         is.assert('unwrap returns same node', unwrapped === raw);
		removeCounter(root);
		return ok;
	},

	'chained setters return receiver': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var ret = scope.count(5).count(10).count(15);
		var ok = is.assertEquals('final value', 15, scope.count()) &&
		         is.assert('returned self', ret === scope);
		removeCounter(root);
		return ok;
	}
});

Unit.TestCase('DOMNodeProxy click & visibility', {
	'click increments count': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		scope.count(0);
		var btn = root.querySelector('.inc');
		btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		var ok = is.assertEquals('count after click', 1, scope.count());
		removeCounter(root);
		return ok;
	},

	'click decrements count': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .dec');
		scope.count(5);
		var btn = root.querySelector('.dec');
		btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		var ok = is.assertEquals('count after click', 4, scope.count());
		removeCounter(root);
		return ok;
	},

	'data-show toggles visibility': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var showEl = root.querySelector('[data-show="count"]');
		scope.count(0);
		var zeroDisplay = showEl.style.display;
		scope.count(7);
		var nonZeroDisplay = showEl.style.display;
		var ok = is.assert('hidden when zero', zeroDisplay === 'none') &&
		         is.assert('visible when non-zero', nonZeroDisplay === '');
		removeCounter(root);
		return ok;
	},

	'data-hide toggles visibility': function () {
		var root = appendCounter();
		var scope = prox.hookup('.' + root.className + ' .inc');
		var hideEl = root.querySelector('[data-hide="count"]');
		scope.count(0);
		var zeroDisplay = hideEl.style.display;
		scope.count(3);
		var nonZeroDisplay = hideEl.style.display;
		var ok = is.assert('visible when zero', zeroDisplay === '') &&
		         is.assert('hidden when non-zero', nonZeroDisplay === 'none');
		removeCounter(root);
		return ok;
	}
});

/*
 *  ─── Reactive scope ─────────────────────────────────────────
 *  Tests for computed, watch, and effect on enhanced scopes.
 *  Requires reactive module loaded (window.Reactive).
 */

Unit.TestCase('Reactive scope basics', {
	'computed tracks dependency': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		scope.computed('double', function () { return scope.count() * 2; });
		scope.count(5);
		var ok = is.assertEquals('double of 5', 10, scope.double()) &&
		         is.assertEquals('double of 7', 14, (scope.count(7), scope.double()));
		removeCounter(root);
		return ok;
	},

	'computed auto-invalidates on dep change': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		scope.computed('double', function () { return scope.count() * 2; });
		scope.count(3);
		var initial = scope.double();
		scope.count(10);
		var ok = is.assertEquals('initial double', 6, initial) &&
		         is.assertEquals('updated double', 20, scope.double());
		removeCounter(root);
		return ok;
	},

	'watch fires callback on change': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		var values = [];
		scope.watch('count', function (v) { values.push(v); });
		scope.count(1);
		scope.count(42);
		var ok = is.assertEquals('first watch value', 1, values[0]) &&
		         is.assertEquals('second watch value', 42, values[1]);
		removeCounter(root);
		return ok;
	},

	'watch receives new and old values': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		scope.count(10);
		var oldVal, newVal;
		scope.watch('count', function (n, o) { newVal = n; oldVal = o; });
		scope.count(20);
		var ok = is.assertEquals('new value', 20, newVal) &&
		         is.assertEquals('old value', 10, oldVal);
		removeCounter(root);
		return ok;
	},

	'effect runs immediately and on dep change': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		var calls = [];
		scope.effect(function () { calls.push(scope.count()); });
		var before = calls.length;
		scope.count(7);
		var ok = is.assert('effect ran at least once initially', before >= 1) &&
		         is.assert('effect ran after count change', calls.indexOf(7) >= 0);
		removeCounter(root);
		return ok;
	},

	'effect tracks multiple dependencies': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		scope.computed('triple', function () { return scope.count() * 3; });
		var log = [];
		scope.effect(function () { log.push('c' + scope.count() + 't' + scope.triple()); });
		var pre = log.slice();
		scope.count(4);
		var ok = is.assert('effect ran initially', pre.length >= 1) &&
		         is.assert('effect re-ran after change', log.length > pre.length) &&
		         is.assert('includes new values', log[log.length - 1] === 'c4t12');
		removeCounter(root);
		return ok;
	},

	'chained setters return reactive scope': function () {
		var root = appendCounter();
		var scope = Reactive.enhance(prox.hookup('.' + root.className + ' .inc'));
		var ret = scope.count(5).count(10);
		var ok = is.assert('returns reactive scope', ret === scope) &&
		         is.assertEquals('value set', 10, scope.count());
		removeCounter(root);
		return ok;
	}
});

/*
 *  ─── Visual demo ───────────────────────────────────────────
 *  Live reactive scope demo — stays on the page after tests.
 */

Unit.TestCase('Reactive visual demo', {
	'show live computed, watch, effect': function () {
		var demoId = '_reactive_demo';
		if (document.getElementById(demoId)) return true;

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:420px;background:#16213e;border:1px solid #e94560;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 8px;color:#e94560"> Reactive Scope Demo</h2>' +
			'<div data-scope>' +
			'  <p>Count: <strong id="rd-count" style="font-size:24px;color:#0f3460">0</strong></p>' +
			'  <button class="rd-inc" style="padding:6px 18px;margin:4px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer">+1</button>' +
			'  <button class="rd-dec" style="padding:6px 18px;margin:4px;background:#533483;color:#fff;border:0;border-radius:4px;cursor:pointer">-1</button>' +
			'  <button class="rd-x2" style="padding:6px 18px;margin:4px;background:#0f3460;color:#fff;border:0;border-radius:4px;cursor:pointer">x2</button>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p>Double:  <span id="rd-double" style="color:#e94560">0</span></p>' +
			'  <p>Triple:  <span id="rd-triple" style="color:#533483">0</span></p>' +
			'  <p>Even?   <span id="rd-even" style="font-weight:bold">yes</span></p>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p style="font-size:12px;color:#888">Effect log:</p>' +
			'  <div id="rd-log" style="font-size:12px;color:#aaa;max-height:80px;overflow:auto"></div>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var initCount = Number(document.getElementById('rd-count').textContent) || 0;
		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.count(initCount);

		scope.computed('double', function () { return scope.count() * 2; });
		scope.computed('triple', function () { return scope.count() * 3; });
		scope.computed('even', function () { return scope.count() % 2 === 0 ? 'yes' : 'no'; });

		scope.effect(function () {
			document.getElementById('rd-count').textContent = scope.count();
			document.getElementById('rd-double').textContent = scope.double();
			document.getElementById('rd-triple').textContent = scope.triple();
			document.getElementById('rd-even').textContent = scope.even();
		});

		scope.effect(function () {
			var log = document.getElementById('rd-log');
			if (!log) return;
			var entry = document.createElement('div');
			entry.textContent = 'count=' + scope.count() + ' double=' + scope.double() + ' triple=' + scope.triple();
			log.appendChild(entry);
			log.scrollTop = log.scrollHeight;
		});

		document.querySelector('#' + demoId + ' .rd-inc').onclick = function () { scope.count(scope.count() + 1); };
		document.querySelector('#' + demoId + ' .rd-dec').onclick = function () { scope.count(scope.count() - 1); };
		document.querySelector('#' + demoId + ' .rd-x2').onclick = function () { scope.count(scope.count() * 2); };

		return true;
	}
});

/*
 *  ─── Step wizard demo ──────────────────────────────────────
 *  Multi-step form with computed progress, step indicators,
 *  and reactive navigation — all driven from a single `step` value.
 */

Unit.TestCase('Step wizard demo', {
	'show computed-driven multi-step wizard': function () {
		var demoId = '_wizard_demo';
		if (document.getElementById(demoId)) return true;

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:520px;background:#16213e;border:1px solid #0f3460;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 16px;color:#e94560"> Reactive Step Wizard</h2>' +
			'<div data-scope>' +
			'  <div style="display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:8px">' +
			'    <div class="wz-dot" id="wz-dot-1" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;background:#333;color:#888;border:2px solid #555;transition:all .3s">1</div>' +
			'    <div class="wz-line" style="width:50px;height:3px;background:#333;transition:background .3s" id="wz-line-1"></div>' +
			'    <div class="wz-dot" id="wz-dot-2" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;background:#333;color:#888;border:2px solid #555;transition:all .3s">2</div>' +
			'    <div class="wz-line" style="width:50px;height:3px;background:#333;transition:background .3s" id="wz-line-2"></div>' +
			'    <div class="wz-dot" id="wz-dot-3" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;background:#333;color:#888;border:2px solid #555;transition:all .3s">3</div>' +
			'    <div class="wz-line" style="width:50px;height:3px;background:#333;transition:background .3s" id="wz-line-3"></div>' +
			'    <div class="wz-dot" id="wz-dot-4" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;background:#333;color:#888;border:2px solid #555;transition:all .3s">4</div>' +
			'  </div>' +
			'  <div style="height:6px;background:#333;border-radius:3px;margin:4px 0 16px;overflow:hidden">' +
			'    <div id="wz-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#e94560,#0f3460);border-radius:3px;transition:width .4s ease"></div>' +
			'  </div>' +
			'  <p style="text-align:center;font-size:13px;color:#888;margin:0 0 16px">Step <span id="wz-current">1</span> of 4 — <span id="wz-label">Personal Info</span></p>' +

			'  <div id="wz-panel-1" style="display:block;background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:16px">' +
			'    <h3 style="margin:0 0 12px;color:#e94560;font-size:15px">Personal Info</h3>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">Name: <span style="color:#fff">Alice</span></p>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">Email: <span style="color:#fff">alice@example.com</span></p>' +
			'  </div>' +
			'  <div id="wz-panel-2" style="display:none;background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:16px">' +
			'    <h3 style="margin:0 0 12px;color:#e94560;font-size:15px">Preferences</h3>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">Theme: <span style="color:#fff">Dark</span></p>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">Notifications: <span style="color:#fff">Enabled</span></p>' +
			'  </div>' +
			'  <div id="wz-panel-3" style="display:none;background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:16px">' +
			'    <h3 style="margin:0 0 12px;color:#e94560;font-size:15px">Review</h3>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">All set! Confirm your choices.</p>' +
			'  </div>' +
			'  <div id="wz-panel-4" style="display:none;background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:16px">' +
			'    <h3 style="margin:0 0 12px;color:#e94560;font-size:15px">Done!</h3>' +
			'    <p style="margin:4px 0;font-size:13px;color:#aaa">Thank you — your setup is complete.</p>' +
			'  </div>' +

			'  <div style="display:flex;justify-content:space-between">' +
			'    <button class="wz-back" style="padding:8px 24px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:monospace">Back</button>' +
			'    <button class="wz-next" style="padding:8px 24px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace">Next</button>' +
			'  </div>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.step(1);

		scope.computed('pct', function () { return (scope.step() - 1) / 3 * 100; });
		scope.computed('isFirst', function () { return scope.step() <= 1; });
		scope.computed('isLast', function () { return scope.step() >= 4; });

		var labels = ['Personal Info', 'Preferences', 'Review', 'Done!'];

		scope.effect(function () {
			var s = scope.step();
			document.getElementById('wz-fill').style.width = scope.pct() + '%';
			document.getElementById('wz-current').textContent = s;
			document.getElementById('wz-label').textContent = labels[s - 1];

			for (var i = 1; i <= 4; i++) {
				var dot = document.getElementById('wz-dot-' + i);
				dot.style.background = i <= s ? '#e94560' : '#333';
				dot.style.color = i <= s ? '#fff' : '#888';
				dot.style.borderColor = i <= s ? '#e94560' : '#555';

				if (i < 4) {
					var line = document.getElementById('wz-line-' + i);
					line.style.background = i < s ? '#e94560' : '#333';
				}

				var panel = document.getElementById('wz-panel-' + i);
				panel.style.display = i === s ? 'block' : 'none';
			}

			var backBtn = box.querySelector('.wz-back');
			backBtn.style.opacity = s > 1 ? '1' : '0.3';
			backBtn.style.cursor = s > 1 ? 'pointer' : 'default';

			var nextBtn = box.querySelector('.wz-next');
			nextBtn.textContent = s >= 4 ? 'Reset' : 'Next';
		});

		box.querySelector('.wz-back').onclick = function () {
			if (scope.step() > 1) scope.step(scope.step() - 1);
		};
		box.querySelector('.wz-next').onclick = function () {
			if (scope.step() >= 4) scope.step(1);
			else scope.step(scope.step() + 1);
		};

		return true;
	}
});

/*
 *  ─── Timer / stopwatch demo ─────────────────────────────────
 *  Millisecond counter with computed formatting.
 *  effect drives the display; interval is the only imperative
 *  control that touches scope.ms().
 */

Unit.TestCase('Timer / stopwatch demo', {
	'show reactive stopwatch': function () {
		var demoId = '_timer_demo';
		if (document.getElementById(demoId)) return true;

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:420px;background:#16213e;border:1px solid #533483;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 16px;color:#e94560"> Reactive Timer</h2>' +
			'<div data-scope>' +
			'  <div id="tm-display" style="font-size:48px;text-align:center;padding:20px 0;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:2px">00:00.0</div>' +
			'  <div style="display:flex;gap:8px;justify-content:center">' +
			'    <button class="tm-start" style="padding:8px 24px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace">Start</button>' +
			'    <button class="tm-stop" style="padding:8px 24px;background:#533483;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace">Stop</button>' +
			'    <button class="tm-reset" style="padding:8px 24px;background:#333;color:#888;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:monospace">Reset</button>' +
			'  </div>' +
			'  <p style="text-align:center;font-size:13px;color:#888;margin:12px 0 0">Lap: <span id="tm-lap" style="color:#e94560">—</span></p>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.ms(0);

		scope.computed('seconds', function () { return Math.floor(scope.ms() / 1000); });
		scope.computed('cs', function () { return Math.floor((scope.ms() % 1000) / 100); });
		scope.computed('mins', function () { return Math.floor(scope.seconds() / 60); });
		scope.computed('secs', function () { return scope.seconds() % 60; });

		scope.effect(function () {
			var m = String(scope.mins()).padStart(2, '0');
			var s = String(scope.secs()).padStart(2, '0');
			var c = scope.cs();
			document.getElementById('tm-display').textContent = m + ':' + s + '.' + c;
		});

		var intervalId = null;

		box.querySelector('.tm-start').onclick = function () {
			if (intervalId) return;
			intervalId = setInterval(function () {
				scope.ms(scope.ms() + 100);
			}, 100);
		};
		box.querySelector('.tm-stop').onclick = function () {
			if (intervalId) { clearInterval(intervalId); intervalId = null; }
			document.getElementById('tm-lap').textContent = document.getElementById('tm-display').textContent;
		};
		box.querySelector('.tm-reset').onclick = function () {
			if (intervalId) { clearInterval(intervalId); intervalId = null; }
			scope.ms(0);
			document.getElementById('tm-lap').textContent = '\u2014';
		};

		return true;
	}
});

/*
 *  ─── Shopping cart demo ─────────────────────────────────────
 *  Two items with +/- qty controls.  subtotal / tax / total
 *  are all computed and update reactively on any qty change.
 *  data-bind inputs also sync through the DOMNodeProxy chain.
 */

Unit.TestCase('Shopping cart demo', {
	'show reactive cart with computed totals': function () {
		var demoId = '_cart_demo';
		if (document.getElementById(demoId)) return true;

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:480px;background:#16213e;border:1px solid #0f3460;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 16px;color:#e94560"> Reactive Cart</h2>' +
			'<div data-scope>' +
			'  <table style="width:100%;border-collapse:collapse;font-size:14px">' +
			'    <tr style="color:#888;border-bottom:1px solid #333">' +
			'      <th style="text-align:left;padding:4px 8px">Item</th>' +
			'      <th style="text-align:center;padding:4px 8px">Qty</th>' +
			'      <th style="text-align:right;padding:4px 8px">Price</th>' +
			'      <th style="text-align:right;padding:4px 8px">Line</th>' +
			'    </tr>' +
			'    <tr style="border-bottom:1px solid #2a2a3e">' +
			'      <td style="padding:8px">Widget A</td>' +
			'      <td style="text-align:center;padding:8px">' +
			'        <button class="ca-dec1" style="width:26px;height:26px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:14px">-</button>' +
			'        <span class="ca-qty1" style="display:inline-block;width:30px;text-align:center;color:#fff">0</span>' +
			'        <button class="ca-inc1" style="width:26px;height:26px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:14px">+</button>' +
			'      </td>' +
			'      <td style="text-align:right;padding:8px;color:#aaa">$10.00</td>' +
			'      <td style="text-align:right;padding:8px;color:#0f3460" class="ca-line1">$0.00</td>' +
			'    </tr>' +
			'    <tr style="border-bottom:1px solid #2a2a3e">' +
			'      <td style="padding:8px">Widget B</td>' +
			'      <td style="text-align:center;padding:8px">' +
			'        <button class="ca-dec2" style="width:26px;height:26px;background:#533483;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:14px">-</button>' +
			'        <span class="ca-qty2" style="display:inline-block;width:30px;text-align:center;color:#fff">0</span>' +
			'        <button class="ca-inc2" style="width:26px;height:26px;background:#533483;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:14px">+</button>' +
			'      </td>' +
			'      <td style="text-align:right;padding:8px;color:#aaa">$15.00</td>' +
			'      <td style="text-align:right;padding:8px;color:#533483" class="ca-line2">$0.00</td>' +
			'    </tr>' +
			'  </table>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p style="font-size:13px;color:#888;margin:4px 0">Items: <span id="ca-items" style="color:#fff">0</span></p>' +
			'  <p style="font-size:13px;color:#888;margin:4px 0">Subtotal: <span id="ca-sub" style="color:#fff">$0.00</span></p>' +
			'  <p style="font-size:13px;color:#888;margin:4px 0">Tax (8%): <span id="ca-tax" style="color:#fff">$0.00</span></p>' +
			'  <p style="font-size:18px;color:#e94560;margin:8px 0 0;font-weight:bold">Total: <span id="ca-total">$0.00</span></p>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.qty1(2);
		scope.qty2(1);

		var PRICE1 = 10, PRICE2 = 15;

		scope.computed('line1', function () { return scope.qty1() * PRICE1; });
		scope.computed('line2', function () { return scope.qty2() * PRICE2; });
		scope.computed('subtotal', function () { return scope.line1() + scope.line2(); });
		scope.computed('tax', function () { return Math.round(scope.subtotal() * 0.08 * 100) / 100; });
		scope.computed('total', function () { return Math.round((scope.subtotal() + scope.tax()) * 100) / 100; });
		scope.computed('items', function () { return scope.qty1() + scope.qty2(); });

		scope.effect(function () {
			var l1 = scope.line1(), l2 = scope.line2();
			box.querySelector('.ca-line1').textContent = '$' + l1.toFixed(2);
			box.querySelector('.ca-line2').textContent = '$' + l2.toFixed(2);
			box.querySelector('.ca-qty1').textContent = scope.qty1();
			box.querySelector('.ca-qty2').textContent = scope.qty2();
			document.getElementById('ca-items').textContent = scope.items();
			document.getElementById('ca-sub').textContent = '$' + scope.subtotal().toFixed(2);
			document.getElementById('ca-tax').textContent = '$' + scope.tax().toFixed(2);
			document.getElementById('ca-total').textContent = '$' + scope.total().toFixed(2);
		});

		box.querySelector('.ca-inc1').onclick = function () { scope.qty1(scope.qty1() + 1); };
		box.querySelector('.ca-dec1').onclick = function () { scope.qty1(Math.max(0, scope.qty1() - 1)); };
		box.querySelector('.ca-inc2').onclick = function () { scope.qty2(scope.qty2() + 1); };
		box.querySelector('.ca-dec2').onclick = function () { scope.qty2(Math.max(0, scope.qty2() - 1)); };

		return true;
	}
});

/*
 *  ─── Form validation demo ───────────────────────────────────
 *  Live validation errors via computed strings.  Submit button
 *  is reactively enabled/disabled based on overall validity.
 *  Input events set raw scope values; computed errors update
 *  reactively.
 */

Unit.TestCase('Form validation demo', {
	'show reactive form validation': function () {
		var demoId = '_form_demo';
		if (document.getElementById(demoId)) return true;

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:420px;background:#16213e;border:1px solid #e94560;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 16px;color:#e94560"> Reactive Form</h2>' +
			'<div data-scope>' +
			'  <div style="margin-bottom:12px">' +
			'    <label style="display:block;font-size:13px;color:#888;margin-bottom:4px">Name</label>' +
			'    <input class="fv-name" style="width:100%;padding:8px;background:#1a1a2e;border:1px solid #333;border-radius:4px;color:#fff;font-family:monospace;box-sizing:border-box" placeholder="Enter your name">' +
			'    <p id="fv-name-err" style="margin:4px 0 0;font-size:12px;color:#e94560;min-height:16px"></p>' +
			'  </div>' +
			'  <div style="margin-bottom:12px">' +
			'    <label style="display:block;font-size:13px;color:#888;margin-bottom:4px">Email</label>' +
			'    <input class="fv-email" style="width:100%;padding:8px;background:#1a1a2e;border:1px solid #333;border-radius:4px;color:#fff;font-family:monospace;box-sizing:border-box" placeholder="email@example.com">' +
			'    <p id="fv-email-err" style="margin:4px 0 0;font-size:12px;color:#e94560;min-height:16px"></p>' +
			'  </div>' +
			'  <div style="margin-bottom:16px">' +
			'    <label style="display:block;font-size:13px;color:#888;margin-bottom:4px">Age</label>' +
			'    <input class="fv-age" style="width:100px;padding:8px;background:#1a1a2e;border:1px solid #333;border-radius:4px;color:#fff;font-family:monospace" placeholder="0">' +
			'    <p id="fv-age-err" style="margin:4px 0 0;font-size:12px;color:#e94560;min-height:16px"></p>' +
			'  </div>' +
			'  <button class="fv-submit" disabled style="padding:10px 32px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace;opacity:0.4">Submit</button>' +
			'  <span id="fv-ok" style="margin-left:12px;font-size:13px;color:#0f3460"></span>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.name('');
		scope.email('');
		scope.age('');

		scope.computed('nameErr', function () {
			var v = scope.name();
			return !v ? 'Name is required' : v.length < 2 ? 'Too short' : '';
		});
		scope.computed('emailErr', function () {
			var v = scope.email();
			if (!v) return 'Email is required';
			return v.indexOf('@') < 0 ? 'Invalid email' : '';
		});
		scope.computed('ageErr', function () {
			var v = scope.age();
			if (v === '' || v === null) return 'Age is required';
			var n = Number(v);
			return isNaN(n) || n < 1 ? 'Enter a valid age' : n < 13 ? 'Must be 13+' : '';
		});
		scope.computed('valid', function () {
			return !scope.nameErr() && !scope.emailErr() && !scope.ageErr();
		});

		scope.effect(function () {
			document.getElementById('fv-name-err').textContent = scope.nameErr();
			document.getElementById('fv-email-err').textContent = scope.emailErr();
			document.getElementById('fv-age-err').textContent = scope.ageErr();

			var ok = scope.valid();
			var btn = box.querySelector('.fv-submit');
			btn.disabled = !ok;
			btn.style.opacity = ok ? '1' : '0.4';
			btn.style.cursor = ok ? 'pointer' : 'default';
			if (ok) document.getElementById('fv-ok').textContent = 'All fields valid!';
			else document.getElementById('fv-ok').textContent = '';
		});

		box.querySelector('.fv-name').oninput = function () { scope.name(this.value); };
		box.querySelector('.fv-email').oninput = function () { scope.email(this.value); };
		box.querySelector('.fv-age').oninput = function () { scope.age(this.value); };

		box.querySelector('.fv-submit').onclick = function () {
			if (scope.valid()) {
				var msg = 'Submitted! Name: ' + scope.name() + ', Email: ' + scope.email() + ', Age: ' + scope.age();
				document.getElementById('fv-ok').textContent = msg;
			}
		};

		return true;
	}
});

/*
 *  ─── Reactive i18n demo ─────────────────────────────────────
 *  Live translations via reactive computed + language switch.
 *  Uses a minimal i18n engine that mirrors the i18next API
 *  (t(), changeLanguage()) — swap it for window.i18next in
 *  production.  scope.lang() is the dependency trigger;
 *  computed translations re-evaluate when it changes.
 */

Unit.TestCase('Reactive i18n demo', {
	'show reactive live translations': function () {
		var demoId = '_i18n_demo';
		if (document.getElementById(demoId)) return true;

		var resources = {
			en: {
				greeting: 'Hello',
				welcome: 'Welcome to the <b>Reactive i18n</b> demo!',
				counter_label: 'Counter',
				about: 'A modern multi-faceted solutions entity, built to shape your identity and brand.',
				switch_label: 'Language'
			},
			ko: {
				greeting: '안녕하세요',
				welcome: '<b>반응형 다국어</b> 데모에 오신 것을 환영합니다!',
				counter_label: '카운터',
				about: '당신의 정체성과 브랜드를 구축하기 위해 설계된 현대적인 다각적 솔루션.',
				switch_label: '언어'
			}
		};

		var i18n = {
			_lng: 'en',
			t: function (key) {
				return resources[this._lng][key] || key;
			},
			changeLanguage: function (lng) {
				this._lng = lng;
			}
		};

		var box = document.createElement('div');
		box.id = demoId;
		box.style.cssText = 'margin:30px auto;max-width:420px;background:#16213e;border:1px solid #533483;border-radius:10px;padding:24px;color:#eee;font-family:monospace';

		box.innerHTML =
			'<h2 style="margin:0 0 16px;color:#e94560"> Reactive Translations</h2>' +
			'<div data-scope>' +
			'  <p style="font-size:13px;color:#888;margin:0 0 8px" id="i18n-switch-label">Language</p>' +
			'  <div style="display:flex;gap:8px;margin-bottom:16px">' +
			'    <button class="i18n-en" style="padding:6px 20px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace;font-weight:bold;opacity:1">EN</button>' +
			'    <button class="i18n-ko" style="padding:6px 20px;background:#333;color:#888;border:1px solid #555;border-radius:4px;cursor:pointer;font-family:monospace">KO</button>' +
			'  </div>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p style="font-size:24px;margin:8px 0" id="i18n-greeting">Hello</p>' +
			'  <p style="font-size:14px;color:#aaa;margin:8px 0" id="i18n-welcome">Welcome to the <b>Reactive i18n</b> demo!</p>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p style="font-size:13px;color:#888;margin:8px 0"><span id="i18n-counter-label">Counter</span>: <strong id="i18n-count" style="font-size:20px;color:#e94560">0</strong></p>' +
			'  <button class="i18n-inc" style="padding:6px 16px;background:#0f3460;color:#fff;border:0;border-radius:4px;cursor:pointer;font-family:monospace">+1</button>' +
			'  <hr style="border-color:#333;margin:12px 0">' +
			'  <p style="font-size:13px;color:#aaa;margin:8px 0" id="i18n-about">A modern multi-faceted solutions entity...</p>' +
			'</div>';

		var stage = document.getElementById('stage') || document.body;
		stage.appendChild(box);

		var domScope = prox.hookup('#' + demoId + ' [data-scope]');
		var scope = Reactive.enhance(domScope);
		scope.count(0);
		scope.lang('en');

		scope.computed('greeting', function () {
			scope.lang();
			return i18n.t('greeting');
		});
		scope.computed('welcome', function () {
			scope.lang();
			return i18n.t('welcome');
		});
		scope.computed('counter_label', function () {
			scope.lang();
			return i18n.t('counter_label');
		});
		scope.computed('about', function () {
			scope.lang();
			return i18n.t('about');
		});
		scope.computed('switch_label', function () {
			scope.lang();
			return i18n.t('switch_label');
		});

		scope.effect(function () {
			document.getElementById('i18n-greeting').innerHTML = scope.greeting();
			document.getElementById('i18n-welcome').innerHTML = scope.welcome();
			document.getElementById('i18n-counter-label').textContent = scope.counter_label();
			document.getElementById('i18n-about').innerHTML = scope.about();
			document.getElementById('i18n-switch-label').textContent = scope.switch_label();
		});

		scope.effect(function () {
			document.getElementById('i18n-count').textContent = scope.count();
		});

		function setLang(lng) {
			if (lng === i18n._lng) return;
			i18n.changeLanguage(lng);
			scope.lang(lng);
			box.querySelector('.i18n-en').style.background = lng === 'en' ? '#e94560' : '#333';
			box.querySelector('.i18n-en').style.color = lng === 'en' ? '#fff' : '#888';
			box.querySelector('.i18n-en').style.border = lng === 'en' ? '0' : '1px solid #555';
			box.querySelector('.i18n-ko').style.background = lng === 'ko' ? '#e94560' : '#333';
			box.querySelector('.i18n-ko').style.color = lng === 'ko' ? '#fff' : '#888';
			box.querySelector('.i18n-ko').style.border = lng === 'ko' ? '0' : '1px solid #555';
		}

		box.querySelector('.i18n-en').onclick = function () { setLang('en'); };
		box.querySelector('.i18n-ko').onclick = function () { setLang('ko'); };
		box.querySelector('.i18n-inc').onclick = function () { scope.count(scope.count() + 1); };

		return true;
	}
});

/*
 *  ─── Summary ───────────────────────────────────────────────
 */

Unit.summary();

trace('');
trace('▲  require("./test") to re-run.  Use Unit.TestCase(name, methods)');
trace('   for individual suites.  Unit.reset() clears counters.');
