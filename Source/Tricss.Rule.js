Tricss.Rule = new Class({
	initialize: function(a, b){
		return ($type(a) == 'element') ? new Tricss.Rule.Element(a, b)
			: new Tricss.Rule.Selector(a, b);
	}
});

(function(){
	
	
function observe(element){
	var props = element.retrieve('tricss:rule:observer', {previousValues:{}});
	
	if (props.observed) return;
	
	props.observed = true;
		
	(function(){		
		Tricss.Properties.each(function(obj, property){
			props.observed = false;
			
			var newValue = element.getStyle(property);
			var previousValue = props.previousValues[property];
						
			if (newValue == previousValue) return;
			
			Tricss.Properties.fireObserver(property, [element, newValue, previousValue]);
			
			props.previousValues[property] = newValue;
		});
	}).delay(1, this);
};

Tricss.Rule.Abstract = new Class({
	
	initialize: function(declarations){
		declarations = declarations || {};
		
		this.importances = new Hash();
		this.values = new Hash();
		
		this.setDeclarations(declarations);
	},
	
	attachTo: function(element){
		element.getTricssRules().include(this);
		
		observe(element);
		
		return this;
	},
	
	detatchFrom: function(element){
		element.getTricssRules().erase(this);
		
		observe(element);
		
		return this;
	},
	
	getDeclaration: function(property){
		property = property.hyphenate();
						
		return Tricss.Properties.get(property).getter.call(this, {
			value: this.values.get(property),
			importance: this.importances.get(property)
		});
	},
		
	setDeclaration: function(property, value, importance){
		property = property.hyphenate();
		importance = ($chk(importance)) ? importance : 1;
		
		var prevent = Tricss.Properties.get(property).setter.call(this, value, importance);
		
		if (prevent !== true){
			this.values.set(property, value);
			this.importances.set(property, importance);
		}
				
		this.getElements().each(observe);
		
		return this;
	},
	
	setDeclarations: function(declarations){
		$each(declarations, function(obj, property){
			var type = $type(obj);
			
			obj = (type == 'object') ? [obj.value, obj.importance]
				: (type != 'array') ? [obj]
				: obj;
			
			this.setDeclaration(property, obj[0], obj[1]);
		}, this);
		
		return this;
	}
});

})();


Tricss.Rule.Selector = new Class({
	
	Extends: Tricss.Rule.Abstract,
	
	initialize: function(selector, declarations){
		this.selector = ($type(selector) == 'string') ? new Tricss.Selector(selector)
			: selector;
						
		this.selector.addEvent('complies', this.attachTo.bind(this));
		this.selector.addEvent('uncomplies', this.detatchFrom.bind(this));
		
		this.parent(declarations);
	},
	
	getElements: function(){
		return this.selector.getElements();
	},
	
	getSpecificity: function(){
		return this.selector.getSpecificity();
	}
});


Tricss.Rule.Element = new Class({
	
	Extends: Tricss.Rule.Abstract,
	
	initialize: function(element, declarations){
		this.parent(declarations);
		
		this.element = element;
		
		this.element.getTricssRules().include(this);
	},
	
	getElements: function(){
		return [this.element];
	},
	
	getSpecificity: function(){
		return 0;
	}
});


Element.implement('getTricssRules', function(){
	return this.retrieve('tricss:rules', []);
});