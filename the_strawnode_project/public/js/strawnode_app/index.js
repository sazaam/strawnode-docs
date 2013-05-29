
// necessary for full app feature
var express = require('Express') ;
var routes = require('./routes') ;

 
var WindowProxy = new Proxy.Class(window, {
	statics:{
		initialize:function(){
			// trace('initing WindowProxy class', this) ;
			return this ;
		}
	},
	constructor:WindowProxy = function WindowProxy(over){
		// trace('window proxy init') ;
		return this ;
	},
	// rewrite custom addEventListener
	bind:function bind(type, closure){
		return (!!window.attachEvent) ? 
			WindowProxy.factory.attachEvent('on'+type, closure) :
			WindowProxy.factory.addEventListener(type, closure, true) ;
	},
	unbind:function unbind(type, closure){
		return (!!window.detachEvent) ? 
			WindowProxy.factory.detachEvent('on'+type, closure) :
			WindowProxy.factory.removeEventListener(type, closure, true) ;
	},
	// rewrite custom setTimeout
	setTimeout:function setTimeout(closure, time){
		return WindowProxy.factory.setTimeout(closure, time) ;
	}
}) ;

// creates an instance of that class , no need to re-assign proxy's target in constructor params 
var wproxy = new WindowProxy() ;

var loadclosure ;
wproxy.bind('load', loadclosure = function loadclosure(e){ // will call wproxy's override instead
	
	wproxy.unbind('load',  loadclosure) ;
	
	// trace(new Proxy(location))
	// trace(e.type) ;
	
	wproxy.setTimeout(function(){
		
		new Proxy($('<div id="topnav">').addClass('abs borderbottom zindex10 sizeSm top0 right0 left0 padding lightest').appendTo('.frame')[0])
			.innerHTML('The StrawNode <sup class="sizeXSm">TM</sup>  Project') ;
		
		new Proxy($('<div id="bottomnav">').addClass('abs bordertop zindex10 bottom0 right0 sizeSm txtR left0 padding lightest').appendTo('.frame')[0])
			.innerHTML('A Creative Commons licensed project') ;
		
	}, 30) ;
})

/* */





var app = express() ;
	
	app.configure(function(){
		app
			.set('view engine', 'jade')
			.set('views', '/js/jade/')
			.set('address', {
				home:'',
				base:__parameters.base,
				useLocale:true
			}) ;
	})
	// PAGE LOAD
	.listen('load', function siteload(e){
		app.discard('load', siteload) ;
		
		
		// WHEN ADDRESS SYSTEM REALLY STARTS
		if(app.isReady())
			app
				.createClient()
				.get('/', routes)
				.initJSAddress() ;
			
		else // WHEN REAL DEEPLINK ARRIVES WITHOUT HASH, RELOAD W/ HASH
			app.createClient() ;
		
	})
	.listen('unload', function siteunload(e){
		// PAGE UNLOAD
		app.discard('load', siteunload) ;
		app.destroy() ;
	}) ;