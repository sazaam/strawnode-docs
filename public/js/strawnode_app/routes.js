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
				{url:'mv-01.webp'},
				{url:'itFlow-01.webp', x:'20%'},
				{url:'itFlow-02.webp', x:'82%'},
				{url:'itFlow-03.webp', x:'90%'},
			]),
			europa : project([
				{url:'europa-02.webp', x:'85%'},
				{url:'europa-03.webp', x:'22%'},
				{url:'europa-01.webp', x:'48%'},
			]),
			infinite : project([
				{url:'inifinite_01_s.webp', x:'20%'},
				{url:'inifinite_01_side.webp', x:'80%'},
				{url:'inifinite_01_frontleft_transp.webp'},
				{url:'inifinite_04_right-Recovered.webp', x:'70%'},
				{url:'infinite-01bis.webp'},
				{url:'inifinite_real_01.webp'},
				{url:'inifinite_real_02.webp'},
				{url:'inifinite_real_03.webp'},
				{url:'inifinite_real_04.webp'},
				{url:'inifinite_real_05.webp'},
				{url:'infinite-02.webp', x:'54%'},
			]),
			dkt : project([
				{url:'dkt-01.webp', x:'5%'},
				{url:'dkt-02.webp', x:'5%'},
				{url:'dkt-03.webp', x:'25%'},
				{url:'dkt-04.webp', x:'60%'},
				{url:'dkt-05.webp', x:'60%'},
				{url:'dkt-06.webp', x:'0%'},
				{url:'dkt-07.webp', x:'75%'},
				{url:'dummy.webp', x:'45%', noslide:1},
			]),
			hexarmor : project([
				{url:'hex-01.webp', x:'50%'},
				{url:'hex-02.webp', x:'45%'},
				{url:'hex-03.webp', x:'65%'},
				{url:'hex-04.webp', x:'60%'},
				{url:'hex-05.webp', x:'60%'},
				{url:'hex-06.webp', x:'60%'},
				{url:'hex-07.webp', x:'0%'},
				{url:'hex-08.webp', x:'60%'},
				{url:'hex-plan-01.webp', x:'50%'},
				{url:'hex-plan-02.webp', x:'20%'},
				{url:'hex-plan-03.webp', x:'0%'},
				{url:'hex-plan-04.webp', x:'0%'},
				{url:'hex-plan-05.webp', x:'60%'},
				{url:'hex-plan-06.webp', x:'60%'},
				{url:'hex-plan-07.webp', x:'50%'},
				{url:'dummy.webp', x:'45%', noslide:1},
			]),
			mmai : project([
				{url:'mmai_01.webp'},
				{url:'mmai_02.webp', x:'50%'},
				{url:'mmai_03.webp', x:'50%'},
				{url:'mmai_04.webp', x:'50%'},
				{url:'mmai_05.webp', x:'50%'},
				{url:'mmai_002.webp', x:'50%'},
				{url:'mmai_001.webp', x:'50%'},
				{url:'mmai_003.webp', x:'50%'},
				{url:'mmai_004.webp', x:'50%'},
				{url:'mmai_005.webp', x:'50%'},
				{url:'mmai_006.webp', x:'50%'},
				{url:'mmai_007.webp', x:'50%'},
			]),
			smythson : project([
				{url:'smythson-naja-01.webp', x:'25%'},
				{url:'smythson-naja-02.webp', x:'45%'},
				{url:'smythson-naja-03.webp', x:'65%'},
				{url:'smythson-naja-04.webp', x:'60%'},
				{url:'/img/webm/cute_talkie.webm', type:'video', x:'25%'},
				{url:'/img/webm/cute_radio.webm', type:'video', x:'25%'}
			]),
			orca : project([
				{url:'orca_01.webp', x:'25%'},
				{url:'orca_02.webp', x:'45%'},
				{url:'orca_03.webp', x:'65%'},
				{url:'orca_04.webp', x:'60%'},
				{url:'orca_06.webp', x:'60%'},
				{url:'orca_07.webp', x:'60%'},
				{url:'orca_08.webp', x:'60%'},
				{url:'orca_09.webp', x:'60%'},
				{url:'orca_11.webp', x:'60%'}
			]),
			xviii : project([
				{url:'/img/webm/xviii.webm', type:'video', x:'25%'},
				{url:'xviii_01.webp', x:'25%'},
				{url:'xviii_02.webp', x:'45%'},
				{url:'xviii_03.webp', x:'65%'},
				{url:'xviii_04.webp', x:'60%'},
				{url:'xviii_05.webp', x:'60%'},
				{url:'xviii_06.webp', x:'60%'},
				{url:'xviii_07.webp', x:'60%'}
			])
		}),
		light : section({style:'tableau'}, {
			ashina : project([
				{url:'/img/webm/Ashina_all_tweaks.webm', type:'video'},
				{url:'Ashina_02.webp', x:'52%'},
				{url:'ashina_house_01.webp', x:'41%'},
				{url:'ashina_house_02.webp', x:'41%'},
				{url:'ashina_house_03.webp', x:'66%'},
				{url:'Ashina_04.webp', x:'32%'},
				{url:'Ashina_01.webp', x:'35%'},
			]),
			modern_art : project([
				{url:'exhibition_01.webp'},
				{url:'exhibition_02.webp', x:'20%'},
				{url:'dummy.webp', noslide:1},
				{url:'dummy.webp', noslide:1},
				{url:'dummy.webp', noslide:1},
				{url:'dummy.webp', noslide:1},
				{url:'dummy.webp', noslide:1},
			])
		}),
		story : section({style:'tableau'}, {
			sagong : project([
				{url:'sagong_01.webp', x:'25%'},
				{url:'sagong_02.webp', x:'60%'},
				{url:'sagong_03.webp', x:'50%'},
				{url:'sagong_04.webp', x:'10%'},
				{url:'sagong_05.webp', x:'65%'},
			]),
			lostinone : project([
				{url:'loi_01.webp'},
				{url:'loi_02.webp', x:'20%'},
				{url:'loi_04.webp', x:'82%'},
				{url:'loi_03.webp', x:'90%'},
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