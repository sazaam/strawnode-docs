
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('./index', { title: 'The StrawNode Project' });
} ;

exports.structure = function(req, res){
  res.json(JSON.stringify({
  		index:{},
  		about:{
  			index:{}
  		},
  		docs:{
  			index:{},
  			guide:{
  				index:{}
  			},
  			api:{
  				index:{}
  			},
  			examples:{
  				index:{},
  				'/[0-9]+/':{
  					index:{},
  					detail:{
  						index:{},
  						'/[0-9]+/':{
  							index:{}
  						}
  					}
  				}
  			}
  		},
  		download:{
  			index:{}
  		}
  }, null, 4)) ;

  
} ;