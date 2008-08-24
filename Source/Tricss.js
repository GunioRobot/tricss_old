// tricss, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>
 
var Tricss = {
	build: '%build%',
	version: '1.0beta',
};


Tricss.Properties = {};

(function(){

var store = {}, observers = new Events();

var base = {
	getter: $empty,
	initial: '',
	setter: $empty
};

$each(Hash.prototype, function(fn, method){
	Tricss.Properties[method] = function(){
		var result = fn.apply(store, arguments);
		
		return (result == store) ? Tricss.Properties : result;
	}
});

$each(Events.prototype, function(fn, method){
	method = (method == 'addEvent') ? 'observe'
		: (method == 'removeEvent') ? 'unobserve'
		: method.replace('Event', 'Observer');
	
	Tricss.Properties[method] = function(){
		fn.apply(observers, arguments);
		
		return Tricss.Properties;
	};
});

Tricss.Properties.get = function(property){
	return Hash.get(store, property) || $extend({}, base);
};
	
Tricss.Properties.set = function(property, options){
	options = $extend($extend({}, base), options || {});
	
	Hash.set(store, property, options);
	
	return Tricss.Properties;
};

})();