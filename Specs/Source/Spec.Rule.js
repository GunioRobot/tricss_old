describe('Rule', {
	'delegate to Rule.Element': function(){
		var rule = new Tricss.Rule(new Element('div'));
		value_of(rule instanceof Tricss.Rule.Element).should_be_true();
	},
	
	'delegate to Rule.Selector': function(){
		var rule = new Tricss.Rule('div');
		value_of(rule instanceof Tricss.Rule.Selector).should_be_true();
	},
	
	'get + set value': function(){
		Tricss.Properties.set('spec-rule');
		
		var rule = new Tricss.Rule('div');
		rule.setDeclaration('spec-rule', 'jklö', 3);
		
		value_of(rule.getDeclaration('spec-rule')).should_be({
			importance: 3,
			value: 'jklö'
		});
		
		Tricss.Properties.erase('spec-rule');
	},
	
	'initialize arg declarations': function(){
		Tricss.Properties.set('spec-rule');
		
		var rule = new Tricss.Rule('div', {
			'spec-rule': ['9268', 2]
		});
		
		value_of(rule.getDeclaration('spec-rule')).should_be({
			importance: 2,
			value: '9268'
		});
		
		Tricss.Properties.erase('spec-rule');
	},
	
	'initial values': function(){
		Tricss.Properties.set('spec-rule', {
			initial: 'qwertzu'
		});
		
		var rule = new Tricss.Rule('div');
		
		value_of(rule.getDeclaration('spec-rule')).should_be({
			importance: 1,
			value: 'qwertzu'
		});
		
		Tricss.Properties.erase('spec-rule');
	},
	
	'setDeclarations': function(){
		Tricss.Properties.set('spec-rule:a').set('spec-rule:b');
		
		var rule = new Tricss.Rule('div');
		
		rule.setDeclarations({
			'spec-rule:a': ['bla'],
			'spec-rule:b': ['blub', 2]
		});
		
		value_of(rule.getDeclaration('spec-rule:a').value).should_be('bla');
		value_of(rule.getDeclaration('spec-rule:b').importance).should_be(2);
		
		Tricss.Properties.erase('spec-rule:a').erase('spec-rule:b');
	},
	
	'observing': function(){		
		Tricss.Properties.set('spec-rule');
		
		var i = 0;
				
		function fn(e, n, p){
			i++;
		}
		
		Tricss.Properties.observe('spec-rule', fn);
		
		var rule = new Tricss.Rule(new Element('div'), {
			'spec-rule': 'fghj'
		});
		
		rule.setDeclaration('spec-rule', 'cvbn');
		Tricss.Properties.unobserve('spec-rule', fn);
		rule.setDeclaration('spec-rule', 'nbvc');
				
		value_of(i).should_be(2);
		
		Tricss.Properties.erase('spec-rule');
	}
});

describe('Rule.Element', {
	'getElement': function(){
		var element = new Element('div');
		var rule = new Tricss.Rule.Element(element);
		value_of(rule.getElements()).should_be([element]);
	},
	
	'getSpecificity': function(){
		var rule = new Tricss.Rule.Element(new Element('div'));
		value_of(rule.getSpecificity()).should_be(0);
	},
	
	'get + set value': function(){
		Tricss.Properties.set('spec-rule');
		
		var rule = new Tricss.Rule(new Element('div'));
		rule.setDeclaration('spec-rule', 'jklö', 3);
		
		value_of(rule.getDeclaration('spec-rule')).should_be({
			importance: 3,
			value: 'jklö'
		});
		
		Tricss.Properties.erase('spec-rule');
	}
});

describe('Rule.Selector', {
	'getElement': function(){
		var rule = new Tricss.Rule.Selector('#a');
		value_of(rule.getElements()[0]).should_be($$('#a')[0]);
	},
	
	'getSpecificity': function(){
		var rule = new Tricss.Rule('div#a');
		value_of(rule.getSpecificity()).should_be(101);
	},
	
	'get + set value': function(){
		Tricss.Properties.set('spec-rule');
		
		var rule = new Tricss.Rule('div#a');
		rule.setDeclaration('spec-rule', 'jklö', 3);
		
		value_of(rule.getDeclaration('spec-rule')).should_be({
			importance: 3,
			value: 'jklö'
		});
		
		Tricss.Properties.erase('spec-rule');
	}
});