trace('in test') ;


Type.customDefinitionChecks(function(properties, def){
	return properties ;
}) ;

var Toto ;
trace((new (Type.getDefinitionByHash((Type.define({
	inherits:EventDispatcher,
	constructor:Toto = function Toto(){
		trace('Toto is here !!!') ;
		trace(this)
		trace(Toto.slot.model.mixins[0]).apply(this , ['prout']) ;
	}
}, IEvent, {
	constructor:function faisPlouf(){
		trace("Jte casse la gueuele") ;
	}
})).slot.hashcode))) instanceof EventDispatcher)