Element.implement({
	addDynamicPseudoEvent: function(dynamicPseudos, when, fn){
		dynamicPseudos = $splat(dynamicPseudos);
		
		if (!fn){
			fn = when;
			when = 'enter';
		}
		
		dynamicPseudos.each(this.registerDynamicPseudo, this);
		
		var delta = 1;
		
		dynamicPseudos.each(function(dynamicPseudo){			
			delta--;
			
			this.addEvent('tricss:' + dynamicPseudo + ':enter', function(){
				delta++;
				if (when == 'enter' && delta == 1) fn();
			}.bind(this), true);
			
			this.addEvent('tricss:' + dynamicPseudo + ':leave', function(){
				delta--;
				if (when == 'leave' && delta == 0) fn();
			}.bind(this), true);
		}, this);
		
		if (delta == 1) fn();
		
		return this;
	},
	
	registerDynamicPseudo: function(dynamicPseudo){		
		if (!Css.DynamicPseudos.has(dynamicPseudo)) return this;
				
		if (!this.registeredDynamicPseudos) this.registeredDynamicPseudos = [];
		else if (this.registeredDynamicPseudos.contains(dynamicPseudo)) return this;
				
		if (!this.state) this.state = [];
		
		var obj = Css.DynamicPseudos.get(dynamicPseudo);
		
		['enter', 'leave'].each(function(when){
			$splat(obj[when]).each(function(event){
				this.addEvent(event, function(){
					var is = (when == 'enter'), was = this.state.contains(dynamicPseudo);
					
					if (is == was) return;
					
					this.state[is ? 'push' : 'erase'](dynamicPseudo);
					
					this.fireEvent('tricss:' + dynamicPseudo + ':' + when);
				}.bind(this));
			}, this);
		}, this);
		
		this.registeredDynamicPseudos.push(dynamicPseudo);
		
		return this;
	}
});

Element.alias('addDynamicPseudoEvent', 'addDpEvent');