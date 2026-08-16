/*
 * StrawNode (StrawNode Core feature, including Type and a nodeless 'require()' implementation)
 * Base Webapp-oriented Framework, along with StrawNode
 * attempting to reproduce Node and Express features and idioms,
 * in the restricted context of a web-page with Javascript.
 * 
 * V 1.0.0
 * 
 * Dependancies : 
 * 	 Type.js
 *
 * authored under Spark Project License
 * 
 * by saz aka True
 * sazaam[(at)gmail.com]
 * 2011-2013
 * 
 * 
 */

'use strict';
window.trace = console.log;
(function (name, definition) {
	if ('function' === typeof define)// AMD
		define(definition);
	else if ('undefined' !== typeof module && module.exports)// Node.js
		module.exports = (('function' === typeof definition) ? definition() : definition) || module.exports;
	else
		if (definition !== undefined) this[name] = ('function' === typeof definition) ? definition() : definition;
})('strawnode', (function () {



	// UTILS
	var scriptSrc = function (abs) {
		var scripts = document.getElementsByTagName('script');
		var script;
		// Search backwards for the script that looks like us
		for (var i = scripts.length - 1; i >= 0; i--) {
			var s = scripts[i];
			var src = s.getAttribute('src', -1) || s.src || '';
			if (src.indexOf('strawnode_async.js') !== -1 || src.indexOf('starter=') !== -1) {
				script = s;
				break;
			}
		}
		// Fallback to the last script if we can't find ourselves (e.g. renamed without starter)
		if (!script) script = scripts[scripts.length - 1];

		return !!abs ? script.src : script.getAttribute('src', -1);
	};

	// REQUIRE AND MODULES

	// NODE URL & PATH

	Object.keys = Object.keys || function (o) {
		if (o == null || (typeof o !== 'object' && typeof o !== 'function'))
			throw new TypeError("Object.keys called on a non-object");
		var result = [];
		for (var key in o) {
			if (Object.prototype.hasOwnProperty.call(o, key))
				result.push(key);
		}
		return result;
	};

	var resolveUrl = (function () {
		var a = document.createElement('a');
		return function (base, rel) {
			if (!rel) return base || '';
			if (/^[a-zA-Z][a-zA-Z0-9.+-]*:/.test(rel)) return rel;
			if (rel.charAt(0) === '/') {
				a.href = location.origin + rel;
				return a.href;
			}
			a.href = base;
			a.href = a.href.replace(/[^/]*$/, '') + rel;
			return a.href;
		};
	})();



	// DETECTING BASE
	// OF COURSE WE ARE IN STRAWNODE, SO NO NEED TO LOAD ONESELF AGAIN

	// I JUST NEED TO KNOW : 
	// ROOT OF PUBLIC PROJECT, 
	// ENTRY PATH TO JS, 
	// PATH TO STARTER IF THERE ARE ANY,

	// AND WHEN ALL SETTINGS DONE, LOAD STARTER FROM REQUIRE 





	// BUT IF I DONT HAVE ANY STARTER, I SHOULD STILL KNOW WHERE I AM SINCE I HAVE NEED FOR REQUIRE

	// SO TWO CASES :
	// EITHER I AM USING STRAWNODE TO START IT ALL
	// OR I JUST NEED REQUIRE AND MANUALLY REQUIRE OTHER NESTED SCRIPTS LATER
	// BUT IN THAT CASE, ANY FILE USING REQUIRE SHOULD BEHAVE AS STRAWNODE i-e KNOWING THERE OWN PATH

	// EXAMPLES
	//1	// JS/STRAWNODE.JS
	// JS/APP/INDEX.JS
	// requiring ./strawnode_modules/TYPE.JS
	// requiring ./ROUTES.JS

	//2	// JS/STRAWNODE.JS?STARTER=APP/INDEX.JS
	// requiring ./APP/INDEX.JS 
	// requiring ./strawnode_modules/TYPE.JS
	// requiring ./ROUTES.JS

	//3	// JS/STRAWNODE.JS?STARTER=APP/
	// requiring ./APP/PACKAGE.JSON 
	// requiring ./strawnode_modules/TYPE.JS
	// requiring ./ROUTES.JS
	// requiring ./INDEX.JS


	// BASE SETTINGS

	var rel_r = /^[.]/;
	var abs_r = /^\//;
	var path_r = /^[.]{0,2}\//;
	var ext_r = /[.](js)$/;
	var path_to_dirname_r = /\/[^\/]+$/;
	var endslash_r = /\/$/;
	var querystring_r = /\?.+/;
	var filename_r = /^.*\//;
	var rel_slash_r = /^[.]\//;

	var DEFAULT_JS_NAME = 'index';

	// HELPERS
	var getBaseParams = function () {
		var abs = scriptSrc(true) || '';
		var src = scriptSrc() || '';
		var filename = abs.replace(querystring_r, '').replace(filename_r, '');
		var dirname = abs.replace(querystring_r, '').replace(filename, '');
		var public_root = abs.replace(src.replace(rel_slash_r, ''), '').replace(querystring_r, '');
		var script_root = abs.replace(querystring_r, '').replace(filename, '');

		return {
			src: src,
			abs: abs,
			dirname: dirname,
			filename: filename,
			public_root: public_root,
			script_root: script_root
		};
	}
	var retrieveQS = function (str) {
		var p = {};
		str.replace(/[^&]+/g, function ($0) {
			var idx = $0.indexOf('=');
			if (idx === -1) {
				p[$0] = '';
			} else {
				p[$0.substring(0, idx)] = $0.substring(idx + 1);
			}
			return '';
		});
		return p;
	}





	// MODULELOADER & MODULE

	var bank = [
		function () { return new XMLHttpRequest() },
		function () { return new ActiveXObject("Msxml2.XMLHTTP") },
		function () { return new ActiveXObject("Msxml3.XMLHTTP") },
		function () { return new ActiveXObject("Microsoft.XMLHTTP") }
	];
	var generateXHR = function generateXHR() {
		var xhttp = false;
		var l = bank.length;
		for (var i = 0; i < l; i++) {
			try {
				xhttp = bank[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		return xhttp;
	};

	var tryAsyncFetch = function tryAsyncFetch(url) {
		if (ModuleLoader.cache[url]) return;
		if (url in ModuleLoader._fetching) return;
		ModuleLoader._fetching[url] = true;

		if (typeof fetch === 'function') {
			fetch(url).then(function (resp) {
				if (!resp.ok) { delete ModuleLoader._fetching[url]; return; }
				return resp.text();
			}).then(function (text) {
				if (text) {
					if (/^\s*</.test(text)) {
						console.warn('[StrawNode] tryAsyncFetch: fetch returned HTML instead of JavaScript');
						console.warn('  url: ' + url);
						console.warn('  first 200 chars: ' + text.slice(0, 200));
					} else {
						ModuleLoader.cache[url] = text;
					}
				}
				delete ModuleLoader._fetching[url];
			}).catch(function () {
				delete ModuleLoader._fetching[url];
			});
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4) return;
				delete ModuleLoader._fetching[url];
				if (xhr.status !== 200 && xhr.status !== 304 && xhr.status !== 0) return;
				var text = xhr.responseText;
				if (/^\s*</.test(text)) {
					console.warn('[StrawNode] tryAsyncFetch: fetch returned HTML instead of JavaScript');
					console.warn('  url: ' + url);
				} else {
					ModuleLoader.cache[url] = text;
				}
			};
			xhr.send(null);
		}
	};

	var setPostData = function setPostData(postData) {
		return {
			post_data: postData,
			post_method: !!postData ? "POST" : "GET",
			ua_header: { ua: 'User-Agent', ns: 'XMLHTTP/1.0' },
			post_data_header: !!postData ? { content_type: 'Content-type', ns: 'application/x-www-form-urlencoded' } : undefined
		};
	}

	var ModuleLoader = function ModuleLoader(url, postData) {
		this.init(url, postData);
	}

	ModuleLoader.prototype.init = function (url, postData) {
		var r = generateXHR();
		if (!r) return;
		this.request = r;
		this.url = !!url ? url : undefined;
		this.userData = setPostData(postData);
	}

	var devMode = false;
	var versionParam = '';
	var versionedUrl = function (url) {
		if (!versionParam || !url) return url;
		return url + (/\?/.test(url) ? '&' : '?') + 'v=' + versionParam;
	};
	ModuleLoader.prototype.load = function load(url, cb) {
		var r = this.request;
		var th = this;
		var ud = this.userData;
		this.failed = false;
		var url = this.url = !!url ? url : this.url;

		if (devMode) url = url + (/\?/.test(url) ? '&' : '?') + '_t=' + Date.now();
		else if (versionParam) url = versionedUrl(url);

		if (url in ModuleLoader.cache) {
			this.response = ModuleLoader.cache[url];
			if (cb) setTimeout(function () { cb(null, th.response); }, 0);
			return this;
		}

		if (typeof fetch === 'function') {
			fetch(url).then(function (resp) {
				if (!resp.ok) {
					th.failed = true;
					if (cb) cb(new Error("Failed to load " + url));
					return;
				}
				return resp.text();
			}).then(function (text) {
				if (th.failed) return;
				th.response = ModuleLoader.cache[url] = text;
				if (cb) cb(null, th.response);
			}).catch(function (err) {
				th.failed = true;
				if (cb) cb(err);
			});
			return this;
		}

		ud['post_method'] = 'GET';
		r.open(ud['post_method'], url, true); // ASYNC

		r.onreadystatechange = function () {
			if (r.readyState != 4) return;
			if (r.status != 200 && r.status != 304 && r.status != 0) {
				th.failed = true;
				if (cb) cb(new Error("Failed to load " + url));
				return false;
			}
			th.response = ModuleLoader.cache[url] = r.responseText;
			if (cb) cb(null, th.response);
		}

		r.send(null);
		return this;
	};

	ModuleLoader.prototype.destroy = function destroy() {
		var ud = this.userData;
		for (var n in ud) {
			delete ud[n];
		}
		for (var s in this) {
			delete this[s];
		}
		return undefined;
	};

	ModuleLoader.setModuleRoot = function (newroot) {
		ModuleLoader.js_root = newroot;
	}
	ModuleLoader.getModuleRoot = function () {
		return ModuleLoader.js_root;
	}
	ModuleLoader.concatRoot = function (append, base) {
		return resolveUrl(base || ModuleLoader.js_root, append);
	}

	// Loading Feedback Array
	var loadingFeedback = window.strawnodeLoadingFeedback = [];
	var snLifecycle = 'idle';
	var logLoad = function (url, status) {
		loadingFeedback.push({ url: url, status: status, time: new Date().getTime() });
		if (Logger.active) Logger.flush();
		if(window.Debug) console.log("[StrawNode Loader]", status, url);
	};

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

	var moduleStack = [];
	var simfunc = function (resp, module, url, params, explicitFilename) {
		if (!resp) {
			throw new Error('[StrawNode] Module not found: "' + url + '" at ' + (explicitFilename || 'unknown') + '.\n  VERBOSE: The file was not in the pre-fetch cache and could not be loaded on demand.\n  VERBOSE: Check that the path is correct and the file exists on the server.');
		}
		var dirname = module.dirname = ModuleLoader.getModuleRoot();
		var filename = module.filename = explicitFilename || ModuleLoader.concatRoot(url, dirname).replace(filename_r, '');
		moduleStack.push(filename || url);

		// Create local require for this module
		module.require = function (id, newparams) {
			return evaluateModule(id, newparams, false, dirname);
		};
		module.require.resolve = require.resolve;
		module.require.getGraph = require.getGraph;

		// Run module source via indirect eval directly (no function wrapper).
		// This gives 0-line offset — errors report exact file line numbers.
		// If module starts with 'use strict', prepend void 0; on the same line
		// to neutralize strict mode (backward compat for implicit globals).
		var PROLOGUE_LINES = 0;
		var public_root = baseparams.public_root;
		var script_root = baseparams.script_root;
		module.params = params;
		var source = resp.replace(
			/^(?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*)?\s*(['"])\s*use\s+strict\s*\1\s*;?\s*/,
			function(m) { return 'void 0;' + m; }
		) + ';\n//# sourceURL=' + (module.dirname + module.filename);

		// Save and set module context as globals for the eval
		var _saved_module = window.module;
		var _saved_require = window.require;
		var _saved_exports = window.exports;
		var _saved___filename = window.__filename;
		var _saved___dirname = window.__dirname;
		var _saved___parameters = window.__parameters;
		var _saved___public_root = window.__public_root;
		var _saved___script_root = window.__script_root;
		window.module = module;
		window.require = module.require;
		window.exports = module.exports;
		window.__filename = filename;
		window.__dirname = dirname;
		window.__parameters = params;
		window.__public_root = public_root;
		window.__script_root = script_root;

		try {
			(0, eval)(source);
		} catch (e) {
			moduleStack.pop();
			var chain = moduleStack.length ? '\n  require chain:\n    ' + moduleStack.join('\n    -> ') : '';
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
			window.module = _saved_module;
			window.require = _saved_require;
			window.exports = _saved_exports;
			window.__filename = _saved___filename;
			window.__dirname = _saved___dirname;
			window.__parameters = _saved___parameters;
			window.__public_root = _saved___public_root;
			window.__script_root = _saved___script_root;
		}
		moduleStack.pop();
		module.loaded = true;
	};

	var cache = {};
	var fetchCache = {}; // Store promises/callbacks for files currently being fetched
	var checkTypeExists = function () { return typeof Type !== 'undefined' };
	var ensureExtension = function (filename) { return filename.replace(/([.]js)?$/, '.js') };
	var islegit = function (resp) { return typeof resp === 'string' && resp.trim().charAt(0) !== '<'; }

	var resolveModuleType = function (id) {
		if (path_r.test(id)) {
			if (ext_r.test(id)) return 'file';
			if (endslash_r.test(id)) return 'dir';
			return 'file';
		}
		if (ext_r.test(id)) return 'node_mods';
		return 'dir';
	};

	var resolveModuleUrl = function (id, type, base) {
		switch (type) {
			case 'file': return ensureExtension(ModuleLoader.concatRoot(id, base));
			case 'dir': return ModuleLoader.concatRoot(id + (id.charAt(id.length - 1) === '/' ? '' : '/') + 'package.json', base);
			case 'node_mods':
				var modId = id.indexOf('strawnode_modules/') === 0 ? id.substring('strawnode_modules/'.length) : id;
				return ModuleLoader.concatRoot('./strawnode_modules/' + modId, base);
		}
	};

	var extractDependencies = function (source, url) {
		var deps = [];
		if (!source) return deps;

		// Skip minified/bundled files — false positives are expensive and never useful
		if (url && /\.min\.js$/i.test(url)) return deps;

		// Strip comments before extracting dependencies
		var cleanSource = source
			.replace(/\/\*[\s\S]*?\*\//g, ' ') // multi-line comments
			.replace(/\/\/.*/g, ' ');          // single-line comments

		// Remove string literal CONTENTS while keeping the outer quotes and
		// preserving real require() calls. We do this by:
		//   1. Temporarily replacing require('...') / require("...") patterns
		//      with a safe placeholder.
		//   2. Replacing all remaining string contents with a space.
		//   3. Restoring placeholders so the require regex finds real deps.
		var REQ_MARKER = '__REQ__';
		var placeholderMap = {};
		var markerIdx = 0;
		cleanSource = cleanSource.replace(
			/(require\s*\(\s*)(['"])([^'"]+)\2/g,
			function (m, prefix, quote, path) {
				var key = REQ_MARKER + (markerIdx++) + REQ_MARKER;
				placeholderMap[key] = m;
				return key;
			}
		);
		// Strip remaining string literal bodies (single and double quoted)
		cleanSource = cleanSource
			.replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, "' '")
			.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, '" "');
		// Restore require-placeholders
		for (var key in placeholderMap) {
			cleanSource = cleanSource.replace(key, placeholderMap[key]);
		}

		// Agnostic heuristic: If this is a pre-bundled file (Webpack, Browserify, or UMD),
		// we skip parsing its internal `require` calls to prevent false-positive pre-fetches.
		var bundlerSignatures = /__webpack_require__|\bdefine\.amd\b|typeof\s+require\s*={2,3}\s*['"]function['"]\s*&&\s*require|['"]function['"]\s*={2,3}\s*typeof\s+require\s*&&\s*require/;

		if (bundlerSignatures.test(cleanSource)) {
			// File is bundled; it manages its own internal requires.
			return deps;
		}

		var reqRegex = /require\s*\(\s*(['"])([^'"]+)\1/g;
		var match;
		while ((match = reqRegex.exec(cleanSource)) !== null) {
			deps.push(match[2]);
		}
		return deps;
	};

	var fetchStack = [];
	// Recursively resolved and fetch module source + dependencies
	var fetchModuleTree = function (url, params, asType, base) {
		var finalUrl = resolveModuleUrl(url, asType, base);

		var initialUrl = finalUrl;
		// Cached/in-flight short-circuit first: shared dependencies (diamonds) are
		// NOT circular — re-requesting a URL that is already being fetched must
		// dedup silently instead of being mis-flagged as a cycle.
		if (fetchCache[initialUrl]) {
			return fetchCache[initialUrl];
		}
		if (ModuleLoader.cache[initialUrl]) {
			return Promise.resolve({ url: initialUrl, source: ModuleLoader.cache[initialUrl], type: asType, rootUrl: url });
		}

		if (fetchStack.indexOf(url) !== -1) {
			console.warn("[StrawNode Loader] Circular dependency detected: " + fetchStack.concat([url]).join(' -> '));
		}
		fetchStack.push(url);

		var processSourceWithExternalDeps = function (fetchedUrl, source, extraDeps) {
			logLoad(fetchedUrl, "fetched");
			var deps = extractDependencies(source, fetchedUrl);
			var allDeps = deps.map(function (d) { return { id: d, type: 'unknown' }; })
				.concat(extraDeps);

			var dirPart = url.indexOf('/') !== -1 ? url.replace(path_to_dirname_r, '/') : './';
			var newRoot = ModuleLoader.concatRoot(dirPart, base);
			if (asType === 'dir') newRoot = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/'), base);
			if (asType === 'node_mods') newRoot = ModuleLoader.concatRoot('./strawnode_modules/', base);

			var depPromises = allDeps.map(function (dep) {
				var reqId = dep.id;
				var reqType = dep.type;

				if (reqType === 'unknown') reqType = resolveModuleType(reqId);

				return fetchModuleTree(reqId, {}, reqType, dep.baseOverride || newRoot)
					.catch(function (err) {
						console.warn("[StrawNode Loader] Failed to pre-fetch dependency: " + reqId + " (Requested by " + fetchedUrl + "). It will throw at runtime if executed.");
						return null;
					});
			});

			return Promise.all(depPromises).then(function () {
				return { url: fetchedUrl, source: source, type: asType, rootUrl: url, newRoot: newRoot };
			});
		};

		var processSource = function (fetchedUrl, source) {
			return processSourceWithExternalDeps(fetchedUrl, source, []);
		};

		var promise = new Promise(function (resolve, reject) {
			logLoad(finalUrl, "fetching");
			var mod = new ModuleLoader();
			mod.init(finalUrl);
			mod.load(finalUrl, function (err, resp) {
				if (err || !islegit(resp)) {
					if (asType === 'file') {
						logLoad(finalUrl, "failed (fallback to dir)");
						return fetchModuleTree(url, params, 'dir', base).then(resolve).catch(reject);
					} else if (asType === 'dir') {
						logLoad(finalUrl, "failed (trying index.js)");
						finalUrl = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/') + 'index.js', base);
						mod.init(finalUrl);
						return mod.load(finalUrl, function (err2, resp2) {
							if (err2 || !islegit(resp2)) return reject(new Error("Failed to load " + finalUrl));
							processSource(finalUrl, resp2).then(resolve).catch(reject);
						});
					} else {
						return reject(err);
					}
				}

				if (asType === 'dir' && finalUrl.indexOf('package.json') !== -1) {
					var pakageJSON = new Function('return ' + resp)();
					var index = pakageJSON.main || pakageJSON.index || './' + DEFAULT_JS_NAME + '.js';
					var indexUrl = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/') + index);
					mod.init(indexUrl);
					return mod.load(indexUrl, function (err2, resp2) {
						if (err2 || !islegit(resp2)) return reject(new Error("Failed to load " + indexUrl));

						var deps = [];
						if (pakageJSON.dependencies) {
							for (var s in pakageJSON.dependencies) {
								var rawDep = pakageJSON.dependencies[s];
								if (rawDep.indexOf('strawnode_modules/') === 0) {
									var pkgDir = url.charAt(url.length - 1) === '/' ? url : url + '/';
									deps.push({
										id: rawDep.substring('strawnode_modules/'.length),
										type: 'node_mods',
										baseOverride: ModuleLoader.concatRoot(pkgDir + 'strawnode_modules/', base)
									});
								} else {
									deps.push({ id: rawDep, type: 'node_mods' });
								}
							}
						}
						processSourceWithExternalDeps(indexUrl, resp2, deps).then(resolve).catch(reject);
					});
				}

				processSource(finalUrl, resp).then(resolve).catch(reject);
			});
		});

		fetchCache[initialUrl] = promise;

		return promise.then(function (result) {
			fetchStack.pop();
			return result;
		}, function (err) {
			fetchStack.pop();
			fetchCache[initialUrl] = null;
			throw err;
		});
	};

	// Evaluate module tree recursively synchronously (since all sources are cached) 
	// This maintains the synchronous nature of require() at runtime
	var evaluateModule = function (id, newparams, isRootCall, base) {
		var s;
		if (!!(s = window[id])) return (s instanceof Module) ? s.exports : s;
		if (cte || (cte = checkTypeExists())) {
			if (!!(s = Type.getDefinitionByName(id))) return Type.is(s, Module) ? s.exports : s;
		}

		var requestedid = id;
		id = ModuleLoader.concatRoot(id, base);

		if (!!(s = cache[id])) return (s instanceof Module) ? s.exports : s;

		ModuleLoader.depStack.push(id);
		if (ModuleLoader.depStack.length > 1)
			ModuleLoader.depEdges[id] = ModuleLoader.depStack[ModuleLoader.depStack.length - 2];

		var params = {};
		if (/\?/.test(requestedid))
			requestedid = requestedid.replace(/\?.+/, function ($1) {
				params = retrieveQS($1.replace(/\?/, ''));
				return '';
			});
		if (!!newparams) {
			for (var k in newparams) params[k] = newparams[k];
		}

		var oldRoot = ModuleLoader.getModuleRoot();

		var asType = resolveModuleType(requestedid);

		// At this point, ModuleLoader.cache MUST contain the fetched source 
		// because fetchModuleTree completed for the entire hierarchy before we started evaluating.
		// Let's resolve what the actual evaluated root is.

		logLoad(requestedid, "evaluating");

		var r, resp;
		var typeExists = checkTypeExists();
		var oldpath = typeExists ? Type.hackpath : '';

		var requireFail = function (url) {
			tryAsyncFetch(url);
			throw new Error('[StrawNode] Module "' + url + '" was not pre-fetched. Use fetchModuleTree() before require(), or add it to the dependency tree.');
		};

		if (asType === 'file') {
			var fileUrl = ensureExtension(ModuleLoader.concatRoot(requestedid, base));
			resp = ModuleLoader.cache[versionedUrl(fileUrl)];
			if (!resp) {
				tryAsyncFetch(versionedUrl(fileUrl));
				asType = 'dir';
			}
		}

		try {
			if (asType === 'dir') {
				var pkgUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + 'package.json', base);
				resp = ModuleLoader.cache[versionedUrl(pkgUrl)];
				var indexUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + 'index.js', base);

				if (resp && islegit(resp)) {
					var pakageJSON = new Function('return ' + resp)();
					var index = pakageJSON.main || pakageJSON.index || './' + DEFAULT_JS_NAME + '.js';
					indexUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + index, base);
					resp = ModuleLoader.cache[versionedUrl(indexUrl)];
					if (!resp) requireFail(versionedUrl(indexUrl));

					var newRoot = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/'), base);
					ModuleLoader.setModuleRoot(newRoot);
					if (typeExists) Type.hackpath = '';

					if (pakageJSON.dependencies) {
						var p = pakageJSON.dependencies;
						for (var pName in p) {
							var depPath = p[pName];
							var depBase = newRoot;
							if (depPath.indexOf('strawnode_modules/') === 0) {
								depPath = depPath.substring('strawnode_modules/'.length);
								depBase = ModuleLoader.concatRoot('strawnode_modules/', newRoot);
							}
							evaluateModule(depPath, {}, false, depBase);
						}
					}

					var modInstance = new Module(requestedid);
					cache[id] = modInstance;
					r = simfunc(resp, modInstance, requestedid, params, indexUrl.replace(filename_r, ''));

				} else {
					resp = ModuleLoader.cache[versionedUrl(indexUrl)];
					if (!resp) requireFail(versionedUrl(indexUrl));
					var newRoot = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/'), base);
					ModuleLoader.setModuleRoot(newRoot);
					if (typeExists) Type.hackpath = '';

					var modInstance = new Module(requestedid);
					cache[id] = modInstance;
					r = simfunc(resp, modInstance, requestedid, params, indexUrl.replace(filename_r, ''));
				}
			} else if (asType === 'file') {
				var finalFileUrl = ensureExtension(ModuleLoader.concatRoot(requestedid, base));
				resp = ModuleLoader.cache[versionedUrl(finalFileUrl)];
				if (!resp) requireFail(versionedUrl(finalFileUrl));
				var dirPart = requestedid.indexOf('/') !== -1 ? requestedid.replace(path_to_dirname_r, '/') : './';
				ModuleLoader.setModuleRoot(ModuleLoader.concatRoot(dirPart, base));
				if (typeExists) Type.hackpath = '';

				var modInstance = new Module(requestedid);
				cache[id] = modInstance;
				r = simfunc(resp, modInstance, requestedid, params, finalFileUrl.replace(filename_r, ''));
			} else if (asType === 'node_mods') {
				var modId = requestedid.indexOf('strawnode_modules/') === 0 ? requestedid.substring('strawnode_modules/'.length) : requestedid;
				var nodeModUrl = ModuleLoader.concatRoot('./strawnode_modules/' + modId, base);
				resp = ModuleLoader.cache[versionedUrl(nodeModUrl)];
				if (!resp) requireFail(versionedUrl(nodeModUrl));
				ModuleLoader.setModuleRoot(ModuleLoader.concatRoot('./strawnode_modules/', base));
				if (typeExists) Type.hackpath = '';

				var modInstance = new Module(requestedid);
				cache[id] = modInstance;
				r = simfunc(resp, modInstance, requestedid, params, nodeModUrl.replace(filename_r, ''));
			}
		} finally {
			if (typeExists) Type.hackpath = oldpath;
			ModuleLoader.setModuleRoot(oldRoot);
			ModuleLoader.depStack.pop();
		}

		logLoad(requestedid, "evaluated");

		s = cache[id];
		return (s instanceof Module) ? s.exports : s;
	};

	// STARTER
	var starterparams;
	var strawnodesrc = scriptSrc();
	var starter;
	if (/\?/.test(strawnodesrc))
		strawnodesrc.replace(querystring_r, function ($1) {
			starterparams = retrieveQS($1.replace(/\?/, ''));
			starter = starterparams.starter;
			return '';
		});

	// CORE REQUIRE METHOD
	var origin;
	var baseparams;
	var STRAWNODE = false;
	var strawnodebaseparams;

	ModuleLoader.cache = {};
	ModuleLoader._fetching = {};
	ModuleLoader.depEdges = {};
	ModuleLoader.depStack = [];
	ModuleLoader.js_root = '';
	var cte;
	var require = window['require'] = function require(id, newparams) {
		if (!STRAWNODE) {
			strawnodebaseparams = baseparams = getBaseParams();
			ModuleLoader.js_root = baseparams.dirname;
			STRAWNODE = true;
			origin = baseparams.src;
		} else {
			if (origin != scriptSrc()) {
				baseparams = getBaseParams();
				ModuleLoader.js_root = baseparams.dirname;
				origin = baseparams.src;
			}
		}

		return evaluateModule(id, newparams, false, ModuleLoader.js_root);
	}

	require.fetchTree = function fetchTree(id, params) {
		var asType = resolveModuleType(id);
		var base = ModuleLoader.js_root;
		return fetchModuleTree(id, params || {}, asType, base);
	};

	require.resolve = function resolve(id) {
		var base = ModuleLoader.js_root || (getBaseParams ? getBaseParams().dirname : location.href);
		var asType = resolveModuleType(id);
		if (asType === 'file') {
			var url = ensureExtension(ModuleLoader.concatRoot(id, base));
			console.log('[StrawNode] resolve "' + id + '" → ' + url + '  (base: ' + base + ')');
			return url;
		}
		if (asType === 'dir') {
			var url = ModuleLoader.concatRoot(id + (id.charAt(id.length - 1) === '/' ? '' : '/') + 'index.js', base);
			console.log('[StrawNode] resolve "' + id + '" → ' + url + '  (base: ' + base + ')');
			return url;
		}
		var modId = id.indexOf('strawnode_modules/') === 0 ? id.substring('strawnode_modules/'.length) : id;
		var url = ModuleLoader.concatRoot('./strawnode_modules/' + modId, base);
		console.log('[StrawNode] resolve "' + id + '" → ' + url + '  (base: ' + base + ')');
		return url;
	};

	require.getGraph = function () {
		return {
			cache: ModuleLoader.cache,
			edges: ModuleLoader.depEdges,
			stack: ModuleLoader.depStack
		};
	};
	
	// Internal function to kick off the async loading of the starter and all its deps
	var dispatchSNEvent = function (name, detail) {
		var e;
		if (typeof window.CustomEvent === "function") {
			e = new CustomEvent(name, { detail: detail });
		} else {
			e = document.createEvent("CustomEvent");
			e.initCustomEvent(name, true, true, detail);
		}
		window.dispatchEvent(e);
	};

	var startAsync = function (startId, startParams) {
		if (startParams && startParams.dev) devMode = true;
		if (startParams && startParams.v) versionParam = startParams.v;
		if (!STRAWNODE) {
			strawnodebaseparams = baseparams = getBaseParams();
			ModuleLoader.js_root = baseparams.dirname;
			STRAWNODE = true;
			origin = baseparams.src;
		}

		if (startParams && startParams.logger && String(startParams.logger) !== '0') {
			Logger.init(window.strawnodesettings.logger || {});
		}

		var asType = resolveModuleType(startId);
		snLifecycle = 'fetching';

		logLoad(startId, "initiating bootstrap");
		fetchModuleTree(startId, startParams, asType, ModuleLoader.js_root).then(function () {
			logLoad(startId, "bootstrap fetched, evaluating tree...");
			try {
				require(startId, startParams);
			} catch (evalErr) {
				console.error("[StrawNode Loader] FATAL: Failed to evaluate application.", evalErr);
				console.warn("[StrawNode Loader] Hint: A module in the dependency tree may have a syntax error or be the wrong file type.");
				snLifecycle = 'error';
				dispatchSNEvent("strawnode-error", { starter: startId, error: evalErr, hint: "A module in the dependency tree may have a syntax error or be the wrong file type." });
				return;
			}

			logLoad(startId, "bootstrap complete") ;
			snLifecycle = 'bootstrapped';
			dispatchSNEvent("strawnode-bootstrapped", { starter: startId, graph: require.getGraph() });

			ModuleLoader.setModuleRoot(
				startId.indexOf('/') !== -1 ?
					ModuleLoader.concatRoot(startId.replace(/[^/]*$/, ''), baseparams.dirname) :
					baseparams.dirname
			);
			snLifecycle = 'ready';
			dispatchSNEvent("strawnode-ready", { starter: startId });
		}).catch(function (err) {
			console.error("[StrawNode Loader] FATAL: Failed to bootstrap application.", err);
			console.warn("[StrawNode Loader] Hint: Did you verify the path to the starter is correct? \"" + startId + "\"");
			snLifecycle = 'error';
			dispatchSNEvent("strawnode-error", { starter: startId, error: err, hint: "Did you verify the path to the starter is correct? \"" + startId + "\"" });
		});
	};

	// LOAD LOGGER — optional, opt-in view controller.
	// Consumes window.strawnodeLoadingFeedback + lifecycle events. The project
	// owns the overlay markup (#loadlogger) and its CSS; strawnode owns the
	// drain/emit/pct/finalize/detach state machine.
	// Enable via ?starter=...&logger=1 (startParams.logger) or require.logger.init(opts).
	// Options may also come from a global window.strawnodesettings = { logger: {...} }
	// defined before strawnode.js loads:
	//   { container, mirror, until, homeReady, phase2Filter, titles,
	//     readyText, className }
	//   until: 'bootstrap' (default — done when all JS modules are fetched +
	//          evaluated) or 'home' (done when the home sections are loaded too;
	//          requires homeReady() as the "home is ready" signal).
	var Logger = (function () {
		var DEFAULTS = {
			container: '#loadlogger',
			mirror: true,
			until: 'bootstrap',
			homeReady: null,
			phase2Filter: null,
			titles: null,
			readyText: null,
			className: 'loadline'
		};

		var S = {
			active: false,
			el: null, consoleEl: null, fillEl: null, pctEl: null, titleEl: null,
			orig: {},
			seen: 0, lastPct: 0, timer: null, finished: false, readyDone: false,
			phase: { started: 0, completed: 0 },
			xhrOpen: null, xhrSend: null, origFetch: null,
			opts: DEFAULTS
		};

		var isMedia = function (u) {
			u = String(u || '');
			return /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico|mp4|webm|mov|og[gv]|m4v|wmv)([?#]|$)/i.test(u);
		};

		var tstamp = function () {
			var d = new Date();
			return ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2) + '.' + ('00' + d.getMilliseconds()).slice(-3);
		};

		var shortUrl = function (u) {
			u = String(u || '').split('?')[0];
			var i = u.indexOf('/strawnode_app/');
			if (i === -1) i = u.lastIndexOf('/js/');
			return (i === -1) ? u : u.slice(i + 1);
		};

		var setTitle = function (t) {
			if (S.titleEl) S.titleEl.textContent = t;
		};
		var setPct = function (p) {
			p = Math.max(0, Math.min(100, p));
			if (S.fillEl) S.fillEl.style.width = p + '%';
			if (S.pctEl) S.pctEl.textContent = p + '%';
		};

		var emit = function (cls, text) {
			if (!S.consoleEl) return;
			var nearBottom = S.consoleEl.scrollTop + S.consoleEl.clientHeight >= S.consoleEl.scrollHeight - 12;
			var line = document.createElement('div');
			line.className = S.opts.className + (cls ? ' ' + cls : '');
			line.textContent = text;
			S.consoleEl.appendChild(line);
			if (nearBottom) S.consoleEl.scrollTop = S.consoleEl.scrollHeight;
		};

		var phase2Filter = function (u) {
			var f = S.opts.phase2Filter;
			return f ? !!f(u) : !isMedia(u);
		};

		var installPhase2 = function () {
			if (window.XMLHttpRequest && window.XMLHttpRequest.prototype && !S.xhrOpen) {
				S.xhrOpen = window.XMLHttpRequest.prototype.open;
				S.xhrSend = window.XMLHttpRequest.prototype.send;
				window.XMLHttpRequest.prototype.open = function (m, u) {
					this.__llurl = u || '';
					this.__llmedia = !phase2Filter(this.__llurl);
					return S.xhrOpen.apply(this, arguments);
				};
				window.XMLHttpRequest.prototype.send = function () {
					var th = this;
					if (th.__llurl && !th.__llmedia && !th.__llcounted) {
						th.__llcounted = true;
						S.phase.started++;
						emit('fetching', '[' + tstamp() + '] fetching  ' + shortUrl(th.__llurl));
					}
					th.addEventListener('load', function () {
						if (th.__llcounted && !th.__llmedia && !th.__lldone) {
							th.__lldone = true;
							S.phase.completed++;
							emit('fetched', '[' + tstamp() + '] fetched  ' + shortUrl(th.__llurl));
						}
					});
					return S.xhrSend.apply(this, arguments);
				};
			}
			if (typeof window.fetch === 'function' && !S.origFetch) {
				S.origFetch = window.fetch;
				window.fetch = function () {
					var u = arguments[0];
					u = (typeof u === 'string') ? u : (u && u.url) || '';
					var count = phase2Filter(u);
					if (count) {
						S.phase.started++;
						emit('fetching', '[' + tstamp() + '] fetching  ' + shortUrl(u));
					}
					return S.origFetch.apply(this, arguments).then(function (resp) {
						if (count) {
							S.phase.completed++;
							emit('fetched', '[' + tstamp() + '] fetched  ' + shortUrl(u));
						}
						return resp;
					}, function (err) {
						if (count) {
							S.phase.completed++;
							emit('fetched', '[' + tstamp() + '] fetched  ' + shortUrl(u));
						}
						throw err;
					});
				};
			}
		};

		var finalize = function (ok) {
			if (S.finished) return;
			S.finished = true;
			window.clearInterval(S.timer);
			if (ok) {
				setPct(100);
				if (S.opts.titles && S.opts.titles.ready) setTitle(S.opts.titles.ready);
			}
			var text = ok ? (S.opts.readyText || 'all required assets loaded') : 'strawnode-error — see console';
			emit(ok ? 'evaluated' : 'error', '[' + tstamp() + '] ' + text);
			window.setTimeout(function () {
				if (!ok) return;
				S.el.classList.add('done');
				window.setTimeout(function () {
					if (S.el.parentNode) S.el.parentNode.removeChild(S.el);
					detach();
				}, 550);
			}, 400);
		};

		var mirror = function (type, args) {
			var parts = [], l = args.length;
			for (var i = 0; i < l; i++) {
				var a = args[i];
				if (typeof a === 'string') parts.push(a);
				else { try { parts.push(JSON.stringify(a)); } catch (e) { parts.push(String(a)); } }
			}
			emit((type === 'error' || type === 'warn') ? 'error' : '', '[' + tstamp() + '] ' + parts.join(' '));
		};

		var onPageErr = function (ev) {
			emit('error', '[' + tstamp() + '] pageerror: ' + ev.message + (ev.filename ? '  ' + shortUrl(ev.filename) + ':' + ev.lineno : ''));
		};
		var onRej = function (ev) {
			var r = ev.reason;
			emit('error', '[' + tstamp() + '] unhandled rejection: ' + (r && r.message ? r.message : String(r)));
		};
		var onReady = function () {
			if (S.finished || S.readyDone) return;
			S.readyDone = true;
			if (S.opts.titles && S.opts.titles.loading) setTitle(S.opts.titles.loading);
			S.lastPct = Math.max(S.lastPct, S.opts.until === 'home' ? 70 : 100);
			setPct(S.lastPct);
			emit('evaluated', '[' + tstamp() + '] bootstrap complete — ready for entry');
			if (S.opts.until === 'home') installPhase2();
		};
		var onSNErr = function (ev) {
			emit('error', '[' + tstamp() + '] ' + (ev.detail && ev.detail.error ? ev.detail.error.message : 'strawnode-error'));
			finalize(false);
		};

		var drain = function () {
			if (S.finished) return;
			var fb = window.strawnodeLoadingFeedback || [];
			var l = fb.length, known = {}, done = {}, st;
			for (var i = 0; i < l; i++) {
				st = String(fb[i].status);
				var u = fb[i].url;
				if (st === 'fetching' || st === 'fetched' || st === 'evaluating' || st === 'evaluated') known[u] = 1;
				if (st === 'fetched' || st === 'evaluating' || st === 'evaluated') done[u] = 1;
			}
			for (; S.seen < l; S.seen++) {
				var e = fb[S.seen], status = String(e.status), cls = 'fetching';
				if (status === 'fetched') cls = 'fetched';
				if (status === 'evaluating') cls = 'evaluating';
				if (status === 'evaluated') cls = 'evaluated';
				if (status.indexOf('fail') !== -1) cls = 'error';
				if (status.indexOf('bootstrap') !== -1) cls = 'evaluated';
				if (e.cls) cls = e.cls;
				emit(cls, '[' + tstamp() + '] ' + status + '  ' + shortUrl(e.url));
			}
			var kn = 0, dn = 0, k, d, pct, policyMet;
			for (k in known) kn++;
			for (d in done) dn++;
			if (!S.readyDone) {
				pct = kn ? Math.round(dn / kn * (S.opts.until === 'home' ? 70 : 100)) : 0;
			} else if (S.opts.until === 'home') {
				pct = 70 + (S.phase.started ? Math.round(S.phase.completed / S.phase.started * 28) : 0);
				policyMet = !!(S.opts.homeReady && S.opts.homeReady());
				if (policyMet) {
					finalize(true);
					return;
				}
			} else {
				pct = 100;
				finalize(true);
				return;
			}
			if (pct > S.lastPct) S.lastPct = pct;
			setPct(S.lastPct);
		};

		var detach = function () {
			window.removeEventListener('error', onPageErr);
			window.removeEventListener('unhandledrejection', onRej);
			window.removeEventListener('strawnode-ready', onReady);
			window.removeEventListener('strawnode-error', onSNErr);
			window.console.log = S.orig.log;
			if (S.orig.info) window.console.info = S.orig.info;
			if (S.orig.debug) window.console.debug = S.orig.debug;
			if (S.orig.warn) window.console.warn = S.orig.warn;
			if (S.orig.error) window.console.error = S.orig.error;
			if (S.xhrOpen && window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
				window.XMLHttpRequest.prototype.open = S.xhrOpen;
				window.XMLHttpRequest.prototype.send = S.xhrSend;
			}
			if (S.origFetch) window.fetch = S.origFetch;
			S.active = false;
			S.el = S.consoleEl = S.fillEl = S.pctEl = S.titleEl = null;
		};

		var init = function (opts) {
			if (S.active) return S;
			if (typeof document === 'undefined') return S;
			var o = {};
			for (var k in DEFAULTS) o[k] = DEFAULTS[k];
			if (opts) for (var k2 in opts) o[k2] = opts[k2];
			S.opts = o;
			S.el = document.getElementById(String(o.container).replace(/^#/, ''));
			if (!S.el) return S;
			S.consoleEl = S.el.querySelector('.loadconsole');
			S.fillEl = S.el.querySelector('.loadfill');
			S.pctEl = S.el.querySelector('.loadpct');
			S.titleEl = S.el.querySelector('.loadtitle');

			var keys = ['log', 'info', 'warn', 'error', 'debug'];
			for (var i = 0; i < keys.length; i++) {
				var k3 = keys[i];
				if (window.console && window.console[k3]) S.orig[k3] = window.console[k3].bind(window.console);
			}

			window.addEventListener('error', onPageErr);
			window.addEventListener('unhandledrejection', onRej);
			window.addEventListener('strawnode-ready', onReady);
			window.addEventListener('strawnode-error', onSNErr);

			if (o.mirror) {
				window.console.log = function () { S.orig.log.apply(window.console, arguments); mirror('log', arguments); };
				if (S.orig.info) window.console.info = function () { S.orig.info.apply(window.console, arguments); mirror('info', arguments); };
				if (S.orig.debug) window.console.debug = function () { S.orig.debug.apply(window.console, arguments); mirror('debug', arguments); };
				if (S.orig.warn) window.console.warn = function () { S.orig.warn.apply(window.console, arguments); mirror('warn', arguments); };
				if (S.orig.error) window.console.error = function () { S.orig.error.apply(window.console, arguments); mirror('error', arguments); };
			}

			S.active = true;
			window.emit = emit;

			if (snLifecycle === 'bootstrapped' || snLifecycle === 'ready') onReady();
			if (snLifecycle === 'error') finalize(false);

			requestAnimationFrame(function () { S.el.classList.add('show'); });
			S.timer = window.setInterval(tick, 110);
			drain();
			return S;
		};

		var tick = function () { drain(); };

		return {
			init: init,
			emit: emit,
			log: function (status, url, cls) {
				window.strawnodeLoadingFeedback.push({ url: url, status: status, cls: cls, time: new Date().getTime() });
				if (S.active) drain();
			},
			setPct: setPct,
			setTitle: setTitle,
			progress: function (started, completed) {
				if (started !== undefined) S.phase.started = started;
				if (completed !== undefined) S.phase.completed = completed;
			},
			done: function () { finalize(true); },
			fail: function (err) {
				emit('error', '[' + tstamp() + '] ' + (err && err.message ? err.message : String(err)));
				finalize(false);
			},
			flush: drain,
			detach: detach,
			get active() { return S.active; }
		};
	})();

	require.logger = Logger;
	window.strawnode = window.strawnode || {};
	window.strawnode.logger = Logger;

	if (!!starter) {
		startAsync(starter, starterparams);
	}

	return;
})())