
// what steps are going to do graphically , extracted from './graphics.js'
// on toggle (both opening / closing) and focus events

var graphics = require('./graphics') ;
var toggle = graphics.toggle ;
var focus = graphics.focus ;
var project_focus = graphics.project_focus ;
var project_toggle = graphics.project_toggle ;
var deep_project_focus = graphics.deep_project_focus ;
var deep_project_toggle = graphics.deep_project_toggle ;

// Express.app.set('liveautoremove', true) ; // erases live-generated regexp steps on close

// hierarchy sections descriptor object written as in 'exports' object

var projects_section ;

var lambda_indexed = function(urljade){} ;

var lambda_deep = function(){
	var lambda_deep_section = function lambda_deep_section(req, res){
		if(res.opening){
			res.userData.urljade = '/jade/artists/section_project.jade' ;
			res.userData.urljson = 'json/section' ;
			res.userData.parameters = {response:res} ;
		}
		return res ;
	}
	lambda_deep_section['@focus'] = project_focus ;
	lambda_deep_section['@toggle'] = project_toggle ;

	lambda_deep_section.index = function lambda_deep_section_index(req, res){
		if(res.opening){
			res.userData.parameters = {response:res} ;
		}
		return res ;
	} ;
	lambda_deep_section.index['@focus'] = deep_project_focus ;
	lambda_deep_section.index['@toggle'] = deep_project_toggle ;


	lambda_deep_section[/[0-9]+/] = function lambda_deep_section_numeric(req, res){
		if(res.opening){
			res.userData.parameters = {response:res} ;
		}
		return res ;
	} ;
	lambda_deep_section[/[0-9]+/]['@focus'] = deep_project_focus ;
	lambda_deep_section[/[0-9]+/]['@toggle'] = deep_project_toggle ;

	return lambda_deep_section ;
}

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
		
		index['@focus'] = focus ;
		index['@toggle'] = toggle ;
		
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
		
		
		about.index['@focus'] = focus ;
		about.index['@toggle'] = toggle ;
		
		about.intro = function about_intro(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section_desc.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res} ;
			}
			return res ;
		} ;
		about.intro['@focus'] = focus ;
		about.intro['@toggle'] = toggle ;
			
		
		return about ;
	})(),
	projects : (function(){
		
		var projects = function projects(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res} ;
			}
			return res ;
		} ;
		
		projects['@focus'] = focus ;
		projects['@toggle'] = toggle ;
		

		projects.europa = lambda_deep() ;
		projects.europa['userData'] = {
			slides:[
				{url:'europa-02.jpg', x:'85%'},
				{url:'europa-03.jpg', x:'22%'},
				{url:'europa-01.jpg', x:'48%'},
			]
		}
		

		projects.infinite = lambda_deep() ;
		projects.infinite['userData'] = {
			slides:[
				{url:'infinite-01bis.jpg'},
				{url:'infinite-02.jpg', x:'54%'},
			]
		}


		projects.smythson = lambda_deep() ;
		projects.smythson['userData'] = {
			slides:[
				{url:'smythson-naja-01.jpg', x:'25%'},
				{url:'smythson-naja-02.jpg', x:'45%'},
				{url:'smythson-naja-03.jpg', x:'65%'},
				{url:'smythson-naja-04.jpg', x:'60%'},
				{url:'dummy.jpg', x:'45%', noslide:1},
			]
		}

		projects.metavagrant = lambda_deep() ;
		projects.metavagrant['userData'] = {
			slides:[
				{url:'mv-01.jpg'},
				{url:'itFlow-01.jpg', x:'20%'},
				{url:'itFlow-02.jpg', x:'82%'},
				{url:'itFlow-03.jpg', x:'90%'},
			]
		}
		
		return projects ;
	})(),
	studies:(function(){
		
		var studies = function studies(req, res){
			if(res.opening){
				res.userData.urljade = '/jade/artists/section.jade' ;
				res.userData.urljson = 'json/section' ;
				res.userData.parameters = {response:res} ;
			}
			return res ;
		} ;
		
		studies['@focus'] = focus ;
		studies['@toggle'] = toggle ;

		
		studies.sagong = lambda_deep() ;
		studies.sagong['userData'] = {
			slides:[
				{url:'mv-01.jpg'},
				{url:'itFlow-01.jpg', x:'20%'},
				{url:'itFlow-02.jpg', x:'82%'},
				{url:'itFlow-03.jpg', x:'90%'},
			]
		}

		studies.lostinone = lambda_deep() ;
		studies.lostinone['userData'] = {
			slides:[
				{url:'mv-01.jpg'},
				{url:'itFlow-01.jpg', x:'20%'},
				{url:'itFlow-02.jpg', x:'82%'},
				{url:'itFlow-03.jpg', x:'90%'},
			]
		}
		
		studies.lostinone = lambda_deep() ;
		studies.lostinone['userData'] = {
			slides:[
				{url:'mv-01.jpg'},
				{url:'itFlow-01.jpg', x:'20%'},
				{url:'itFlow-02.jpg', x:'82%'},
				{url:'itFlow-03.jpg', x:'90%'},
			]
		}

		return studies ;
	})(),
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
			docs.index['@focus'] = focus ;
			docs.index['@toggle'] = toggle ;
			
			docs.guide = function docs_guide(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.guide['@focus'] = focus ;
			docs.guide['@toggle'] = toggle ;

			docs.api = function docs_api(req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/section' ;
					res.userData.parameters = {response:res} ;
				}
				return res ;
			} ;
			docs.api['@focus'] = focus ;
			docs.api['@toggle'] = toggle ;
			
			
			docs.examples = function docs_examples(req, res){ return res.ready() } ;
			
				docs.examples.index = function docs_examples_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
						res.userData.urljson = 'json/section_choose_item' ;
						res.userData.parameters = {response:res.parentStep} ;
					}
					return res ;
				} ;
				docs.examples.index['@focus'] = focus ;
				docs.examples.index['@toggle'] = toggle ;

				
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
					docs.examples[/[0-9]+/].index['@focus'] = focus ;
					docs.examples[/[0-9]+/].index['@toggle'] = toggle ;
					
					docs.examples[/[0-9]+/].detail = function docs_examples_numeric_detail(req, res){ return res.ready() } ;
				
						docs.examples[/[0-9]+/].detail.index = function docs_examples_numeric_detail_index(req, res){
							if(res.opening){
								res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
								res.userData.urljson = 'json/section_choose_item' ;
								res.userData.parameters = {response:res.parentStep} ;
							}
							return res ;
						} ;
						docs.examples[/[0-9]+/].detail.index['@focus'] = focus ;
						docs.examples[/[0-9]+/].detail.index['@toggle'] = toggle ;

						docs.examples[/[0-9]+/].detail[/[0-9]+/] = function docs_examples_numeric_deep(req, res){ return res.ready() } ;
							
							docs.examples[/[0-9]+/].detail[/[0-9]+/].index = function docs_examples_numeric_deep_index(req, res){
								if(res.opening){
									res.userData.urljade = '/jade/artists/section_item_detail.jade' ;
									res.userData.urljson = 'json/section_item_detail' ;
									res.userData.parameters = {response:res.parentStep} ;
								}
								return res ;
							} ;
							docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@focus'] = focus ;
							docs.examples[/[0-9]+/].detail[/[0-9]+/].index['@toggle'] = toggle ;

		return docs ;
	})()

} ;