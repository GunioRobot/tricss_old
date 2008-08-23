// tricss, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>
 
var Tricss = {
	build: '%build%',
	version: '1.0beta',
};


Tricss.Properties = {};

(function(){

var store = new Hash(), observers = new Events();

var base = {
	getter: $arguments(0),
	initial: '',
	setter: $empty
};

$each(Hash.prototype, function(fn, method){
	if (fn.bind) Tricss.Properties[method] = fn.bind(store);
});

$each(Events.prototype, function(fn, method){
	var method = method.replace('Event', 'Observer');
	Tricss.Properties[method] = fn.bind(observers);
});

Tricss.Properties.get = function(property){
	return Hash.get(store, property) || $extend(base);
};
	
Tricss.Properties.set = function(property, options){
	options = $extend(base, options || {});
	
	return Hash.set(store, property, options);
};

})();