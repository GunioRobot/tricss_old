Tricss.Document = {
	
	ready: false,
	rules: [],
	rawRules: [],
	
	addCss: function(css){
		var rules = [], rawRules = Tricss.Parser.rules(css, true);
		
		this.rawRules.extend(rawRules);
		
		rawRules.each(function(rule){
			var has = false;
			
			var declarations = Hash.filter(rule.declarations, function(declaration, property){
				if (!Tricss.Properties.has(property)) return false;
				has = true;
				return true;
			});
			
			if (has) rules.push(new Tricss.Rule(rule.selector, declarations));
		});
		
		this.rules.extend(rules);
		
		return this;
	},
	
	addStylesheet: function(element, fn){
		fn = fn || $empty;
		
		this.getCss(element, function(css){
			this.addCss(css);
			fn();
		});
		
		return this;
	},
	
	getCss: function(element, fn){
		switch (element.get('tag')){
		case 'style':
			fn.call(this, element.get('html'));
		break;
		case 'link':
			new Request({
				onSuccess: function(css){
					fn.call(this, css);
				}.bind(this),
				onFailure: function(xhr){
					if (document.location.href.slice(0, 5) == 'file:')
						fn.call(this, xhr.responseText);
				}.bind(this),
				url: element.href,
				method: 'get'
			}).send();
		}
	},
	
	process: function(){
		var delta = 1;
		
		var fn = (function(){
			if (!this.ready && delta == 1){
				this.ready = true;
				window.fireEvent('tricss:ready', [this.rules]);
			}
		}).bind(this);
				
		Array.each(document.styleSheets, function(styleSheet){			
			if ($type(styleSheet) != 'object') return;
			delta--;
						
			if (!styleSheet.ownerNode && !styleSheet.owningElement) return;
						
			var element = $(styleSheet[styleSheet.ownerNode ? 'ownerNode' : 'owningElement']);
						
			this.addStylesheet(element, function(){
				delta++;
				fn();
			});
		}, this);
				
		fn();
		
		return this;
	}
};

window.addEvent('domready', Tricss.Document.process.bind(Tricss.Document));