Tricss.Document = new new Class({
	
	initialize: function(){
		this.ready = false;
		this.rules = [];
		
		window.addEvent('domready', this.process.bind(this));
	},
	
	addCss: function(css){
		var rules = Tricss.Parser.rules(css, true);
		
		rules.map(function(rule){
			return new Tricss.Rule(rule.selector, rule.declarations);
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
		break;
		case 'link':
			new Request({
				onSuccess: function(css){
					this.addCss(css);
					fn();
				}.bind(this),
				url: element.href,
				method: 'get'
			}).send();
		}
		
		return this;
	},
	
	process: function(){
		var delta = 1;
		
		var fn = (function(){
			if (!this.ready && delta == 1){
				this.ready = true;
				document.fireEvent('tricss:ready', [this.rules]);
			}
		}).bind(this);
		
		Hash.each(document.styleSheets, function(styleSheet){
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
})();