
var container = '.zoneall' ;
var coltw ;
var RGB = BJS.$.ColorMode.RGB ;
var HSV = BJS.$.ColorMode.HSV ;

var sectionbehavior = require('./sectionbehavior') ;
var events = require('./events', {touch:{mobile:1, pc:1}}) ;


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

		var twws ;
		var imglinks = $('.imglink') ;
		var paneimg;
		var imglink ;
		var ind = res.id == '' ? 0 : parseInt(res.id) ;
		var back = $('.innerback') ;
		var imgpanecont = $('.imgpanecont') ;
		if(res.opening){
			
			imglink = $(imglinks.get(ind)) ;
            var paneimg = imglink.clone() ;
			
			paneimg.addClass('paneimg') ;
			
			paneimg.appendTo(imgpanecont) ;

			twws = [
				BJS.create({
					target:imgpanecont,
					to:{'opacity':100},
					time:.25,
					ease:Linear.easeOut
				})
			] ;

			BJS.serialTweens(
				twws
			).play().onComplete = function(){
				
				sectionbehavior.verify_toggle(true, res) ;
				res.ready() ;

			} ;

		}else{
			paneimg = $('.paneimg') ;
			
			if(paneimg.attr('loaded')){ // ensures next time if loaded we dont go thru the loading process
				
				res.parentStep.userData.slides[ind].loaded = 1 ;
				var num = paneimg.attr('childindex') ;
				imglink = $('.imglink[childindex='+num+']')
				imglink.css('background-image', paneimg.css('background-image')) ;
				imglink.children().remove() ;

			}

			twws = [
				BJS.create({
					target:imgpanecont,
					to:{'opacity':0},
					time:.25,
					ease:Linear.easeOut
				})
			] ;

			BJS.serialTweens(
				twws
			).play().onComplete = function(){
				sectionbehavior.verify_toggle(false, res) ;
				paneimg.remove() ;
				
				res.ready() ;
			} ;
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
			
			res.render('/jade/artists/content_project.jade', res.fetch(res.userData.urljson, res.userData.parameters), function(){
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
				template_project.remove() ;
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

		var color = res.userData.color = res.userData.color || {h:rand, s:70, v:30} ;
		
		var templateA, templateB ;

		var dims = res.userData.dims = res.userData.dims || {
			start:{ 'margin-top':150, 'alpha':0},
			end:{'margin-top':0, 'alpha':100}
		} ;
		
		var tws ;

		var isHome = res.name == '@' ;
		var realid = res.id == '' ? res.parentStep.id : res.id ;
		if(res.opening){
			
			res.render(res.userData.urljade, res.fetch(res.userData.urljson, res.userData.parameters), function(){
				templateA = res.templateA = res.template ;
				res.render('/jade/artists/contenttest.jade', res.fetch(res.userData.urljson, res.userData.parameters), function(){
					
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