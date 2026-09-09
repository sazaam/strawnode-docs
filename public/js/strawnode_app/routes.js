// hierarchy sections descriptor object written as in 'exports' object

// Members are CONFIG objects (declarative data) : `urljade` is hoisted into
// userData, `@`-prop keys attach handlers, object values recurse as children,
// and `parameters.response` derives from structure (a landing, id '', reports
// its parent step). The historical function form — an open handler that sets
// userData/parameters under `res.opening` plus `@`-props and named/`index`
// children — remains fully supported (e.g. `section()`/`project()` factories
// and any leaf still written by hand).

var graphics = require('./graphics') ;

var sections = require('./sections')(graphics) ;
var section = sections.section ;
var project = sections.project ;

// Express.app.set('liveautoremove', true) ; // erases live-generated regexp steps on close

module.exports = {
	index : {
		urljade : '/jade/structure/section.jade',
		'@focus' : graphics.focus,
		'@toggle' : graphics.toggle
	},
	/////////// ABOUT
	about : {
		index : {
			urljade : '/jade/structure/section_desc.jade',
			'@focus' : graphics.focus,
			'@toggle' : graphics.toggle
		},
		intro : {
			urljade : '/jade/structure/section_desc.jade',
			'@focus' : graphics.focus,
			'@toggle' : graphics.toggle
		}
		
	},
	/////////// WORKS
	works : {
		index : {
			urljade : '/jade/structure/section.jade',
			'@focus' : graphics.focus,
			'@toggle' : graphics.toggle
		},
		vision : section({}),
		make : section({style:'tableau'}, {
			metavagrant : project([
				{url:'mv-01.jpg'},
				{url:'itFlow-01.jpg', x:'20%'},
				{url:'itFlow-02.jpg', x:'82%'},
				{url:'itFlow-03.jpg', x:'90%'},
			]),
			europa : project([
				{url:'europa-02.jpg', x:'85%'},
				{url:'europa-03.jpg', x:'22%'},
				{url:'europa-01.jpg', x:'48%'},
			]),
			infinite : project([
				{url:'inifinite_01_s.jpg', x:'20%'},
				{url:'inifinite_01_side.jpg', x:'80%'},
				{url:'inifinite_01_frontleft_transp.jpg'},
				{url:'inifinite_04_right-Recovered.jpg', x:'70%'},
				{url:'infinite-01bis.jpg'},
				{url:'inifinite_real_01.jpg'},
				{url:'inifinite_real_02.jpg'},
				{url:'inifinite_real_03.jpg'},
				{url:'inifinite_real_04.jpg'},
				{url:'inifinite_real_05.jpg'},
				{url:'infinite-02.jpg', x:'54%'},
			]),
			dkt : project([
				{url:'dkt-01.jpg', x:'5%'},
				{url:'dkt-02.jpg', x:'5%'},
				{url:'dkt-03.jpg', x:'25%'},
				{url:'dkt-04.jpg', x:'60%'},
				{url:'dkt-05.jpg', x:'60%'},
				{url:'dkt-06.jpg', x:'0%'},
				{url:'dkt-07.jpg', x:'75%'},
				{url:'dummy.jpg', x:'45%', noslide:1},
			]),
			hexarmor : project([
				{url:'hex-01.jpg', x:'50%'},
				{url:'hex-02.jpg', x:'45%'},
				{url:'hex-03.jpg', x:'65%'},
				{url:'hex-04.jpg', x:'60%'},
				{url:'hex-05.jpg', x:'60%'},
				{url:'hex-06.jpg', x:'60%'},
				{url:'hex-07.jpg', x:'0%'},
				{url:'hex-08.jpg', x:'60%'},
				{url:'hex-plan-01.jpg', x:'50%'},
				{url:'hex-plan-02.jpg', x:'20%'},
				{url:'hex-plan-03.jpg', x:'0%'},
				{url:'hex-plan-04.jpg', x:'0%'},
				{url:'hex-plan-05.jpg', x:'60%'},
				{url:'hex-plan-06.jpg', x:'60%'},
				{url:'hex-plan-07.jpg', x:'50%'},
				{url:'dummy.jpg', x:'45%', noslide:1},
			]),
			mmai : project([
				{url:'mmai_01.jpg'},
				{url:'mmai_02.jpg', x:'50%'},
				{url:'mmai_03.jpg', x:'50%'},
				{url:'mmai_04.jpg', x:'50%'},
				{url:'mmai_05.jpg', x:'50%'},
				{url:'mmai_002.jpg', x:'50%'},
				{url:'mmai_001.jpg', x:'50%'},
				{url:'mmai_003.jpg', x:'50%'},
				{url:'mmai_004.jpg', x:'50%'},
				{url:'mmai_005.jpg', x:'50%'},
				{url:'mmai_006.jpg', x:'50%'},
				{url:'mmai_007.jpg', x:'50%'},
			]),
			smythson : project([
				{url:'smythson-naja-01.jpg', x:'25%'},
				{url:'smythson-naja-02.jpg', x:'45%'},
				{url:'smythson-naja-03.jpg', x:'65%'},
				{url:'smythson-naja-04.jpg', x:'60%'},
				{url:'dummy.jpg', x:'45%', noslide:1},
			])
		}),
		light : section({style:'tableau'}, {
			ashina : project([
				{url:'Ashina_BW.jpg'},
				{url:'Ashina_02.jpg', x:'52%'},
				{url:'ashina_house_01.jpg', x:'41%'},
				{url:'ashina_house_02.jpg', x:'41%'},
				{url:'ashina_house_03.jpg', x:'66%'},
				{url:'Ashina_04.jpg', x:'32%'},
				{url:'Ashina_01.jpg', x:'35%'},
			]),
			modern_art : project([
				{url:'exhibition_01.jpg'},
				{url:'exhibition_02.jpg', x:'20%'},
				{url:'dummy.jpg', noslide:1},
				{url:'dummy.jpg', noslide:1},
				{url:'dummy.jpg', noslide:1},
				{url:'dummy.jpg', noslide:1},
				{url:'dummy.jpg', noslide:1},
			])
		}),
		story : section({style:'tableau'}, {
			sagong : project([
				{url:'sagong_01.jpg', x:'25%'},
				{url:'sagong_02.jpg', x:'60%'},
				{url:'sagong_03.jpg', x:'50%'},
				{url:'sagong_04.jpg', x:'10%'},
				{url:'sagong_05.jpg', x:'65%'},
			]),
			lostinone : project([
				{url:'loi_01.jpg'},
				{url:'loi_02.jpg', x:'20%'},
				{url:'loi_04.jpg', x:'82%'},
				{url:'loi_03.jpg', x:'90%'},
			])
		}),
		
		// self-rendering config member (no landing): renders on visit.
		build : {
			urljade : '/jade/structure/section.jade',
			'@toggle': graphics.toggle, 
			'@focus': graphics.focus
		}
	},
	/////////// DOCS
	docs : {
		index : {
			urljade : '/jade/structure/section.jade',
			'@focus' : graphics.focus,
			'@toggle' : graphics.toggle
		},
			

			/*
			docs.guide = function docs_guide(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/structure/section.jade' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.guide['@focus'] = graphics.focus ;
			docs.guide['@toggle'] = graphics.toggle ;

			docs.api = function docs_api(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/structure/section.jade' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.api['@focus'] = graphics.focus ;
			docs.api['@toggle'] = graphics.toggle ;
			
			
			docs.examples = function docs_examples(req, res){ return res.ready() } ;
			
				docs.examples.index = function docs_examples_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/structure/section_choose_item.jade' ;
						res.userData.parameters = {response:res.parentStep} ;
					}
					return res ;
				} ;
				docs.examples.index['@focus'] = graphics.focus ;
				docs.examples.index['@toggle'] = graphics.toggle ;

				
				docs.examples[/[0-9]+/] = function docs_examples_numeric(req, res){ return res.ready() } ;
					
					docs.examples[/[0-9]+/].index = function docs_examples_numeric_index(req, res){
						if(res.opening){
							res.userData.autoremove = true ;
							res.userData.urljade = '/jade/structure/section_item_numeric.jade' ;
							res.userData.parameters = {response:res.parentStep} ;
						}
						return res ;
					} ;
					docs.examples[/[0-9]+/].index['@focus'] = graphics.focus ;
					docs.examples[/[0-9]+/].index['@toggle'] = graphics.toggle ;
					
					docs.examples[/[0-9]+/].detail = function docs_examples_numeric_detail(req, res){ return res.ready() } ;
				
						docs.examples[/[0-9]+/].detail.index = function docs_examples_numeric_detail_index(req, res){
							if(res.opening){
								res.userData.urljade = '/jade/structure/section_choose_item.jade' ;
								res.userData.parameters = {response:res.parentStep} ;
							}
							return res ;
						} ;
						docs.examples[/[0-9]+/].detail.index['@focus'] = graphics.focus ;
						docs.examples[/[0-9]+/].detail.index['@toggle'] = graphics.toggle ;

						docs.examples[/[0-9]+/].detail[/[0-9]+/] = function docs_examples_numeric_deep(req, res){ return res.ready() } ;
							
							docs.examples[/[0-9]+/].detail[/[0-9]+/].index = function docs_examples_numeric_deep_index(req, res){
								if(res.opening){
									res.userData.urljade = '/jade/structure/section_item_detail.jade' ;
									res.userData.parameters = {response:res.parentStep} ;
								}
								return res ;
							} ;
			docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@focus'] = graphics.focus ;
			docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@toggle'] = graphics.toggle ;
			*/
			
			// declarative containers with mixed children: the landing inherits
			// the viewport and auto-derives its response, named children stay
			// expressible as `section({})` factories.
			code : {
				urljade : '/jade/structure/section.jade',
				index   : { '@toggle': graphics.toggle, '@focus': graphics.focus },
				strawnode : section({}),
				betweenjs : section({}),
				type      : section({})
			},

			tech : {
				urljade : '/jade/structure/section.jade',
				index   : { '@toggle': graphics.toggle, '@focus': graphics.focus },
				shaders    : section({}),
				modelling  : section({}),
				procedural : section({}),
				tweens     : section({})
			}
	},
	/////////// CONTACT
	contact : {
		urljade : '/jade/structure/contact.jade',
		'@focus' : graphics.focus,
		'@toggle' : graphics.toggle
	}

} ;