/*var originalSetStyle = Element.prototype.setStyle;

Element.implement('setStyle', function(property, value){
	if (Css.Animations.CssProperties.contains(property)){
		var decorator = this.retrieve('Css.Animations.decorator');
		if (decorator) decorator.inlineStyles.set(property, value);
	}

	originalSetStyle.apply(this, arguments);
});*/

document.addEvent('css:ready', function(rules){
	rules.each(function(){
		
	});
});