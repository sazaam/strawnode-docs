
// Structural helpers for the hierarchy routes descriptor.
// Encodes the framework invariant "one renderer per step" :
//  - section(opts, children) -> a viewport section, it renders itself
//    (urljade + urljson + parameters), so it must NOT carry an 'index'
//    child (that would create a defaultStep double render).
//  - project(slides) -> a deep app leaf (lambda_deep), exposing its own
//    'index' and '/[0-9]+/' slide children, plus userData.slides.
// Deck-ness is data : section({deck:true}) stamps userData.deck which the
// templates and sectionbehavior read instead of id-based regexp lists.
// graphics handlers are injected (factory) to avoid a circular require
// (graphics -> sections -> graphics).

var RESERVED_CHILDREN = ['index', '/'] ;

module.exports = function(graphics){

var focus = graphics.focus ;
var toggle = graphics.toggle ;
var project_focus = graphics.project_focus ;
var project_toggle = graphics.project_toggle ;
var deep_project_focus = graphics.deep_project_focus ;
var deep_project_toggle = graphics.deep_project_toggle ;

var project = function(slides){
    var leaf = function leaf(req, res){
        if(res.opening){
            res.userData.urljade = '/jade/artists/section_project.jade' ;
            res.userData.urljson = 'json/section' ;
            res.userData.parameters = {response:res} ;
        }
        return res ;
    } ;
    leaf['@focus'] = project_focus ;
    leaf['@toggle'] = project_toggle ;

    leaf.index = function leaf_index(req, res){
        if(res.opening){
            res.userData.parameters = {response:res} ;
        }
        return res ;
    } ;
    leaf.index['@focus'] = deep_project_focus ;
    leaf.index['@toggle'] = deep_project_toggle ;

    leaf[/[0-9]+/] = function leaf_numeric(req, res){
        if(res.opening){
            res.userData.parameters = {response:res} ;
        }
        return res ;
    } ;
    leaf[/[0-9]+/]['@focus'] = deep_project_focus ;
    leaf[/[0-9]+/]['@toggle'] = deep_project_toggle ;

    if(!!slides) leaf['userData'] = Object.assign(leaf['userData'] || {}, {slides:slides}) ;

    return leaf ;
} ;

var section = function(opts, children){
    opts = opts || {} ;
    children = children || {} ;

    for(var key in children){
        if(RESERVED_CHILDREN.indexOf(key) != -1)
            throw new Error("section() : reserved child '" + key + "' on a self-rendering section (would create a defaultStep double render)") ;
    }

    var fn = function(req, res){
        if(res.opening){
            res.userData.urljade = '/jade/artists/section.jade' ;
            res.userData.urljson = 'json/section' ;
            res.userData.parameters = {response:res} ;
        }
        return res ;
    } ;
    fn['@focus'] = focus ;
    fn['@toggle'] = toggle ;

    if(!!opts.deck) fn['userData'] = Object.assign(fn['userData'] || {}, {deck:true}) ;

    for(var key in children){
        fn[key] = children[key] ;
    }

    return fn ;
} ;

return {
    section: section,
    project: project
} ;

}
