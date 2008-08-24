describe('Element.addTricssEvent', {
	'should fire [hover, focus] once': function(){
		var element = new Element('div'), i = 0;
		
		function fn(){
			i++;
			element.removeTricssEvent(['hover', 'focus'], 'enter', fn);
		};
				
		element.addTricssEvent(['hover', 'focus'], 'enter', fn);
		element.addTricssEvent(['hover', 'focus'], 'enter', fn);
		
		element.fireEvent('mouseenter');
		element.fireEvent('focus');
		element.fireEvent('blur');
		element.fireEvent('focus');
		
		value_of(i).should_be(1);
	}
});