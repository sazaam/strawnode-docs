

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

var lambda_deep = function(){
	var lambda_deep_section = function lambda_deep_section(req, res){
		if(res.opening){
			res.userData.urljade = '/jade/artists/section.jade' ;
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

// plain section step : renders the section nav + default article content
var section = function(){
	var section = function section (req, res){
		if(res.opening){
			res.userData.urljade = '/jade/artists/section.jade' ;
			res.userData.urljson = 'json/section' ;
			res.userData.parameters = {response:res} ;
		}
		return res ;
	} ;
	section['@focus'] = focus ;
	section['@toggle'] = toggle ;
	return section ;
} ;

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
	/////////// WORKS — One Vision, Infinite Expressions
	works : (function(){
		
		var works = section() ;

		works.vision = (function(){
			
			var vision = section() ;

			vision.metavagrant = lambda_deep() ;
			vision.metavagrant['userData'] = {
				slides:[
					{url:'mv-01.jpg'},
					{url:'itFlow-01.jpg', x:'20%'},
					{url:'itFlow-02.jpg', x:'82%'},
					{url:'itFlow-03.jpg', x:'90%'},
				]
			}
			
			return vision ;
		})() ;
		
		works.make = (function(){
			
			var make = section() ;
			
			make.europa = lambda_deep() ;
			make.europa['userData'] = {
				slides:[
					{url:'europa-02.jpg', x:'85%'},
					{url:'europa-03.jpg', x:'22%'},
					{url:'europa-01.jpg', x:'48%'},
				]
			}
			

			make.infinite = lambda_deep() ;
			make.infinite['userData'] = {
				slides:[
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
				]
			}


			
			make.dkt = lambda_deep() ;
			make.dkt['userData'] = {
				slides:[
					{url:'dkt-01.jpg', x:'5%'},
					{url:'dkt-02.jpg', x:'5%'},
					{url:'dkt-03.jpg', x:'25%'},
					{url:'dkt-04.jpg', x:'60%'},
					{url:'dkt-05.jpg', x:'60%'},
					{url:'dkt-06.jpg', x:'0%'},
					{url:'dkt-07.jpg', x:'75%'},
					{url:'dummy.jpg', x:'45%', noslide:1},
				]
			}
			
			make.hexarmor = lambda_deep() ;
			make.hexarmor['userData'] = {
				slides:[
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
				]
			}

			make.mmai = lambda_deep() ;
			make.mmai['userData'] = {
				slides:[
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
				]
			}
			
			make.smythson = lambda_deep() ;
			make.smythson['userData'] = {
				slides:[
					{url:'smythson-naja-01.jpg', x:'25%'},
					{url:'smythson-naja-02.jpg', x:'45%'},
					{url:'smythson-naja-03.jpg', x:'65%'},
					{url:'smythson-naja-04.jpg', x:'60%'},
					{url:'dummy.jpg', x:'45%', noslide:1},
				]
			}
			
			return make ;
		})() ;
		
		works.light = (function(){
			
			var light = section() ;

			light.ashina = lambda_deep() ;
			light.ashina['userData'] = {
				slides:[
					{url:'Ashina_BW.jpg'},
					{url:'Ashina_02.jpg', x:'52%'},
					{url:'ashina_house_01.jpg', x:'41%'},
					{url:'ashina_house_02.jpg', x:'41%'},
					{url:'ashina_house_03.jpg', x:'66%'},
					{url:'Ashina_04.jpg', x:'32%'},
					{url:'Ashina_01.jpg', x:'35%'},
				]
			}

			light.modern_art = lambda_deep() ;
			light.modern_art['userData'] = {
				slides:[
					{url:'exhibition_01.jpg'},
					{url:'exhibition_02.jpg', x:'20%'},
					{url:'dummy.jpg', noslide:1},
					{url:'dummy.jpg', noslide:1},
					{url:'dummy.jpg', noslide:1},
					{url:'dummy.jpg', noslide:1},
					{url:'dummy.jpg', noslide:1},
				]
			}

			return light ;
		})() ;
		
		works.story = (function(){
			
			var story = section() ;
			
			story.sagong = lambda_deep() ;
			story.sagong['userData'] = {
				slides:[
					{url:'sagong_01.jpg', x:'25%'},
					{url:'sagong_02.jpg', x:'60%'},
					{url:'sagong_03.jpg', x:'50%'},
					{url:'sagong_04.jpg', x:'10%'},
					{url:'sagong_05.jpg', x:'65%'},
				]
			}

			story.lostinone = lambda_deep() ;
			story.lostinone['userData'] = {
				slides:[
					{url:'loi_01.jpg'},
					{url:'loi_02.jpg', x:'20%'},
					{url:'loi_04.jpg', x:'82%'},
					{url:'loi_03.jpg', x:'90%'},
				]
			}
			
			return story ;
		})() ;
		
		works.build = (function(){
			
			var build = section() ;
			
			build.code = section() ;
			build.tech = section() ;
			
			return build ;
		})() ;
		
		return works ;
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
			
			docs.code = section() ;
			docs.tech = section() ;
			
		return docs ;
	})()

} ;
