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

	Object.keys = Object.keys || (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"),
			DontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			DontEnumsLength = DontEnums.length;

		return function (o) {
			if (!Type.of(o, "object") && !Type.of(o, "function") || o === null)
				throw new TypeError("Object.keys called on a non-object");

			var result = [];
			for (var name in o) {
				if (hasOwnProperty.call(o, name))
					result.push(name);
			}

			if (hasDontEnumBug) {
				for (var i = 0; i < DontEnumsLength; i++) {
					if (hasOwnProperty.call(o, DontEnums[i]))
						result.push(DontEnums[i]);
				}
			}

			return result;
		};
	})();

	var Url = window['Url'] = (function () {
		var protocolPattern = /^([a-z0-9.+-]+:)/i,
			portPattern = /:[0-9]*$/,

			// RFC 2396: characters reserved for delimiting URLs.
			// We actually just auto-escape these.
			delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

			// RFC 2396: characters not allowed for various reasons.
			unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),

			// Allowed by RFCs, but cause of XSS attacks. Always escape these.
			autoEscape = ['\''].concat(delims),
			// Characters that are never ever allowed in a hostname.
			// Note that any invalid chars are also handled, but these
			// are the ones that are *expected* to be seen, so we fast-path
			// them.
			nonHostChars = ['%', '/', '?', ';', '#']
				.concat(unwise).concat(autoEscape),
			nonAuthChars = ['/', '@', '?', '#'].concat(delims),
			hostnameMaxLen = 255,
			hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
			hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
			// protocols that can allow "unsafe" and "unwise" chars.
			unsafeProtocol = {
				'javascript': true,
				'javascript:': true
			},
			// protocols that never have a hostname.
			hostlessProtocol = {
				'javascript': true,
				'javascript:': true
			},
			// protocols that always have a path component.
			pathedProtocol = {
				'http': true,
				'https': true,
				'ftp': true,
				'gopher': true,
				'file': true,
				'http:': true,
				'ftp:': true,
				'gopher:': true,
				'file:': true
			},
			// protocols that always contain a // bit.
			slashedProtocol = {
				'http': true,
				'https': true,
				'ftp': true,
				'gopher': true,
				'file': true,
				'http:': true,
				'https:': true,
				'ftp:': true,
				'gopher:': true,
				'file:': true
			};


		var Url = function Url() {
			this.protocol = null;
			this.slashes = null;
			this.auth = null;
			this.host = null;
			this.port = null;
			this.hostname = null;
			this.hash = null;
			this.search = null;
			this.query = null;
			this.pathname = null;
			this.path = null;
		}

		Url.parse = function (url, parseQueryString, slashesDenoteHost) {
			if (!!url && typeof (url) == 'object' && url instanceof Url) return url;
			var u = new Url();
			u.parse(url, parseQueryString, slashesDenoteHost);
			return u;
		}
		Url.format = function (obj) {
			if (typeof (obj) == 'string') obj = Url.parse(obj);
			if (!obj instanceof Url) return new Url().format.call(obj);
			return obj.format();
		}
		Url.resolve = function (from, to) {
			return Url.parse(from, false, true).resolve(to);
		}

		Url.prototype.resolve = function resolve(relative) {
			return this.resolveObject(Url.parse(relative, false, true)).format();
		}
		Url.prototype.resolveObject = function resolveObject(relative) {
			if (typeof (relative) == 'string') {
				var rel = new Url();
				rel.parse(relative, false, true);
				relative = rel;
			}

			var result = new Url();
			Object.keys(this).forEach(function (k) {
				result[k] = this[k];
			}, this);

			// hash is always overridden, no matter what.
			// even href="" will remove it.
			result.hash = relative.hash;

			// if the relative url is empty, then there's nothing left to do here.
			if (relative.href === '') {
				result.href = result.format();
				return result;
			}

			// hrefs like //foo/bar always cut to the protocol.
			if (relative.slashes && !relative.protocol) {
				// take everything except the protocol from relative
				Object.keys(relative).forEach(function (k) {
					if (k !== 'protocol')
						result[k] = relative[k];
				});

				//urlParse appends trailing / to urls like http://www.example.com
				if (slashedProtocol[result.protocol] && result.hostname && !result.pathname)
					result.path = result.pathname = '/';

				result.href = result.format();
				return result;
			}

			if (relative.protocol && relative.protocol !== result.protocol) {
				// if it's a known url protocol, then changing
				// the protocol does weird things
				// first, if it's not file:, then we MUST have a host,
				// and if there was a path
				// to begin with, then we MUST have a path.
				// if it is file:, then the host is dropped,
				// because that's known to be hostless.
				// anything else is assumed to be absolute.
				if (!slashedProtocol[relative.protocol]) {
					Object.keys(relative).forEach(function (k) {
						result[k] = relative[k];
					});
					result.href = result.format();
					return result;
				}

				result.protocol = relative.protocol;
				if (!relative.host && !hostlessProtocol[relative.protocol]) {
					var relPath = (relative.pathname || '').split('/');
					while (relPath.length && !(relative.host = relPath.shift()));
					if (!relative.host) relative.host = '';
					if (!relative.hostname) relative.hostname = '';
					if (relPath[0] !== '') relPath.unshift('');
					if (relPath.length < 2) relPath.unshift('');
					result.pathname = relPath.join('/');
				} else {
					result.pathname = relative.pathname;
				}
				result.search = relative.search;
				result.query = relative.query;
				result.host = relative.host || '';
				result.auth = relative.auth;
				result.hostname = relative.hostname || relative.host;
				result.port = relative.port;
				// to support http.request
				if (result.pathname || result.search) {
					var p = result.pathname || '';
					var s = result.search || '';
					result.path = p + s;
				}
				result.slashes = result.slashes || relative.slashes;
				result.href = result.format();
				return result;
			}

			var isSourceAbs = (!!result.pathname && result.pathname.charAt(0) === '/'),
				isRelAbs = (relative.host || relative.pathname && relative.pathname.charAt(0) === '/'),
				mustEndAbs = (isRelAbs || isSourceAbs || (result.host && relative.pathname)),
				removeAllDots = mustEndAbs,
				srcPath = !!result.pathname && result.pathname.split('/') || [],
				relPath = !!relative.pathname && relative.pathname.split('/') || [],
				psychotic = !!result.protocol && !slashedProtocol[result.protocol];

			// if the url is a non-slashed url, then relative
			// links like ../.. should be able
			// to crawl up to the hostname, as well.  This is strange.
			// result.protocol has already been set by now.
			// Later on, put the first path part into the host field.
			if (psychotic) {
				result.hostname = '';
				result.port = null;
				if (!!result.host) {
					if (srcPath[0] === '') srcPath[0] = result.host;
					else srcPath.unshift(result.host);
				}
				result.host = '';
				if (relative.protocol) {
					relative.hostname = null;
					relative.port = null;
					if (!!relative.host) {
						if (relPath[0] === '') relPath[0] = relative.host;
						else relPath.unshift(relative.host);
					}
					relative.host = null;
				}
				mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
			}

			if (isRelAbs) {
				// it's absolute.
				result.host = (!!relative.host || relative.host === '') ? relative.host : result.host;
				result.hostname = (!!relative.hostname || relative.hostname === '') ? relative.hostname : result.hostname;
				result.search = relative.search;
				result.query = relative.query;
				srcPath = relPath;
				// fall through to the dot-handling below.
			} else if (relPath.length) {
				// it's relative
				// throw away the existing file, and take the new path instead.
				if (!srcPath) srcPath = [];
				srcPath.pop();
				srcPath = srcPath.concat(relPath);
				result.search = relative.search;
				result.query = relative.query;
			} else if (!!relative.search) {
				// just pull out the search.
				// like href='?foo'.
				// Put this after the other two cases because it simplifies the booleans
				if (psychotic) {
					result.hostname = result.host = srcPath.shift();
					//occationaly the auth can get stuck only in host
					//this especialy happens in cases like
					//url.resolveObject('mailto:local1@domain1', 'local2@domain2')
					var authInHost = !!result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
					if (authInHost) {
						result.auth = authInHost.shift();
						result.host = result.hostname = authInHost.shift();
					}
				}
				result.search = relative.search;
				result.query = relative.query;
				//to support http.request
				if (result.pathname !== null || result.search !== null) {
					result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
				}
				result.href = result.format();
				return result;
			}

			if (!srcPath.length) {
				// no path at all.  easy.
				// we've already handled the other stuff above.
				result.pathname = null;
				//to support http.request
				if (result.search)
					result.path = '/' + result.search;
				else
					result.path = null;
				result.href = result.format();
				return result;
			}

			// if a url ENDs in . or .., then it must get a trailing slash.
			// however, if it ends in anything else non-slashy,
			// then it must NOT get a trailing slash.
			var last = srcPath.slice(-1)[0];
			var hasTrailingSlash = ((!!result.host || !!relative.host) && (last === '.' || last === '..') || last === '');

			// strip single dots, resolve double dots to parent dir
			// if the path tries to go above the root, `up` ends up > 0
			var up = 0;
			for (var i = srcPath.length; i >= 0; i--) {
				last = srcPath[i];
				if (last == '.') {
					srcPath.splice(i, 1);
				} else if (last === '..') {
					srcPath.splice(i, 1);
					up++;
				} else if (up) {
					srcPath.splice(i, 1);
					up--;
				}
			}

			// if the path is allowed to go above the root, restore leading ..s
			if (!mustEndAbs && !removeAllDots) {
				for (; up--; up)
					srcPath.unshift('..');
			}

			if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/'))
				srcPath.unshift('');

			if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/'))
				srcPath.push('');

			var isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');

			// put the host back
			if (psychotic) {
				result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
				//occationaly the auth can get stuck only in host
				//this especialy happens in cases like
				//url.resolveObject('mailto:local1@domain1', 'local2@domain2')
				var authInHost = !!result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
				if (authInHost) {
					result.auth = authInHost.shift();
					result.host = result.hostname = authInHost.shift();
				}
			}

			mustEndAbs = mustEndAbs || (!!result.host && srcPath.length);

			if (mustEndAbs && !isAbsolute) {
				srcPath.unshift('');
			}

			if (!srcPath.length) {
				result.pathname = null;
				result.path = null;
			} else {
				result.pathname = srcPath.join('/');
			}

			//to support request.http
			if (result.pathname !== null || result.search !== null)
				result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');

			result.auth = relative.auth || result.auth;
			result.slashes = result.slashes || relative.slashes;
			result.href = result.format();
			return result;
		}

		Url.prototype.format = function format() {

			var auth = this.auth || '';

			if (!!auth) {
				auth = encodeURIComponent(auth);
				auth = auth.replace(/%3A/i, ':');
				auth += '@';
			}

			var protocol = this.protocol || '',
				pathname = this.pathname || '',
				hash = this.hash || '',
				host = false,
				query = '';

			if (!!this.host) {
				host = auth + this.host;
			} else if (!!this.hostname) {
				host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
				if (!!this.port)
					host += ':' + this.port;
			}

			if (!!this.query && typeof (this.query) == 'object' && Object.keys(this.query).length)
				query = querystring.stringify(this.query);

			var search = this.search || (query && ('?' + query)) || '';

			if (!!protocol && protocol.substr(-1) !== ':') protocol += ':';

			// only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
			// unless they had them to begin with.
			if (!!this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
				host = '//' + (host || '');
				if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
			} else if (!!!host) {
				host = '';
			}

			if (!!hash && hash.charAt(0) !== '#') hash = '#' + hash;
			if (!!search && search.charAt(0) !== '?') search = '?' + search;

			return protocol + host + pathname + search + hash;
		}

		Url.prototype.parseHost = function parseHost() {
			var host = this.host;
			var port = portPattern.exec(host);
			if (port) {
				port = port[0];
				if (port !== ':') {
					this.port = port.substr(1);
				}
				host = host.substr(0, host.length - port.length);
			}
			if (host) this.hostname = host;
		}

		Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
			if (typeof (url) !== 'string')
				throw new TypeError("Parameter 'url' must be a string, not " + typeof (url));

			var rest = url;

			// trim before proceeding.
			// This is to support parse stuff like " http://foo.com \n"
			rest = rest.trim();

			var proto = protocolPattern.exec(rest);
			if (!!proto) {
				proto = proto[0];
				var lowerProto = proto.toLowerCase();
				this.protocol = lowerProto;
				rest = rest.substr(proto.length);
			}

			// figure out if it's got a host
			// user@server is *always* interpreted as a hostname, and url
			// resolution will treat //foo/bar as host=foo,path=bar because that's
			// how the browser resolves relative URLs.
			if (!!slashesDenoteHost || !!proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
				var slashes = rest.substr(0, 2) === '//';
				if (!!slashes && !(proto && hostlessProtocol[proto])) {
					rest = rest.substr(2);
					this.slashes = true;
				}
			}

			if (!!!hostlessProtocol[proto] &&
				(!!slashes || (!!proto && !!!slashedProtocol[proto]))) {
				// there's a hostname.
				// the first instance of /, ?, ;, or # ends the host.
				// don't enforce full RFC correctness, just be unstupid about it.

				// If there is an @ in the hostname, then non-host chars *are* allowed
				// to the left of the first @ sign, unless some non-auth character
				// comes *before* the @-sign.
				// URLs are obnoxious.
				var atSign = rest.indexOf('@');
				if (atSign !== -1) {
					var auth = rest.slice(0, atSign);

					// there *may be* an auth
					var hasAuth = true;
					for (var i = 0, l = nonAuthChars.length; i < l; i++) {
						if (auth.indexOf(nonAuthChars[i]) !== -1) {
							// not a valid auth. Something like http://foo.com/bar@baz/
							hasAuth = false;
							break;
						}
					}

					if (hasAuth) {
						// pluck off the auth portion.
						this.auth = decodeURIComponent(auth);
						rest = rest.substr(atSign + 1);
					}
				}

				var firstNonHost = -1;
				for (var i = 0, l = nonHostChars.length; i < l; i++) {
					var index = rest.indexOf(nonHostChars[i]);
					if (index !== -1 && (firstNonHost < 0 || index < firstNonHost))
						firstNonHost = index;
				}

				if (firstNonHost !== -1) {
					this.host = rest.substr(0, firstNonHost);
					rest = rest.substr(firstNonHost);
				} else {
					this.host = rest;
					rest = '';
				}

				// pull out port.
				this.parseHost();

				// we've indicated that there is a hostname,
				// so even if it's empty, it has to be present.
				this.hostname = this.hostname || '';

				// if hostname begins with [ and ends with ]
				// assume that it's an IPv6 address.
				var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

				// validate a little.
				if (!!!ipv6Hostname) {
					var hostparts = this.hostname.split(/\./);
					for (var i = 0, l = hostparts.length; i < l; i++) {
						var part = hostparts[i];
						if (!!!part) continue;
						if (!!!part.match(hostnamePartPattern)) {
							var newpart = '';
							for (var j = 0, k = part.length; j < k; j++) {
								if (part.charCodeAt(j) > 127) {
									// we replace non-ASCII char with a temporary placeholder
									// we need this to make sure size of hostname is not
									// broken by replacing non-ASCII by nothing
									newpart += 'x';
								} else {
									newpart += part[j];
								}
							}
							// we test again with ASCII char only
							if (!!!newpart.match(hostnamePartPattern)) {
								var validParts = hostparts.slice(0, i);
								var notHost = hostparts.slice(i + 1);
								var bit = part.match(hostnamePartStart);
								if (!!bit) {
									validParts.push(bit[1]);
									notHost.unshift(bit[2]);
								}
								if (notHost.length) {
									rest = '/' + notHost.join('.') + rest;
								}
								this.hostname = validParts.join('.');
								break;
							}
						}
					}
				}

				if (this.hostname.length > hostnameMaxLen)
					this.hostname = '';
				else
					// hostnames are always lower case.
					this.hostname = this.hostname.toLowerCase();

				if (!ipv6Hostname) {
					// IDNA Support: Returns a puny coded representation of "domain".
					// It only converts the part of the domain name that
					// has non ASCII characters. I.e. it dosent matter if
					// you call it with a domain that already is in ASCII.
					var domainArray = this.hostname.split('.');
					var newOut = [];
					for (var i = 0; i < domainArray.length; ++i) {
						var s = domainArray[i];
						newOut.push(s.match(/[^A-Za-z0-9_-]/) ? 'xn--' + punycode.encode(s) : s);
					}
					this.hostname = newOut.join('.');
				}

				var p = !!this.port ? ':' + this.port : '';
				var h = this.hostname || '';
				this.host = h + p;
				this.href += this.host;

				// strip [ and ] from the hostname
				// the host field still retains them, though
				if (!!ipv6Hostname) {
					this.hostname = this.hostname.substr(1, this.hostname.length - 2);
					if (rest[0] !== '/')
						rest = '/' + rest;
				}
			}

			// now rest is set to the post-host stuff.
			// chop off any delim chars.
			if (!!!unsafeProtocol[lowerProto]) {

				// First, make 100% sure that any "autoEscape" chars get
				// escaped, even if encodeURIComponent doesn't think they
				// need to be.
				for (var i = 0, l = autoEscape.length; i < l; i++) {
					var ae = autoEscape[i];
					var esc = encodeURIComponent(ae);
					if (esc === ae)
						esc = escape(ae);
					rest = rest.split(ae).join(esc);
				}
			}


			// chop off from the tail first.
			var hash = rest.indexOf('#');
			if (hash !== -1) {
				// got a fragment string.
				this.hash = rest.substr(hash);
				rest = rest.slice(0, hash);
			}
			var qm = rest.indexOf('?');
			if (qm !== -1) {
				this.search = rest.substr(qm);
				this.query = rest.substr(qm + 1);
				if (!!parseQueryString)
					this.query = querystring.parse(this.query);
				rest = rest.slice(0, qm);
			} else if (!!parseQueryString) {
				// no query string, but parseQueryString still requested
				this.search = '';
				this.query = {};
			}
			if (!!rest) this.pathname = rest;
			if (!!slashedProtocol[proto] && !!this.hostname && !!!this.pathname) {
				this.pathname = '/';
			}

			//to support http.request
			if (!!this.pathname || !!this.search) {
				var p = this.pathname || '';
				var s = this.search || '';
				this.path = p + s;
			}

			// finally, reconstruct the href based on what has been validated.
			this.href = this.format();

			return this;
		}

		return Url;
	})();

	var Path = window['Path'] = (function () {
		var splitDeviceRe =
			/^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

		// Regex to split the tail part of the above into [*, dir, basename, ext]
		var splitTailRe =
			/^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

		var f = function f(p) {
			return !!p;
		}
		function normalizeArray(parts, allowAboveRoot) {
			var res = [];
			for (var i = 0; i < parts.length; i++) {
				var p = parts[i];

				// ignore empty parts
				if (!p || p === '.')
					continue;

				if (p === '..') {
					if (res.length && res[res.length - 1] !== '..') {
						res.pop();
					} else if (allowAboveRoot) {
						res.push('..');
					}
				} else {
					res.push(p);
				}
			}

			return res;
		}

		// returns an array with empty elements removed from either end of the input
		// array or the original array if no elements need to be removed
		function trimArray(arr) {
			var lastIndex = arr.length - 1;
			var start = 0;
			for (; start <= lastIndex; start++) {
				if (arr[start])
					break;
			}

			var end = lastIndex;
			for (; end >= 0; end--) {
				if (arr[end])
					break;
			}

			if (start === 0 && end === lastIndex)
				return arr;
			if (start > end)
				return [];
			return arr.slice(start, end + 1);
		}
		var Path = function Path() {
			throw new Error('Not meant to be instanciated');
		}

		Path.resolve = function () {

			var resolvedDevice = '',
				resolvedTail = '',
				resolvedAbsolute = false;

			for (var i = arguments.length - 1; i >= -1; i--) {
				var path;
				if (i >= 0)
					path = arguments[i];
				/*
				
				Let's just ignore this for the moment - (sazaam)

				else if (!resolvedDevice)
					// WHAT IS THIS ???????????
					//path = process.cwd() ;
				else {
					// Windows has the concept of drive-specific current working
					// directories. If we've resolved a drive letter but not yet an
					// absolute path, get cwd for that drive. We're sure the device is not
					// an unc path at this points, because unc paths are always absolute.
					path = process.env['=' + resolvedDevice] ;
					// Verify that a drive-local cwd was found and that it actually points
					// to our drive. If not, default to the drive's root.
					if (!path || path.substr(0, 3).toLowerCase() !== resolvedDevice.toLowerCase() + '\\') {
						path = resolvedDevice + '\\' ;
					}
				}*/

				// Skip empty and invalid entries
				if (typeof (path) !== 'string')
					throw new TypeError('Arguments to path.resolve must be strings');
				else if (!!!path)
					continue;

				var result = splitDeviceRe.exec(path),
					device = result[1] || '',
					isUnc = device && device.charAt(1) !== ':',
					isAbsolute = !!result[2] || isUnc, // UNC paths are always absolute
					tail = result[3];

				if (!!device && !!resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase())
					// This path points to another device so it is not applicable
					continue;

				if (!!!resolvedDevice)
					resolvedDevice = device;
				if (!resolvedAbsolute) {
					resolvedTail = tail + '\\' + resolvedTail;
					resolvedAbsolute = isAbsolute;
				}

				if (!!resolvedDevice && resolvedAbsolute)
					break;
			}

			// Convert slashes to backslashes when `resolvedDevice` points to an UNC
			// root. Also squash multiple slashes into a single one where appropriate.
			if (isUnc) {
				resolvedDevice = normalizeUNCRoot(resolvedDevice);
			}

			// At this point the path should be resolved to a full absolute path,
			// but handle relative paths to be safe (might happen when process.cwd()
			// fails)

			// Normalize the tail path

			resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f), !!!resolvedAbsolute).join('\\');

			return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) || '.';
		}

		Path.normalize = function (path) {
			var result = splitDeviceRe.exec(path),
				device = result[1] || '',
				isUnc = !!device && device.charAt(1) !== ':',
				isAbsolute = !!result[2] || isUnc, // UNC paths are always absolute
				tail = result[3],
				trailingSlash = /[\\\/]$/.test(tail);

			// Normalize the tail path
			tail = normalizeArray(tail.split(/[\\\/]+/).filter(f), !isAbsolute).join('\\');

			if (!!!tail && !isAbsolute) {
				tail = '.';
			}
			if (!!tail && trailingSlash) {
				tail += '\\';
			}

			// Convert slashes to backslashes when `device` points to an UNC root.
			// Also squash multiple slashes into a single one where appropriate.
			if (isUnc) {
				device = normalizeUNCRoot(device);
			}

			return device + (isAbsolute ? '\\' : '') + tail;
		}

		Path.join = function () {
			var filter = function (p) {
				if (typeof (p) !== 'string')
					throw new TypeError('Arguments to path.join must be strings');
				return p;
			}

			var paths = Array.prototype.filter.call(arguments, filter);
			var joined = paths.join('\\');

			// Make sure that the joined path doesn't start with two slashes, because
			// normalize() will mistake it for an UNC path then.
			//
			// This step is skipped when it is very clear that the user actually
			// intended to point at an UNC path. This is assumed when the first
			// non-empty string arguments starts with exactly two slashes followed by
			// at least one more non-slash character.
			//
			// Note that for normalize() to treat a path as an UNC path it needs to
			// have at least 2 components, so we don't filter for that here.
			// This means that the user can use join to construct UNC paths from
			// a server name and a share name; for example:
			//   path.join('//server', 'share') -> '\\\\server\\share\')
			if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
				joined = joined.replace(/^[\\\/]{2,}/, '\\');
			}

			return Path.normalize(joined);
		}

		Path.relative = function (from, to) {
			from = Path.resolve(from);
			to = Path.resolve(to);

			// windows is not case sensitive
			var lowerFrom = from.toLowerCase();
			var lowerTo = to.toLowerCase();

			var trim = function (arr) {
				var start = 0;
				for (; start < arr.length; start++) {
					if (arr[start] !== '') break;
				}

				var end = arr.length - 1;
				for (; end >= 0; end--) {
					if (arr[end] !== '') break;
				}

				if (start > end) return [];

				return arr.slice(start, end - start + 1);
			}

			var toParts = trim(to.split('\\'));

			var lowerFromParts = trim(lowerFrom.split('\\'));
			var lowerToParts = trim(lowerTo.split('\\'));

			var length = Math.min(lowerFromParts.length, lowerToParts.length);
			var samePartsLength = length;
			for (var i = 0; i < length; i++) {
				if (lowerFromParts[i] !== lowerToParts[i]) {
					samePartsLength = i;
					break;
				}
			}

			if (samePartsLength == 0)
				return to;

			var outputParts = [];
			for (var i = samePartsLength; i < lowerFromParts.length; i++) {
				outputParts.push('..');
			}

			outputParts = outputParts.concat(toParts.slice(samePartsLength));

			return outputParts.join('\\');
		}

		Path.dirname = function (path) {
			var result = splitPath(path),
				root = result[0],
				dir = result[1];

			if (!!!root && !!!dir)
				// No dirname whatsoever
				return '.';

			if (dir)
				// It has a dirname, strip trailing slash
				dir = dir.substr(0, dir.length - 1);

			return root + dir;
		}

		Path.basename = function (path, ext) {
			var f = splitPath(path)[2];
			// TODO: make this comparison case-insensitive on windows?
			if (!!ext && f.substr(-1 * ext.length) === ext)
				f = f.substr(0, f.length - ext.length);
			return f;
		}

		Path.extname = function (path) {
			return splitPath(path)[3];
		}

		Path.exists = function () { // deprecated
			/*if (!warned) {
				if (process.throwDeprecation) {
					throw new Error(msg) ;
				} else if (process.traceDeprecation) {
					console.trace(msg) ;
				} else {
					console.error(msg) ;
				}
				warned = true ;
			}
			return fn.apply(this, arguments) ;*/
		}

		Path.existsSync = function () {// deprecated
			/*if (!warned) {
				if (process.throwDeprecation) {
					throw new Error(msg) ;
				} else if (process.traceDeprecation) {
					console.trace(msg) ;
				} else {
					console.error(msg) ;
				}
				warned = true ;
			}
			return fn.apply(this, arguments) ;*/
		}
		Path._makelong = function (path) {
			// Note: this will *probably* throw somewhere.
			if (typeof (path) !== 'string')
				return path;

			if (!!!path)
				return '';

			var resolvedPath = Path.resolve(path);

			if (/^[a-zA-Z]\:\\/.test(resolvedPath))
				// path is local filesystem path, which needs to be converted
				// to long UNC path.
				return '\\\\?\\' + resolvedPath;
			else if (/^\\\\[^?.]/.test(resolvedPath))
				// path is network UNC path, which needs to be converted
				// to long UNC path.
				return '\\\\?\\UNC\\' + resolvedPath.substring(2);

			return path;
		}

		return Path;
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
	var DEFAULT_PKG_JSON_FILENAME = '';

	// var trace = function(){return console.log.apply(console, [].concat(arguments))} ;
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
		str.replace(/[^&]+/g, function ($0) { p[$0.replace(/=.+$/, '')] = $0.replace(/.+[^=]=/, ''); return '' })
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

	ModuleLoader.prototype.load = function load(url, cb) {
		var r = this.request;
		var th = this;
		var ud = this.userData;
		this.failed = false;
		var url = this.url = !!url ? url : this.url;

		if (url in ModuleLoader.cache) {
			this.response = ModuleLoader.cache[url];
			if (cb) setTimeout(function () { cb(null, th.response); }, 0);
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
		return Url.resolve(base || ModuleLoader.js_root, append);
	}

	// Loading Feedback Array
	var loadingFeedback = window.strawnodeLoadingFeedback = [];
	var logLoad = function (url, status) {
		loadingFeedback.push({ url: url, status: status, time: new Date().getTime() });
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

	var simfunc = function (resp, module, url, params) {
		var dirname = module.dirname = ModuleLoader.getModuleRoot();
		var filename = module.filename = ModuleLoader.concatRoot(url, dirname).replace(filename_r, '');

		// Create local require for this module
		module.require = function (id, newparams) {
			return evaluateModule(id, newparams, false, dirname);
		};

		module.filename == ''
			&& DEFAULT_PKG_JSON_FILENAME !== ''
			&& (filename = module.filename = DEFAULT_PKG_JSON_FILENAME);
		var file = 'with(module){' + resp + '};\nreturn module;';
		var public_root = baseparams.public_root;
		var script_root = baseparams.script_root;
		module.params = params;
		var f;
		try {
			f = new Function('module', '__filename', '__dirname', '__parameters', '__public_root', '__script_root', file)(module, filename, dirname, params, public_root, script_root);
		} catch (e) {
			var err = e.constructor(e.message + '\n at ' + module.dirname + module.filename);
			throw err;
		}
		module.loaded = true;
		return f;
	};

	var cache = {};
	var fetchCache = {}; // Store promises/callbacks for files currently being fetched
	var checkTypeExists = function () { return typeof Type !== 'undefined' };
	var ensureExtension = function (filename) { return filename.replace(/([.]js)?$/, '.js') };
	var islegit = function (resp) { return resp[0] != '<'; }

	var extractDependencies = function (source) {
		var deps = [];
		if (!source) return deps;

		// Strip comments before extracting dependencies to avoid loading commented-out requires
		var cleanSource = source
			.replace(/\/\*[\s\S]*?\*\//g, ' ') // Strip multi-line comments
			.replace(/\/\/.*/g, ' ');          // Strip single-line comments

		// Agnostic heuristic: If this is a pre-bundled file (Webpack, Browserify, or UMD),
		// we skip parsing its internal `require` calls to prevent false-positive pre-fetches.
		// We look for common bundler signatures in the first 3000 characters.
		var head = cleanSource.substring(0, 3000);
		var bundlerSignatures = /__webpack_require__|\bdefine\.amd\b|typeof\s+require\s*={2,3}\s*['"]function['"]\s*&&\s*require|['"]function['"]\s*={2,3}\s*typeof\s+require\s*&&\s*require/;

		if (bundlerSignatures.test(head)) {
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

	// Parallel async loop
	var asyncEach = function (items, fn, cb) {
		if (items.length === 0) return cb();
		var pending = items.length;
		var errState = false;
		items.forEach(function (item) {
			fn(item, function (err) {
				if (errState) return;
				if (err) { errState = true; return cb(err); }
				pending--;
				if (pending === 0) cb();
			});
		});
	};

	// Recursively resolved and fetch module source + dependencies
	var fetchModuleTree = function (url, params, asType, cb, base) {
		var resolvedUrl = url;
		// var isAbs = abs_r.test(url);
		// if (isAbs) ModuleLoader.setModuleRoot(absolute_root);

		var finalUrl, finalType = asType;
		switch (asType) {
			case 'file': finalUrl = ensureExtension(ModuleLoader.concatRoot(url, base)); break;
			case 'dir': finalUrl = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/') + 'package.json', base); break;
			case 'node_mods':
				// Avoid double-prepending strawnode_modules if already present at the start of the ID
				var id = url.indexOf('strawnode_modules/') === 0 ? url.substring('strawnode_modules/'.length) : url;
				finalUrl = ModuleLoader.concatRoot('./strawnode_modules/' + id, base);
				break;
		}

		var initialUrl = finalUrl;
		if (fetchCache[initialUrl]) {
			// Already fetched or fetching
			fetchCache[initialUrl].push(cb);
			return;
		}
		if (ModuleLoader.cache[initialUrl]) {
			return cb(null, { url: initialUrl, source: ModuleLoader.cache[initialUrl], type: asType, rootUrl: url });
		}
		fetchCache[initialUrl] = [cb];

		var finishFetch = function (err, result) {
			var callbacks = fetchCache[initialUrl];
			fetchCache[initialUrl] = null; // Clear queue, value is in ModuleLoader.cache anyway
			if (callbacks) callbacks.forEach(function (c) { c(err, result); });
		};

		logLoad(finalUrl, "fetching");

		var mod = new ModuleLoader();
		mod.init(finalUrl);
		mod.load(finalUrl, function (err, resp) {
			if (err || (asType !== 'file' && !islegit(resp))) {
				if (asType === 'file') {
					// Fallback to dir
					logLoad(finalUrl, "failed (fallback to dir)");
					return fetchModuleTree(url, params, 'dir', finishFetch, base);
				} else if (asType === 'dir') {
					// Fallback from package.json to index.js
					logLoad(finalUrl, "failed (trying index.js)");
					finalUrl = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/') + 'index.js', base);
					mod.init(finalUrl);
					return mod.load(finalUrl, function (err2, resp2) {
						if (err2) return finishFetch(err2);
						processSource(finalUrl, resp2, finishFetch);
					});
				} else {
					return finishFetch(err);
				}
			}

			if (asType === 'dir' && finalUrl.indexOf('package.json') !== -1) {
				var pakageJSON = new Function('return ' + resp)();
				var index = pakageJSON.main || pakageJSON.index || './' + DEFAULT_JS_NAME + '.js';
				DEFAULT_PKG_JSON_FILENAME = index.replace(filename_r, '');
				var indexUrl = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/') + index);
				mod.init(indexUrl);
				return mod.load(indexUrl, function (err2, resp2) {
					if (err2 || !islegit(resp2)) return finishFetch(new Error("Failed to load " + indexUrl));

					var deps = [];
					if (pakageJSON.dependencies) {
						for (var s in pakageJSON.dependencies) {
							var rawDep = pakageJSON.dependencies[s];
							if (rawDep.indexOf('strawnode_modules/') === 0) {
								// Path like "strawnode_modules/jquery.min.js":
								// strip the prefix and fetch as a node_mods type from the
								// package's own strawnode_modules/ subfolder.
								// Use ModuleLoader.concatRoot (not bare Url.resolve) so the
								// absolute URL is computed against the JS root, not the page URL.
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
					processSourceWithExternalDeps(indexUrl, resp2, deps, finishFetch);
				});
			}

			processSource(finalUrl, resp, finishFetch);
		});

		var processSource = function (fetchedUrl, source, doneCB) {
			processSourceWithExternalDeps(fetchedUrl, source, [], doneCB);
		};

		var processSourceWithExternalDeps = function (fetchedUrl, source, extraDeps, doneCB) {
			logLoad(fetchedUrl, "fetched");
			var deps = extractDependencies(source);
			var allDeps = deps.map(function (d) { return { id: d, type: 'unknown' }; })
				.concat(extraDeps);

			// Set the local module root for relative requires inside this file
			var dirPart = url.indexOf('/') !== -1 ? url.replace(path_to_dirname_r, '/') : './';
			var newRoot = ModuleLoader.concatRoot(dirPart, base);
			if (asType === 'dir') newRoot = ModuleLoader.concatRoot(url + (url.charAt(url.length - 1) === '/' ? '' : '/'), base);
			if (asType === 'node_mods') newRoot = ModuleLoader.concatRoot('./strawnode_modules/', base);

			asyncEach(allDeps, function (dep, depCB) {
				var reqId = dep.id;
				var reqType = dep.type;

				if (reqType === 'unknown') {
					if (path_r.test(reqId)) {
						if (ext_r.test(reqId)) reqType = 'file';
						else if (endslash_r.test(reqId)) reqType = 'dir';
						else reqType = 'file'; // Try as file first, falls back to dir
					} else if (ext_r.test(reqId)) {
						reqType = 'node_mods';
					} else {
						reqType = 'dir'; // Treat unscoped as dir/module
					}
				}

				fetchModuleTree(reqId, {}, reqType, function (err, result) {
					if (err) {
						console.warn("[StrawNode Loader] Failed to pre-fetch dependency: " + reqId + " (Requested by " + fetchedUrl + "). It will throw at runtime if executed.");
						return depCB(null, result); // Ignore error to allow false positives (like internal bundled modules) from regex scanner
					}
					depCB(null, result);
				}, dep.baseOverride || newRoot);
			}, function (err) {
				doneCB(err, { url: fetchedUrl, source: source, type: asType, rootUrl: url, newRoot: newRoot });
			});
		};
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

		var params = {};
		if (/\?/.test(requestedid))
			requestedid = requestedid.replace(/\?.+/, function ($1) {
				params = retrieveQS($1.replace(/\?/, ''));
				return '';
			});
		if (!!newparams) {
			for (var k in newparams) params[k] = newparams[k];
		}

		var isAbs = abs_r.test(requestedid);
		var oldRoot = ModuleLoader.getModuleRoot();
		// if (isAbs) ModuleLoader.setModuleRoot(absolute_root); // Not needed with absolute URL handling below

		var asType;
		if (path_r.test(requestedid)) {
			if (ext_r.test(requestedid)) asType = 'file';
			else if (endslash_r.test(requestedid)) asType = 'dir';
			else asType = 'file';
		} else if (ext_r.test(requestedid)) asType = 'node_mods';
		else asType = 'dir';

		var finalUrl;
		switch (asType) {
			case 'file': finalUrl = ensureExtension(ModuleLoader.concatRoot(requestedid, base)); break;
			case 'dir': finalUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + 'package.json', base); break;
			case 'node_mods': finalUrl = ModuleLoader.concatRoot('./strawnode_modules/' + requestedid, base); break;
		}

		// At this point, ModuleLoader.cache MUST contain the fetched source 
		// because fetchModuleTree completed for the entire hierarchy before we started evaluating.
		// Let's resolve what the actual evaluated root is.

		logLoad(requestedid, "evaluating");

		var r, resp;
		var typeExists = checkTypeExists();
		var oldpath = typeExists ? Type.hackpath : '';

		if (asType === 'file') {
			resp = ModuleLoader.cache[ensureExtension(ModuleLoader.concatRoot(requestedid, base))];
			if (!resp) {
				// Failed file, try dir
				asType = 'dir';
			}
		}

		if (asType === 'dir') {
			var pkgUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + 'package.json', base);
			resp = ModuleLoader.cache[pkgUrl];
			var indexUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + 'index.js', base);

			if (resp && islegit(resp)) {
				var pakageJSON = new Function('return ' + resp)();
				var index = pakageJSON.main || pakageJSON.index || './' + DEFAULT_JS_NAME + '.js';
				DEFAULT_PKG_JSON_FILENAME = index.replace(filename_r, '');
				indexUrl = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/') + index, base);
				resp = ModuleLoader.cache[indexUrl];

				var newRoot = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/'), base);
				ModuleLoader.setModuleRoot(newRoot);
				if (typeExists) Type.hackpath = '';

				if (pakageJSON.dependencies) {
					var p = pakageJSON.dependencies;
					for (var pName in p) {
						var depPath = p[pName];
						var depBase = newRoot;
						// Smart resolution: if a dep path starts with 'strawnode_modules/',
						// strip the prefix and resolve from the package's strawnode_modules/ folder.
						// The node_mods resolver will then prepend ./strawnode_modules/ from that
						// deeper base, landing at strawnode_modules/strawnode_modules/<file>.
						// This lets package.json say "strawnode_modules/foo.js" and the loader
						// naturally finds it at <pkg>/strawnode_modules/strawnode_modules/foo.js.
						if (depPath.indexOf('strawnode_modules/') === 0) {
							depPath = depPath.substring('strawnode_modules/'.length);
							depBase = ModuleLoader.concatRoot('strawnode_modules/', newRoot);
						}
						evaluateModule(depPath, {}, false, depBase);
					}
				}

				var modInstance = new Module(requestedid);
				cache[id] = modInstance; // Cache eager to handle circular deps
				r = simfunc(resp, modInstance, requestedid, params);

			} else {
				resp = ModuleLoader.cache[indexUrl];
				var newRoot = ModuleLoader.concatRoot(requestedid + (requestedid.charAt(requestedid.length - 1) === '/' ? '' : '/'), base);
				ModuleLoader.setModuleRoot(newRoot);
				if (typeExists) Type.hackpath = '';

				var modInstance = new Module(requestedid);
				cache[id] = modInstance;
				r = simfunc(resp, modInstance, requestedid, params);
			}
		} else if (asType === 'file') {
			var finalFileUrl = ensureExtension(ModuleLoader.concatRoot(requestedid, base));
			resp = ModuleLoader.cache[finalFileUrl];
			var dirPart = requestedid.indexOf('/') !== -1 ? requestedid.replace(path_to_dirname_r, '/') : './';
			ModuleLoader.setModuleRoot(ModuleLoader.concatRoot(dirPart, base));
			if (typeExists) Type.hackpath = '';

			var modInstance = new Module(requestedid);
			cache[id] = modInstance;
			r = simfunc(resp, modInstance, requestedid, params);
		} else if (asType === 'node_mods') {
			// Avoid double-prepending strawnode_modules
			var modId = requestedid.indexOf('strawnode_modules/') === 0 ? requestedid.substring('strawnode_modules/'.length) : requestedid;
			var nodeModUrl = ModuleLoader.concatRoot('./strawnode_modules/' + modId, base);
			resp = ModuleLoader.cache[nodeModUrl];
			ModuleLoader.setModuleRoot(ModuleLoader.concatRoot('./strawnode_modules/', base));
			if (typeExists) Type.hackpath = '';

			var modInstance = new Module(requestedid);
			cache[id] = modInstance;
			r = simfunc(resp, modInstance, requestedid, params);
		}

		if (typeExists) Type.hackpath = oldpath;
		ModuleLoader.setModuleRoot(oldRoot);

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
	
	// Internal function to kick off the async loading of the starter and all its deps
	var startAsync = function (startId, startParams) {
		if (!STRAWNODE) {
			strawnodebaseparams = baseparams = getBaseParams();
			ModuleLoader.js_root = baseparams.dirname;
			STRAWNODE = true;
			origin = baseparams.src;
		}

		var asType = 'dir';
		if (path_r.test(startId)) {
			if (ext_r.test(startId)) asType = 'file';
			else if (endslash_r.test(startId)) asType = 'dir';
			else asType = 'file';
		} else if (ext_r.test(startId)) asType = 'node_mods';
		else asType = 'dir';

		logLoad(startId, "initiating bootstrap");
		fetchModuleTree(startId, startParams, asType, function (err) {
			if (err) {
				console.error("[StrawNode Loader] FATAL: Failed to bootstrap application.", err);
				return;
			}
			logLoad(startId, "bootstrap fetched, evaluating tree...");
			require(startId, startParams);

			logLoad(startId, "bootstrap complete");

			// ES5-compatible event dispatch (supports IE9+)
			var eventName = "strawnode-ready";
			var eventData = { detail: { starter: startId } };
			var e;
			if (typeof window.CustomEvent === "function") {
				e = new CustomEvent(eventName, eventData);
			} else {
				// IE 9-11 polyfill
				e = document.createEvent("CustomEvent");
				e.initCustomEvent(eventName, true, true, eventData.detail);
			}
			window.dispatchEvent(e);
		}, ModuleLoader.js_root);
	};

	if (!!starter) {
		startAsync(starter, starterparams);
	}

	return;
})())