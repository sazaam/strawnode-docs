trace('in test') ;


Type.customDefinitionChecks(function(properties, def){
	return properties ;
}) ;

var Toto ;
new (Type.define({
	constructor:Toto = function Toto(){
		trace('Toto is here !!!') ;
		
		Toto.slot.model.mixins[0].apply(this ) ;
		
		var t = this ;
		// ready as an EventListener
		this.bind('toto', function closure1(e){
			this.unbind('toto', arguments.callee) ;
			trace('LOAD ORIGINAL', e.type)
		})
		
		this.bind('toto', function closure2(e){
			trace('LOAD', e.type)
		})
		
		this.trigger('toto') ;
		this.trigger('toto') ;
		this.trigger('toto') ;
		this.trigger('toto') ;
	}
}, EventDispatcher)) ;