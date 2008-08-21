(function(){

var regexps = {
	comments: /\/\*.*?\*\//gi,
	declarations: /\s*([a-z-]+)\s*:\s*([^;]+?)\s*(!important)?\s*;/gi,
	rules: /\s*([^{]+){([^}]*)}/gi
};

Tricss.Parser = {
	declarations: function(css){
		var declarations = {};
		
		while (result = regexps.declarations.exec(css)){			
			declarations[result[1]] = {
				important: (result[3] == '!important'),
				value: result[2]
			};
		}
		
		return declarations;
	},
	
	rules: function(css, parseDeclarations){
		var rules = [];
		
		css = css.replace(regexps.comments, '');
		
		while (result = regexps.rules.exec(css)){
			var rule = {
				body: result[2],
				selector: result[1]
			};
			
			if (parseDeclarations) rule.declarations = Tricss.Parser.declarations(rule.body),
			
			rules.push(rule);
		}
		
		return rules;
	}
};

})();