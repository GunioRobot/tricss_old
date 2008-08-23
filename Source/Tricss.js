// tricss, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>

var Tricss = {
	build: '%build%',
	version: '1.0beta',
};

Tricss.Properties = new new Class({
	
	Extends: Hash,
	Implements: Events,
			
	initialize: function(){
		this.default = {
			getter: $arguments(0),
			initial: '',
			setter: $empty
		};
	},
	
	get: function(property){
		return this.parent(property) || $extend(this.default);
	},
	
	set: function(property, options){
		options = $extend(this.default, options);
		
		return this.parent(property, options);
	}
})();

$each(Events.prototype, function(fn, method){
	var newMethod = method.replace('Event', 'Observer');
	Tricss.Properties[newMethod] = fn;
	delete Tricss.Properties[method]
});