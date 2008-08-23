Tricss.Rule = new Class({
	initialize: function(a, b){
		return ($type(a) == 'element') ? new Tricss.Rule.Inline(a, b)
			: new Tricss.Rule.Css(a, b);
	}
});

(function(){
	
	
function triggerChange(element){
	if (element.retrieve('tricss:rule:observed') == true) return;

	element.store('tricss:rule:observed', true);

	(function(){
		Css.Properties.each(function(obj, property){
			element.store('tricss:rule:observed', false);

			var newValue = element.getStyle(property);
			var previousValue = element.retrieve('tricss:rule:previousValue:' + property);

			if (newValue == previousValue) return;

			Css.Properties.fireObserver(property, [element, newValue, previousValue]);

			element.store('tricss:rule:previousValue:' + property, newValue);
		});
	}).delay(1, this);
};

Tricss.Rule.Abstract = new Class({
	
	initialize: function(selector, declarations){
		declarations = declarations || {};
		
		this.importances = new Hash();
		this.values = new Hash();
		
		this.setDeclarations(declarations);
	},
	
	attachTo: function(element){
		element.getTricssRules().include(this);
		
		triggerChange(element);
		
		return this;
	},
	
	detatchFrom: function(element){
		element.getTricssRules().erase(this);
		
		triggerChange(element);
		
		return this;
	},
	
	getDeclaration: function(property){
		property = property.hyphenate();
		
		return Css.Properties.get(property).getter.call(this, {
			value: this.values.get(property),
			importance: this.importances.get(property)
		});
	},
		
	setDeclaration: function(property, value, importance){
		property = property.hyphenate();
		importance = ($chk(importance)) ? importance : 1;
		
		var prevent = Css.Properties.get(property).setter.call(this, value, importance);
		
		if (prevent !== true){
			this.values.set(property, value);
			this.importances.set(property, importance);
		}
				
		this.getElements().each(triggerChange);
		
		return this;
	},
	
	setDeclarations: function(declarations){
		$each(declarations, function(obj, property){
			this.setDeclaration(property, obj.value, obj.importance);
		}, this);
		
		return this;
	}
});

})();


Css.Rule.Selector = new Class({
	
	Extends: Css.Rule.Abstract,
	
	initialize: function(selector, declarations){
		this.parent(declarations);
		
		this.selector = ($type(selector) == 'string') ? new Css.Selector(selector)
			: selector;
				
		this.selector.addEvent('complies', this.attachTo.bind(this));
		this.selector.addEvent('uncomplies', this.detatchFrom.bind(this));
		
		if (this.selector.alwaysComplies) this.selector.elements.each(this.attachTo, this);
	},
	
	getElements: function(){
		return this.selector.getElements();
	},
	
	getSpecificity: function(){
		return this.selector.getSpecificity();
	}
});


Css.Rule.Inline = new Class({
	
	Extends: Css.Rule.Abstract,
	
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
	return this.retrieve('tricss:rules:rules', []);
});