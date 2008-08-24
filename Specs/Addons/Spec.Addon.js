describe('Addon', {
	'initialize': function(){
		var addon = new Tricss.Addon('A', {
			onChange: function(element, styles){
				//log('set to: x = ' + styles.x + ', y = ' + styles.y);
			},
			prefix: '-addon-test',
			properties: {
				a: {
					initial: 'foo'
				},
				b: {
					initial: 6
				}
			}
		});
		value_of(!!addon).should_be_true();
	},
	
	'Tricss.Addons': function(){
		var addon = Tricss.Addons.get('A');
		value_of(addon instanceof Tricss.Addon).should_be_true();
	},
	
	'Tricss.Properties': function(){
		value_of(Tricss.Properties.get('-addon-test-a').initial).should_be('foo');
		value_of(Tricss.Properties.get('-addon-test-b').initial).should_be(6);
	},
	
	'element\'s initial values': function(){
		value_of($('a').getStyle('-addon-test-a')).should_be('foo');
		value_of($('b').getStyle('-addon-test-b')).should_be(6);		
	},
	
	'default short hand': function(){
		value_of($('a').getStyle('-addon-test')).should_be('foo 6');
	},
	
	'removal': function(){
		Tricss.Addons.get('A').remove();
		
		value_of(Tricss.Properties.has('-addon-test-a')).should_be_false();
		value_of($('b').getStyle('-addon-test-b')).should_be_false();
		value_of(Tricss.Addons.has('A')).should_be_false();		
	},
	
	'shorthand setter + getter': function(){
		var addon = new Tricss.Addon('B', {
			prefix: '-addon-test',
			properties: {
				bla: {
					initial: 'blub'
				}
			},
			shorthandGetter: function(obj){
				obj.value = '<' + this.getDeclaration('-addon-test-bla').value + '>';
			},
			shorthandSetter: function(obj){
				this.setDeclaration('-addon-test-bla', obj.value.toUpperCase(), obj.importance);
				return true;
			}
		});
		
		var element = new Element('div').setStyle('-addon-test', 'bUlB');
		
		value_of(element.getStyle('-addon-test')).should_be('<BULB>');
		
		addon.remove();
	},
	
	'onChange': function(){
		var i = 0;
		
		var addon = new Tricss.Addon('C', {
			prefix: '-addon-test',
			properties: {
				cow: {
					initial: 'moo'
				}
			},
			onChange: function(element,now){
				if (now.cow == 'milk!') i++;
			}
		});
		
		var element = new Element('div').setStyle('-addon-test-cow', 'milk!');
		
		value_of(i).should_be(1);
		
		addon.remove();
	}
});