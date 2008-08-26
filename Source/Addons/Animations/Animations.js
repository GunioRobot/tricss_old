// tricss: Css Animations, Copyright 2008 (c) Chris Schneider, <http://www.chrisbk.de>

(function(){

var defaultCssProperties = ['background-color', 'background-position', 'border-bottom-color',
	'border-bottom-width', 'border-left-color', 'border-left-width', 'border-right-color',
	'border-right-width', 'border-top-color', 'border-top-width', 'bottom', 'color', 'font-size',
	'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'margin-bottom',
	'margin-left', 'margin-right', 'margin-top', 'max-height', 'max-width', 'opacity',
	'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'right', 'text-indent',
	'top', 'width', 'z-index'];

var defaultDurations = new Hash({
	short: 250,
	normal: 500,
	long: 750
});

var defaultTimeUnits = new Hash({
	'ms': 1,
	's': 1000
});

var defaultTransitions = new Hash({
	linear: Fx.Transitions.linear
});

Fx.Transitions.each(function(obj, transition){
	if (transition == 'extend' || transition == 'linear') return;

	Hash.each(obj, function(fn, ease){
		if ($type(fn) != 'function') return;

		var alias = transition.toLowerCase() + ease.substr(4).hyphenate();
		defaultTransitions.set(alias, fn);
	});
});


Css.Animations = new Class({

	Implements: Options,

	options: {
		aliases: {},
		cssProperties: defaultCssProperties,
		deprecates: false,
		durations: defaultDurations,
		timeUnits: defaultTimeUnits,
		transitions: defaultTransitions
	},

	initialize: function(name, options){
		this.name = name;
		this.setOptions(options);

		if (this.options.deprecates || this.deprecates()) return false;

		this.regexps = {
			duration: new RegExp('([\\d.]+)(' + Hash.getKeys(this.options.timeUnits).join('|') + ')')
		};

		Css.Animations.CssProperties.combine(this.options.cssProperties);
	},

	addElement: function(element){
		Css.Animations.Elements.include(element);
		Css.Animations.getDecorator(element);
		return this;
	},

	change: function(element, options){
		options = this.getAnimationOptions(element, options);

		var decorator = Css.Animations.getDecorator(element);
		decorator.change(options);

		return this;
	},

	deprecates: function(){
		return (!Browser.Engine.webkit && !Browser.Engine.gecko);
	},

	getAnimationOptions: function(element, options){
		options = options || {};

		['duration', 'properties', 'transition'].each(function(p){
			if (!options[p])
				options[p] = element.getStyle(this.options.aliases[p]);
		}, this);

		var match = options.duration.match(this.regexps.duration);
		options.duration = (match) ? match[1].toFloat() * Hash.get(this.options.timeUnits, match[2])
			: (Hash.get(this.options.durations, options.duration) || 0);

		options.properties = (options.properties == 'none') ? []
			: ((options.properties == 'all') ? this.options.cssProperties
			: $splat(options.properties));

		options.transition = Hash.get(this.options.transitions, options.transition);

		return options;
	}
});

Css.Animations.CssProperties = new Hash()

Css.Animations.DefaultCssProperties = defaultCssProperties;
Css.Animations.DefaultDurations = defaultDurations;
Css.Animations.DefaultTimeUnits = defaultCssProperties;
Css.Animations.DefaultTransitions = defaultTransitions;

Css.Animations.Elements = [];

Css.Animations.Regexps = {
	shortHand: /([^\s,]+\s*,\s*)+[^\s,]+|[^\s,]+/gi
};

	
var originalSetStyle = Element.prototype.setStyle;

Element.implement('setStyle', function(property, value){
	if (Css.Animations.CssProperties.contains(property)){
		var decorator = this.retrieve('Css.Animations.decorator');
		if (decorator) decorator.inlineStyles.set(property, value);
	}

	originalSetStyle.apply(this, arguments);
});

// This class is used internally. It's behaviour, name or existence can be changed at any time without any notification!

Css.Animations.Decorator = new Class({
	
	Extends: Fx.Morph,
	
	options: {
		link: 'cancel'
	},
	
	initialize: function(element){
		this.parent(element);
		
		this.tos = {};
		
		this.inlineStyles = new Hash();
		
		$each(this.element.style, function(p){
			this.inlineStyles.set(p, this.element.style[p.camelCase()]);
		}, this);
		
		this.now = new Hash();
		
		(function(){
			Css.Animations.CssProperties.each(function(property){
				this.setStyle(property, this.getStyle(property));
			}, this);
		}).delay(1, this);
	},
	
	change: function(options){		
		if (options.duration < 1 || options.properties.length == 0) return this;
				
		(function(){
			var nows = {}, to = {};
			
			var properties = Css.Animations.CssProperties.filter(function(p){
				if (this.inlineStyles.has(p)) return false;
				
				this.element.style[p.camelCase()] = '';
					
				return true;
			}, this);
						
			properties.each(function(p){
				nows[p] = this.getStyle(p);
			}, this);
			
			Hash.each(nows, function(now, p){
				var from = this.now.get(p);
				
				if (!options.properties.contains(p)){
					this.setStyle(p, to);
				} else {
					this.setStyle(p, from);
					if (from != now) to[p] = [from, now];
				}
			}, this);
			
			this.options.durations = options.duration;
			this.options.transition = options.transition;
						
			var hasChanged = Hash.some(to, function(a, p){
				var b = this.tos[p];
				if (!b) return true;
				return (a[1] != b[1]);
			}, this);

			this.tos = to;
									
			if (hasChanged) this.start(to, options);
			if (hasChanged) console.log(to);
		}).delay(1, this);
		
		return this;
	},
	
	getStyle: function(property){
		if (this.inlineStyles.has(property)) return this.inlineStyles.get(property);
		
		if (property == 'opacity') return (this.element.currentStyle) ? this.element.currentStyle.opacity
				: document.defaultView.getComputedStyle(this.element, '').getPropertyValue('opacity');
		
		return this.element.getStyle(property);
	},
	
	render: function(element, property, value, unit){
	    value = this.serve(value, unit);
				
		if (!value[0]) return;
		
		value = ($type(value) != 'array') ? value
			: (value.length == 3) ? value.rgbToHex()
			: value[0];
		
		if ($type(value) == 'number') value += (unit !== false) ? unit : 'px';
				
		this.setStyle(property, value);
		
		return this;
	},
	
	setStyle: function(property, value){		
		this.now.set(property, value);
				
		if (property == 'opacity' && value == 0) value = 0.001;
		
		originalSetStyle.call(this.element, property, value, true);
		
		return this;
	}
});

Css.Animations.getDecorator = function(element){
	var instance = element.retrieve('Css.Animations.decorator');
	
	if (!instance){
		instance = new Css.Animations.Decorator(element);
		element.store('Css.Animations.decorator', instance);
	}
	
	return instance;
};


var observers = [], triggered = false;

Css.Animations.addObserver = observers.include.bind(observers);

document.addEvent('domready', function(){
	var htmlElement = $$('html')[0];

	function fn(){
		if (triggered) return;
		triggered = true;
		
		observers.each(function(fn){
			fn();
		});
		
		(function(){
			triggered = false;
		}).delay(1);
	}
	
	htmlElement.addEvent('mouseover', fn).addEvent('mouseout', function(event){
		if (event.target == htmlElement) fn();
	})
});


})();