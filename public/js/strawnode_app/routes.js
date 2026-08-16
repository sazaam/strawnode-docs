
// hierarchy sections descriptor object written as in 'exports' object

var graphics = require('./graphics') ;

var sections = require('./sections')(graphics) ;
var section = sections.section ;
var project = sections.project ;

// Express.app.set('liveautoremove', true) ; // erases live-generated regexp steps on close

module.exports = {
	index : (function(){
		
		var index = function index (req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section.jade' ;
				res.userData.urljson = 'json/home' ;
				res.userData.parameters = {response:res.parentStep} ;
			}
			return res ;
		} ;
		
		index['@focus'] = graphics.focus ;
		index['@toggle'] = graphics.toggle ;
		
		return index ;
	})(),
	/////////// ABOUT
	about : (function(){
		
		var about = function about (req, res){ return res.ready() } ;
		
		about.index = function about_index(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section_desc.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res.parentStep} ;
			}
			return res ;
		} ;
		
		about.index['@focus'] = graphics.focus ;
		about.index['@toggle'] = graphics.toggle ;
		
		about.intro = function about_intro(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section_desc.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res} ;
			}
			return res ;
		} ;
		about.intro['@focus'] = graphics.focus ;
		about.intro['@toggle'] = graphics.toggle ;
			
		
		return about ;
	})(),
	/////////// WORKS
	works : (function(){
		
		var works = function works (req, res){ return res.ready() ; } ;
		
		works.index = function works_index(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res.parentStep} ;
			}
			return res ;
		} ;
		works.index['@focus'] = graphics.focus ;
		works.index['@toggle'] = graphics.toggle ;
		
		works.vision = section({}) ;
		works.make = section({deck:true}, {
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
		}) ;
		works.light = section({deck:true}, {
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
		}) ;
		works.story = section({deck:true}, {
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
		}) ;
		
		works.build = (function(){
			
			var build = function build (req, res){ return res.ready() ; } ;
			
			build.index = function build_index(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				return res ;
			} ;
			build.index['@focus'] = graphics.focus ;
			build.index['@toggle'] = graphics.toggle ;
			
			// build.code = section({}) ;
			// build.tech = section({}) ;
			
			return build ;
		})() ;
		
		return works ;
	})(),
	/////////// DOCS
	docs : (function(){
		
		var docs = function docs (req, res){ return res.ready() } ;
		
			docs.index = function docs_index(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				return res ;
			} ;
			docs.index['@focus'] = graphics.focus ;
			docs.index['@toggle'] = graphics.toggle ;
			


			/*
			docs.guide = function docs_guide(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.guide['@focus'] = graphics.focus ;
			docs.guide['@toggle'] = graphics.toggle ;

			docs.api = function docs_api(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.api['@focus'] = graphics.focus ;
			docs.api['@toggle'] = graphics.toggle ;
			
			
			docs.examples = function docs_examples(req, res){ return res.ready() } ;
			
				docs.examples.index = function docs_examples_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
						res.userData.urljson = 'json/section_choose_item' ;
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
							res.userData.urljade = '/jade/artists/section_item_numeric.jade' ;
							res.userData.urljson = 'json/section' ;
							res.userData.parameters = {response:res.parentStep} ;
						}
						return res ;
					} ;
					docs.examples[/[0-9]+/].index['@focus'] = graphics.focus ;
					docs.examples[/[0-9]+/].index['@toggle'] = graphics.toggle ;
					
					docs.examples[/[0-9]+/].detail = function docs_examples_numeric_detail(req, res){ return res.ready() } ;
				
						docs.examples[/[0-9]+/].detail.index = function docs_examples_numeric_detail_index(req, res){
							if(res.opening){
								res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
								res.userData.urljson = 'json/section_choose_item' ;
								res.userData.parameters = {response:res.parentStep} ;
							}
							return res ;
						} ;
						docs.examples[/[0-9]+/].detail.index['@focus'] = graphics.focus ;
						docs.examples[/[0-9]+/].detail.index['@toggle'] = graphics.toggle ;

						docs.examples[/[0-9]+/].detail[/[0-9]+/] = function docs_examples_numeric_deep(req, res){ return res.ready() } ;
							
							docs.examples[/[0-9]+/].detail[/[0-9]+/].index = function docs_examples_numeric_deep_index(req, res){
								if(res.opening){
									res.userData.urljade = '/jade/artists/section_item_detail.jade' ;
									res.userData.urljson = 'json/section_item_detail' ;
									res.userData.parameters = {response:res.parentStep} ;
								}
								return res ;
							} ;
			docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@focus'] = graphics.focus ;
			docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@toggle'] = graphics.toggle ;
			*/
			
			docs.code = (function(){

				var code = function code (req, res){ return res.ready() ; } ;

				code.index = function code_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res.parentStep} ;
					}
					return res ;
				} ;
				code.index['@focus'] = graphics.focus ;
				code.index['@toggle'] = graphics.toggle ;

				code.strawnode = section({}) ;
				code.betweenjs = section({}) ;
				code.type = section({}) ;

				return code ;
			})() ;

			docs.tech = (function(){

				var tech = function tech (req, res){ return res.ready() ; } ;

				tech.index = function tech_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res.parentStep} ;
					}
					return res ;
				} ;
				tech.index['@focus'] = graphics.focus ;
				tech.index['@toggle'] = graphics.toggle ;

				tech.shaders = section({}) ;
				tech.modelling = section({}) ;
				tech.procedural = section({}) ;
				tech.tweens = section({}) ;

				return tech ;
			})() ;

		return docs ;
	})(),
	/////////// CONTACT
	contact : (function(){
		
		var contact = function contact (req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/contact.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res} ;
			}
			return res ;
		} ;
		
		contact['@focus'] = graphics.focus ;
		contact['@toggle'] = graphics.toggle ;
		
		return contact ;
	})()

} ;
