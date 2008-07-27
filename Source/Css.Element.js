Css.Element = {};

Element.implement('addDpEvent', function(){
	var instance = this.retrieve('Css.Element.instance');
	if (!instance){
		instance = new Css.Element.Instance(this);
		this.store('Css.Element.instance', instance);
	}
	instance.addEvent.apply(instance, arguments);
	return this;
});

// this class is used internally. It's behaviour, name or existence can be changed at any time without any notification!

Css.Element.Instance = new Class({
		
	initialize: function(element){
		this.element = $(element);
		this.events = new Events();
		this.listeningFor = [];
		this.states = new Hash();
	},
	
	addEvent: function(dynamicPseudos, when, fn){
		if (!fn) fn = ($type(when) == 'function') ? when : $empty;
		when = (when == 'leave') ? '@leave' : '@enter';
		dynamicPseudos = $splat(dynamicPseudos);
		
		dynamicPseudos.each(this.attachDynamicPseudo, this);
		
		var num = 1;
		dynamicPseudos.each(function(dynamicPseudo){
			if (!dynamicPseudo) return;
			
			num--;
			this.events.addEvent(dynamicPseudo + '@enter', function(){
				num++;
				if (when == '@enter' && num == 1) fn();
			}.bind(this));
			
			this.events.addEvent(dynamicPseudo + '@leave', function(){
				num--;
				if (when == '@leave' && num == 0) fn();
			}.bind(this));
		}, this);
	},
	
	attachDynamicPseudo: function(dynamicPseudo){
		if (!dynamicPseudo || this.listeningFor.contains(dynamicPseudo)) return;
		
		this.states.set(dynamicPseudo, false);
		
		var obj = Css.DynamicPseudos.get(dynamicPseudo);
		if (!obj) return;
		
		['enter', 'leave'].each(function(when){
			$splat(obj[when]).each(function(event){
				this.element.addEvent(event, function(){
					var state = (when == 'enter');
					var oldState = this.states.get(dynamicPseudo);
					
					if (state == oldState) return;					
					this.states.set(dynamicPseudo, state);
					
					var suffix = (state) ? '@enter' : '@leave';
					
					this.events.fireEvent(dynamicPseudo + suffix, [this.element, this.states]);
				}.bind(this));
			}, this);
		}, this);
		
		this.listeningFor.push(dynamicPseudo);
	}
});