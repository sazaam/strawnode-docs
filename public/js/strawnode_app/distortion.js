/*
 * Transition renderer for project slides.
 * Raw WebGL2: two source textures, one displacement texture, one progress uniform.
 */

var VERT = [
	'#version 300 es',
	'in vec2 aPosition;',
	'out vec2 vUv;',
	'void main(){',
	'	vUv = aPosition * 0.5 + 0.5;',
	'	gl_Position = vec4(aPosition, 0.0, 1.0);',
	'}'
].join('\n');

var FRAG = [
	'#version 300 es',
	'precision highp float;',
	'in vec2 vUv;',
	'out vec4 outColor;',
	'',
	'uniform sampler2D uTexA;',
	'uniform sampler2D uTexB;',
	'uniform sampler2D uDisp;',
	'uniform vec2 uRes;',
	'uniform vec2 uSizeA;',
	'uniform vec2 uSizeB;',
	'uniform float uProgress;',
	'uniform float uIntensity;',
	'uniform float uDirection;',
	'',
	'vec2 cover(vec2 uv, vec2 imageSize, vec2 boxSize){',
	'	float boxAspect = boxSize.x / boxSize.y;',
	'	float imageAspect = imageSize.x / imageSize.y;',
	'	vec2 scale = imageAspect > boxAspect',
	'		? vec2(boxAspect / imageAspect, 1.0)',
	'		: vec2(1.0, imageAspect / boxAspect);',
	'	return (uv - 0.5) * scale + 0.5;',
	'}',
	'',
	'void main(){',
	'	vec2 uv = vUv;',
	'	float amount = texture(uDisp, uv).r;',
	'',
	'	vec2 uvA = cover(uv, uSizeA, uRes) + vec2(uDirection * uProgress * amount * uIntensity, 0.0);',
	'	vec2 uvB = cover(uv, uSizeB, uRes) - vec2(uDirection * (1.0 - uProgress) * amount * uIntensity, 0.0);',
	'',
	'	vec4 a = texture(uTexA, uvA);',
	'	vec4 b = texture(uTexB, uvB);',
	'	outColor = mix(a, b, uProgress);',
	'}'
].join('\n');

var displacementCanvas = null;

function hash2(ix, iy) {
	var h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t) {
	return t * t * (3 - 2 * t);
}

function valueNoise(x, y) {
	var ix = Math.floor(x), iy = Math.floor(y);
	var fx = x - ix, fy = y - iy;
	var ux = smooth(fx), uy = smooth(fy);
	var a = hash2(ix, iy), b = hash2(ix + 1, iy);
	var c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
	return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
}

function fbm(x, y) {
	var value = 0, amplitude = 0.5, frequency = 1;
	for (var i = 0; i < 5; i++) {
		value += amplitude * valueNoise(x * frequency, y * frequency);
		frequency *= 2;
		amplitude *= 0.5;
	}
	return value;
}

function makeDisplacementCanvas(size) {
	var canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	var ctx = canvas.getContext('2d');
	var image = ctx.createImageData(size, size);
	var data = image.data;

	for (var y = 0; y < size; y++) {
		for (var x = 0; x < size; x++) {
			var nx = x / size, ny = y / size;
			var value = fbm(nx * 3.2 + 11.3, ny * 3.2 + 4.7);
			var shade = Math.round(Math.min(1, Math.max(0, value)) * 255);
			var i = (y * size + x) * 4;
			data[i] = data[i + 1] = data[i + 2] = shade;
			data[i + 3] = 255;
		}
	}

	ctx.putImageData(image, 0, 0);
	return canvas;
}

function getDisplacementCanvas() {
	if (!displacementCanvas) displacementCanvas = makeDisplacementCanvas(256);
	return displacementCanvas;
}

function compile(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error('Shader compile failed: ' + log);
	}
	return shader;
}

function createProgram(gl) {
	var vs = compile(gl, gl.VERTEX_SHADER, VERT);
	var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
	var program = gl.createProgram();
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var log = gl.getProgramInfoLog(program);
		gl.deleteProgram(program);
		throw new Error('Program link failed: ' + log);
	}
	return program;
}

function TransitionRenderer(canvas) {
	this.canvas = canvas;
	this.gl = canvas.getContext('webgl2', {
		antialias: false,
		alpha: true,
		premultipliedAlpha: true,
		powerPreference: 'default'
	});

	if (!this.gl) throw new Error('WebGL2 is not available');

	this.progress = 0;
	this.intensity = 0.42;
	this.direction = 1;
	this.sources = { A: null, B: null };
	this.destroyed = false;

	this._initGL();
	this._initGeometry();
	this._initTextures();
	this.resize(1, 1, 1);
}

TransitionRenderer.prototype._initGL = function () {
	var gl = this.gl;
	gl.clearColor(0, 0, 0, 0);
	this.program = createProgram(gl);
	this.loc = {
		aPosition: gl.getAttribLocation(this.program, 'aPosition'),
		uTexA: gl.getUniformLocation(this.program, 'uTexA'),
		uTexB: gl.getUniformLocation(this.program, 'uTexB'),
		uDisp: gl.getUniformLocation(this.program, 'uDisp'),
		uRes: gl.getUniformLocation(this.program, 'uRes'),
		uSizeA: gl.getUniformLocation(this.program, 'uSizeA'),
		uSizeB: gl.getUniformLocation(this.program, 'uSizeB'),
		uProgress: gl.getUniformLocation(this.program, 'uProgress'),
		uIntensity: gl.getUniformLocation(this.program, 'uIntensity'),
		uDirection: gl.getUniformLocation(this.program, 'uDirection')
	};
};

TransitionRenderer.prototype._initGeometry = function () {
	var gl = this.gl;
	this.vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);

	this.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1, -1, 1, -1, -1, 1, 1, 1
	]), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(this.loc.aPosition);
	gl.vertexAttribPointer(this.loc.aPosition, 2, gl.FLOAT, false, 0, 0);
	gl.bindVertexArray(null);
};

TransitionRenderer.prototype._initTextures = function () {
	this.texDisp = this._createTexture(getDisplacementCanvas(), 256, 256, false);
	this.sources.A = this._makeSource(null, 'image', 1, 1, false);
	this.sources.B = this._makeSource(null, 'image', 1, 1, false);
};

TransitionRenderer.prototype._createTexture = function (source, width, height, flipY) {
	var gl = this.gl;
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!flipY);

	if (source === null) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Math.max(1, width), Math.max(1, height), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	} else {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	return texture;
};

TransitionRenderer.prototype._makeSource = function (source, kind, width, height, flipY) {
	var gl = this.gl;
	var obj = {
		texture: this._createTexture(source, width, height, flipY),
		kind: kind,
		source: source,
		video: kind === 'video' ? source : null,
		width: Math.max(1, width || 1),
		height: Math.max(1, height || 1),
		allocated: !!source,
		lastTime: -1
	};
	return obj;
};

TransitionRenderer.prototype._uploadVideo = function (obj, force) {
	if (!obj || !obj.video) return;
	var video = obj.video;
	if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
	if (!force && obj.allocated && obj.lastTime === video.currentTime) return;

	var gl = this.gl;
	gl.bindTexture(gl.TEXTURE_2D, obj.texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	if (!obj.allocated || obj.width !== video.videoWidth || obj.height !== video.videoHeight) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
		obj.allocated = true;
		obj.width = video.videoWidth;
		obj.height = video.videoHeight;
	} else {
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, video);
	}

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	obj.lastTime = video.currentTime;
};

TransitionRenderer.prototype.setSource = function (slot, source, kind, width, height) {
	if (this.destroyed) return;
	slot = slot === 'A' ? 'A' : 'B';
	var old = this.sources[slot];
	if (old && old.texture) this.gl.deleteTexture(old.texture);

	if (!source) {
		this.sources[slot] = this._makeSource(null, 'image', 1, 1, false);
		return;
	}

	var isVideo = kind === 'video' || source.tagName == 'VIDEO';
	if (isVideo) {
		var obj = this._makeSource(null, 'video', 1, 1, false);
		obj.video = source;
		this.sources[slot] = obj;
		this._uploadVideo(obj, true);
	} else {
		var w = width || source.naturalWidth || source.width || 1;
		var h = height || source.naturalHeight || source.height || 1;
		this.sources[slot] = this._makeSource(source, 'image', w, h, true);
	}
};

TransitionRenderer.prototype.setProgress = function (progress) {
	this.progress = Math.max(0, Math.min(1, Number(progress) || 0));
};

TransitionRenderer.prototype.setIntensity = function (intensity) {
	this.intensity = Number(intensity);
	if (!isFinite(this.intensity)) this.intensity = 0.42;
};

TransitionRenderer.prototype.setDirection = function (direction) {
	this.direction = Number(direction) < 0 ? -1 : 1;
};

TransitionRenderer.prototype.resize = function (width, height, dpr) {
	var pixelWidth = Math.max(1, Math.round(width * dpr));
	var pixelHeight = Math.max(1, Math.round(height * dpr));
	if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
		this.canvas.width = pixelWidth;
		this.canvas.height = pixelHeight;
	}
	this.gl.viewport(0, 0, pixelWidth, pixelHeight);
};

TransitionRenderer.prototype.render = function () {
	if (this.destroyed || !this.gl) return;
	var gl = this.gl;
	var a = this.sources.A;
	var b = this.sources.B;

	this._uploadVideo(a, false);
	this._uploadVideo(b, false);

	gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(this.program);
	gl.bindVertexArray(this.vao);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, a.texture);
	gl.uniform1i(this.loc.uTexA, 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, b.texture);
	gl.uniform1i(this.loc.uTexB, 1);

	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, this.texDisp);
	gl.uniform1i(this.loc.uDisp, 2);

	gl.uniform2f(this.loc.uRes, this.canvas.width, this.canvas.height);
	gl.uniform2f(this.loc.uSizeA, a.width, a.height);
	gl.uniform2f(this.loc.uSizeB, b.width, b.height);
	gl.uniform1f(this.loc.uProgress, this.progress);
	gl.uniform1f(this.loc.uIntensity, this.intensity);
	gl.uniform1f(this.loc.uDirection, this.direction);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
};

TransitionRenderer.prototype.destroy = function () {
	if (this.destroyed) return;
	this.destroyed = true;

	var gl = this.gl;
	if (gl) {
		if (this.sources.A && this.sources.A.texture) gl.deleteTexture(this.sources.A.texture);
		if (this.sources.B && this.sources.B.texture) gl.deleteTexture(this.sources.B.texture);
		if (this.texDisp) gl.deleteTexture(this.texDisp);
		if (this.buffer) gl.deleteBuffer(this.buffer);
		if (this.vao) gl.deleteVertexArray(this.vao);
		if (this.program) gl.deleteProgram(this.program);
		var lose = gl.getExtension('WEBGL_lose_context');
		if (lose) lose.loseContext();
	}
	this.gl = null;
};

function coverRect(sourceWidth, sourceHeight, width, height, panX) {
	var scale = Math.max(width / sourceWidth, height / sourceHeight);
	var scaledWidth = sourceWidth * scale;
	var scaledHeight = sourceHeight * scale;
	return {
		x: (width - scaledWidth) * panX,
		y: (height - scaledHeight) * 0.5,
		width: scaledWidth,
		height: scaledHeight
	};
}

function drawCover(ctx, source, sourceWidth, sourceHeight, width, height, panX) {
	if (!source || !sourceWidth || !sourceHeight) {
		ctx.fillStyle = '#121212';
		ctx.fillRect(0, 0, width, height);
		return;
	}
	var rect = coverRect(sourceWidth, sourceHeight, width, height, panX);
	ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height);
}

function makeSnapshot(source, sourceWidth, sourceHeight, width, height, panX) {
	var canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(width));
	canvas.height = Math.max(1, Math.round(height));
	var ctx = canvas.getContext('2d');
	drawCover(ctx, source, sourceWidth, sourceHeight, canvas.width, canvas.height, panX);
	return canvas;
}

function backgroundImageUrl(el) {
	if (!el) return null;
	var background = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage || '';
	var match = /url\(["']?(.*?)["']?\)/.exec(background);
	return match && match[1] ? match[1] : null;
}

function snapshotBackground(el, width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(width));
	canvas.height = Math.max(1, Math.round(height));
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#121212';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var url = backgroundImageUrl(el);
	if (!url) return canvas;

	var image = new Image();
	var draw = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawCover(ctx, image, image.naturalWidth, image.naturalHeight, canvas.width, canvas.height, 0.5);
	};
	image.onload = draw;
	image.src = url;
	if (image.complete && image.naturalWidth) draw();
	return canvas;
}

function backgroundPan(el) {
	if (!el) return 0;
	var value = el.style.backgroundPositionX || window.getComputedStyle(el).backgroundPositionX || '0%';
	var number = parseFloat(value);
	if (!isFinite(number)) return 0;
	if (value.indexOf('%') !== -1) return Math.max(0, Math.min(1, number / 100));
	return 0;
}

function snapshotPane(pane, image, width, height) {
	if (!pane) return null;

	if (pane.tagName == 'VIDEO') {
		return makeSnapshot(pane, pane.videoWidth, pane.videoHeight, width, height, 0.5);
	}

	var source = image;
	var sourceWidth = source && (source.naturalWidth || source.width);
	var sourceHeight = source && (source.naturalHeight || source.height);

	if (!source) {
		var url = pane.getAttribute('data-src') || backgroundImageUrl(pane);
		if (url) {
			source = new Image();
			source.src = url;
			sourceWidth = source.naturalWidth || source.width;
			sourceHeight = source.naturalHeight || source.height;
		}
	}

	return makeSnapshot(source, sourceWidth, sourceHeight, width, height, backgroundPan(pane));
}

function loadImage(src, callback) {
	if (!src) {
		callback(null);
		return;
	}
	var image = new Image();
	var called = false;
	var done = function (result) {
		if (called) return;
		called = true;
		callback(result);
	};
	image.onload = function () { done(image); };
	image.onerror = function () { done(null); };
	image.src = src;
}

module.exports = {
	create: function (canvas) {
		try {
			return new TransitionRenderer(canvas);
		} catch (e) {
			if (window.console && console.warn) console.warn('Distortion transition unavailable:', e.message);
			return null;
		}
	},
	loadImage: loadImage,
	snapshotPane: snapshotPane,
	snapshotBackground: snapshotBackground,
	backgroundImageUrl: backgroundImageUrl,
	makeSnapshot: makeSnapshot,
	coverRect: coverRect
};
