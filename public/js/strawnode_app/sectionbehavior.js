

var slidings_sections = ['projects', 'studies'] ;
var about_type_sliding_sections = ['about'] ;



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
        
        // Slides
        this.intro_slides(cond, res) ;
        
        // shaders
        this.back_shaders(cond, res) ;

        this.project_hide(cond, res) ;

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
        if(!res.id.test(slidings_sections)) return ;

        if(cond){

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

                        if(sss.length == sss2.length) {
                            clearInterval(tw_letters_in) ;
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

                // trace(i18next.t(desc.attr('i18n')+ '_0' + (res.id == '' ? 0 : res.id)))
                var ttt = i18next.t(desc.attr('i18n')+ '_0' + (res.id == '' ? 0 : res.id)) ;


                // var article = desc.find('.article_container') ;
                
                // if(article.size()){
                //     BTW.to(article, {opacity:0}, .15, Linear.easeOut).play().onComplete = function(){article.remove()} ;
                // }
                
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
        
        if(res.depth == 1 || !!res.parentStep.parentStep && !res.parentStep.parentStep.id.test(slidings_sections)) return ;

        var tt = this ;

        var project_zone = $('.project_zone') ;

        var lr_nav = $('.projectsectionpanesnav a') ;
        var ud_nav = $('.project_zone .updownarr a') ;
        var info = $('.info a') ;

        var paneimg = $('.paneimg') ;
        var ind = res.id == '' ? 0 : parseInt(res.id) ;


        var isMob = Kompat.instance.isMobile ; 

        var events = {
            down:'mousedown',
            move:'mousemove',
            up:'mouseup',
        }
        
        if(isMob){
            events = {
                down:'touchstart',
                move:'touchmove',
                up:'touchend',
            }
        }


        if(cond){
            $('.navzoneinside, .content').addClass('hidden') ;

            var noSlide = 0;
            tt.ensureTranslates(res, project_zone) ;
            var index_res = parseInt(res.name) ;
            var curSlide = res.parentStep.userData.slides[isNaN(index_res) ? 0 : index_res] ;
            noSlide = curSlide.noslide ;
            
            var cineratio = 16/9 ;
            

            var getPageX = function(e){
                return isMob ? e.originalEvent.touches[0].clientX : e.pageX ;
            }

            project_zone.on(events.down, res.userData.onPJ_MD = function(e){
                
                if(!isMob){
                    e.preventDefault() ;
                    e.stopPropagation() ;
                }

                var panes = $('.project_section_panes') ;
                var top = panes.position().top ;
                var bottom = top + panes.height() ;
                // alert(!!e.originalEvent.touches[0])
                var Y = e.clientY || e.originalEvent.touches[0].clientY ;
                if(Y > bottom || Y < top){
                    return window.location.hash = $('.close_project a').attr('href') ;
                }
                
                if(!noSlide){

                    var misted = $('.mist') ;
                    var pW = paneimg.width() ;
                    var pH = paneimg.height() ;

                    /// SKIP X-SCROLL ON ASPECT RATIO
                    if(pW / pH > cineratio) return ;

                    var el = $(e.target) ;
                    var tag = el.prop('tagName') ;
                    
                    if(!tag.test('A', 'SVG', 'PATH', '/i')) {
                        
                        var bgDef = paneimg.css('background-position-x') || '50%' ;
                        var bgX = parseInt(bgDef.replace('%', '')) ;
                        var pe = getPageX(e) ;
                        var diff, clamped ;
                        var move, up ;
                        
                        misted.css('opacity', .1) ;

                        project_zone.on(events.move, move = function(e){
                            
                            diff = (pe - getPageX(e)) ;
                            clamped = (bgX + parseInt(diff / (pW/2) * 100)).clamped(-3, 103) ;
                            paneimg.css('background-position-x', clamped + '%') ;

                        }) ;

                        project_zone.on(events.up, up = function(e){
                            
                            bgX = clamped ;
                            if(bgX > 100 || bgX < 0){
                                BJS.create({
                                    target:paneimg,
                                    to:{"background-position-x::%":bgX < 0 ? 0 : 100},
                                    time:.15,
                                    ease:Back.easeOut
                                }).play() ;
                            }

                            misted.css('opacity', 1) ;

                            project_zone.off(events.move, move) ;
                            project_zone.off(events.up, up) ;
                            project_zone.off('mouseout', up) ;
                        })
                        project_zone.on('mouseout', up) ;
                    }
                }

            }) ;
            

			lr_nav.each(function(i, el){
				var a = $(el) ;
				if(a.hasClass('prev')){
					if(ind == 0) a.addClass('transp') ;
					else a.removeClass('transp') ;
				}else{
					if(ind == res.parentStep.userData.slides.length - 1) a.addClass('transp') ;
					else a.removeClass('transp') ;
				}
			})

			lr_nav.on('mousedown', res.userData.onLR_MD = function(e){
				var a = $(e.target) ;
				var way = a.hasClass('next') ? 1 : -1 ;
				var lang = document.documentElement.getAttribute('lang') ;
				var n = ind ;
				var h ;
				var prefix = '#/' + lang ;
				
				if(way == 1){
					n++ ;
					if(n == 0) h = prefix + res.path + n + '/' ;
					else h = prefix + res.parentStep.path  + '/' + n + '/' ;
				}else{
					n-- ;
					if(n == 0) h = prefix + res.parentStep.path + '/' ;
					else h = prefix + res.parentStep.path  + '/' + n + '/' ;
				}
				window.location.hash = h ;
			}) ;

			ud_nav.on('mousedown', res.userData.onUD_MD = function(e){
				var a = $(e.target) ;
				var way = a.hasClass('aft') ? 1 : -1 ;
				var ind = res.parentStep.index ;
				var lang = document.documentElement.getAttribute('lang') ;
				var prefix = '#/' + lang ;
				var n = ind ;
				var ch = res.parentStep.parentStep.children ;
				var l = ch.length ;

				if(way == 1) n++ ;
				else n-- ;
				
				n = (l + n) % l ;
				window.location.hash = prefix + ch[n].path + '/' ;
			}) ;



        }else{
            paneimg.css('background-position-x', '50%') ;

			lr_nav.off('mousedown', res.userData.onLR_MD) ;
			ud_nav.off('mousedown', res.userData.onUD_MD) ;
			project_zone.off(events.down, res.userData.onPJ_MD) ;

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
        if(!res.parentStep.id.test(slidings_sections)) return ; // return if we are NOT in the right section
        
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
        
        if(!res.id.test(slidings_sections)) return ;
        
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
                    sss.trigger('mousedown') ;
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
                a.on('mousedown', function(e){
                    if(!!tww && tww.isPlaying) return false ;
                    arranged = tt.itemsByPos(project_pane, true) ;
                    var target = a.hasClass('aft') ? half + 1 : half - 1 ;
                    $(arranged.get(target)).trigger('mousedown') ;
                })
            })
            
            
            /////////////////////////////////////////////// Local leftpane nav Links
            var locallinks = $('.localnav ul li a') ;
            locallinks.attr('href', 'javascript:void(0)')

            locallinks.on('mousedown', function(e){
                if(!!tww && tww.isPlaying) return false ;

                var el = $(e.target) ;
                var arranged = tt.itemsByPos(project_pane, true) ;
                
                var ind = $('.localnav ul li a').index(el) ;
                var target = half + ind ;
                $(arranged.get(target)).trigger('mousedown') ;
                
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
            

            project_pane.on('mousedown', function(e){

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
                        
                        h = '#/' + lang + '/' + res.id + '/' ;
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
            
            lrnav.mousedown(function(e){
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
            lrlocal.mousedown(function(e){
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

            
        }else{
            

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
            var i = 0 ;
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
                sl.find('a').on('mousedown', res.userData.sl_click)
            }else{
                sl.find('a').off('mousedown', res.userData.sl_click)
            }
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
                    shaders:[next, simplex, crosszoom, warpy, bumpsine, matrixcity, clouds2D, rays_storm, siny, tuby, voids, causticball, squarevortex, twisty, meteor, rainy, shapy, voidspace],
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
                var startid = parseInt(Math.random() * (l-1)) ;
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
        
                $('.shadernav a').on('mousedown', function(e){
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