(function(){

var parentGet = Element.prototype.getStyle;
var parentSet = Element.prototype.setStyle;

Element.implement({
	
	getStyle: function(property){
		if (Tricss.Properties.has(property)){
			var rules = this.getTricssRules(), value = null, importance = 0, specificity = 0;
			
			rules.each(function(rule, i){
				var rValue = rule.getDeclaration(property).value;
				
				if (!$chk(rValue)) return;
				
				var rImportance = rule.importances.get(property);
				if (rImportance < importance) return;
				
				var rSpecificity = rule.getSpecificity();
				if (rImportance == importance && rSpecificity < specificity) return;
								
				value = rValue;
				importance = rImportance;
				specificity = rSpecificity;
			});
			
			return value || Tricss.Properties.get(property).initial;
		}
		return parentGet.apply(this, arguments);
	},
	
	setStyle: function(property, value){
		if (Tricss.Properties.has(property)){
			var inlineRule = this.retrieve('tricss:inlineRule');
			
			if (!inlineRule){
				inlineRule = new Css.Rule(this);
				this.store('tricss:inlineRule', inlineRule);
			}
			
			inlineRule.setDeclaration(property, value, 3);
		}
		
		return parentSet.apply(this, arguments);
	}
});

})();