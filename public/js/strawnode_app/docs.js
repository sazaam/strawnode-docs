

window.DocsArticles = {
	_leaves: ['strawnode', 'betweenjs', 'type'],

	load : function(resources, done){
		var target = resources[0] ;
		var pending = this._leaves.length ;
		if(!target || !target.en) { if(done) done() ; return ; }

		var self = this ;
		this._leaves.forEach(function(leaf){
			var xhr = new XMLHttpRequest() ;
			xhr.open('GET', '/docs/' + leaf + '.md') ;
			xhr.onload = function(){
				if(xhr.status === 200 && target.en.translation[leaf]){
					target.en.translation[leaf].article = xhr.responseText ;
					if(target.ko && target.ko.translation[leaf])
						delete target.ko.translation[leaf].article ;
				}
				if(--pending === 0 && done) done() ;
			} ;
			xhr.onerror = function(){
				if(--pending === 0 && done) done() ;
			} ;
			xhr.send() ;
		}) ;
	}
} ;
