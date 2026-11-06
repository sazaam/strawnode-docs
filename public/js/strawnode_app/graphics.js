
var container = '.zoneall' ;
var coltw ;
var RGB = BJS.$.ColorMode.RGB ;
var HSV = BJS.$.ColorMode.HSV ;

var sectionbehavior = require('./sectionbehavior') ;
var events = require('./events') ;
var distortion = require('./distortion') ;

var deep_scope = function(res){
	var scope = res.parentStep && res.parentStep.template_project ;
	if(!scope || !scope.length) scope = $('.project_zone') ;
	return scope ;
} ;

var slide_direction = function(res, state, ind){
	var slides = res.parentStep && res.parentStep.userData && res.parentStep.userData.slides ;
	var slide = slides && slides[ind] ;
	var direction = slide && slide.direction ;

	if(direction === 'rtl' || direction === -1) return -1 ;
	if(direction === 'ltr' || direction === 1) return 1 ;

	var prev = state && state.index ;
	if(prev === null || prev === undefined || !slides || !slides.length) return 1 ;
	if(ind === prev) return state.direction || 1 ;
	if(ind === (prev + 1) % slides.length) return 1 ;
	if(ind === (prev - 1 + slides.length) % slides.length) return -1 ;
	return ind > prev ? 1 : -1 ;
} ;

var get_distortion_state = function(scope){
	if(!scope || !scope.length) return null ;

	var state = scope.data('distortionState') ;
	if(state === false) return null ;
	if(state) return state ;

	var canvas = $('<canvas class="distortionpane" aria-hidden="true"></canvas>') ;
	var grid = scope.find('.gridtransp') ;
	if(grid.length) canvas.insertBefore(grid) ;
	else canvas.appendTo(scope.find('.innerpane')) ;

	var renderer = distortion.create(canvas.get(0)) ;
	if(!renderer){
		canvas.remove() ;
		scope.data('distortionState', false) ;
		return null ;
	}

	state = {
		scope : scope,
		canvas : canvas,
		renderer : renderer,
		snapshot : null,
		media : null,
		index : null,
		direction : 1,
		pendingMedia : null,
		tween : null,
		pending : null,
		visible : false
	} ;

	state.resize = function(){
		var target = state.scope.find('.imgpanecont') ;
		if(!target.length) return ;
		var dpr = Math.min(window.devicePixelRatio || 1, 2) ;
		state.renderer.resize(target.width(), target.height(), dpr) ;
	} ;

	if(window.ResizeObserver){
		var inner = scope.find('.innerpane').get(0) ;
		if(inner){
			state.observer = new ResizeObserver(function(){
				if(!state.visible) return ;
				state.resize() ;
				state.renderer.render() ;
			}) ;
			state.observer.observe(inner) ;
		}
	}

	scope.data('distortionState', state) ;
	return state ;
} ;

var release_media = function(media){
	if(!media) return ;

	var pane = media.pane ;
	if(pane && pane.length){
		var node = pane.get(0) ;
		if(node && node.tagName == 'VIDEO'){
			try{ node.pause() ; }catch(e){}
			$(node).off('.distortion') ;
			try{
				node.removeAttribute('src') ;
				node.load() ;
			}catch(e){}
		}
		pane.remove() ;
	}

	media.pane = null ;
	media.image = null ;
	media.video = null ;
} ;

var cancel_state = function(state, keep){
	if(!state) return ;
	var pending = state.pending ;
	state.pending = null ;

	if(state.tween){
		try{ state.tween.stop() ; }catch(e){}
		state.tween = null ;
	}
	if(state.pendingMedia){
		if(state.pendingMedia.cancel) state.pendingMedia.cancel() ;
		release_media(state.pendingMedia) ;
		state.pendingMedia = null ;
	}
	if(pending && pending !== keep) pending.ready() ;
} ;

var destroy_state = function(scope){
	if(!scope || !scope.length) return ;
	var state = scope.data('distortionState') ;
	if(!state) return ;

	cancel_state(state) ;
	if(state.media) release_media(state.media) ;
	if(state.observer) state.observer.disconnect() ;
	state.renderer.destroy() ;
	state.canvas.remove() ;
	state.snapshot = null ;
	state.media = null ;
	scope.removeData('distortionState') ;
} ;

var open_media = function(res, ind, scope){
	var imglink = scope.find('.imageslinks .imglink').eq(ind) ;
	var imgpanecont = scope.find('.imgpanecont') ;
	if(!imglink.length || !imgpanecont.length) return null ;

	var type = imglink.attr('data-type') ||
		(imglink.get(0).tagName == 'VIDEO' ? 'video' : 'image') ;
	var src = imglink.attr('data-src') ||
		(type == 'video' ? imglink.attr('src') : distortion.backgroundImageUrl(imglink.get(0))) ;
	var pane ;

	if(type == 'video'){
		pane = $('<video class="paneimg abs fullW fullH cover" muted loop playsinline preload="auto" style="object-fit:cover;background:#000"></video>')
			.attr('src', src) ;
		pane.appendTo(imgpanecont) ;
		try{
			var video = pane.get(0) ;
			video.muted = true ;
			var playing = video.play() ;
			if(playing && playing.catch) playing.catch(function(){}) ;
		}catch(e){}
	}else{
		pane = imglink.clone() ;
		pane.addClass('paneimg') ;
		if(src) pane.css('background-image', 'url(' + src + ')') ;
		pane.children('.lazy').remove() ;
		pane.appendTo(imgpanecont) ;
	}

	if(src) pane.attr('data-src', src) ;
	pane.attr('data-type', type) ;

	var media = {
		type : type,
		src : src,
		pane : pane,
		image : null,
		video : null,
		done : false,
		ok : false,
		callbacks : [],
		timer : null
	} ;

	var finish = function(ok){
		if(media.done) return ;
		media.done = true ;
		media.ok = ok ;
		if(media.timer){
			clearTimeout(media.timer) ;
			media.timer = null ;
		}
		var callbacks = media.callbacks ;
		media.callbacks = [] ;
		for(var i = 0 ; i < callbacks.length ; i++) callbacks[i](ok) ;
	} ;

	media.onReady = function(callback){
		if(media.done) callback(media.ok) ;
		else media.callbacks.push(callback) ;
	} ;

	media.cancel = function(){
		media.done = true ;
		media.callbacks = [] ;
		if(media.timer){
			clearTimeout(media.timer) ;
			media.timer = null ;
		}
	} ;

	media.timer = setTimeout(function(){ finish(false) ; }, 900) ;

	if(type == 'video'){
		media.video = pane.get(0) ;
		var checkVideo = function(){
			if(media.video.readyState >= 2 && media.video.videoWidth) finish(true) ;
		} ;
		$(media.video).on('loadeddata.distortion canplay.distortion', checkVideo) ;
		checkVideo() ;
	}else if(src){
		distortion.loadImage(src, function(image){
			if(media.done) return ;
			if(!image){
				finish(false) ;
				return ;
			}
			media.image = image ;
			pane.attr('loaded', 1) ;
			pane.css('background-image', 'url(' + src + ')') ;
			pane.children('.lazy').remove() ;
			finish(true) ;
		}) ;
	}else{
		finish(false) ;
	}

	return media ;
} ;

var start_open = function(res, state, media){
	state.pendingMedia = media ;
	state.resize() ;

	var width = state.canvas.get(0).width ;
	var height = state.canvas.get(0).height ;
	var snapshot = state.snapshot ;

	if(!snapshot){
		snapshot = distortion.snapshotBackground(
			state.scope.find('.innerback').get(0), width, height
		) ;
	}

	state.renderer.setSource('A', snapshot, 'image', snapshot.width, snapshot.height) ;

	if(media.type == 'video'){
		state.renderer.setSource('B', media.video, 'video') ;
	}else{
		state.renderer.setSource('B', media.image, 'image',
			media.image.naturalWidth, media.image.naturalHeight) ;
	}

	state.progress = 0 ;
	state.renderer.setProgress(0) ;
	state.scope.find('.imgpanecont').css('opacity', 0) ;
	state.canvas.css('display', 'block') ;
	state.visible = true ;
	state.renderer.render() ;
} ;

var reveal_open = function(state, media, ind){
	if(media){
		state.media = media ;
		state.pendingMedia = null ;
	}
	state.index = ind ;
	state.scope.find('.imgpanecont').css('opacity', 100) ;
	state.canvas.css('display', 'none') ;
	state.visible = false ;
} ;

var fallback_open = function(res, state, scope, ind){
	if(state){
		state.pendingMedia = null ;
		state.canvas.css('display', 'none') ;
		state.visible = false ;
		state.index = ind ;
	}

	sectionbehavior.video_controls(true, res) ;

	BJS.serialTweens([
		BJS.create({
			target : scope.find('.imgpanecont'),
			to : {'opacity' : 100},
			time : .25,
			ease : Linear.easeOut
		})
	]).play().onComplete = function(){
		sectionbehavior.verify_toggle(true, res) ;
		res.ready() ;
	} ;
} ;

var close_transition = function(res, state, ind, scope, pendingOpen){
	var pane = scope.find('.paneimg') ;
	var image = state.media && state.media.type == 'image' ? state.media.image : null ;

	if(!pendingOpen && pane.length){
		try{
			state.resize() ;
			var snapshot = distortion.snapshotPane(
				pane.get(0), image, state.canvas.get(0).width, state.canvas.get(0).height
			) ;
			if(snapshot){
				state.snapshot = snapshot ;
				state.renderer.setSource('A', snapshot, 'image', snapshot.width, snapshot.height) ;
				state.renderer.setSource('B', snapshot, 'image', snapshot.width, snapshot.height) ;
				state.progress = 0 ;
				state.renderer.setProgress(0) ;
				state.canvas.css('display', 'block') ;
				state.visible = true ;
				state.renderer.render() ;
			}
		}catch(e){
			state.snapshot = null ;
			state.canvas.css('display', 'none') ;
			state.visible = false ;
		}
	}

	scope.find('.imgpanecont').css('opacity', 0) ;
	sectionbehavior.video_controls(false, res) ;

	if(pane.length){
		if(pane.get(0).tagName == 'VIDEO'){
			try{
				var video = pane.get(0) ;
				video.pause() ;
				video.currentTime = 0 ;
				$(video).off('.distortion') ;
				video.removeAttribute('src') ;
				video.load() ;
			}catch(e){}
		}else if(pane.attr('loaded')){
			try{ res.parentStep.userData.slides[ind].loaded = 1 ; }catch(e){}
			var num = pane.attr('childindex') ;
			var imglink = scope.find('.imageslinks .imglink[childindex=' + num + ']') ;
			imglink.css('background-image', pane.css('background-image')) ;
			imglink.children().remove() ;
		}
		pane.remove() ;
	}

	state.media = null ;
	sectionbehavior.verify_toggle(false, res) ;
	res.ready() ;
} ;

var legacy_deep_open = function(res, scope){
	var imgpanecont = scope.find('.imgpanecont') ;
	var imglinks = scope.find('.imageslinks .imglink') ;
	var ind = res.id == '' ? 0 : parseInt(res.id) ;
	var imglink = $(imglinks.get(ind)) ;
	var paneimg ;

	if(imglink.get(0).tagName == 'VIDEO'){
		paneimg = $('<video class="paneimg abs fullW fullH cover" muted loop playsinline preload="auto" style="object-fit:cover;background:#000"></video>')
			.attr('src', imglink.attr('src')) ;
		paneimg.appendTo(imgpanecont) ;
		paneimg.get(0).play() ;
	}else{
		paneimg = imglink.clone() ;
		paneimg.addClass('paneimg') ;
		paneimg.appendTo(imgpanecont) ;
	}

	sectionbehavior.video_controls(true, res) ;

	BJS.serialTweens([
		BJS.create({
			target : imgpanecont,
			to : {'opacity' : 100},
			time : .25,
			ease : Linear.easeOut
		})
	]).play().onComplete = function(){
		sectionbehavior.verify_toggle(true, res) ;
		res.ready() ;
	} ;
} ;

var legacy_deep_close = function(res, scope){
	var imgpanecont = scope.find('.imgpanecont') ;
	var ind = res.id == '' ? 0 : parseInt(res.id) ;
	var paneimg = scope.find('.paneimg') ;

	if(!!paneimg.length){
		if(paneimg.get(0).tagName == 'VIDEO'){
			try{
				var video = paneimg.get(0) ;
				video.pause() ;
				video.currentTime = 0 ;
			}catch(e){}
		}else if(paneimg.attr('loaded')){
			res.parentStep.userData.slides[ind].loaded = 1 ;
			var num = paneimg.attr('childindex') ;
			var imglink = scope.find('.imageslinks .imglink[childindex=' + num + ']') ;
			imglink.css('background-image', paneimg.css('background-image')) ;
			imglink.children().remove() ;
		}
	}

	BJS.serialTweens([
		BJS.create({
			target : imgpanecont,
			to : {'opacity' : 0},
			time : .25,
			ease : Linear.easeOut
		})
	]).play().onComplete = function(){
		sectionbehavior.video_controls(false, res) ;
		sectionbehavior.verify_toggle(false, res) ;
		paneimg.remove() ;
		res.ready() ;
	} ;
} ;


module.exports = {

	
	deep_project_focus : function(e){

		var res = e.target ;
		
		if(e.type == 'focusIn'){

			sectionbehavior.verify_focus(true, res) ;
			sectionbehavior.verify_i18(true, res) ;
			
		}else{

			sectionbehavior.verify_focus(false, res) ;
			res.focusReady() ;

		}

	},


	deep_project_toggle : function(e){

		var res = e.target ;
		var ind = res.id == '' ? 0 : parseInt(res.id) ;
		var scope = deep_scope(res) ;
		var state ;

		if(res.opening){

			state = get_distortion_state(scope) ;
			if(!state){
				legacy_deep_open(res, scope) ;
				return ;
			}

			cancel_state(state, res) ;

			var media = open_media(res, ind, scope) ;
			if(!media){
				state.canvas.css('display', 'none') ;
				state.visible = false ;
				legacy_deep_open(res, scope) ;
				return ;
			}

			state.pending = res ;
			state.pendingMedia = media ;

			media.onReady(function(ok){
				if(state.pending !== res) return ;

				if(!ok){
					state.pending = null ;
					state.media = media ;
					fallback_open(res, state, scope, ind) ;
					return ;
				}

				state.direction = slide_direction(res, state, ind) ;
				state.renderer.setDirection(state.direction) ;

				try{
					start_open(res, state, media) ;
				}catch(e){
					state.pending = null ;
					state.media = media ;
					fallback_open(res, state, scope, ind) ;
					return ;
				}

				var tw = BJS.create({
					target : state,
					to : {progress : 1},
					from : {progress : 0},
					time : .65,
					ease : Quint.easeInOut,
					onUpdate : function(){
						state.renderer.setProgress(state.progress) ;
						state.renderer.render() ;
					}
				}) ;

				state.tween = tw ;
				tw.onComplete = function(){
					if(state.pending !== res) return ;
					state.pending = null ;
					state.tween = null ;

					reveal_open(state, media, ind) ;
					sectionbehavior.video_controls(true, res) ;
					sectionbehavior.verify_toggle(true, res) ;
					res.ready() ;
				} ;
				tw.play() ;
			}) ;

		}else{

			state = scope.length ? scope.data('distortionState') : null ;
			if(!state){
				legacy_deep_close(res, scope) ;
				return ;
			}

			var pendingOpen = !!state.pendingMedia ;
			cancel_state(state, res) ;
			close_transition(res, state, ind, scope, pendingOpen) ;
		}

	},

	empty_toggle : function(e){

		var res = e.target ;

		if(res.opening){

		}else{

		}
		res.ready() ;
	},
	empty_focus : function(e){

		var res = e.target ;
		
		if(e.type == 'focusIn'){

			// sectionbehavior.verify_focus(true, res) ;
			
		}else{

			// sectionbehavior.verify_focus(false, res) ;

			res.focusReady() ;
		}

	},



	project_focus : function(e){

		var res = e.target ;
		
		if(e.type == 'focusIn'){

			sectionbehavior.verify_focus(true, res) ;
			
		}else{

			sectionbehavior.verify_focus(false, res) ;

			res.focusReady() ;
		}

	},
	project_toggle : function(e){

		var res = e.target ;
		var template_project ;

		var dims = res.userData.dims = {
			start:{ 'width::%':80, 'height::%':80, 'margin-left::%':10, 'margin-top::%':5, 'alpha':0},
			end:{'width::%':100, 'height::%':100, 'margin-left::%':0, 'margin-top::%':0, 'alpha':100}
		} ;
		
		var twws ;

		if(res.opening){

			sectionbehavior.set_project_open(true) ;
			
			res.render('/jade/structure/content_project.jade', res.userData.parameters, function(){
				template_project = res.template_project = 
					res.template
						.addClass('zindex'+(10 - res.depth)).css({opacity:0})
						.appendTo('.contentzone') ;
				twws = [
					BJS.tween(template_project, dims.end, dims.start, .25, Quint.easeOut)
				] ;
				BJS.serialTweens(
					twws
				).play().onComplete = function(){
					sectionbehavior.verify_toggle(true, res) ;
					res.ready() ;
				} ;
			})
			
		}else{
			
			twws = [
				BJS.tween(
					(template_project = res.template_project),
					res.userData.dims.start, res.userData.dims.end, .25, Quint.easeIn
				)
			] ;
			
			BJS.serialTweens(
				twws
			).play().onComplete = function(){
				sectionbehavior.verify_toggle(false, res) ;
				destroy_state(template_project) ;
				template_project.remove() ;
				sectionbehavior.set_project_open(false) ;
				res.ready() ;
			} ;
		}

	},


	focus : function(e){
		var res = e.target ;
		var color = HSV.format(res.userData.color) ;
		var backcolor = RGB.fromHex('#121212') ;

		if(!! coltw && coltw.isPlaying) coltw.stop() ;
		
		if(e.type == 'focusIn'){
			coltw = BetweenJS.to($('.coloraddict'), {'background-color':color}, 1.25, Linear.easeOut) ;
			sectionbehavior.verify_focus(true, res) ;
			coltw.play() ;
		}else{
			// coltw = BetweenJS.to($('.coloraddict'), {'background-color':backcolor}, .15, Linear.easeOut) ;
			sectionbehavior.verify_focus(false, res) ;

			// coltw.onComplete = function(){
			// 	res.focusReady() ;
			// }
			res.focusReady() ;
		}
		
	},
	toggle : function(e){
		var res = e.target ;

		/// Home rgb(71, 23, 77)
		/// Projects rgb(39, 23, 77)
		/// Studies rgb(23, 67, 77)
		/// other rgb(23, 46, 77);
		/// olive rgb(23, 72, 77);
		/// greenish rgb (23, 77, 63);
		/// very reddish rgb(77, 23, 57);
		/// orangish rgb(77, 31, 23);
		/// violetish rgb(62, 23, 77);
		/// violetwarmish rgb(77, 23, 66);

		var rand = Math.random() * 360 ;

		if(rand > 20 && rand < 140) {
			rand += 120 ;
		}

		var color = res.userData.color = res.userData.color || ((res.name == '@') ? {h: 259, s: 70, v: 30} : {h:rand, s:70, v:30}) ;

		var templateA, templateB ;

		var dims = res.userData.dims = res.userData.dims || {
			start:{ 'margin-top':150, 'alpha':0},
			end:{'margin-top':0, 'alpha':100}
		} ;
		
		var tws ;

		var isHome = res.name == '@' ;
		var realid = res.id == '' ? res.parentStep.id : res.id ;
		if(res.opening){
			
			res.render(res.userData.urljade, res.userData.parameters, function(){
				templateA = res.templateA = res.template ;
				res.render('/jade/structure/content_generic.jade', res.userData.parameters, function(){
					
					templateB = res.templateB = res.template ;
					templateA.addClass('section_' + (isHome ? 'home' : realid))
					templateB.addClass('section_' + (isHome ? 'home' : realid))

					tws = [
						BJS.tween(
							templateA
									.addClass('zindex'+(10 - res.depth)).css({opacity:0})
									.appendTo(container),
							dims.end, dims.start, .08, Quint.easeOut
						),
						BJS.delay(
							BJS.tween(
								templateB
										.addClass('zindex'+(10 - res.depth)).css({opacity:0})
										.appendTo(container),
								dims.end, dims.start, .08, Quint.easeOut
							)
						, .15)
					] ;
					
					BJS.serialTweens(
						tws
					).play().onComplete = function(){
						sectionbehavior.verify_toggle(true, res) ;
						
						res.ready() ;
					} ;
				})
			}) ;
			
			
		}else{

			tws = [
				BJS.tween(
					(templateB = res.templateB),
					dims.start, dims.end, .08, Quint.easeIn
				),
				BJS.tween(
					(templateA = res.templateA),
					dims.start, dims.end, .08, Quint.easeIn
				)
			] ;
			
			BJS.serialTweens(
				tws
			).play().onComplete = function(){
				sectionbehavior.verify_toggle(false, res) ;
				templateA.remove() ;
				templateB.remove() ;
				res.ready() ;
			} ;
		}
	}
}