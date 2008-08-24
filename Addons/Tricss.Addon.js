Tricss.Plugin = new Class({
	
	Implements: Options,
	
	options: {
		onChange: $empty,
		prefix: '',
		properties: {},
		shorthandGetter: $empty,
		shorthandSetter: $empty
	},
	
	initialize: function(name, options){
		this.name = name;
		this.setOptions(options);
		
		this.Properties = new Hash(this.options.properties);
		
		this.prefix = (this.options.prefix) ? this.options.prefix + '-' : '';
		var properties = [];
		
		this.Properties.each(function(obj, property){
			property = obj.alias = this.prefix + (obj.alias || property);
			properties.push(property);
			
			Tricss.Properties.set(property, {
				initial: obj.initial
			});
						
			Tricss.Properties.observe(property, this.changeFn.bind(this));
		}, this);
		
		if (this.prefix){
			var obj = {};
						
			obj.getter = this.options.shorthandGetter;
			
			if (obj.getter == $empty){
				obj.getter = function(obj){
					var value = properties.map(function(property){
						return this.values.get(property) || Tricss.Properties.get(property).initial;
					}, this).join(' ');
				
					return {
						importance: obj.importance || 1,
						value: value
					};
				};
			}
			
			obj.setter = this.options.shorthandSetter;
			
			if (obj.setter == $empty){
				obj.setter = function(value, importance){
					value.split(/ +/).each(function(value, i){
						console.log(value, properties[i]);
						//if (properties[i]) this.setDeclaration(properties[i], value, importance);
					}, this);
				};
			}
			
			Tricss.Properties.set(this.options.prefix, obj);
		}
		
		Tricss.Plugins.set(this.name, this);
	},
	
	changeFn: function(element){
		var styles = this.Properties.map(function(obj, property){
			console.log(this.prefix + property, element.getStyle(this.prefix + property));
			return element.getStyle(this.prefix + property);
		}, this);
		
		var oldStylesObj = element.retrieve('tricss:plugin:oldStyles', {});
		var oldStyles = oldStylesObj[this.name] || {};

		if (styles.every(function(v, p){ return oldStyles[p] == v; })) return;
		
		console.log(styles.x);
		
		this.options.onChange.call(this, element, styles, oldStyles);
		
		oldStylesObj[this.name] = styles;
	}

});

Tricss.Plugins = new Hash();