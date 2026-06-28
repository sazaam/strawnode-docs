
;
(function() {
	// trace('EVENT MODULE LOADED');
	var options = module.params || {} ;
    
	
	
	

	
	var EventEnhancer = Type.define({
		domain:Type.appdomain,
		pkg:'events',
		constructor:EventEnhancer = function EventEnhancer(options)
		{
			EventEnhancer.initEvents(options || {}) ;
			return this ;
		},
		statics:{
			initEvents:function(options){
				
				var ww = $(window) ;
				var body = $('body') ;
				var isMob = this.isMobileDevice = window.isMobileDevice = /(Ip(hone|od|ad))|Android|BlackBerry/gi.test(navigator.userAgent) ;
				
				trace('EVENT OPTIONS :\n\t', options)
				
				//////// RESIZE
				if(!!options.resize){
					(function(){
						var resizestarted = false ;
						var resizemoved = false ;
						var restartuid ;
						var resizeclosure ;
						
						ww.on('resize', resizeclosure = function(e){
							var dur = resizemoved == true ? 600 : 100 ;
							if(restartuid !== undefined) clearTimeout(restartuid) ;
							if(resizestarted == false){
									ww.trigger('resizestart') ;
									resizestarted = true ;
							}else{
									resizemoved = true ;
									ww.trigger('resizemove') ;
							}
							restartuid = setTimeout(function(){
									restartuid = undefined ;
									resizestarted = false ;
									resizemoved = false ;
									ww.trigger('resizeend') ;
							}, dur) ;
						})
					})() ;
				}
						
				
				
				if(!!options.arrows){
				
					(function(){
						
						var Arrows = Type.define({
							pkg: 'org.libspark.straw::Arrows',
							domain: Type.appdomain,
							statics: {
									keycodes: {
											'32': 'space',
											'33': 'pageup',
											'34': 'pagedown',
											'35': 'end',
											'36': 'home',
											'37': 'left',
											'38': 'up',
											'39': 'right',
											'40': 'down',
											'45': 'insert',
											'46': 'delete',
											'8': 'backspace',
											'13': 'enter',
											'27': 'escape',
									}
							},
							constructor: Arrows = function Arrows() {
									//
							},
							enable: function(closures) {
									this.closures = closures;
			
									return this;
							},
							register: function() {
			
									var fff = this;
			
									$(document).bind('keydown', function(e) {
			
											var keycodes = Arrows.keycodes,
													closures = fff.closures,
													keycode = e.keyCode,
													cl;
			
											if (keycode in keycodes) {
													if (!!(cl = closures[keycodes[keycode]])) {
															cl.apply(ArrowsNavigator.instance, [e]);
													}
											}
			
									});
			
									return this;
							}
						})
				
						var ArrowsNavigator = Type.define({
							pkg: 'org.libspark.straw::ArrowsNavigator',
							domain: Type.appdomain,
							constructor: ArrowsNavigator = function ArrowsNavigator() {
									ArrowsNavigator.instance = this.enable();
							},
							getCurrentStep: function() {
									return AddressHierarchy.instance.currentStep;
							},
							getEligible: function() {
			
									var el = this.eligible || AddressHierarchy.instance.currentStep;
			
									if (el.id == "") el = el.parentStep;
			
									return (this.eligible = el);
							},
							selectNext: function(d) {
									var s = this.getEligible();
									if (!s.parentStep) return s;
									return s.parentStep.hasNext() ? s.parentStep.getNext() : s.parentStep.getChild(0);
							},
							selectPrev: function(d) {
									var s = this.getEligible();
									if (!s.parentStep) return s;
									return s.parentStep.hasPrev() ? s.parentStep.getPrev() : s.parentStep.getChild(s.parentStep.children.length - 1);
							},
							selectUp: function(d) {
									var s = this.getEligible();
									return s.parentStep == Unique.instance ? s : s.parentStep || s;
							},
							selectDown: function(d) {
									var s = this.getEligible();
									return s.defaultStep || s.children[0] || s;
							},
							elect: function() {
									var s = this.getEligible();
			
									if (s != this.getCurrentStep()) {
											AddressHierarchy.instance.changer.setStepValue(s);
									}
							},
							go: function(step, cur) {
									if (step != cur)
											AddressHierarchy.instance.changer.setStepValue(step);
							},
							enable: function() {
			
									var a = this;
			
									var closures = {
											'left': function(e) {
													var st = a.getCurrentStep();
													var s = st.handleUp();
													this.go(s, st);
											},
											'up': function(e) {
													var st = a.getCurrentStep();
													var s = st.handlePrev();
													this.go(s, st);
											},
											'right': function(e) {
													var st = a.getCurrentStep();
													var s = st.handleDown();
													this.go(s, st);
											},
											'down': function(e) {
													var st = a.getCurrentStep();
													var s = st.handleNext();
													this.go(s, st);
											}
									}
			
									new Arrows().enable(closures).register();
			
									return this;
							}
						})
				
						ArrowsNavigator.instance = new ArrowsNavigator() ;
				
						
					})() ;
				}
				
				if(!!options.scroll){
					(function(){
						var scrollstarted = false ;
						var scrollmoved = false ;
						var restartuid ;
						var scrollclosure ;
						
						body.on('scroll', scrollclosure = function(e){
							var dur = 200 ;
							if(restartuid !== undefined) clearTimeout(restartuid) ;
							if(scrollstarted == false){
									ww.trigger('scrollStart') ;
									scrollstarted = true ;
							}else{
									scrollmoved = true ;
									ww.trigger('scrollmove') ;
							}
							restartuid = setTimeout(function(){
									restartuid = undefined ;
									scrollstarted = false ;
									scrollmoved = false ;
									ww.trigger('scrollEnd', [body.scrollTop()]) ;
							}, dur) ;
						})
						
					})()
					
				}
				
			},
			initialize:function(){
				this.instance = new (this)(options) ;
			}
		}
	}) ;
	

	



    var halted = false;

    var pauseBetween = function() {
        var AT = BetweenJS.$.AnimationTicker ;
        if (!!AT.started) {
            if (!!AT.HALT) {
                halted = false;
                AT.restoreSystem();
            } else {
                AT.haltSystem();
                halted = true;
            }
        }
    }

    // SPACEBAR

    $(document).on('keydown', function(e) {
		var keycode = e.which ;
		var ctrl = e.ctrlKey ;
		var shift = e.shiftKey ;
        
        if (shift && keycode == 32) {
            pauseBetween() ;
        }
    })



    $(window).on('blur', function(e) {
        var AT = BetweenJS.$.AnimationTicker;
        if (!!AT.started && !halted) AT.haltSystem();
    })

    $(window).on('focus', function(e) {
        var AT = BetweenJS.$.AnimationTicker;
        if (!!AT.started && !halted) AT.restoreSystem();
    }) 	
	
    
	

})();