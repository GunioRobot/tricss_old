describe('Basic', {
	'info': function(){		
		value_of(!!Tricss.build).should_be_true();
		value_of(!!Tricss.version).should_be_true();
	}
});

describe('Properties', {
	'set + get': function(){
		var obj = {
			getter: function(){ /*a*/ },
			initial: 'testInitial',
			setter: function(){ /*b*/ }
		};
		
		Tricss.Properties.set('specA', obj);
		var got = Tricss.Properties.get('specA');
		
		value_of(got).should_be(obj);
	},
	
	'has': function(){
		value_of(Tricss.Properties.has('specA')).should_be_true();
		value_of(Tricss.Properties.has('asdf')).should_be_false();
	},
	
	'inheriting defaults': function(){
		var obj = {
			getter: $arguments(0),
			initial: 'initialB',
			setter: $empty
		};
		
		Tricss.Properties.set('specB', { initial: 'initialB'});
		var got = Tricss.Properties.get('specB');
		
		value_of(got).should_be(obj);
	},
	
	'undefined properties': function(){
		var got = Tricss.Properties.get('asdf');
		value_of(got).should_be({
			getter: $arguments(0),
			initial: '',
			setter: $empty
		});
	},
	
	'each loop': function(){
		var str = '';
		
		Tricss.Properties.each(function(v, p){
			str += p + ' ';
		});
		
		value_of(str).should_be('specA specB ');
	},
	
	'remove': function(){
		Tricss.Properties.erase('specB');
		value_of(Tricss.Properties.has('specB')).should_be_false();
	},
	
	'observing': function(){
		var i = 0;
		function fn(){ i++; }
		
		Tricss.Properties.observe('test', fn);
		Tricss.Properties.fireObserver('test');
		Tricss.Properties.unobserve('test', fn);
		Tricss.Properties.fireObserver('test');
		
		value_of(i).should_be(1)
	}
});