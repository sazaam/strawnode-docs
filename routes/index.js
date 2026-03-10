
/*
 * GET home page.
 */


let Unique = require('./nodestep').Unique ;
let Step = require('./nodestep').Step ;
let HierarchyChanger = require('./nodestep').HierarchyChanger ;
let Hierarchy = require('./nodestep').Hierarchy ;
let E = require('./nodestep').E ;
E.unique = Unique ;
var U = Unique.getInstance() ;
Hierarchy.getInstance().setAncestor(U) ;

const safeCircReplace = () => {
	const visited = new WeakSet() ;
	return (key, value) => {
		if (typeof value === "object" && value !== null) {
		if (visited.has(value)) {
			return ;
		}
		visited.add(value) ;
		}
		return value ;
	} ;
} ;

module.exports = {
	safeCircReplace:safeCircReplace,
	tree:undefined,
	Unique:E.unique,
	Hierarchy:Hierarchy,
	HierarchyChanger:HierarchyChanger,
	Step:Step,
	translate: function(){
		let routes = module.exports.routes ;
		E.app.get('/', routes) ;
		let tree = module.exports.tree = U.getHierarchies() ;
		return tree ;
	},
	find:function(path){
		let p = path.replace(/^\/../, '') ;
		let res = Hierarchy.getInstance().getDeep(p) ;
		!!!res && (res = Hierarchy.getInstance().getDeep(p.replace(/\/$/, ''))) ;
		return res ;
	},
	routes:{
		index : (function(){
		
			var index = function index (req, res){
				if(res.opening){
					res.userData.urljade = '/jade/artists/section.jade' ;
					res.userData.urljson = 'json/home' ;
					res.userData.parameters = {response:res.parentStep} ;
				}
				return res ;
			} ;
			
			
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
				
				
				about.intro = function about_intro(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section_desc.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res} ;
					}
					return res ;
				} ;
			
			return about ;
		})(),
		projects : (function(){
			
			var projects = function projects(req, res){ return res.ready() } ;
				
				projects.index = function projects_index(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res.parentStep} ;
					}
					return res ;
				} ;
			
			return projects ;
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
				
				docs.guide = function docs_guide(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res} ;
					}
					return res ;
				} ;

				docs.api = function docs_api(req, res){
					if(res.opening){
						res.userData.urljade = '/jade/artists/section.jade' ;
						res.userData.urljson = 'json/section' ;
						res.userData.parameters = {response:res} ;
					}
					return res ;
				} ;
				
				docs.examples = function docs_examples(req, res){ return res.ready() } ;
				
					docs.examples.index = function docs_examples_index(req, res){
						if(res.opening){
							res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
							res.userData.urljson = 'json/section_choose_item' ;
							res.userData.parameters = {response:res.parentStep} ;
						}
						return res ;
					} ;
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
						docs.examples[/[0-9]+/].detail = function docs_examples_numeric_detail(req, res){ return res.ready() } ;
					
							docs.examples[/[0-9]+/].detail.index = function docs_examples_numeric_detail_index(req, res){
								if(res.opening){
									res.userData.urljade = '/jade/artists/section_choose_item.jade' ;
									res.userData.urljson = 'json/section_choose_item' ;
									res.userData.parameters = {response:res.parentStep} ;
								}
								return res ;
							} ;
							docs.examples[/[0-9]+/].detail[/[0-9]+/] = function docs_examples_numeric_deep(req, res){ return res.ready() } ;
								
								docs.examples[/[0-9]+/].detail[/[0-9]+/].index = function docs_examples_numeric_deep_index(req, res){
									if(res.opening){
										res.userData.urljade = '/jade/artists/section_item_detail.jade' ;
										res.userData.urljson = 'json/section_item_detail' ;
										res.userData.parameters = {response:res.parentStep} ;
									}
									return res ;
								} ;

			return docs ;
		})()
	},
	routesjson : JSON.stringify(module.exports.tree, safeCircReplace()),
}
