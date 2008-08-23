// tricss, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>

var Tricss = {
	author: 'Chris Schneider',
	build: '%build%',
	version: '1.0beta',
	website: 'http://www.chrisbk.de/repository/tricss/'
};

Tricss.Properties = new Hash();

(function(){
	var events = new Events();
	
	['addEvent', 'fireEvent', 'removeEvent'].each(function(event){
		var parent = Tricss.Properties[event];
		
		// property, mutatorOrAccessor (find a better name!) ...
		Tricss.Properties[event] = function(){
			arguments[1] = arguments[0] + '@' + arguments[1];
			arguments.shift();
			
			return this.parent.apply(this, arguments);
		};
	});
})();
/*
Tricss.Properties.get = function(){
	return this.get.apply(this.properties, arguments) || Hash.extend(this.default);
};

Tricss.Properties.set = function(){
	var obj = Hash.extend(this.default, options);
	
	this.properties.set(property, obj);
};*/

var Css = Tricss;