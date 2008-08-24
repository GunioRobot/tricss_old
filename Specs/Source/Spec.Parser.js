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
		var r = Tricss.Parser.rules("div#foo:hover:focus  a .moep{}");
		value_of(r[0].selector).should_be('div#foo:hover:focus  a .moep');
	},
	
	'rules body': function(){
		var r = Tricss.Parser.rules("div {:body:}")[0];
		value_of(r.body).should_be(':body:');
	},
	
	'complex': function(){
		var str = "/* --------------------\n * @Layout\n */\n\nhtml {\n  overflow: hidden;\n}\n\n/*  */  body, \n#container {\n  overflow: hidden;\n  padding: 0;\n  margin: 0;\n}";
		var rules = Tricss.Parser.rules(str);
		value_of(rules[0].selector.clean()).should_be('html');
		value_of(rules[1].selector.clean()).should_be("body");
		value_of(rules[2].selector.clean()).should_be("#container");
	},
	
	'empty body': function(){
		var rules = Tricss.Parser.rules("div {\n}");
		value_of(rules[0].body).should_be("\n");
	}
});