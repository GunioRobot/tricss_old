(function(){

var parentGet = Element.prototype.getStyle;
var parentSet = Element.prototype.setStyle;

function getInlineRule(element){
	var inlineRule = this.retrieve('tricss:inlineRule');
	
	if (!inlineRule){
		inlineRule = new Tricss.Rule(element);
		this.store('tricss:inlineRule', inlineRule);
	}
	
	return inlineRule;
}

Element.implement({
	
	getStyle: function(property){
		if (Tricss.Properties.has(property)){
			var rules = this.getTricssRules(), value = null, importance = 0, specificity = 0;
						
			rules.each(function(rule, i){				
				var rValue = rule.values.get(property);
				if (!$chk(rValue)) return;
				
				var rImportance = rule.importances.get(property);
				if (rImportance < importance) return;
				
				var rSpecificity = rule.getSpecificity();
				if (rImportance == importance && rSpecificity < specificity) return;
								
				value = rValue;
				importance = rImportance;
				specificity = rSpecificity;
			});
						
			return value || getInlineRule(this).getDeclaration(property).value;
		}
		return parentGet.apply(this, arguments);
	},
	
	setStyle: function(property, value){
		if (Tricss.Properties.has(property))
			getInlineRule(this).setDeclaration(property, value, 3);
		
		return parentSet.apply(this, arguments);
	}
});

})();