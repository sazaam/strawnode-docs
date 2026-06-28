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

Unit.reset();

var is = Unit.Assertions;

/*
 *  ─── Basic truth & equality ─────────────────────────────────
 */

Unit.TestCase('truth & equality', {

	setup: function() {
		return '✓ setup ran once';
	},

	tearDown: function() {
		return '✓ tearDown ran once';
	},

	'truthy values': function() {
		return is.assert('true', true) &&
		       is.assert('1', 1) &&
		       is.assert('"a"', 'a');
	},

	'falsy values': function() {
		return !!false === false &&
		       !!0 === false &&
		       !!'' === false &&
		       !!null === false &&
		       !!undefined === false;
	},

	'strict equality': function() {
		return is.assertSame('same', 'hello', 'hello') &&
		       is.assertSame('42=42', 42, 42) &&
		       is.assertNotSame('diff types', '42', 42);
	},

	'loose equality': function() {
		return is.assertEquals('"42"==42', '42', 42) &&
		       is.assertEquals('null==undef', null, undefined) &&
		       is.assertNotEquals('1!=2', 1, 2);
	}
});

/*
 *  ─── Null / undefined / NaN ────────────────────────────────
 */

Unit.TestCase('null / undefined / NaN', {

	'null checks': function() {
		return is.assertNull('null', null) &&
		       is.assertNotNull('not null', 0);
	},

	'undefined checks': function() {
		var undef;
		return is.assertUndefined('undef', undef) &&
		       is.assertNotUndefined('defined', 42);
	},

	'NaN checks': function() {
		return is.assertNaN('0/0', 0 / 0) &&
		       is.assertNaN('NaN', NaN) &&
		       is.assertNotNaN('42', 42) &&
		       is.assertNotNaN('string', 'hello') &&
		       is.assertNotNaN('null', null);
	}
});

/*
 *  ─── Numeric: number, int, float ───────────────────────────
 */

Unit.TestCase('numeric', {

	'number type': function() {
		return is.assertNumber('42', 42) &&
		       is.assertNumber('3.14', 3.14) &&
		       is.assertNumber('Infinity', Infinity) &&
		       is.assertNumber('NaN', NaN) &&
		       typeof '42' !== 'number';
	},

	'integer detection': function() {
		return is.assertInt('42', 42) &&
		       is.assertInt('0', 0) &&
		       is.assertInt('-5', -5) &&
		       !(typeof 3.14 === 'number' && isFinite(3.14) && 3.14 % 1 === 0) &&
		       !(typeof NaN === 'number' && isFinite(NaN));
	},

	'float detection': function() {
		return is.assertFloat('3.14', 3.14) &&
		       is.assertFloat('-0.5', -0.5) &&
		       !(typeof 42 === 'number' && isFinite(42) && 42 % 1 !== 0) &&
		       !(typeof Infinity === 'number' && isFinite(Infinity));
	}
});

/*
 *  ─── Type checking (via Type.is / Type.of) ─────────────────
 *  These delegate to Type.is() and Type.of() from type.js,
 *  which are thin wrappers over instanceof / typeof but
 *  conform to the framework's type system.
 */

Unit.TestCase('type checking', {

	'typeof': function() {
		return is.assertTypeOf('string', 'string', 'hello') &&
		       is.assertTypeOf('number', 'number', 42) &&
		       is.assertTypeOf('boolean', 'boolean', true) &&
		       is.assertTypeOf('function', 'function', function() {}) &&
		       is.assertTypeOf('object', 'object', {}) &&
		       is.assertTypeOf('undefined', 'undefined', undefined);
	},

	'typed assertions': function() {
		return is.assertString('is string', 'hello') &&
		       is.assertNumber('is number', 42) &&
		       is.assertBoolean('is boolean', false) &&
		       is.assertFunction('is function', function() {}) &&
		       is.assertObject('is object', {}) &&
		       is.assertNull('null', null);
	},

	'array (via Type.is)': function() {
		return is.assertArray('[]', []) &&
		       is.assertArray('new Array(5)', new Array(5)) &&
		       !({} instanceof Array);
	}
});

/*
 *  ─── Instanceof (via Type.is) ──────────────────────────────
 *  assertInstanceOf / assertNotInstanceOf delegate to
 *  Type.is() so they work with Type.define()-ed classes.
 */

Unit.TestCase('instanceof (Type system)', {

	'built-in constructors': function() {
		return is.assertInstanceOf('Array', Array, []) &&
		       is.assertInstanceOf('Date', Date, new Date()) &&
		       is.assertInstanceOf('RegExp', RegExp, /./) &&
		       is.assertNotInstanceOf('not Array', Array, {});
	},

	'Type.define classes': function() {
		var Animal = Type.define({
			constructor: function Animal(n) { this.name = n; },
			speak: function() { return '...'; }
		});
		var d = new Animal('Rex');
		return is.assertInstanceOf('Animal', Animal, d) &&
		       is.assertFunction('method', d.speak) &&
		       is.assertEquals('name', 'Rex', d.name);
	},

	'Type.define inherits': function() {
		var Animal = Type.define({
			constructor: function Animal(n) { this.name = n; }
		});
		var Cat = Type.define({
			constructor: function Cat(n) { Cat.base.call(this, n); },
			inherits: Animal,
			speak: function() { return 'meow'; }
		});
		var c = new Cat('Luna');
		return is.assertInstanceOf('Cat instanceof Cat', Cat, c) &&
		       is.assertInstanceOf('Cat instanceof Animal', Animal, c) &&
		       is.assertNotInstanceOf('Animal not Cat', Cat, new Animal('x'));
	}
});

/*
 *  ─── Pattern matching ──────────────────────────────────────
 */

Unit.TestCase('patterns', {
	'match': function() { return is.assertMatch('hello', /hello/, 'hello world'); },
	'no match': function() { return is.assertNoMatch('bye', /bye/, 'hello world'); }
});

/*
 *  ─── Exceptions ────────────────────────────────────────────
 */

Unit.TestCase('exceptions', {

	'expected': function() {
		return is.assertException(
			'null.toString',
			function() { null.toString(); },
			'toString'
		);
	},

	'safe': function() {
		return is.assertNoException('safe', function() { 1 + 1; });
	}
});

/*
 *  ─── DOM (browser only) ────────────────────────────────────
 */

Unit.TestCase('DOM', {
	'body element': function() {
		return is.assertNotNull('body', document.body) &&
		       is.assertTagName('tag', 'body', document.body);
	}
});

/*
 *  ─── Type system framework tests ───────────────────────────
 */

Unit.TestCase('Type system', {

	'Type.define with statics': function() {
		var M = Type.define({
			statics: { add: function(a, b) { return a + b; }, PI: 3.14 }
		});
		return is.assertFunction('static method', M.add) &&
		       is.assertEquals('3+4', 7, M.add(3, 4)) &&
		       is.assertFloat('PI', M.PI);
	},

	'Type.make factory': function() {
		var Pt = Type.define({
			constructor: function Pt(x, y) { this.x = x; this.y = y; }
		});
		var p = Type.make(Pt, 3, 7);
		return is.assertInstanceOf('Pt', Pt, p) &&
		       is.assertInt('x', p.x) &&
		       is.assertEquals('x=3', 3, p.x) &&
		       is.assertEquals('y=7', 7, p.y);
	}
});

/*
 *  ─── Nested suites ─────────────────────────────────────────
 */

Unit.TestCase('nested', {

	'outer': function() { return is.assert('outer pass', true); },

	'math': {
		'1+1': function() { return is.assertEquals('', 2, 1 + 1); },
		'3-1': function() { return is.assertEquals('', 2, 3 - 1); }
	}
});

/*
 *  ─── Async tests (done callback & Promise) ────────────────
 */

Unit.TestCase('async', {

	'done callback': function(done) {
		setTimeout(function() {
			is.assert('async pass', true);
			done();
		}, 10);
	},

	'done callback with error': function(done) {
		setTimeout(function() {
			done('intentional failure');
		}, 10);
	},

	'promise thenable': function() {
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve(is.assert('promise pass', true));
			}, 10);
		});
	}
});

/*
 *  ─── Proxy ─────────────────────────────────────────────────
 *  Uses the hybrid Proxy from strawexpress (native when
 *  available, static closure fallback).  Both paths share the
 *  same API contracts.
 */

Unit.TestCase('Proxy', {

	'lookup via Type.definition': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		return is.assertNotNull('resolved', P) &&
		       is.assertFunction('is constructor', P);
	},

	'wrap returns distinct object': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = { x: 1, y: 2 };
		var proxy = P(target);
		return is.assertNotNull('proxy', proxy) &&
		       is.assert('proxy !== target', proxy !== target);
	},

	'primitive getter returns value': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var proxy = P({ x: 42, s: 'hi', b: true });
		return is.assertFunction('x is closure', proxy.x) &&
		       is.assertEquals('x() === 42', 42, proxy.x()) &&
		       is.assertEquals('s() === "hi"', 'hi', proxy.s()) &&
		       is.assert('b() === true', proxy.b() === true);
	},

	'primitive setter propagates to target': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = { x: 10 };
		var proxy = P(target);
		proxy.x(99);
		return is.assertEquals('target.x === 99', 99, target.x) &&
		       is.assertEquals('proxy.x() === 99', 99, proxy.x());
	},

	'object property two-arg accessor': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var proxy = P({ data: { a: 1, b: 2 } });
		return is.assertEquals('data("a")', 1, proxy.data('a')) &&
		       is.assertEquals('data("b")', 2, proxy.data('b'));
	},

	'object property setter via two-arg': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var proxy = P({ data: { a: 1 } });
		proxy.data('a', 999);
		return is.assertEquals('data.a after set', 999, proxy.data('a'));
	},

	'object property merge via object-arg': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var proxy = P({ data: { a: 1, b: 2 } });
		proxy.data({ c: 3 });
		return is.assertEquals('a preserved', 1, proxy.data('a')) &&
		       is.assertEquals('c added', 3, proxy.data('c'));
	},

	'function forwarding': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = {
			counter: 0,
			increment: function() { this.counter++; return this.counter; }
		};
		var proxy = P(target);
		var result = proxy.increment();
		return is.assertEquals('counter incremented', 1, result) &&
		       is.assertEquals('increment returns', 2, proxy.increment());
	},

	'override properties': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = { x: 1, y: 2 };
		var override = { z: 3 };
		var proxy = P(target, override);
		return is.assertEquals('original x', 1, proxy.x()) &&
		       is.assertEquals('override z (raw)', 3, proxy.z);
	},

	'override replacing existing property': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = { x: 1 };
		var override = { x: 999 };
		var proxy = P(target, override);
		return is.assertEquals('override wins', 999, proxy.x);
	},

	'__proxy__ back-reference': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		var target = { x: 1 };
		var proxy = P(target);
		return is.assert('__proxy__ set', !!target.__proxy__);
	},

	'dual instanceof — custom class': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		function Widget(n) { this.name = n; }
		Widget.prototype.greet = function() { return 'Hi, ' + this.name; };
		var obj = new Widget('test');
		var proxy = P(obj);
		return is.assertInstanceOf('Widget', Widget, proxy);
	},

	'cached class via toClass': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		function Model(n) { this.name = n; }
		var obj = new Model('first');
		var ProxyModel = P(obj, null, true);
		return is.assertFunction('ProxyModel is constructor', ProxyModel);
	},

	'toClass instances share prototype chain': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		function Model(n) { this.name = n; }
		Model.prototype.say = function() { return this.name; };
		var obj = new Model('tmpl');
		var ProxyModel = P(obj, null, true);
		var a = new ProxyModel(new Model('Alice'));
		var b = new ProxyModel(new Model('Bob'));
		return is.assertInstanceOf('a instanceof Model', Model, a) &&
		       is.assertInstanceOf('b instanceof Model', Model, b) &&
		       is.assert('a !== b', a !== b);
	},

	'static Proxy.Class shortcut': function() {
		var P = Type.definition('org.libspark.straw.proxies::Proxy');
		function Shape(s) { this.side = s; }
		var obj = new Shape(10);
		var Klass = P.Class(obj, null);
		return is.assertFunction('Class returns constructor', Klass);
	}
});

/*
 *  ─── Summary ───────────────────────────────────────────────
 */

Unit.summary();

trace('');
trace('▲  require("./test") to re-run.  Use Unit.TestCase(name, methods)');
trace('   for individual suites.  Unit.reset() clears counters.');
