Css.Rule = new Class({
	
	initialize: function(selector, declarations){
		declarations = declarations || {};
		this.importances = new Hash();
		this.values = new Hash();
		this.element = false;

		if ($type(selector) == 'element'){
			this.selector = {
				getSpecificity: $lambda(0)
			};
			this.element = selector;
			
			var rules = this.element.retrieve('Css.Rule.rules');
			if (!rules){
				rules = [];
				this.element.store('Css.Rule.rules', rules);
			}
			rules.include(this);
		} else {
			this.selector = new Css.Selector(selector);
			
			this.selector.addEvent('complies', this.attachTo.bind(this));
			this.selector.addEvent('uncomplies', this.detachFrom.bind(this));
			
			if (this.selector.alwaysComplies) this.selector.elements.each(this.attachTo, this);
		}
		
		this.setDeclarations(declarations);
	},
	
	attachTo: function(element){
		this._attach_(element, false).changed(element);
		return this;
	},
	
	detachFrom: function(element){
		this._attach_(element, true).changed(element);
		return this;
	},
	
	_attach_: function(element, remove){
		var rules = element.retrieve('Css.Rule.rules');
		if (!rules){
			rules = [];
			element.store('Css.Rule.rules', rules);
		}
		rules[(remove === true) ? 'erase' : 'include'](this);
				
		this.changed(element);
				
		return this;
	},
	
	changed: function(element){
		if (element.retrieve('Css.Rule.attached') == true) return this;
		
		(function(){
			Css.Properties.each(function(obj, property){
				element.store('Css.Rule.attached', false);
				
				var newValue = element.getStyle(property);
				var previousValue = element.retrieve('Css.Rule.previousValue.' + property);
				
				if (newValue == previousValue) return;
					
				Css.Properties.fireEvent(property + 'Change', [element, newValue]);
					
				element.store('Css.Rule.previousValue.' + property, newValue);
			});
		}).delay(1, this);
		
		element.store('Css.Rule.attached', true);
		
		return this;
	},
	
	getAffectedElements: function(){
		return (this.element) ? [this.element] : this.selector.elements.getValues();
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
		
		this.getAffectedElements().each(this.changed, this);
		
		return this;
	},
	
	setDeclarations: function(declarations){
		Hash.each(declarations, function(obj, property){
			this.setDeclaration(property, obj.value, obj.importance);
		}, this);
		
		return this;
	}
});