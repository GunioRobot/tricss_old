// Limitations: (but they shouldn't matter :p)
// <div><div><div id="a"></div></div></div>
// selector: div:hover div#a
// thanks to: Css.Selector.use -> getParent of selector

Css.Selector = new Class({
	
	Extends: Events,
	
	initialize: function(selector){
		if (Css.Selector.Cache.has(selector)) return Css.Selector.Cache.get(selector);
		Css.Selector.Cache.set(selector, this);
		
		this.selector = selector;
		this.alwaysComplies = true;
		this.specificity = 0;
		this.elements = [];
		this.parts = [];
		this.used = false;
				
		var strOriginal = '';
		var strStatic = '';
		var result = this.selector.split(Css.Selector.RegExps.splitter);
		
		// BUGFIX!
		if (Browser.Engine.trident){
			var r = [result[0]];
			var str = this.selector.substr(r[0].length);	
			for (var i = 1; i < result.length; i++){
				var a = result[i];
				var pos = str.indexOf(a);
				var b = str.substr(0, pos - 1).trim() || ' ';
				var c = str.substr(pos - 1, 1);
				r.push(b, c, a);
				str = str.substr(pos + a.length);
			}
			result = r;
		}
						
		(!result[0]) ? result.shift() : result.unshift('', '');
		var last = result.getLast();
		if (!last || last.match(/^\s*$/)) result.pop();
		
		for (var i = 0, l = result.length; i < l; i += 3){
			var str = result[i + 1] + (result[i + 2] || '');
			var r = str.split(Css.Selector.RegExps.dynamics);
			
			strStatic += result[i] + r[0];
			strOriginal += result[i] + str;
			
			// BUGFIX!
			if (Browser.Engine.trident){
				var dynamicPseudos = str.match(Css.Selector.RegExps.dynamics);
			} else {
				var dynamicPseudos = r.clean().erase(' ');
				dynamicPseudos.shift();
			}
			
			var part = new Css.Selector.Part(strOriginal, strStatic, dynamicPseudos);
			if (part.alwaysComplies == false) this.alwaysComplies = false;
			this.parts.push(part);
		}
	},
	
	addEvent: function(event, fn){
		this.use();
		if (event == 'complies' && this.alwaysComplies) this.elements.each(fn, this);
		this.parent.apply(this, arguments);
	},
	
	getSpecificity: function(){
		if (this.specificity > 0) return this.specificity;
		var str = this.selector.replace(Css.Selector.RegExps.specificityA, '');
		var a = str.split('#').length - 1;
		var b = str.match(Css.Selector.RegExps.specificityB);
		b = (b) ? b.length : 0;
		var c = str.match(Css.Selector.RegExps.specificityC);
		c = (c) ? c.length : 0;
		if (str.match(/^[a-z]+/i)) c++;
		this.specificity = 100 * a + 10 * b + c;
		return this.specificity;	
	},
		
	use: function(force){
		force = force || false;
		if (this.used && !force) return this;
		this.used = true;
				
		for (var i = 0, l = this.parts.length; i < l; i++){ 
			this.parts[i].use(force, (i == l - 1));
		}
		
		this.elements = this.parts.getLast().elements;
		
		this.elements.each(function(element){
			var num = 1;
			var el = element;
			
			for (var iLast = this.parts.length - 1, i = iLast; i >= 0; i--){
				var part = this.parts[i];
				// OVERWORK THIS !!!
				if (iLast > i) el = el.getParent();
				var id = Css.Selector.id(el);
				if (part.alwaysComplies || !el) continue;				
				num--;
				
				part.addEvent(id + '@complies', function(){
					num++;
					if (num > 0) this.fireEvent('complies', element);
				}.bind(this));
				part.addEvent(id + '@uncomplies', function(){
					num--;
					if (num == 0) this.fireEvent('uncomplies', element);
				}.bind(this));

			}
		}, this);
		
		return this;
	}
});

Css.Selector.Cache = new Hash();

Css.Selector.RegExps = {
	dynamics: (/(:active|:focus|:hover)/g),
	specificityA: /:(before|after|first-letter|first-line)/,
	specificityB: /\[|\:|\./g,
	specificityC: /( |\+|>)[a-z]+/ig,
	splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
	splitterIE: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g)
};

// This class is used internally. It's behaviour, name or existence can be changed at any time without any notification!

Css.Selector.Part = new Class({
	
	Implements: Events,
	
	initialize: function(selector, staticSelector, dynamicPseudos){
		if (Css.Selector.Part.Cache.has(selector)) return Css.Selector.Part.Cache.get(selector);
		this.selector = selector;
		this.staticSelector = staticSelector;
		this.dynamicPseudos = dynamicPseudos || [];
		this.used = false;
		this.dynamicPseudosStr = this.dynamicPseudos.join('');
		this.elements = new Hash();
		this.alwaysComplies = (this.dynamicPseudos.length < 1);
		Css.Selector.Part.Cache.set(selector, this);
	},
	
	use: function(force, needEls){
		if ((this.used && !force) || (this.alwaysComplies && needEls !== true)) return this;
		this.elements = new Hash();
		
		document.getElements(this.staticSelector).each(function(element){
			var id = Css.Selector.id(element);
			this.elements.set(id, element);
			if (this.alwaysComplies && needEls) return;
			
			element.addDpEvent(this.dynamicPseudos, this.fireEvent.bind(this, id + '@complies'))
				.addDpEvent(this.dynamicPseudos, 'leave', this.fireEvent.bind(this, id + '@uncomplies'));
			}, this);
		
		this.used = true;
		return this;
	}
});

Css.Selector.Part.Cache = new Hash();


Css.Selector.id = function(element){
	var id = element.retrieve('Css.Selector.id');
	if (id < 1){
		id = Css.Selector.ID += 1;
		element.store('Css.Selector.id', id);
	}
	return id;
};
Css.Selector.ID = 0;