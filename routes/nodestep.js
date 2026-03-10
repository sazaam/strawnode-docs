
let Type = require('./type').Type ;


var CodeUtil = Type.define({
    pkg:'utils::CodeUtil',
    domain:Type.appdomain,
    statics:{
        overwritesafe:function overwritesafe(target, propname, propvalue){
            if(!!! target[propname])
                target[propname] = propvalue ;
        },
        deepclone:function deepclone(o){
            return JSON.parse(JSON.stringify(o)) ;
        }
    }
}) ;

var StringUtil = Type.define({
    pkg:'utils::StringUtil',
    domain:Type.appdomain,
    statics:{
        SPACE:' ',
        SLASH:'/',
        HASH:'#',
        AROBASE:'@',
        DOLLAR:'$',
        EMPTY:'',
        initialize:function(){
            String.prototype.test = function(s, testedStrings){

                var args = [].slice.call(arguments) ;
                var str = ('flat' in args ? args.flat(Infinity) : args).join('|') ;
                return new RegExp(str).test(this) ;
            } ;

        }
    }
}) ;

var ArrayUtil = Type.define({
    pkg:'utils::ArrayUtil',
    domain:Type.appdomain,
    statics:{
        isArray:function(obj){
            return Type.is(obj, Array) ;
        },
        slice:[].slice,
        argsToArray:function(args){
            return args.length ? ArrayUtil.slice.call(args) : [] ;
        },
        indexOf:function(arr, obj){
            if(arr.hasOwnProperty('indexOf'))
            return arr.indexOf.apply(arr, [obj]) ; // FF / CHR / OP implementation
            var n = -1 ;
            var l = arr.length ;
            for(var i = 0 ; i < l ; i++ ){
                if(arr[i] == obj) {
                    n = i ;
                    break ;
                }
            }
            return n ;
        }
    }
}) ;

var PathUtil = Type.define({
    pkg:'utils::PathUtil',
    domain:Type.appdomain,
    statics:{
        abs_hash_re:/#/,
        hash_re:/^\/#\//,
        startslash_re:/^\//,
        safe_startslash_re:/(^\/)?/,
        endslash_re:/\/$/,
        safe_endslash_re:/(\/)?$/,
        bothslash_re:/(^\/|\/$)/g,
        multiplesep_re:/(\/){2,}/g,
        undersore_re:/_/g,
        path_re:/^[^?]+/,
        qs_re:/\?.*$/,
        replaceUnderscores:function(str){
            return (!!str) ? str.replace(PathUtil.endslash_re, StringUtil.SPACE) : str ;
        },
        hasMultipleSeparators:function(str){
            return (!!str) ? PathUtil.multiplesep_re.test(str) : str ;
        },
        removeMultipleSeparators:function(str){
            return (!!str) ? str.replace(PathUtil.multiplesep_re, StringUtil.SLASH) : str ;
        },
        trimlast:function trimlast(str){
            return (!!str) ? str.replace(PathUtil.endslash_re, StringUtil.EMPTY) : str ;
        },
        trimfirst:function trimfirst(str){
            return (!!str) ? str.replace(PathUtil.startslash_re, StringUtil.EMPTY) : str ;
        },
        trimall:function trimfirst(str){
            return (!!str) ? str.replace(PathUtil.bothslash_re, StringUtil.EMPTY) : str ;
        },
        ensurelast:function ensurelast(str){
            return (!!str) ? str.replace(PathUtil.safe_endslash_re, StringUtil.SLASH) : str ;
        },
        ensurefirst:function ensurefirst(str){
            return (!!str) ? str.replace(PathUtil.safe_startslash_re, StringUtil.SLASH) : str ;
        },
        ensureall:function ensureall(str){
            return (!!str) ? PathUtil.ensurelast(PathUtil.ensurefirst(str)) : str ;
        },
        endslash:function endslash(str){
            return (!!str) ? PathUtil.endslash_re.test(str) : str ;
        },
        startslash:function startslash(str){
            return (!!str) ? PathUtil.startslash_re.test(str) : str ;
        },
        allslash:function allslash(str){
            return (!!str) ? PathUtil.startslash(str) &&  PathUtil.endslash(str) : str ;
        },
        eitherslash:function eitherslash(str){
            return (!!str) ? PathUtil.bothslash_re.test(str) : str ;
        }
    }
}) ;


/* STEP */
var Step = Type.define({
    pkg:'step',
    domain:Type.appdomain,
    statics:{
        // STATIC VARS
        hierarchies:{},
        getHierarchies:function (){ return Step.hierarchies },
        // STATIC CONSTANTS
        SEPARATOR:StringUtil.SLASH
    },
    id:'',
    path:'',
    label:undefined,
    depth:NaN,
    index:NaN,
    parentStep:undefined,
    defaultStep:undefined,
    ancestor:undefined,
    hierarchyLinked:false,
    children:[],
    isFinal:false,
    userData:undefined,
    
    // CTOR
    constructor:Step = function Step(id){
        Step.base.apply(this, []) ;
        
        this.id = id ;
        this.label = PathUtil.replaceUnderscores(this.id) ;
        this.children = [] ;
        this.alphachildren = {} ;
        this.depth = 0 ;
        this.index = -1 ;
        this.userData = { } ;
        this.isFinal = false ;
        
        // this.settings(commandOpen, commandClose) ;
    },
  
    
    // DATA DESTROY HANDLING
    destroy:function(){
        var st = this ;
        if (Type.is(st.parentStep, Step) && st.parentStep.hasChild(st)) st.parentStep.remove(st) ;
        
        /* if (st.isOpenable) st.commandOpen = st.destroyCommand(st.commandOpen) ;
        if (st.isCloseable) st.commandClose = st.destroyCommand(st.commandClose) ; */
        
        if (!! st.userData ) st.userData = st.destroyObj(st.userData) ;
        
        if (st.children.length != 0) st.children = st.destroyChildren() ;
        if (Type.is(st.ancestor, Step) && st.ancestor == st) {
            if (st.id in Step.hierarchies) st.unregisterAsAncestor() ;
        }
        
        for(var s in this){
            delete this[s] ;
        }
        
        return undefined ;
    },
    /* destroyCommand:function(c){ return !! c ? c.destroy() : c }, */
    destroyChildren:function(){ if (this.getLength() > 0) this.empty(true) ; return undefined },
    destroyObj:function(o){
        for (var s in o) {
            o[s] = undefined ;
            delete o[s] ;
        }
        return undefined ;
    },
    
    setId:function setId(value){ this.id = value },
    getId:function getId(){ return this.id},
    getIndex:function getIndex(){ return this.index},
    getPath:function getPath(){ return this.path },
    getDepth:function getDepth(){ return this.depth },
    // OPEN/CLOSE-TYPE (SELF) CONTROLS
    // removed... unrelevant
    // CHILD/PARENT REFLECT
    getParentStep:function getParentStep(){ return this.parentStep },
    getAncestor:function getAncestor(){ return Type.is(this.ancestor, Step) ? this.ancestor : this },
    getChildren:function getChildren(){ return this.children },
    getNumChildren:function getNumChildren(){ return this.children.length },
    getLength:function getLength(){ return this.getNumChildren() },
    //HIERARCHY REFLECT
    getHierarchies:function getHierarchies(){ return Step.hierarchies},
    getHierarchy:function getHierarchy(){ return Step.hierarchies[id] },
    
    // PLAY-TYPE (CHILDREN) CONTROLS
    getPlayhead:function getPlayhead(){ return this.playhead },
    getLooping:function getLooping(){ return this.looping },
    setLooping:function setLooping(value){ this.looping = value },
    getWay:function getWay(){ return this.way },
    setWay:function setWay(value){ this.way = value },
    getState:function getState(){ return this.state },
    setState:function setState(value){ this.state = value },
    
    getUserData:function getUserData(){ return this.userData },
    setUserData:function setUserData(value){ this.userData = value },
    
    getLoaded:function getLoaded(){ return this.loaded },
    setLoaded:function setLoaded(value){ this.loaded = value },
    getIsFinal:function getIsFinal(){ return this.isFinal },
    setIsFinal:function setIsFinal(value){ this.isFinal = value },
    
    hasChild:function hasChild(ref){
        if(Type.is(ref, Step))
            return this.getIndexOfChild(ref) != -1 ;
        else if (Type.of(ref, 'string'))
            return ref in this.alphachildren ;
        else
            return ref in this.children() ;
    },
    getChild:function getChild(ref){
        var st = this ;
        if(ref === undefined) ref = null ;
        var child ;
        if (ref == null)  // REF IS NOT DEFINED
            child = st.children[st.children.length - 1] ;
        else if (Type.is(ref, Step)) { // HERE REF IS A STEP OBJECT
            child = ref ;
            if (!st.hasChild(child)) throw new Error('step "'+child.id+'" is not a child of step "'+st.id+'"...') ;
        }else if (Type.of(ref, 'string')) { // is STRING ID
            child = st.alphachildren[ref]   ;
        }else { // is INT ID
            if(ref == -1) child = st.children[st.children.length - 1] ;
            else child = st.children[ref] ;
        }
        if (! Type.is(child, Step))  throw new Error('step "' + ref + '" was not found in step "' + st.id + '"...') ;
        
        return child ;
    },
    add:function add(child, childId){
        var st = this ;
        if(childId === undefined) childId = null ;
        var l = st.children.length ;
        
        if (!!childId) {
            child.id = childId ;
        }else {
            if(child.id === undefined) 
            child.id = l ;
            else {
                childId = child.id ;
            }
        }
        st.children[l] = child ; // write L numeric entry
        
        
        if (Type.of(childId, 'string')) { // write Name STRING Entry
            st.alphachildren[childId] = child ;
        }
        
        return st.register(child) ;
    },
    remove:function remove(ref){
        var st = this ;
        
        if(ref === undefined) ref = -1 ;
        var child = st.getChild(ref) ;
        var n = st.getIndexOfChild(child) ;
        
        if (Type.of(child.id, 'string')){
            st.alphachildren[child.id] = null ;
            delete st.alphachildren[child.id] ;
        }
        
        st.children.splice(n, 1) ;
        if (st.playhead == n) st.playhead -- ;
        
        return st.unregister(child) ;
    },
    empty:function empty(destroyChildren){
        if(destroyChildren === undefined) destroyChildren = true ;
        var l = this.getLength() ;
        while (l--) destroyChildren ? this.remove().destroy() : this.remove() ;
    },
    register:function register(child, cond){
        var st = this , ancestor;
        if(cond === undefined) cond = true ;
        
        if (cond) {
            child.index = st.children.length - 1 ;
            child.parentStep = st ;
            child.depth = st.depth + 1 ;
            ancestor = child.ancestor = st.getAncestor() ;
            child.path = (st.path !== undefined ? st.path : st.id ) + Step.SEPARATOR + child.id ;
            
            if (!!Step.hierarchies[ancestor.id]) {
                Step.hierarchies[ancestor.id][child.path] = child ;
            }
            
        }else {
            ancestor = child.ancestor ;
            
            if (!!Step.hierarchies[ancestor.id]) {
                Step.hierarchies[ancestor.id][child.path] = undefined ;
                delete Step.hierarchies[ancestor.id][child.path] ;
            }
            
            child.index = - 1 ;
            child.parentStep = undefined ;
            child.ancestor = undefined ;
            child.depth = 0 ;
            child.path = undefined ;
        }
        return child ;
    },
    unregister:function unregister(child){ return this.register.apply(this, [child, false]) },
    registerAsAncestor:function registerAsAncestor(cond){
        var st = this ;
        if (cond === undefined) cond = true ;
        if (cond) {
            Step.hierarchies[st.id] = { } ;
            st.ancestor = st ;
        }else {
            if (st.id in Step.hierarchies) {
                Step.hierarchies[st.id] = null ;
                delete Step.hierarchies[st.id] ;
            }
            st.ancestor = null ;
        }
        return st ;
    },
    unregisterAsAncestor:function unregisterAsAncestor(){ 
        return this.registerAsAncestor(false) 
    },
    linkHierarchy:function linkHierarchy(h){
        this.hierarchyLinked = true ;
        this.hierarchy = h ;
        return this ;
    },
    unlinkHierarchy:function unlinkHierarchy(h){
        this.hierarchyLinked = false ;
        this.hierarchy = undefined ;
        delete this.hierarchy ;
        return this ;
    },
    getIndexOfChild:function getIndexOfChild(child){
        return ArrayUtil.indexOf(this.children, child) ;
    },
    getNext:function getNext(){
        var s = this.children[this.playhead + 1] ;
        return this.looping ? Type.is(s, Step) ? s : this.children[0] : s ;
    },
    getPrev:function getPrev(){
        var s = this.children[this.playhead - 1] ;
        return this.looping? Type.is(s, Step) ? s : this.children[this.getLength() - 1] : s ;
    },
    hasNext:function hasNext(){ return this.getNext() ?  true : this.looping },
    hasPrev:function hasPrev(){ return this.getPrev() ?  true : this.looping },
    // Navigating behaviors
    handleNext:function(){
        if(!this.parentStep) return this ;
        return this.parentStep.hasNext() ? this.parentStep.getNext() : this.parentStep.getChild(0) ;
    },
    handlePrev:function(){
        if(!this.parentStep) return this ;
        return this.parentStep.hasPrev() ? this.parentStep.getPrev() : this.parentStep.getChild(this.parentStep.children.length - 1) ;
    },
    handleUp:function(){
        return this.parentStep == Unique.instance ? this : this.parentStep || this ;
    },
    handleDown:function(){
        return this.defaultStep || this.children[0] || this ;
    },
    dumpChildren:function dumpChildren(str){
        if(!!!str) str = '' ;
        var chain = '                                                                            ' ;
        this.children.forEach(function(el, i, arr){
            str += chain.slice(0, el.depth) ;
            str += el ;
            if(parseInt(i+1) in arr) str += '\n' ;
        })
        return str ;
    },
    godFather:function(){
        var s = this ;
        while(!!s.parentStep && s.parentStep !== Unique.instance){
            s = s.parentStep ;
        }
        return s ;
    },
    toString:function toString(){
        var st = this ;
        return '[Step >>> id:'+ st.id+' , path: '+st.path + ((st.children.length > 0) ? '[\n'+st.dumpChildren() +'\n]'+ ']' : ']') ;
    }
}) ;

var Unique = Type.define({
    pkg:'step',
    inherits:Step,
    domain:Type.appdomain,
    constructor:Unique = function Unique(){
        Unique.instance = this ;
        Unique.base.apply(this, ['@']) ;
    },
    statics:{
        instance:undefined,
        getInstance:function getInstance(){ return Unique.instance || new Unique() }
    },
    toString:function toString(){
        var st = this ;
        return '[Unique >>> id:'+ st.id+' , path: '+ st.path + ((st.children.length > 0) ? '[\n'+ st.dumpChildren() + '\n]' + ']' : ']') ;
    }
}) ;

var HierarchyChanger = Type.define({
    statics:{
        instance:undefined,
        getInstance:function getInstance(){ return HierarchyChanger.instance || (HierarchyChanger.instance = new HierarchyChanger()) }
    },
    pkg:'hierarchy',
    domain:Type.appdomain,
    statics:{
        DEFAULT_PREFIX:StringUtil.HASH,
        SEPARATOR:Step.SEPARATOR,
        __re_multipleseparator:new RegExp('('+Step.SEPARATOR+'){2,}'),
        __re_qs:PathUtil.qs_re,
        __re_path:PathUtil.path_re,
        __re_endSlash:PathUtil.endslash_re,
        __re_startSlash:PathUtil.startslash_re,
        __re_hash:PathUtil.hash_re,
        __re_abs_hash:PathUtil.abs_hash_re
    },
    hierarchy:undefined,
    __value:StringUtil.EMPTY,
    __currentPath:StringUtil.EMPTY,
    __home:StringUtil.EMPTY,
    __temporaryPath:StringUtil.EMPTY,
    
    constructor:HierarchyChanger = function HierarchyChanger(){
        // trace(this)
    },
    setHierarchy:function setHierarchy(val){ this.hierarchy = val },
    getHierarchy:function getHierarchy(){ return this.hierarchy },
    setHome:function setHome(val){ this.__home = PathUtil.trimlast(val) },
    getHome:function getHome(){ return this.__home = PathUtil.trimlast(__home) },
    getValue:function getValue(){ return this.__value },
    setValue:function setValue(val){ this.hierarchy.redistribute(this.__value = val) },
    getCurrentPath:function getCurrentPath(){ return this.__currentPath = PathUtil.trimlast(this.__currentPath) },
    setCurrentPath:function setCurrentPath(val){ this.__currentPath = PathUtil.trimlast(val) },
    getTemporaryPath:function getTemporaryPath(){ return (this.__temporaryPath !== undefined) ? this.__temporaryPath = PathUtil.trimlast(this.__temporaryPath) : undefined },
    setTemporaryPath:function setTemporaryPath(val){ this.__temporaryPath = PathUtil.trimlast(val) }
}) ;

var Hierarchy = Type.define({
    statics:{
        instance:undefined,
        getInstance:function getInstance(){ return Hierarchy.instance || (Hierarchy.instance = new Hierarchy()) }
    },
    pkg:'hierarchy',
    domain:Type.appdomain,
    idTimeoutFocus:-1 ,
    idTimeoutFocusParent:-1 ,
    root:undefined , // Step
    previousStep:undefined , // Step
    currentStep:undefined , // Step
    changer:undefined ,// HierarchyChanger;
    exPath:'',
    command:undefined ,// Command;
    // CTOR
    constructor:Hierarchy = function Hierarchy(){
        //
    },
    setAncestor:function setAncestor(s, changer){
        var hh = this ;
        hh.root = s ;
        console.log("setting Ancestor...") ;
        hh.root.registerAsAncestor() ;
        hh.root.linkHierarchy(this) ;
        
        hh.currentStep = hh.root ;
        
        hh.changer = changer || new HierarchyChanger() ;
        hh.changer.hierarchy = hh ;
        
        return s ;
    },
    add:function add(step, at){
        return Type.of(at, 'string') ?  this.getDeep(at).add(step) : this.root.add(step) ;
    },
    remove:function remove(id, at){
        return Type.of(at, 'string') ? this.getDeep(at).remove(id) : this.root.remove(id) ;
    },
    getDeep:function getDeep(path){
        var h = Step.hierarchies[this.root.id] ;
        return (path === this.root.id) ? this.root : h[HierarchyChanger.__re_startSlash.test(path)? path : HierarchyChanger.SEPARATOR + path] ;
    },
    getDeepAt:function getDeepAt(referenceHierarchy, path){
        return Step.hierarchies[referenceHierarchy][path] ;
    },
    getTop:function getTop(tg, rt){
        while(tg.parentStep){
            if(tg.parentStep == (rt || Express.app.get('unique').getInstance())) return tg ;
            tg = tg.parentStep ;
        }
        return tg ;
    },
    getRoot:function getRoot(){ return this.root },
    getCurrentStep:function getCurrentStep(){ return this.currentStep },
    getPreviousStep:function getPreviousStep(){ return this.previousStep },
    getChanger:function getChanger(){ return this.changer },
    getCommand:function getCommand(){ return this.command }
}) ;

var Response = Type.define({
    pkg:'response',
    inherits:Step,
    domain:Type.appdomain,
    constructor:Response = function Response(id, pattern){
        
        var res = this ;
        
        Response.base.apply(this, [
            id
        ]) ;
        
        // Cast regexp Steps
        if(pattern !== '/' && PathUtil.allslash(pattern)){
            res.regexp = new RegExp(PathUtil.trimall(pattern)) ;
        }

        return res ;
    },
    isLiveStep:function(){
        var res = this ;
        if( !! res.regexp){
            if(/[^\w]/.test(res.regexp.source))
            return true ;
        }
        return false ;
    }
}) ;


var E = Type.define({
    pkg:'::Express',
    domain:Type.appdomain,
    statics:{
        app:undefined,
        unique:undefined,
        initialize:function(){
            // console.log("E initialized...")
            E.app = new E() ;
        }
    },
    constructor:E = function E(){
        return !!E.app ? E.app : this ;
    },
    get:function get(pattern, handler, parent){
        
        var sectionId = handler.sectionId ;
        
        handler.sectionId = undefined ;
        delete handler.sectionId ;

        if(handler.constructor !== Function){
            for(var s in handler){
                this.get(s == 'index' ? '/' : s , handler[s], parent) ;
            }
            return this ;
        }else{
            // nothing here yet...
        }
        
        var id = pattern.replace(/(^\/|\/$)/g, '') ; // regexp format clean
        
        var res = new Response(id, pattern) ;
        if(!!sectionId) res.sectionId = sectionId ;
        
        var emptyId = id == '' ;
        var hasParent = !!parent ;
        
        res.parent = hasParent ? (emptyId ? parent.parentStep : parent) : res.path == '/' ? undefined : E.unique.getInstance() ;
        res.name = emptyId ? hasParent ? parent.id : E.unique.getInstance().id : res.id ;
        res.opening = true ;

        res.handler = handler ;
        res.responseAct = handler ;
        
        this.enableResponse(true, res, parent) ;
        
        return this ;
    },
    enableResponse:function enableResponse(cond, res, parent){
        var handler = res.handler ;
        
        if(cond){
            
            parent = parent || E.unique.getInstance() ;
            
            
            if(res.id == '') parent.defaultStep = res ;
            parent.add(res) ;
            
            for(var s in handler){
                if(s == 'name') continue ; // Stoopid IE trying to go for Name value of the function
                if(s.indexOf('@') == 0)  continue ; // this.attachHandler(true, s, handler[s], res) ;
                else if(s == 'index') this.get('', handler[s], res) ;
                else this.get(s, handler[s], res) ;
            }
            
        }else{
            for(var s in handler){
                if(s.indexOf('@') == 0) continue ; // this.attachHandler(false, s, handler[s], res) ;
            }
            var l = res.getLength() ;
            
            while(l--){
                this.enableResponse(false, res.getChild(l)) ;
            }
            res.parentStep.remove(res) ;
        }
    },
    removeResponse:function removeResponse(res){
        return this.enableResponse(false, res) ;
    }
}) ;


module.exports = {
    Step,
    Unique,
    HierarchyChanger,
    Hierarchy,
    Response,
    E
}