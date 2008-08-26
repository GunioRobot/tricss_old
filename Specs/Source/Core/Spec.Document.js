(function(){

var fired = 0;
var wasReady = Tricss.Document.ready;

window.addEvent('tricss:ready', function(){
	fired++;
});

describe('Document', {
	'ready': function(){
		value_of(wasReady).should_be(false);
		value_of(fired).should_be(1);
		value_of(Tricss.Document.ready).should_be(true);
	},
	
	'style sheet added?': function(){
		value_of(Tricss.Document.rawRules).should_have_at_least(30, 'items');
	},
	
	'adding css': function(){		
		Tricss.Document.addCss('#ba { be: qu; }');
		var rule = Tricss.Document.rawRules.getLast();
		
		value_of(rule.selector).should_be('#ba');
		value_of(rule.body).should_be(' be: qu; ');
		value_of(rule.declarations).should_be({be: {important: false, value: 'qu'}});
	},

	'adding known css': function(){
		Tricss.Properties.set('blub');
		
		Tricss.Document.addCss('.rt { blub: 266px; }');
		var rule = Tricss.Document.rules.getLast();
		
		value_of(rule.getDeclaration('blub').value).should_be('266px');
		
		Tricss.Properties.erase('blub');
	},
	
	'<style>': function(){
		var has = Tricss.Document.rawRules.some(function(rule){
			return (rule.selector.contains('#spec-document-test')
				&& rule.body.contains('font-size'));
		});
		value_of(has).should_be(true);
	}
});

})();