describe('Parser', {
	'single declaration': function(){
		var d = Tricss.Parser.declarations("foo: bar;");
		value_of(d.foo.value).should_be('bar');
	},
	
	'declarations': function(){
		var d = Tricss.Parser.declarations("foo: bar;\nbla: blub;");
		value_of(d).should_be({
			bla: {
				important: false,
				value: 'blub'
			},
			foo: {
				important: false,
				value: 'bar'
			}
		});
	},
	
	'declarations whitespaces': function(){
		var d = Tricss.Parser.declarations("  a: b;\n  \n \t\t  c: d;");
		value_of(d).should_be({
			a: {
				important: false,
				value: 'b'
			},
			c: {
				important: false,
				value: 'd'
			}
		});
	},
	
	'declaration importance': function(){
		var d = Tricss.Parser.declarations("me: we !important;");
		value_of(d.me).should_be({important: true, value: 'we'});
	},
	
	'rules selector': function(){
		var r = Tricss.Parser.rules("div#foo:hover:focus  a .moep{}")[0];
		value_of(r.selector).should_be('div#foo:hover:focus  a .moep');
	},
	
	'rules body': function(){
		var r = Tricss.Parser.rules("div {:body:}")[0];
		value_of(r.body).should_be(':body:');
	}
});