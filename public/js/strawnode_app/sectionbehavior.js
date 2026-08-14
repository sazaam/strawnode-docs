

// deck-ness is data : stamped by section({deck:true}) on the route handler's userData
var isDeck = function(res){
    return !!(res && res.userData && res.userData.deck) ;
} ;
var about_type_sliding_sections = ['about'] ;

var GestureManager = require('./strawnode_modules/gesture') ;
var KeyboardManager = require('./strawnode_modules/keyboard') ;
var Reactive = require('./strawnode_modules/reactive') ;
var ReactiveI18n = require('./strawnode_modules/reactive-i18n') ;
var i18next = require('./strawnode_modules/strawnode_modules/i18next.js') ;
var LazyLoad = require('./strawnode_modules/strawnode_modules/lazyload.js') ;
var ShaderToyLite = require('./strawnode_modules/strawnode_modules/shadertoylite.js') ;

module.exports = {
    /////////////////////////////////// CHECK & ADD|REMOVE CLASS ALONG CONDITION
    treatClass : function treatClass(el, cl, cond){
        if(cond) el.removeClass(cl) ;
        else el.addClass(cl) ;
        return el ;
    },

    ///////////////////////////////////////////////////// CHECKS & VERIFIES AT STEP LEVEL FOR FOCUS AND TOGGLE EVENTS




    verify_focus:function verify_focus(cond, res){
        var id = res.id == '' ? res.parentStep.id : res.id ;
        // LANG Switches
        this.enableLang(cond, res) ;
        
        this.intro_gesture(cond, res) ;
        // Slides
        this.intro_slides(cond, res) ;
        
        // shaders
        this.back_shaders(cond, res) ;

        this.project_hide(cond, res) ;

        // Home Catchphrases
        this.home_catchphrases(cond, res) ;

        this.vision(cond, res) ;
    },

    vision:function(cond, res){
        if(res.name != 'vision') return ;
        
        if(cond){
            
            var makeRand = function(w, h){ return { w: Math.random() * w , h: Math.random() * h} } ;
            
            var zone = $('.spark') ;
            var scroller = $('.vision').get(0) ;
            var obs = null ;
            var activeTw = null ;

            // per-zone orbit tween, not started yet.
            // resume = true re-enters the frozen state seamlessly (same radius, resumes at the frozen angle)
            var buildOrbit = function(z, resume){
                var tws = [] ;
                z.find('.box').each(function(ii, ell){
                    var box = $(ell) ;
                    // orbit center = the random placement applied at focus
                    var c = box.data('sparkc') ;
                    // keep the per-box radius across entries so re-activation is seamless
                    var rad = parseFloat(box.data('sparkr')) ;
                    if(isNaN(rad)){
                        rad = 4 + Math.random() * 20 ;
                        box.data('sparkr', rad) ;
                    }
                    // per-box scale cycle : own phase, kept across entries.
                    // phase-only (no frequency multiplier) keeps scale periodic over one
                    // orbit, so the scale returns to its own start when the tween restarts
                    var sp = parseFloat(box.data('sparkp')) ;
                    if(isNaN(sp)){
                        sp = Math.random() * Math.PI * 2 ;
                        box.data('sparkp', sp) ;
                    }
                    var dur = 1.8 + Math.random() * 2.4 ;
                    var dir = Math.random() > .5 ? 1 : -1 ;
                    var start = resume
                        ? Math.atan2(parseFloat(box.css('top')) - c.y, parseFloat(box.css('left')) - c.x)
                        : Math.random() * Math.PI * 2 ;
                    var el = box.find('.el').get(0) ;
                    var phaser = { ang : start } ;
                    var twbox = BJS.create({
                        target:phaser,
                        to:{ ang : start + dir * Math.PI * 2 },
                        // time:dur,
                        ease:Physical.uniform(.02),
                        onUpdate:function(){
                            var a = phaser.ang ;
                            box.css({
                                'left' : (c.x + rad * Math.cos(a)) + 'px',
                                'top'  : (c.y + rad * Math.sin(a)) + 'px'
                            }) ;
                            // depth illusion : each box scales 80-120% over its own cycle
                            if(!!el){
                                var s = .8 + .4 * (.5 + .5 * Math.sin(a + sp)) ;
                                el.style.transform = 'scale(' + s.toFixed(3) + ')' ;
                            }
                        }
                    }) ;
                    tws.push(twbox) ;
                })
                return BJS.parallelTweens(tws) ;
            }

            var setActive = function(z){
                if(!!activeTw) activeTw.stop() ;
                activeTw = null ;
                if(!!!z || !z.length) return ;
                var resume = !!z.data('sparkplayed') ;
                z.data('sparkplayed', true) ;
                var tw = buildOrbit(z, resume) ;
                activeTw = tw ;
                tw.play().stopOnComplete = 0 ;
            }

            // place every spark's boxes once, keeping the centers for the orbits
            zone.each(function(i, el){
                var z = $(el) ;
                var w = z.width(), h = z.parent().height() ;
                var mw = w >> 1, mh = h >> 1 ;

                z.find('.box').each(function(ii, ell){
                    var rand = makeRand(w, h) ;
                    var box = $(ell) ;
                    box.css({'left':rand.w + 'px', 'top':rand.h + 'px'}) ;
                    box.data('sparkc', { x: rand.w, y: rand.h }) ;
                })
            })

            // scrollytelling : animate the article zone entering the scope, stop the previous one
            if('IntersectionObserver' in window){
                obs = new IntersectionObserver(function(entries){
                    entries.forEach(function(en){
                        if(!!en.isIntersecting){
                            setActive($(en.target).find('.spark')) ;
                        }
                    })
                }, { root : scroller, threshold : .5 }) ;
                zone.each(function(i, el){
                    obs.observe(el.closest('article')) ;
                })
            }else{
                // no IO support : keep the first zone only
                setActive(zone.eq(0)) ;
            }

            res.userData = res.userData || {} ;
            res.userData.visionCleanup = function(){
                if(!!obs) obs.disconnect() ;
                if(!!activeTw) activeTw.stop() ;
                activeTw = null ;
            } ;

            $('.vision a.prev, .vision a.next').click(function(e){
                e.preventDefault() ;
                var tg = $(e.target) ;
                var isNext = tg.hasClass('next') ;
                var i = parseInt(tg.attr('data-index')) ;
                var animtg = $('.vision') ;
                var top = (isNext ? i + 1 : i - 1) * (animtg.height()) ;
                
                var scrolltw = BJS.create({
                    target:animtg, 
                    to:{'scrollTop':top},
                    time:.25, ease:Expo.easeOut
                }) ;

                scrolltw.play() ;

            }) ;





        }else{
            if(!!res.userData && !!res.userData.visionCleanup) res.userData.visionCleanup() ;
        }
    },
    home_catchphrases:function(cond, res){
        if(res.name!='@') return ;
        
        var tw_pix, tw_fade ;
        var brackets, zone ;
        if(cond){
            zone = $('.content').removeClass('flowYauto flowXhidden').addClass('flowvisible') ;
            brackets = $('<div>').addClass('brackets flex rel justify-center HmarXLg padXLg rel flowvisible') ;
            var qarr = [] ;

            var quotes = i18next.t('quotes', { returnObjects: true }) ;

            for(var s in quotes){
                qarr.push(quotes[s]) ;
            }
            


            var randomize = function(rr){
                return parseInt(Math.random() * rr) - (rr >> 1) ;
            }

            var ql = qarr.length ;
            var rand = res.userData.rand || parseInt(Math.random() * ql) ;
            var bracketstxt = $('<div>').addClass('rel').css('white-space','pre-line').appendTo(brackets) ;
            var bracketsbox = $('<div>').addClass('animz glass').css({'padding':'20px'}).appendTo(bracketstxt) ;
            var txt = $('<div>').addClass('quote sizeM').css({'opacity': 0}).html(qarr[rand]).appendTo(bracketsbox) ;
            
            var lr = $('<div class="abs typo animz">').css({'bottom':'-20px', 'right':'20px'}).appendTo(bracketstxt) ;
            var larr = $('<a href="javascript:void(0)">').addClass('larr HpadSm').html('&lt;').appendTo(lr) ;
            var rarr = $('<a href="javascript:void(0)">').addClass('rarr HpadSm').html('&gt;').appendTo(lr) ;

            var track = $('<div class="abs typo animz">').css({'bottom':'-20px', 'left':'20px', 'right':'120px', 'background':'white'}).appendTo(bracketstxt) ;
            var lineback = $('<hr class="abs" />').css({'width':'100%','height':'1px', 'left':'30px', 'right':'0', top:'-7px', background:'#FFFFFF22'}).appendTo(track) ;
            var linetrack = lineback.clone().css({'width':'20%', background:'#FFFFFF55'}).appendTo(track) ;

            var timesec = 14 ;
            var ii = 0 ;
            var threshold = 5 ;
            var prevDrawTime = (Date.now()) ;
            var firstDrawTime = 0;
            var dont = false ;
            var refreshtrack = function(n){
                n = dont ? 0 : n ;
                linetrack.css({'width':(n / timesec * 100) + '%'}) ;
            } ;

            var animtrack = res.userData.animtrack = res.userData.animtrack || new BJS.$.Animation(undefined, function(n){
                var now = Date.now() ;

                if (firstDrawTime == 0) {
                    firstDrawTime = now;
                }

                // I want to have a timecount that is given locally(this animation only)
                // that gives me the time since the start, and removing any pause/stop times
                // and that resets on anim.reset().

                if(ii % threshold != 0){
                    var loctime = (now - prevDrawTime) * .01 ; 
                    if(loctime > (n - parseInt(n))){
                        var elapsed = prevDrawTime - firstDrawTime;
                        firstDrawTime = now - elapsed;
                        prevDrawTime = now;
                    }
                    var gone = (prevDrawTime - firstDrawTime) * .001 ;
                    prevDrawTime = now ;
                    ii = ii % threshold ;
                    refreshtrack((prevDrawTime - firstDrawTime) * .001) ;
                    if(gone > timesec){
                        rarr.trigger('click') ;
                        dont = 1 ;
                        prevDrawTime = firstDrawTime + .005 ;
                    }
                }
                
                ii ++ ;
            }) ;

            
            animtrack.start() ;


            var nnn = function(e){
                e.preventDefault() ;
                e.stopPropagation() ;
                
                dont = 1 ;
                var now = Date.now() ;
                prevDrawTime = now + .005 ;

                if(!!res.userData.tw_fade && res.userData.tw_fade.isPlaying) res.userData.tw_fade.stop() ;
                if(!!res.userData.tw_pix && res.userData.tw_pix.isPlaying) res.userData.tw_pix.stop() ;

                if($(e.target).hasClass('larr')) rand -- ;
                else rand ++ ;

                rand = res.userData.rand = (ql + rand) % ql ;

                var n = 18 ;
                positions = positions.slice(n).concat(positions.slice(0, n)) ;
                froms = froms.slice(n).concat(froms.slice(0, n)) ;
                tweens = [] ;
                
                tw_fade = res.userData.tw_fade = BJS.create({target:animz, to:{opacity:0}, time:.25, ease:Linear.easeOut}) ;
                tw_fade.onComplete = function(){
                    
                    firstDrawTime = Date.now() ;
                    prevDrawTime = firstDrawTime + .005 ;

                    txt.html(qarr[rand]) ;

                    ww = bracketstxt.width() ;
                    hh = bracketstxt.height() ;

                    mw = ww >> 1 ;
                    mh = hh >> 1 ;
                    
                    pixels.each(function(i, el){
    
                        var p = $(el) ;
                        var tto = {
                                'top::PX':randomize(hh),
                                'left::PX':randomize(ww)
                            } ;
                        var tw1 = BJS.create({target:p, 
                            to:tto,
                            time:.125 + (.005125*i), 
                            ease:Back.easeIn}) ;
                        
                        var tw2 = BJS.create({target:p, 
                            to:place(i),
                            from:tto,
                            time:.125 + (.0005125*i), 
                            ease:Expo.easeOut}) ;
                            
                        tweens.push(BJS.serial(tw1, tw2)) ;
                    }) ;
                    
                    tw_pix = res.userData.tw_pix = BJS.serial(
                        BJS.parallelTweens(tweens),
                        BJS.create({target:animz, to:{opacity:100}, from:{opacity:0}, time:1.25, ease:Linear.easeOut} )
                    ) ;
                    
                    tw_pix.play() ;
                    tw_pix.onComplete = function(){
                        firstDrawTime = Date.now() ;
                        prevDrawTime = firstDrawTime + .005 ;
                        dont = 0 ;
                    }
                }
                

                tw_fade.play() ;

            }

            larr.on('click', nnn) ;
            rarr.on('click', nnn) ;

            var place = function(i){
                var to = {} ;
                switch(true){
                    // BR
                    case (i < 10) :
                        to['top::PX'] = mh ;
                        to['left::PX'] = mw - i ;
                    break;
                    
                    case (i >= 10 && i < 19) :
                        to['top::PX'] = mh - (i - 10) ;
                        to['left::PX'] = mw ;
                    break;
                    
                    // TL
                    case (i >= 19 && i < 28) :
                        to['top::PX'] = -mh ;
                        to['left::PX'] = -mw + (i - 19) ;
                    break;
                    case (i >= 28 && i < 37) :
                        to['top::PX'] = -mh + (i - 28) ;
                        to['left::PX'] = -mw;
                    break;

                    // TR
                    case (i >= 37 && i < 46) :
                        to['top::PX'] = -mh ;
                        to['left::PX'] = mw - (i - 36) ;
                    break;
                    case (i >= 46 && i < 55) :
                        to['top::PX'] = -mh + (i - 46) ;
                        to['left::PX'] = mw ;
                    break;
                    
                    // BL
                    case (i >= 55 && i < 64) :
                        to['top::PX'] = mh ;
                        to['left::PX'] = -mw + (i - 55) ;
                    break;
                    case (i >= 64 && i < 73) :
                        to['top::PX'] = mh - (i - 64) ;
                        to['left::PX'] = -mw ;
                    break;
                }
                return to ;
            } ;
            var bracketspix = $('<div>').addClass('abs bracketspix top50 left50').appendTo(bracketstxt) ;
            var num = 10 ;
            var total = num * 8 ;
            var l = total - 8 ;
            var positions = [], tweens = [], pixels, froms = [] ;

            brackets.appendTo(zone) ;

            var animz = $('.animz') ;
            
            var ww = bracketstxt.width() ;
            var hh = bracketstxt.height() ;

            var mw = ww >> 1 ;
            var mh = hh >> 1 ;

            for(var i = 0 ; i < l; i ++){
                
                var pix = $('<b>') ;
                pix.addClass('pix') ;
                pix.appendTo(bracketspix) ;
                var from = {}, to = {} ;
                
                to = place(i) ;
                
                
                from['top::PX'] = randomize(hh) ;
                from['left::PX'] = randomize(ww) ;
                
                positions.push(to) ;
                froms.push(from) ;
                var tw = BJS.create({target:pix, 
                    from:from, 
                    to:to, 
                    time:.5, 
                    ease:Expo.easeInOut}) ;
                tweens.push(tw) ;
            }

            BJS.serial(
                BJS.parallelTweens(tweens),
                BJS.create({target:txt, to:{opacity:100}, from:{opacity:0}, time:1.25, ease:Linear.easeOut} )
            ).play() ;

            

            pixels = $('.pix') ;
        }else{

            if(!!res.userData.animtrack) {
                res.userData.animtrack.stop() ;
                res.userData.animtrack.destroy() ;
                res.userData.animtrack = undefined ;
                delete res.userData.animtrack ;
            }

            if(!!res.userData.tw_fade && res.userData.tw_fade.isPlaying) res.userData.tw_fade.stop() ;
            if(!!res.userData.tw_pix && res.userData.tw_pix.isPlaying) res.userData.tw_pix.stop() ;


            brackets = $('.brackets') ;
            brackets.remove() ;
            zone = $('.content').addClass('flowYauto flowXhidden').removeClass('flowvisible') ;
        }

    },
    verify_toggle:function verify_toggle(cond, res){
        // Projects Slides
        this.removeLoading() ;
        
        this.project_slides(cond, res) ;
        this.ensure_slides(cond, res) ;
        this.deep_slides(cond, res) ;
        this.lazy_images(cond, res) ;
    },
    removeLoading:function(){
        if(!window.stoploader){
            window.stoploader = true ;
            window.render = undefined ;
            delete window.render ;
            $('#logocont').remove() ;
        }
    },
    lazy_images:function(cond, res){
        if(cond){
            if(!!!window.lazyFunctions){
                window.lazyFunctions = {
                    load: function (elm) {
    
                        elm.style.color = "red";
                        var el = $(elm) ;
                        
                        var img = el.parent() ;
                        var url = el.attr('lazy') ;
                        var target = el ;
                        target.find('hr.backindic').css('width', '100%') ;
                        var ac = new AjaxCommand(url, function(jxhr, r){

                            img.removeClass('lazy') ;
                            img.css('opacity', 0) ;
                            img.css('background-image', 'url('+ url +')') ;
                            img.children().remove() ;
                            var appearTW = BJS.create({
                                target:img,
                                to:{'opacity':100},
                                time:.25,
                                ease:Linear.easeOut
                            }) ;
                            appearTW.play() ;
                            img.attr('loaded', 1) ;

                        }, null, null, function(percent, e){
                            
                            target.find('hr.indic').css('width', percent + '%') ;
                            
                        }) ;
                        ac.execute() ;
                    }
                } ;
            }

            if(!!!window.ll){
                
                var executeLazyFunction = function(el) {
                    var lazyFunctionName = el.getAttribute("data-lazy-function") ;
                    var lazyFunction = window.lazyFunctions[lazyFunctionName] ;
                    if (!lazyFunction) return ;
                    
                    lazyFunction(el) ;
                }
                
                var ll = new LazyLoad({
                    unobserve_entered: true, // <- Avoid executing the function multiple times
                    unobserve_completed: true,
                    callback_enter: executeLazyFunction // Assigning the function defined above
                }) ;

                res.userData.ll = ll ;
            }

        }else{
            res.userData.ll.destroy() ;
        }

    },

    project_hide:function project_hide(cond, res){
        if(!isDeck(res)) return ;

        if(cond){
            $('.navzoneinside, .content').removeClass('hidden') ;
        }else{
            if(Unique.getInstance().hierarchy.changer.leavesNode() == 1)
                $('.navzoneinside, .content').addClass('hidden') ;
        }
        
    },





    ///////////////////////////////////////////////////// CHECK WHAT NEEDS TO BE TRANSLATED
    verify_i18:function verify_i18(cond, res){
        var t = i18next.t ;
        var tt = this ;
        $('[i18]').each(function(i, el){
            var item = $(el) ;
            var tval = item.attr('i18') ;
            var trans = t(tval) ;
            
            if(trans != item.html()){
                item.html(trans) ;
            }
        })
        $('a').each(function(i, el){
            var item = $(el) ;
            var href = item.attr('href') ;
            if(!item.hasClass('langchange'))
            if(/^#\/(\w{2})/.test(href)){
                
                var n = tt.update_locale(href) ;
                item.attr('href', n) ;
            }
        })
    },
    ///////////////////////////////////////////////////// UPDATE LANG IN HREFS
    update_locale:function update_locale(href){
        var loc = document.documentElement.getAttribute('lang') ;
        return href.replace(/^#\/(\w{2})/, '#/' + loc) ;
    },

    ///////////////////////////////////////////////////// SLIDES FROM THE PROJECT-LEVEL STEP HELPERS
    /////////////////////// TRANSLATES TRANSITION
    textAppear:function(block, newtxt, unfound){
        
        var saz = block ;

        var saztw_in = saz.data('int_in') ;
        var saztw_out = saz.data('int_in') ;
        if(!!saztw_in) clearInterval(saztw_in) ;
        if(!!saztw_out) clearInterval(saztw_out) ;
        newtxt = newtxt.trim() ;
        var sss = saz.html().trim() ;
        var sss2 = newtxt ;
        var thres = 3 ;
        
        thres = Kompat.instance.isBrave ? 3 : 3 ;

        if(sss == sss2) return ;

        var tw_letters_out = setInterval(function(){
            if(sss[sss.length-1] == '>'){
                var ind = sss.lastIndexOf('<') ;
                if(ind != -1){
                    sss = sss.substring(0, ind)
                }
            }else if(sss.test('^&nbsp;')){
                sss = sss.replace(/^&nbsp;/, '') ;
            }
            sss = sss.slice(0, -1) ;
            sss = (!unfound && sss.length == 0) ? '&nbsp;' : sss ;
            saz.html(sss) ;
            
            if(sss.length == 0 || sss == '&nbsp;'){
                clearInterval(tw_letters_out) ;

                saz.html('&nbsp;') ;
                
                if(!unfound) {
                    
                    var tw_letters_in = setInterval(function(){

                        if(sss2[sss.length] == '<'){
                            var temp = sss2.replace(sss, '') ;
                            sss += temp.substr(0, temp.indexOf('>')) ;
                        }

                        saz.html(sss = sss2.slice(0, sss.length + 1)) ;

                        if(sss.length >= sss2.length) {
                            clearInterval(tw_letters_in) ;
                            // trace('YOOOO FINISH')
                            $('.webmcont img').remove() ;
                            $('.webmcont video').removeClass('none') ;
                        }
                    }, thres) ;
                    block.data('int_in', tw_letters_in) ;
                }
            }
        }, thres) ;
        block.data('int_out', tw_letters_out) ;
        
        return ;
    },
    /////////////////////// ENABLE TRANSLATES
    ensureTranslates:function(res, project_zone){
        
        var tt = this ;

        var translates = project_zone.find('[i18n]') ;
        var isJade = 0 ;
        if(translates.size()){
            translates.each(function(i, el){
                var desc = $(el) ;
                var txt = desc.html() ;
                var i18attr = desc.attr('i18n') ;
                var trans, transdef, newtrans ;

                var ttt = i18next.t(desc.attr('i18n')+ '_0' + (res.id == '' ? 0 : res.id)) ;

                var hasJade = 0 ;
                
                if(i18attr.test('[$]$')){
                    trans = desc.attr('i18n').replace('$', '') ; 
                    transdef = trans ;
                }else{
                    trans = desc.attr('i18n') + '_0' + (res.id == '' ? 0 : res.id) ; 
                    transdef = desc.attr('i18n') + '_00' ; 
                }

                var putsomecont = function(t){
                    
                    var md = desc.attr('md') ;
                    newtrans = (i18next.t(trans, i18next.t(transdef))) ;
                    var unfound = newtrans == transdef ;
                    if(!!md) newtrans = marked.marked(newtrans) ;
                    
                    isJade = isJade || hasJade ;

                    setTimeout(() => {
                        project_zone.find('.webms').remove() ;
                        tt.textAppear(desc, hasJade ? t : newtrans, unfound) ;
                    }, 2);
                }


                if(ttt.test('^jade::')){
                    jade.render(ttt.replace('jade::', ''), {filename:'/jade/index.jade'}, function(err, template){
                        var cont = $(marked.marked(template)).html() ;
                        putsomecont(cont) ;
                    }) ;
                    hasJade = 1 ;
                }else{
                    putsomecont() ;
                }
                
                
            })
        }

        return isJade ;
    },
    ///////////////////////////////////////////////////// SLIDES FROM THE PROJECT-LEVEL STEP
    deep_slides:function deep_slides(cond, res){
        
        if(res.depth == 1 || !res.parentStep.parentStep || !isDeck(res.parentStep.parentStep) || !(res.parentStep.userData && res.parentStep.userData.slides)) return ;

        var tt = this ;

        var project_zone = $('.project_zone') ;
        var lr_nav = $('.projectsectionpanesnav a') ;
        var ud_nav = $('.project_zone .updownarr a') ;
        var info = $('.info a') ;

        var paneimg = $('.paneimg') ;
        var ind = res.id == '' ? 0 : parseInt(res.id) ;


        if(cond){

            // Remove touch-action lock from parent's zoneall so native scroll works in deep sections
            $('.zoneall').removeClass('touch-action') ;

            // Hide ParentSection
            $('.navzoneinside, .content').addClass('hidden') ;


            var next, prev ;

            // HANDLING LR NAVIGATION BETWEEN CHILD STEPS
            // JUST LIVE-CHANGE THEIR HREF
            lr_nav.each(function(i, el){
                var parsec = res.parentStep.id ;
                var lang = document.documentElement.getAttribute('lang') ;
                var a = $(el) ;
                var isnext = a.hasClass('next') ;
                var pind = (isnext ? ind + 1 : ind - 1) ;
                var ppath = res.parentStep.path ;
                var href = '#/' + lang + (ppath + '/' + (!isnext && ind == 1 ? '' : pind + '/')) ;
                a.attr('href', href) ;

                if(isnext) next = a ;
                else prev = a ;
                if((isnext && ind == res.parentStep.userData.slides.length - 1) || (!isnext && ind == 0)){
                    a.addClass('transp') ;
                }else{
                    a.removeClass('transp') ;
                }
            })


			tt.ensureTranslates(res, project_zone) ;
			ReactiveI18n.bindContainer(project_zone, { stepId: res.id }) ;
			
			var index_res = parseInt(res.name) ;
            index_res = isNaN(index_res) ? 0 : index_res ;

            var curSlide = res.parentStep.userData.slides[isNaN(index_res) ? 0 : index_res] ;
            var noslide = curSlide.noslide ;




            // BACKGROUND SLIDING
            var cineratio = 16/9 ;
            
            var zoneel = project_zone.get(0) ;
            var misted = $('.mist') ;

            var is_slide = !noslide ;
            
            if(is_slide){
                paneimg.css('background-position-x', '0%') ;
                
                var pW = paneimg.width() ;
                var pH = paneimg.height() ;

                /// SKIP X-SCROLL ON ASPECT RATIO
                if(pW / pH <= cineratio) {

                    var tw_back = res.userData.tw_back = BJS.delay(BJS.create({
                        target:paneimg,
                        to:{'background-position-x::%':100},
                        from:{'background-position-x::%':0},
                        time:5,
                        ease:Physical.uniform(.3)
                    }), 0, 2) ;
                    
                    tw_back.stopOnComplete = 0 ;
                    tw_back.restart() ;
                    
                }
                project_zone.addClass('touch-action') ;
            }else{
                project_zone.removeClass('touch-action') ;
                $('.scrollingzone').attr('data-gesture-scroll', 'y') ;
            }

            res.userData.gestureEl = zoneel ;

            GestureManager.listen(res, {
                
                swipe: function(e) {
                    
                    var dir ;
                    var enabled ;
                    switch(e.direction){
                        case 'right' :
                            enabled = !prev.hasClass('transp') ;
                            dir = prev.attr('href') ;
                        break ;
                        case 'left' :
                            enabled = !next.hasClass('transp') ;
                            dir = next.attr('href') ;
                        break ;
                        case 'down' :
                            enabled = true ;
                            dir = $('.contentzone .prev_section a').attr('href') ;
                        break ;
                        case 'up' :
                            enabled = true ;
                            dir = $('.contentzone .next_section a').attr('href') ; ;
                        break ;
                    }
                    
                    if(enabled) window.location = dir ;
                }
            });

            
            


		}else{
			ReactiveI18n.cleanup() ;
			var tw_back = res.userData.tw_back ;
			if(!!tw_back) {
				tw_back.stop() ;
			}
			
			paneimg.css('background-position-x', '0%') ;

			// Restore touch-action lock on parent's zoneall when returning from deep section
			$('.zoneall').addClass('touch-action') ;

			// Ensures it Hides/Unhides ParentSection Content only if it is leaving the stage
			if(Unique.getInstance().hierarchy.changer.leavesNode() == -1){
                if(Unique.getInstance().hierarchy.changer.getFutureDepth() < 2){
                    $('.navzoneinside, .content').removeClass('hidden')
                }
            }

            
        }

    },
    ///////////////////////////////////////////////////// ENSURE THAT PROJECTS ARE WELL DISPLAYED ON SLIDE-LEVEL STEP
    ensure_slides:function ensure_slides(cond, res){
        if(!isDeck(res.parentStep)) return ; // return if we are NOT in the right section
        
        if(cond){
            res.parentStep.userData.getTo(res.index) ;
        }else{
            // Not need for anything here...
        }
    },
    ///////////////////////////////////////////////////// SLIDES FROM THE PROJECT-LEVEL STEP
    enableLang:function enableLang(cond, res){
        var ln = $('.langswitch') ; 
        if(ln.size()){
            ln.find('a').each(function(i, el){
                // want only base /#/en/ or /#fr/
                // TODO 
                // needs to concatenate better and with checks...
                var sss = ($(el).attr('href').substr(0,4) + res.path ) ;
                sss = sss.replace(/\/+$/g, '') + '/' ;
                $(el).attr('href', sss)
            })
        }
    },
    ///////////////////////////////////////////////////// PROJECTS-LEVEL SLIDES
    /////////////////////////////////// TOP OF ITEMS IN PX
    getTop:function getTop(el){
        return parseInt(('css' in el ? el.css('top') : $(el).css('top')).replace('px', '')) ;
    },
    /////////////////////////////////// ORDER ITEMS BY POSITION SETTING THEIR UPDATED INDEX IN LIST
    itemsByPos:function(els, asc){
        var getTop = this.getTop ;
        var sorted = els.toArray().sort(function(a, b){
            var topa = getTop(a) ;
            var topb = getTop(b) ;
            return asc ? topa - topb : topb - topa ;
        })

        return $(sorted).each(function(i, el){
            el.setAttribute('localind', i) ;
        }) ;
    },
    /////////////////////////////////// LOCAL NAV NEEDS RE-ORDERING
    reorderLocalNav:function(dist, way){
        var sl_list = $('.localnav ul li') ;
        var size = sl_list.size() ;
        var sl_nav = $('.localnav ul') ;
        sl_list.find('a').addClass('justtransp') ;
        var el ;
        abs = dist > 0 ? dist : -dist ;
        
        $('.localnav ul li').addClass('none') ;

        for(var i = 0 ; i < abs ; i ++){
            if(way > 0){
                $($('.localnav ul li').get(0)).appendTo(sl_nav) ;
            }else{
                $($('.localnav ul li').get(size-1)).prependTo(sl_nav) ;
            }
        }
        $('.localnav ul li:nth-child(-n+4)').removeClass('none') ;
        $($('.localnav ul li a').get(0)).removeClass('justtransp') ;
    },
    /////////////////////////////////// ACTUAL PROJECTS SLIDE ENABLING
    project_slides:function project_slides(cond, res){
        
        if(!isDeck(res)) return ;

        if(cond){
            var tt = this ;
            var project_pane = $('.project_pane') ;
            
            var totalchildren = res.children.length ;

            var total = project_pane.size() ;
            var half = Math.round(total / 2) ;
            var getLocalInd = function(el){
                return parseInt(/\d+$/.exec(el.attr('localind'))[0]) ;
            } ;
            
            var oldCurIndex = res.userData.currentIndex || 0 ;
            res.userData.currentIndex = 0 ;

            var getTo = res.userData.getTo = function(n){
                
                if(res.userData.currentIndex != n){
                    
                    res.userData.fast = 2 ;
                    var sss = $(project_pane.get(n)) ;
                    sss.trigger('click') ;
                    res.userData.fast = false ;

                }
                res.userData.currentIndex = n ;
            }

            /////////////////////////////////////////////// UP and DOWN arrows in local leftpane nav 
            var sl_vertnav = $('.updownarr') ;
            var arr = sl_vertnav.find('a') ;
            arr.each(function(i, el){
                var a = $(el) ;
                var ind ;
                a.on('click', function(e){
                    if(!!tww && tww.isPlaying) return false ;
                    arranged = tt.itemsByPos(project_pane, true) ;
                    var target = a.hasClass('aft') ? half + 1 : half - 1 ;
                    $(arranged.get(target)).trigger('click') ;
                })
            })
            
            
            /////////////////////////////////////////////// Local leftpane nav Links
            var locallinks = $('.localnav ul li a') ;
            locallinks.attr('href', 'javascript:void(0)')

            locallinks.on('click', function(e){
                if(!!tww && tww.isPlaying) return false ;

                var el = $(e.target) ;
                var arranged = tt.itemsByPos(project_pane, true) ;
                
                var ind = $('.localnav ul li a').index(el) ;
                var target = half + ind ;
                $(arranged.get(target)).trigger('click') ;
                
                return false ;
            })

            var flagCurrent = function(cond, el){
                var elind = parseInt(/\d+$/.exec(el.attr('straw'))[0]) % totalchildren ;
                if(cond ){
                    res.userData.currentIndex = elind ;
                }
                return tt.treatClass(el, 'enabled', !cond) ;
            }
            ////////////////////////////////////////////// VERT SLIDE SYSTEM
            

            var arranged, way, tww, oldie = flagCurrent(true,  $(project_pane.get(0))) ;
            

            project_pane.on('click', function(e){

                if(!!tww && tww.isPlaying) return ;

                var fast = res.userData.fast ;

                arranged = tt.itemsByPos(project_pane, true) ;

                var el = $(e.currentTarget) ;
                
                var localind = getLocalInd(el) ;
                
                var h = el.height() ;
                var dist = half - localind ; 
                
                way = localind > half ? 1 : localind < half ? -1 : 0 ;
                var lang = document.documentElement.getAttribute('lang') ;
                var h ;
                if(!way) {
                    if(!fast) {
                        
						h = '#/' + lang + res.path + '/' ;
                        var mid_h = h + (el.attr('named')) + '/' ;
                        var panind = el.data('index') ;
                        
                        var suffix = panind != 0 ? (el.data('index') - 1) + '/' : '' ;
                        if(panind > 0){
                            el.data('slide')(0) ; 
                        }
                        window.location.hash = mid_h + suffix ;
                    }
                    return ;
                }
                
                var tws = [] ;
                
                arranged.each(function(i, el){
                    var item = $(el) ;

                    if(i == half) {
                        oldie = flagCurrent(false, item) ;
                        if(oldie.data('opened')){
                            oldie.data('slide')(0) ;
                        }
                    }

                    var original = i + dist - half ;
                    var safe = ((total + i + dist) % total) - half ;
                    
                    var time = fast ? fast == 2 ? .15 : 0 : .25 ;
                    var posind = way > 0 ? i : total - i ; 

                    var safeh = safe * h ;
                    var originalh = original * h ;
                    var ittop = tt.getTop(item) ;
                    var isCur = i == half - dist ;
                    var op = isCur ? 100 : 20 ;
                    
                    if(isCur){
                        flagCurrent(true, $(arranged.get(half - dist))) ;
                        // trace($(arranged.get(half - dist)))
                        // $(arranged.get(half - dist)).data('slide')(1)
                    }

                    if( way > 0 ? ittop < safeh : ittop > safeh ){
                        var halftwin = BJS.create({
                            target:item,
                            to:{'top::PX': originalh , 'opacity': 0},
                            time:time,
                            ease:Sine.easeInOut
                        }) ;
                        
                        var safestdist = (way > 0 ? safe - way * dist : safe + way * dist ) ;
                        
                        var halftwout = BJS.create({
                            target:item,
                            to:{'top::PX': safeh , 'opacity': op},
                            from:{'top::PX': safestdist * h},
                            time:time,
                            ease:Sine.easeInOut
                        })
                        tws.push(
                            BJS.serial(
                                BJS.delay(halftwin, fast ? 0 : posind * .05),
                                BJS.func(function(){
                                    item.css('top' , safestdist * h + 'px') ;
                                }),
                                BJS.delay(halftwout, fast ? 0 : .05 * (total - 5))
                            )
                        ) ;
                    }else{
                        tws.push(
                            BJS.delay(
                                BJS.create({
                                    target:item,
                                    to:{'top::PX': safeh , 'opacity': op},
                                    time:time,
                                    ease:Sine.easeInOut
                                })
                            
                            , fast ? 0 : posind * .05)
                        ) ;
                    }

                })
                
                tww = BJS.parallelTweens(tws) ;
                tww.play() ;
                tt.reorderLocalNav(dist, way) ;
            }) ;

            if(oldCurIndex != res.userData.currentIndex){
                getTo(oldCurIndex) ;
            }

            
            var locrarr = $('.localnav .lr_arrows .next') ;
            var loclarr = $('.localnav .lr_arrows .prev') ;
            project_pane.each(function(i, el){
                var pane = $(el) ;
                pane.data('opened', false) ;
                pane.data('index', 0) ;
                var inner = pane.find('.innerslide') ;
                var l = inner.find('.innerpane').size() + 1 ;
                pane.data('slide', function(n){
                    pane.data('index', n) ;
                    var lr_tw = BJS.create({
                        target:inner,
                        to:{"left::%":-n * 100},
                        time:.25,
                        ease:Expo.easeOut
                    })
                    lr_tw.play() ;
                    var lim = n == 0 ? -1 : n == l -1 ? 1 : 0 ;

                    var rarr = pane.find('.next') ; 
                    var larr = pane.find('.prev') ;
                    
                    tt.treatClass(larr, 'justtransp', lim != -1) ;
                    tt.treatClass(rarr, 'justtransp', lim != 1) ;
                    tt.treatClass(loclarr, 'justtransp', lim != -1) ;
                    tt.treatClass(locrarr, 'justtransp', lim != 1) ;
                    
                    pane.data('opened', lim != -1 ? true : false) ;
                })
            })


            
            ///////////////////////////////////////////// INNER HOR SLIDE SYSTEM

            var lrnav = project_pane.find('.panenav a') ;
            
            lrnav.on('click', function(e){
                e.cancelable && e.preventDefault() ;
                e.stopPropagation() ;
                var el = $(e.currentTarget) ;
                if(el.hasClass('justtransp')) return ;
                var pane = el.closest('.project_pane') ;
                
                var way = el.hasClass('next') ? 1 : -1 ;
                var ind = pane.data('index') ;
                
                pane.data('slide')(ind + way) ;

                return false ;
            })

            var lrlocal = $('.localnav .lr_arrows a') ;
            lrlocal.on('click', function(e){
                e.cancelable && e.preventDefault() ;
                e.stopPropagation() ;
                var el = $(e.currentTarget) ;
                if(el.hasClass('justtransp')) return ;

                var pane = $('.project_pane.enabled') ;
                
                var way = el.hasClass('next') ? 1 : -1 ;
                var ind = pane.data('index') ;
                
                pane.data('slide')(ind + way) ;

                return false ;
            })

            $('.zoneall').addClass('touch-action') ;
            res.userData.gestureEl = $('.zoneall').get(0) ;

            GestureManager.listen(res, {
                
                swipe: function(e) {
                    // trace('SWIPE_EVENT direction='+e.direction+' dX='+e.distanceX.toFixed(0)+' dY='+e.distanceY.toFixed(0)+' vX='+e.velocityX.toFixed(3)+' vY='+e.velocityY.toFixed(3)+' ms='+e.timeTaken.toFixed(0));
                    var dir ;
                    var enabled ;
                    switch(e.direction){
                        case 'right' :
                            // enabled = !prev.hasClass('transp') ;
                            // dir = prev.attr('href') ;
                            loclarr.trigger('click') ;
                        break ;
                        case 'left' :
                            // enabled = !next.hasClass('transp') ;
                            // dir = next.attr('href') ;
                            locrarr.trigger('click') ;
                        break ;
                        case 'down' :
                            // enabled = true ;
                            $('.updownarr a.bef').trigger('click') ;
                            // dir = $('.contentzone .prev_section a').attr('href') ;
                        break ;
                        case 'up' :
                            $('.updownarr a.aft').trigger('click') ;
                            // enabled = true ;
                            // dir = $('.contentzone .next_section a').attr('href') ; ;
                        break ;
                    }
                    
                    // if(enabled) window.location = dir ;
                }
            });
        }
    },
    ///////////////////////////////////////////////////// SMALLER HORIZONTAL SLIDES IN ABOUT INTRO SECTION
    intro_slides : function intro_slides(cond, res){
        if(!res.parentStep.id.test(about_type_sliding_sections)) return ; // return if we are NOT in the right section
        


        var sl = $('.about.slides') ;
        var tt = this ;
        if(sl.size()){
            var i = 0 ;
            var slcont = sl.find('.about_intro') ;
            var sls = sl.find('.unit') ; 
            var l = sls.size() ;
            var next = sl.find('.next'), prev = sl.find('.prev') ;
            
            var tw ;
            if(cond){
                res.userData.sl_click = function(e){
                    if(!!tw && tw.isPlaying) tw.stop() ;
                    var el = $(e.target) ;
                    var way = el.hasClass('next') ;
                    i += way ? 1 : -1 ;
                    i = i % 3 ;

                    sls.each(function(ii, sli){
                        $(sli).css('opacity', ii == i ? 1 : .3)
                    }) ;
                    $('.pagination .num').text(i+1) ;
                    tw = BJS.create({
                        target:slcont,
                        to:{'left::%':(i) * -100},
                        time:.2,
                        ease:Expo.easeOut
                    }).play() ;

                    tt.treatClass(next, 'transp', i != l - 1) ;
                    tt.treatClass(prev, 'transp', i != 0) ;

                } ;
                sl.find('a').on('click', res.userData.sl_click) ;


                
                res.userData.gestureEl = $('.zoneall') ;

                GestureManager.listen(res, {
                    
                    swipe: function(e) {
                        // trace('swiped', 'DIRECTION: ' + e.direction.toUpperCase());
                        // trace(e.direction)
                        var dir ;
                        var enabled ;
                        switch(e.direction){
                            case 'right' :
                                if(i > 0)
                                prev.trigger('click') ;
                            break ;
                            case 'left' :
                                if(i < 2)
                                next.trigger('click') ;
                            break ;
                            case 'down' :
                                window.location = $('.backlink').attr('href')
                            break ;
                            case 'up' :
                                window.location = $('.furtherlink').attr('href') ;
                            break ;
                        }
                        
                    }
                });






            }else{
                sl.find('a').off('click', res.userData.sl_click)
            }
        }
    },
    intro_gesture : function intro_gesture(cond, res){
        
        if(res.name != 'about') return ;

        if(cond){

            res.userData.gestureEl = $('.zoneall') ;

            GestureManager.listen(res, {
                
                swipe: function(e) {
                    // trace('swiped', 'DIRECTION: ' + e.direction.toUpperCase());
                    // trace(e.direction)
                    var dir ;
                    var enabled ;
                    switch(e.direction){
                        case 'right' :
                            
                        break ;
                        case 'left' :
                            
                        break ;
                        case 'down' :
                            window.location = $('.close').attr('href')
                        break ;
                        case 'up' :
                            window.location = $('.furtherlink').attr('href') ;
                        break ;
                    }
                    
                }
            });
        }else{

        }
    },
    ///////////////////////////////////////////////////// SHADERS BACKGROUND ENABLING GLOBAL
    back_shaders : function back_shaders(cond, res){
        if(!!window.shaderEnabled){
            return ;
        }else{
            var tt = this ;

            // trace(Kompat.instance) ;
            // trace(navigator.userAgent) ;
            // trace(Kompat.instance.ES6BaseCompliant)
            
            BetweenJS.timeout(.1, function(){

                var sh = shaders = {
                    //- shaders:[next, paintedvortex, rays_storm, ],
                    // shaders:[next, crosszoom, crossholy, paintedvortex, glowers, clouds, simplex, hsvmedusas, warpy, siny, smoky, bumpsine, matrixcity, turbuly, snaky, clouds2D, airplane, rays_storm, tuby, voids, causticball, watery, /* digitalbrain, */ twiggly, squarevortex, twisty, bubbly, voidstars, phoenix, particly, matrix, cloudyskies, meteor, marbly, rainy, shapy, laserdance, voidspace, snowy],
                    shaders:[next, simplex, crosszoom, warpy, bumpsine, matrixcity, 
                        liquidGold,
                        chromaticVortex,
                        neonNebulaV2,
                        burningPaper,
                        frostedPlasma,
                        holographicSilk,
                        abstractNebula,
                        interstellarTunnel,
                        electricFractal,
                        dreamyParticles,
                        moltenGold,
                        quantumLattice,
                        digitalRainfall,
                        atomicOrbits,
                        logicLattice,
                        resonanceGrid,
                        axiomParticles,
                        hypercubeProjection,
                        synapticFlow,
                        tesseractGrid,
                        eventHorizonBloom,
                        chronosFragments,
                        etherealCurrent,
                        dramaticVortex,
                        fractalMembrane,
                        neonTidal,
                        prismDust,
                        azureHaze,
                        intricateMandala,
                        clouds2D, rays_storm, siny, tuby, voids, causticball, squarevortex, twisty, meteor, rainy, shapy, voidspace],
                    calcCanvasSize:function calcCanvasSize() {
                        var can = $('#'+id) ;
                        var wr = can.parent() ;
                        let rect = {w:wr.width(), h:wr.height()} ;
                        // accurate way is setting width and height as tag attribute
                        can.attr({width:rect.w, height:rect.h}) ;
                        
                        // redraw
                        toy.setImage({source: idshade});
                        
                        toy.redraw() ;
                    }
                }
        
                var id = 'backshader' ;
                var backshader = $('#backshader').css('opacity', 0) ; 

                var tw_out = window.tw_shade_out = BJS.create({
                    target:backshader,
                    to:{'opacity':0},
                    from:{'opacity':50},
                    time:.25,
                    ease:Linear.easeOut
                }) ;
                var tw_in = window.tw_shade_in = BJS.reverse(tw_out) ;
                

                var i = 0 , l = sh.shaders.length ;
                // var startid = parseInt(Math.random() * (l-1)) ;
                var startid = 10 ;
                var localID = parseInt(localStorage.shaderID || startid) ;
                i = localID ;
                var idshade = sh.shaders[localID] ;
                var toy = window.toy = new ShaderToyLite(id, window.isMobileDevice);
                
                sh.calcCanvasSize() ;
                toy.setImage({source: idshade});
                localStorage.shaderID = localID ;
                toy.play() ;
                
                // TODO 
                // not add multiple EL to these
                
                var pp = $('.shadernav a.prev') ; 
                var nn = $('.shadernav a.next') ; 
        
                $('.shadernav a').on('click', function(e){
                    var el = $(e.target) ;
                    var way = el.hasClass('next') ;
                    i += way ? 1 : -1 ;
                    i = i % l ;
                    
                    if(window.tw_shade_out && window.tw_shade_out.isPlaying) window.tw_shade_out.stop() ;
                    if(window.tw_shade_in && window.tw_shade_in.isPlaying) window.tw_shade_in.stop() ;
                    
                    tw_out.play().onComplete = function(){

                        idshade = sh.shaders[i] ;
                        localStorage.shaderID = i ;
                        sh.calcCanvasSize() ;
                        tw_in.play() ;

                    } ;


                    // tt.treatClass(nn, 'transp', i != l - 1) ;
                    tt.treatClass(pp, 'transp', i != 0) ;
                    
                    return false ;
                })
        
        
                window.addEventListener('resize', sh.calcCanvasSize) ;
                window.shaderEnabled = true ;

                tw_in.play() ;

                trace('DONE SHADERING...')

            }).play() ;
        }

    }
}