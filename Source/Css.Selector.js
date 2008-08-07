Css.Selector = (function(){
	
	var getId = (function(){
		var ID = 0;
		
		return function (element){
			var id = element.retrieve('css:selector:id');
			
			if (id < 1){
				id = ID += 1;
				element.store('css:selector:id', id);
			}
			
			return id;
		};
	})();
	

	var Part = (function(){
		var cache = new Hash();

		return new Class({

			Implements: Events,

			initialize: function(selector, staticSelector, dynamicPseudos){
				if (cache.has(selector)) return cache.get(selector);
				cache.set(selector, this);
				
				this.selector = selector;
				this.staticSelector = staticSelector;
				this.dynamicPseudos = dynamicPseudos || [];
		
				this.alwaysComplies = (this.dynamicPseudos.length < 1);
				this.dynamicPseudosStr = this.dynamicPseudos.join('');
				this.elements = new Hash();
				this.used = false;
			},

			use: function(){
				this.used = true;
					
				this.elements.empty();
								
				document.getElements(this.staticSelector).each(function(element){
					var id = getId(element);
				
					this.elements.set(id, element);
					
					if (this.alwaysComplies) return;
				
					element.addDpEvent(this.dynamicPseudos, this.fireEvent.bind(this, id + '@complies'))
					.addDpEvent(this.dynamicPseudos, 'leave', this.fireEvent.bind(this, id + '@uncomplies'));
				}, this);
				
				return this;
			}
		});
	})();
	

	var cache = new Hash();

	var regExps = {
		dynamics: (/(:active|:focus|:hover)/g),
		specificityA: /:(before|after|first-letter|first-line)/,
		specificityB: /\[|\:|\./g,
		specificityC: /( |\+|>)[a-z]+/ig,
		splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
	};
	
	return new Class({
		
		Extends: Events,

		initialize: function(selector){
			if (cache.has(selector)) return cache.get(selector);
			cache.set(selector, this);
			
			this.selector = selector;
			
			this.alwaysComplies = true;
			this.specificity = 0;
			this.elements = [];
			this.parts = [];
			this.used = false;
	
			var strOriginal = '';
			var strStatic = '';
	
			var result = this.selector.split(regExps.splitter);
	
			(!result[0]) ? result.shift() : result.unshift('', '');
	
			var last = result.getLast();
			if (!last || last.match(/^\s*$/)) result.pop();
	
			for (var i = 0, l = result.length; i < l; i += 3){
				var str = result[i + 1] + (result[i + 2] || '');
		
				var r = str.split(regExps.dynamics);
		
				strStatic += result[i] + r[0];
				strOriginal += result[i] + str;
		
				var dynamicPseudos = r.clean().erase(' ');
				dynamicPseudos.shift();
		
				var part = new Part(strOriginal, strStatic, dynamicPseudos);
		
				if (!part.alwaysComplies) this.alwaysComplies = false;
		
				this.parts.push(part);
			}
		},

		addEvent: function(event, fn){
			if (!this.used) this.update();
	
			if (event == 'complies' && this.alwaysComplies)
				this.elements.each(function(element){
					fn(element, this);
				}, this);
	
			this.parent.apply(this, arguments);
		},

		getElements: function(){
			if (!this.used) this.update();
	
			return this.elements;
		},

		getSpecificity: function(){
			if (this.specificity > 0) return this.specificity;
	
			var str = this.selector.replace(regExps.specificityA, '');
	
			var a = str.split('#').length - 1;
	
			var b = str.match(regExps.specificityB);
			b = (b) ? b.length : 0;
	
			var c = str.match(regExps.specificityC);
			c = (c) ? c.length : 0;
	
			if (str.match(/^[a-z]+/i)) c++;
	
			this.specificity = 100 * a + 10 * b + c;
	
			return this.specificity;	
		},

		update: function(){
			var lastPart = this.parts.getLast();
				
			this.parts.each(function(part){
				if ((!part.alwaysComplies || part == lastPart) && (!part.used || this.used)) part.use();
			}, this);
			
			this.used = true;
			
			this.elements = lastPart.elements;
			
			this.elements.each(function(element){
				var num = 1;
				var el = element;
				
				for (var iLast = this.parts.length - 1, i = iLast; i >= 0; i--){
					var part = this.parts[i];
					
					if (iLast > i) el = el.getParent();
					
					var id = getId(el);
					
					if (part.alwaysComplies || !el) continue;
					
					num--;
					
					part.addEvent(id + '@complies', function(){
						num++;
						
						if (num > 0) this.fireEvent('complies', [element, this]);
					}.bind(this));
					
					part.addEvent(id + '@uncomplies', function(){
						num--;
						
						if (num == 0) this.fireEvent('uncomplies', [element, this]);
					}.bind(this));
			
				}
			}, this);
			
			return this;
		}
	});
})();