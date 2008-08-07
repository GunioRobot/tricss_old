Css.Parser = new new Class({
	
	initialize: function(){		
		this.regexps = {
			comments: /\/\*.*?\*\//gi,
			declarations: /\s*([a-z-]+)\s*:\s*([^;]+?)\s*(!important)?\s*;/gi,
			rules: /\s*([^{]+){([^}]*)}/gi
		};
	},
	
	declarations: function(css){
		var declarations = {};
		
		while (result = this.regexps.declarations.exec(css)){
			var property = result[1];
			
			declarations[property] = {
				important: (result[3] == '!important'),
				value: result[2]
			};
		}
		
		return declarations;
	},
	
	rules: function(css, declarations){
		var rules = [];
		
		css = css.replace(this.regexps.comments, '');
		
		while (result = this.regexps.rules.exec(css)){
			var rule = {
				body: result[2],
				selector: result[1]
			};
			
			if (declarations) rule.declarations = this.declarations(rule.body),
			
			rules.push(rule);
		}
		
		return rules;
	}
})();


Css.Document = new new Class({
	
	initialize: function(){
		this.ready = false;
		this.rules = [];
		
		window.addEvent('domready', this.process.bind(this));
	},
	
	addCss: function(css){
		var rules = Css.Parser.rules(css, true);
		
		rules.map(function(rule){
			return new Css.Rule(rule.selector, rule.declarations);
		});
		
		this.rules.extend(rules);
						
		return this;
	},
	
	addStylesheet: function(element, fn){
		fn = fn || $empty;
		
		switch (element.get('tag')){
		case 'style':
			this.addCss(element.get('html')); // IE: drops custom declarations
			fn();
			this.ready = true;
		break;
		case 'link':
			new Request({
				onSuccess: function(text){
					this.addCss(text);
					fn();
				}.bind(this),
				url: element.href,
				method: 'get'
			}).send();
		}
		
		return this;
	},
	
	process: function(){
		var i = 0;
		
		var fn = (function(){
			if (!this.ready && i == 0){
				this.ready = true;
				document.fireEvent('css:ready', [this.rules]);
			}
		}).bind(this);
		
		Hash.each(document.styleSheets, function(styleSheet){
			i++;
			
			if (!styleSheet.ownerNode && !styleSheet.owningElement) return;
			
			var element = $(styleSheet[styleSheet.ownerNode ? 'ownerNode' : 'owningElement']);
			
			this.addStylesheet(element, function(){
				i--;
				fn();
			});
		}, this);
				
		fn();
		
		return this;
	}
})();