

window.DocsArticles = {
	_leaves: ['strawnode', 'betweenjs', 'type', 'shaders', 'modelling', 'procedural', 'tweens'],

	load : function(resources, done){
		var target = resources[0] ;
		if(!target || !target.en) { if(done) done() ; return ; }

		var self = this ;
		var en = target.en.translation ;
		var ko = !!target.ko ? target.ko.translation : null ;
		var perLeaf = !!ko ? 2 : 1 ;
		var pending = this._leaves.length * perLeaf ;

		var settle = function(){
			if(--pending === 0 && done) setTimeout(done, 0) ;
		} ;

		this._leaves.forEach(function(leaf){
			var confs = ko
				? [ {res:en, url:'/docs/' + leaf + '.md'}, {res:ko, url:'/docs/ko/' + leaf + '.md'} ]
				: [ {res:en, url:'/docs/' + leaf + '.md'} ] ;
			confs.forEach(function(conf){
				var xhr = new XMLHttpRequest() ;
				xhr.open('GET', conf.url) ;
				xhr.onload = function(){
					if(xhr.status === 200 && conf.res[leaf]){
						conf.res[leaf].article = xhr.responseText ;
					}
					settle() ;
				} ;
				xhr.onerror = function(){ settle() ; } ;
				xhr.send() ;
			}) ;
		}) ;
	}
} ;
