StrawNode Docs
==============

All Documentation for 
The STRAW Project (StrawNode, StrawExpress, StrawJade & extra toolkits)


What does StrawNode do ?
=

StrawNode attempts to take a primordial place in front-end development of applications, 
providing a concrete framework to start apps as quickly as possible.
Node is for Node.js, Straw is for its logic's injection.

Inject Node ways and practices in your EVEN FRONT-END app development.

The goal is indeed to reproduce at closest the way Node, Express, and others do,
with or without Node.js installed.
And also prepare the way for future installation of Node, in any project, adding the 
'is-Node-installed-or-not?' abstraction level, allowing you to start projects 
in Node's mind even without Node...
Node, Express, and Jade best practices are here from the start, only simulated in context of 
in-page js scripts.

Of course, both StrawNode and Node are meant to achieve very different things, but let's still
believe it's good to have Node's best of patterns and practices in front-end realms.

Included in the Straw Project :

- strawnode : Framework for Node environnment simulation
- strawexpress : Framework for solving Front-End common issues
- strawjade : Jade Templating Engine Front-End Parser
- ...


Pre-requisites
=

As a project still in development, one must be indulgent with things that look unstable/unsubtle, 
and understand the further goal of Straw Project yet with some abstraction.
First Node.js has no need to be cross-browser since not evolving in browser environment.
Straw's JS needs to be cross-browser and sometimes, hacky solutions instead of full implementation can 
become lighter compared to some huge Node.js libs that achieve the same plus so much more but that we won't ever need.

A 'portage' job had to be done, selecting what had completely no point in StrawNode (in the web) and omit it.
With the rest of Node's classes/patterns/features the portage job was to see a quickier/lighter solution to it, 
taking in consideration cross-browser coding, and once again, do with the limits of web-context instead of Node.js context...

Some theorical classes will be portable with ease, but some more practical and evironment-related 
will fail in seeing a good portage in browser context.

For example, we have no interest now on porting the Node.js 'Class: dgram.Socket' class into Straw (why not? but not now), 
but implementing the URL, Path, Module Classes seems far more compatible and yet useful.


On the other hand, Node.js isn't prepare for front-end issues such as cross-browsing Class inheritance, in-page events,
deeplinking matched with live AJAX sections, etc... where Straw tries to find a workaround keeping Node's spirit and structure.

Express in Node, achieves quickly handful things, so does StrawExpress, they're just won't really do the same things.

StrawNode is emulation of Node system bases.
StrawExpress is a promotion to webpage context (and features) of Express, to ease and quicken things up,
and StrawJade is eventually just a portage of the parsing original tool for in-page and without-node context.


Overview
=
	
Assuming here that you're used to Node and curious of Straw, 
please enjoy some examples of what you can see in Straw usual practices :



Starting from a Node.js app base, (let's anticipate when Node will be present)
within a Node package looking like this :
	
	
	package.json
	| 
	app.js
	|
	views/
		|
		pages/
		|
		layout.jade
		|
		index.jade
	|
	routes/
		|
		index.js
	|
	public/
		|
		js/
			|
			strawnode.js
			|
			...
		|
		css/
		|
		img/


Recognizing the comfortable Node.js structure, 
but from the StrawNode point of view, 
front-end apps are to reside in public/js/
where a StrawNode's package.json system awaits.

	public/			// your webvisible/public dir
		|
		css/		// styles
		|
		views/		// future browser-jade templates
		|
		js/			// scripts
			|
			strawnode.js
			|
			strawnode_app/
				|
				package.json
				|
				index.js
				|
				steps.js
				|
				node_modules/
					|
					strawexpress.js
					|
					strawexpress_utils.js
					|
					strawjade.js
					|
					betweenjs.js
					|
					node_modules/
						|
						jquery-1.8.0.js
						|
						jquery-ba-hashchange.js
					

In /views/index.jade,
all initialization is called from one js call :
	
	script(type="text/javascript", src="./js/strawnode.js?starter=./strawnode_app/")

This will load strawnode's base in the page
your app's index will be passed as argument to the strawnode module, which will take care of 
connecting to that entry point, at initialisation of app.

As you know ho Node handles Module loading, expect to have various possibilities when calling a Module:
- './my_app_index.js' directly load a module by path ;
- './my_app/index.js' directly load a module by nested path ;
- './my_app/' will look for a 'package.json' file inside of a 'my_app' folder, and if fails, 
will try loading an 'index.js' in same folder, as a fallback behaviour.
If succeeds finding 'package.json' file, such as in Node.js, it will parse inner dependencies and index settings, 
and will handle module loading accordingly for you.

A module can be loaded/required by passing its url as argument in that way.

Later, this module can be required (in script scope) via the use of several aliases.


Up to here, you've visited some of Strawnode's features, app-wise, but in architecture, modules, classes, 
and hierarchy/loading of packages.
Let's see what's StrawExpress is for, and why have it separated from strawnode.js.




Deeper in the example, once dependancies are loaded in my_app_index.js :


	var express = require('Express') ; // strawexpress is now aliased as Express
	
	var app = express() ;
	
	// PAGE LOAD / UNLOAD EVENTS
	app
		.listen('load', function siteload(e){
			app.discard('load', siteload) ;
			// Your Initing code here, as page load event fires...
		})
		
		.listen('unload', function siteunload(e){
			app.discard('unload', siteunload) ;
			// Your Destroying code here, as page load event fires...
		}) ;


Getting Started with StrawNode
=

... to be continued real soon.