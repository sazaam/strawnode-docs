
var path = require('path') ;

var i18next = require('i18next') ;
var i18nextMiddleware = require('i18next-http-middleware') ;
// var Backend = require('i18next-node-fs-backend') ;

var translations = require('./translations') ;

i18next
	// .use(Backend)
	.use(i18nextMiddleware.LanguageDetector)
	.init({
		// debug:true,
		// backend: {
		// 	loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json')
		// },
		resources:translations,
		detection: {
			order: ['querystring', 'cookie'],
			caches: ['cookie']
		},
		saveMissing: true,
		fallbackLng: ['en'],
		preload: ['en', 'kr']
	})


module.exports = {

  enable:()=>{
    return i18nextMiddleware.handle(i18next, {
      ignoreRoutes: ['/foo'], // or function(req, res, options, i18next) { /* return true to ignore */ }
      removeLngFromUrl: false
    })
	},
	i18next:i18next
}