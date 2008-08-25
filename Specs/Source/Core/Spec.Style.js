describe('Style', {
	'inline': function(){
		Tricss.Properties.set('test');
		
		//A matches #a
		var D = new Tricss.Rule('#a', {
			test: {
				value: 0
			}
		});
		
		//B matches #a, overwrites A (inline style)
		$('a').setStyle('test', 0.7);
		
		value_of($('a').getStyle('test')).should_be(0.7);
		
		Tricss.Properties.erase('test');
	},
	
	'importance': function(){
		Tricss.Properties.set('test');
		
		//A: matches #b
		new Tricss.Rule('div#foo div#b', {
			test: {
				value: 0.7
			}
		});

		//B: matches #b, overwrites A (importance)
		new Tricss.Rule('div#b', {
			test: {
				importance: 2,
				value: 0.5
			}
		});
						
		value_of($('b').getStyle('test')).should_be(0.5);
		
		Tricss.Properties.erase('test');
	},
	
	'specificity': function(){
		Tricss.Properties.set('test');
		
		//A: matches #c
		new Tricss.Rule('div#foo div div#c', {
			test: 0.9
		});

		//B: matches #c, overwritten by A (specificity)
		new Tricss.Rule('#c', {
			test: {
				value: 0.1
			}
		});

		//C: matches #c:hover, overwritten by A (specificity)
		new Tricss.Rule('#c:hover', {
			test: {
				importance: 2,
				value: 0.6
			}
		});
		
		value_of($('c').getStyle('test')).should_be(0.9);
		
		$('c').fireEvent('mouseenter');
				
		value_of($('c').getStyle('test')).should_be(0.6);
		
		Tricss.Properties.erase('test');
	}
});