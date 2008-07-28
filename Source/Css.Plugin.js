Css.Plugin = new Class({
	
	Implements: Options,
	
	options: {
		onChange: $empty,
		prefix: '',
		properties: {},
		shorthand: false,
		shorthandSetter: false
	},
	
	initialize: function(name, options){
		this.name = name;
		this.setOptions(options);
		this.Properties = new Hash(this.options.properties);
		
		var prefix = this.options.prefix, shorthand = this.options.shorthand;
		
		this.Properties.each(function(obj, property){
			obj.alias = ((prefix) ? prefix + '-' : '') + (obj.alias || property);
			
			Css.Properties.set(obj.alias, {
				initial: obj.initial
			});
			
			Css.Properties.addEvent(obj.alias + 'Change', this.changeFn.bind(this));
		}, this);
		
		if (shorthand){
			var properties = (shorthand === true) ? this.Properties.getKeys()
				: $splat(shorthand);
			
			properties = properties.map(function(property){
				return this.Properties.get(property).alias;
			}, this);
				
			var obj = {};
			
			obj.getter = function(obj){
				var value = properties.map(function(property){
					return this.values.get(property) || Css.Properties.get(property).initial;
				}, this).join(' ');
				
				return {
					importance: obj.importance,
					value: value
				};
			};
			
			obj.setter = this.options.shorthandSetter
				|| function(value, importance){
					var values = value.split(' ');
					properties.each(function(property, i){
						if (values[i]) this.setDeclaration(property, values[i], importance);
					}, this);
				};
			
			Css.Properties.set(this.options.prefix, obj);
		}
		
		Css.Plugins.set(name, this);
	},
	
	changeFn: function(element){
		var styles = this.Properties.map(function(obj, property){
			return element.getStyle(obj.alias);
		});
		var oldStyles = element.retrieve('Css.Plugins.' + this.name + '.styles') || {};

		if (styles.every(function(v, p){ return Hash.get(oldStyles, p) == v; })) return this;
				
		this.options.onChange.call(this, element, styles, oldStyles);
		
		element.store('Css.Plugins.' + this.name + '.styles', styles);
		
		return this;
	}

});

Css.Plugins = new Hash();