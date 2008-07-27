Css.Parser = new new Class({
	
	initialize: function(){
		this.regexps = {
			a: /\s*([^{]+){([^}]*)}/gi,
			b: /\s*([a-z-]+)\s*:\s*([^;]+?)\s*(!important)?\s*;/gi,
			comments: /\/\*.*?\*\//gi
		};
	},
	
	addCss: function(text){
		var rules = [];
		text = text.replace(this.regexps.comments, '');
		while (a = this.regexps.a.exec(text)){
			var selector = a[1];
			var declarations = {};
			while (b = this.regexps.b.exec(a[2])){
				if (!Css.Properties.has(b[1])) continue;
				var obj = {
					importance: (b[3] == '!important') ? 2 : 1,
					value: b[2]
				};
				Hash.set(declarations, b[1], obj);
			}
			var rule = new Css.Rule(selector, declarations);
			rules.push(rule);
		}
		return rules;
	},
	
	addStylesheet: function(element){
		switch (element.get('tag')){
			case 'style':
				// IE Probs! (drops custom declarations)
				this.addCss(element.get('html'));
				break;
			case 'link':
				new Request({
					onSuccess: function(text){
						this.addCss(text);
					}.bind(this),
					url: element.href,
					method: 'get'
				}).send();
		}
		return this;
	},
	
	processDocument: function(){
		Hash.each(document.styleSheets, function(styleSheet){
			if (!styleSheet.ownerNode && !styleSheet.owningElement) return;
			var element = $(styleSheet[styleSheet.ownerNode ? 'ownerNode' : 'owningElement']);
			this.addStylesheet(element);
		}, this);
		return this;
	}	
})();

window.addEvent('domready', Css.Parser.processDocument.bind(Css.Parser));