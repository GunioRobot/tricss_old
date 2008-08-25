Tricss.Addon = new Class({
	
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
						
			Tricss.Properties.observe(property, this._changeFn.bind(this));
		}, this);
		
		if (this.prefix){
			var obj = {};
						
			obj.getter = this.options.shorthandGetter;
						
			if (obj.getter == $empty){
				obj.getter = function(obj){		
					obj.value = properties.map(function(property){
						return this.values.get(property) || Tricss.Properties.get(property).initial;
					}, this).join(' ');
				};
			}
			
			obj.setter = this.options.shorthandSetter;
			
			if (this.options.shorthandSetter == $empty){
				obj.setter = function(value, importance){
					value.split(/ +/).each(function(value, i){
						console.log(value, properties[i]);
						//if (properties[i]) this.setDeclaration(properties[i], value, importance);
						return true;
					}, this);
				};
			}
			
			Tricss.Properties.set(this.options.prefix, obj);
		}
		
		Tricss.Addons.set(this.name, this);
	},
	
	_changeFn: function(element){		
		var styles = this.Properties.map(function(obj, property){
			return element.getStyle(this.prefix + property);
		}, this);
		
		var oldStylesObj = element.retrieve('tricss:addon:oldStyles', {});
		var oldStyles = oldStylesObj[this.name] || {};
				
		if (styles.every(function(v, p){ return oldStyles[p] == v; })) return;
		
		this.options.onChange.call(this, element, styles);
		
		oldStylesObj[this.name] = styles;
	},
	
	remove: function(){
		this.Properties.each(function(obj, property){
			Tricss.Properties.erase(obj.alias);
		});
		
		Tricss.Addons.erase(this.name);
				
		return this;
	}
});

Tricss.Addons = new Hash();