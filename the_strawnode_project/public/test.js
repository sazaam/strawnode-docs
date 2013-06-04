trace('in test') ;


Type.customDefinitionChecks(function(properties, def){
	return properties ;
}) ;

var Toto ;
trace((new (Type.getDefinitionByHash((Type.define({
	constructor:Toto = function Toto(){
		trace('Toto is here !!!') ;
		
		Toto.slot.model.mixins[0].apply(this ) ;
		var t = this ;
		// ready as an EventListener
		this.bind('toto', function(e){
			t.unbind('toto', arguments.callee) ;
			t.faisPlouf() ;
			trace('LOAD', e.type)
		})
		
		this.bind('toto', function(e){
			t.faisPlouf() ;
			trace('LOAD', e.type)
		})
		
		this.trigger('toto') ;
	}
}, EventDispatcher, {
	faisPlouf:function faisPlouf(){
		return trace("Jte casse la gueuele") ;
	}
})).slot.hashcode))) instanceof EventDispatcher)