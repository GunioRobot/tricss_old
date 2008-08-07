Css.Rule = new Class({
	
	initialize: function(a, b){
		switch($type(a)){
		case 'element':
			return new Css.Rule.Element(a, b);
		case 'string':
			a = new Css.Selector(a);
		default:
			return new Css.Rule.Selector(a, b);
		}
	}
});

Css.Rule.Abstract = new Class({
	
	initialize: function(selector, declarations){
		declarations = declarations || {};
		this.importances = new Hash();
		this.values = new Hash();
		
		this.setDeclarations(declarations);
	},
	
	attachTo: function(element){
		element.getCssRules().include(this);
		
		Css.Rule.changed(element);
		
		return this;
	},
	
	detatchFrom: function(element){
		element.getCssRules().erase(this);
		
		Css.Rule.changed(element);
		
		return this;
	},
	
	getDeclaration: function(property){
		property = property.hyphenate();
		
		var getter = Css.Properties.get(property).getter;
		
		var obj = {
			importance: this.importances.get(property),
			value: this.values.get(property)
		};
		
		return (!getter) ? obj : getter.call(this, obj);
	},
		
	setDeclaration: function(property, value, importance){
		property = property.hyphenate();
		importance = ($chk(importance)) ? importance : 1;
		
		var setter = Css.Properties.get(property).setter;
				
		if (!setter){
			this.values.set(property, value);
			this.importances.set(property, importance);
		} else {
			setter.call(this, value, importance);
		}
				
		Css.Properties.fireEvent(property + 'Set', [this, value, importance]);
		
		this.getElements().each(Css.Rule.changed, this);
		
		return this;
	},
	
	setDeclarations: function(declarations){
		Hash.each(declarations, function(obj, property){
			this.setDeclaration(property, obj.value, obj.importance);
		}, this);
		
		return this;
	}
});

Css.Rule.Selector = new Class({
	
	Extends: Css.Rule.Abstract,
	
	initialize: function(selector, declarations){
		this.parent(declarations);
		
		this.selector = ($type(selector) == 'string') ? new Css.Selector(selector)
			: selector;
				
		this.selector.addEvent('complies', this.attachTo.bind(this));
		this.selector.addEvent('uncomplies', this.detatchFrom.bind(this));
		
		//if (this.selector.alwaysComplies) this.selector.elements.each(this.attachTo, this);
		
		this.setDeclarations(declarations);
	},
	
	getElements: function(){
		return this.selector.getElements();
	},
	
	getSpecificity: function(){
		return this.selector.getSpecificity();
	}
});


Css.Rule.Element = new Class({
	
	Extends: Css.Rule.Abstract,
	
	initialize: function(element, declarations){
		this.parent(declarations);
		
		this.element = element;
		
		this.element.getCssRules().include(this);
	},
	
	getElements: function(){
		return [this.element];
	},
	
	getSpecificity: function(){
		return 0;
	}
});

Css.Rule.changed = function(element){
	if (element.retrieve('css:rule:hasXyz') == true) return;
	
	element.store('css:rule:hasXyz', true);
	
	(function(){
		Css.Properties.each(function(obj, property){
			element.store('css:rule:hasXyz', false);
			
			var newValue = element.getStyle(property);
			var previousValue = element.retrieve('css:rule:previousValue:' + property);
						
			if (newValue == previousValue) return;
				
			Css.Properties.fireEvent(property + 'Change', [element, newValue]);
				
			element.store('css:rule:previousValue:' + property, newValue);
		});
	}).delay(1, this);
};


Element.implement('getCssRules', function(){
	var rules = this.retrieve('css:rules:rules');

	if (!rules){
		rules = [];
		this.store('css:rules:rules', rules);
	}

	return rules;
});