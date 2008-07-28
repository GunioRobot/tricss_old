// tricss, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>

var Css = {
	version: '1.0beta'
};

Css.DynamicPseudos = new Hash({
	
	':active': {
		enter: 'mousedown',
		leave: ['mouseup', 'mouseout']
	},
	
	':focus': {
		enter: 'focus',
		leave: 'blur'
	},
	
	':hover': {
		enter: 'mouseenter',
		leave: 'mouseleave'
	}
});

Css.Properties = new new Class({
	
	// Extend: Hash,
	Implements: Events,
	
	initialize: function(){
		this.properties = new Hash();
	},
	
	each: function(){
		return this.properties.each.apply(this.properties, arguments);
	},
	
	get: function(property){
		return this.properties.get.apply(this.properties, arguments);
	},
	
	has: function(){
		return this.properties.has.apply(this.properties, arguments);
	},
	
	set: function(property, options){
		var obj = Hash.extend({
			getter: false,
			initial: null,
			setter: false
		}, options);
		this.properties.set(property, obj);
	}
})();