


var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path') ;

var app = express() ;

var env = process.NODE_ENV || 'development' ;

if(env == 'development'){
  app.set('port', process.env.PORT || 3000) ;
  app.set('views', path.join(__dirname, 'public/jade')) ;
  app.set('view engine', 'jade') ;
  app.use(express.static(path.join(__dirname, 'public'))) ;
}

app.get('/', routes.index) ;
app.get('/structure', routes.structure) ;

http
	.createServer(app)
	.listen(
		app.get('port'),
		function(){
			console.log("Express server listening on port " + app.get('port')) ;
		}) ;
