Tricss.Rule = new Class({
	initialize: function(a, b){
		return ($type(a) == 'element') ? new Tricss.Rule.Element(a, b)
			: new Tricss.Rule.Selector(a, b);
	}
});

(function(){

function changed(element){	
	if (Tricss.Document && !Tricss.Document.ready){
		if (element.retrieve('tricss:rule:delayed')){
			document.addEvent('tricss:ready', function(){
				changed(element);
			});
			
			element.store('tricss:rule:delayed', true);
		}
		
		return;
	}
		
	var previousValues = element.retrieve('tricss:rule:previousValue', {});
		
	Tricss.Properties.each(function(obj, property){
		var newValue = element.getStyle(property);
		var previousValue = previousValues[property];
						
		if (newValue == previousValue) return;
				
		Tricss.Properties.fireObserver(property, [element, newValue, previousValue]);
		
		previousValues[property] = newValue;
	});
}

Tricss.Rule.Abstract = new Class({
	
	initialize: function(declarations){
		declarations = declarations || {};
		
		this.importances = new Hash();
		this.values = new Hash();
		
		this.setDeclarations(declarations);
	},
	
	attachTo: function(element){
		element.getTricssRules().include(this);
				
		changed(element);
		
		return this;
	},
	
	detatchFrom: function(element){
		element.getTricssRules().erase(this);
		
		changed(element);
		
		return this;
	},
	
	getDeclaration: function(property){
		property = property.hyphenate();
		
		var obj = Tricss.Properties.get(property);
		
		var result = {
			value: this.values.get(property) || obj.initial,
			importance: this.importances.get(property) || 1
		};
		
		obj.getter.call(this, result);
		
		return result;
	},
		
	setDeclaration: function(property, value, importance){
		property = property.hyphenate();
		
		var obj = {
			importance: ($chk(importance)) ? importance : 1,
			value: value
		};
		
		var prevent = Tricss.Properties.get(property).setter.call(this, obj);
		
		if (prevent !== true){
			this.values.set(property, obj.value);
			this.importances.set(property, obj.importance);
		}
				
		this.getElements().each(changed);
		
		return this;
	},
	
	setDeclarations: function(declarations){
		$each(declarations, function(obj, property){
			var type = $type(obj);
			
			obj = (type == 'object') ? [obj.value, obj.importance]
				: $splat(obj);
			
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
				
		this.parent(declarations);
		
		this.selector.addEvent('complies', this.attachTo.bind(this));
		this.selector.addEvent('uncomplies', this.detatchFrom.bind(this));
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
		this.element = element;
		
		this.element.getTricssRules().include(this);
		
		this.parent(declarations);
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