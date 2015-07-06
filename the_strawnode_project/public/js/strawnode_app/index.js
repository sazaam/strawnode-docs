// necessary for full app feature
var express = require('Express') ;
var routes = require('./routes') ;

var app = express() ;

module.exports = app
	.set('view_engine', 'jade')
	.set('views', __public_root + '/jade/')
	.set('address', {
		home:'',
		base:'undefined' !== typeof __parameters ? __parameters.base : location.protocol + '//' + location.host + location.pathname,
		useLocale:true
	})
	.listen('load', function(e){
		app.discard('load', arguments.callee) ;
		// PAGE LOAD HANDLING
		
		// INIT APP-DEEPLINKED STEPS & BEHAVIORS
		app
			.createClient()
			.get('/', routes)
			.initAddress() ;
		
	})
	.listen('unload', function(e){
		app.discard('unload',arguments.callee) ;
		// PAGE UNLOAD HANDLING
		app = app.destroy() ;
		// CLEANING FOR BROWSER'S SAKE, WHO KNOWS
	}) ;
