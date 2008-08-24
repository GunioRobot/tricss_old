(function(){

var regexps = {
	comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
	declarations: /\s*([a-z-]+)\s*:\s*([^;]+?)\s*(!important)?\s*;/gi,
	rules: /((?:.+,\s+)*?.+?)\s*{([^}]*)}/gim
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
			var selector = result[1], body = result[2];
			
			var prototype = {
				body: body,
				declarations: (parseDeclarations) ? Tricss.Parser.declarations(body) : false,
			};
			
			if (selector.contains(',')){
				var selectors = selector.split(',');
				
				for(var i = 0, l = selectors.length; i < l; i++)
					rules.push(
						$extend({ selector: selectors[i] }, prototype)
					);
			} else {
				prototype.selector = selector;
				
				rules.push(prototype);
			}
		}
		
		return rules;
	}
};

})();