describe('Selector', {
	'matches': function(){
		var selectors = [
			'div#b',
			'#a',
			'div #a div',
			'#foo #c',
			'div > input#a',
			'div[id=c]',
			'div:hover',
			'#foo div#b:hover'
		];
		var i = 0, should = 0;
		selectors = ['div:hover'];
		
		selectors.each(function(selector){
			new Tricss.Selector(selector).addEvent('complies', function(){ i++; });
			
			should += $$(selector).length;
		});
				
		value_of(i).should_be(should);
	},
	
	'events': function(){
		var i = 0;
		
		function fn(){
			i++;
		}
		
		var selector = new Tricss.Selector('div#foo:hover div input#a:focus');
		
		selector.addEvent('complies', fn);
		selector.addEvent('uncomplies', fn);
		
		var a = $('foo'), b = $('a');
		a.fireEvent('mouseenter');
		b.fireEvent('focus')
		b.fireEvent('blur')
		a.fireEvent('mouseleave')
		a.fireEvent('mouseenter')
		b.fireEvent('focus')
		b.fireEvent('blur')
		b.fireEvent('blur')
		b.fireEvent('focus')
		a.fireEvent('mouseenter');
		
		value_of(i).should_be(5);
	},
	
	'specificity': function(){
		$each({
			'*': 0,
			'LI': 1,
			'UL LI': 2,
			'UL OL+LI': 3,
			'H1 + *[REL=up]': 11,
			'UL OL LI.red': 13,
			'LI.red.level': 21,
			'#x34y': 100,
			'div#asd a .fg': 112,
			'q#wer .zz u#io p': 213
		}, function(specificity, selector){
			selector = new Tricss.Selector(selector);
			value_of(selector.getSpecificity()).should_be(specificity);
		});
	},
	
	'elements': function(){
		var selector = new Tricss.Selector('#a');
		value_of(selector.getElements()).should_be([$('a')]);
	}
});