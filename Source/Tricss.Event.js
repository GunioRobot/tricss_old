Tricss.Events = new Hash({
	active: {
		enter: 'mousedown',
		leave: 'mouseup'
	},
	focus: {
		enter: 'focus',
		leave: 'blur'
	},
	hover: {
		enter: 'mouseenter',
		leave: 'mouseleave'
	}
});

(function(){
	
var ids = [], removers = new Hash();

var obj = {
	addEvent: function(events, when, fn){
		var l = events.length, rmvrs = [], state = [];
			
		var id = ids.indexOf(fn);
		if (id == -1) id = ids.push(fn) - 1;
		id += events.join(',') + when;
			
		if (removers.has(id)) return this;
	
		events.each(function(event){			
			var obj = Tricss.Events.get(event);
			if (!obj) return;
		
			var enter = function(){
				state.include(event);
				if (when == 'enter' && state.length == l) fn();
			}.bind(this);
		
			var leave = function(){
				state.erase(event);
				if (when == 'leave' && state.length == l - 1) fn();
			}.bind(this);
		
			this.addEvent(obj.enter, enter).addEvent(obj.leave, leave);
		
			rmvrs.push(function(){
				this.removeEvent(obj.enter, enter).removeEvent(obj.leave, leave);
			}.bind(this));
		}, this);
	
		removers.set(id, rmvrs);
			
		return this;
	},

	removeEvent: function(events, when, fn){
		var id = ids.indexOf(fn) + events.join(',') + when;
		var rmvrs = removers[id];
	
		if (rmvrs){
			rmvrs.each(function(fn){ fn(); });
			removers.erase(id);
		}
	
		return this;
	}
};

$each(obj, function(multiFn, method){
	var implement = method.replace('Event', 'TricssEvent');
	
	Element.implement(implement, function(event, when, fn){
		if (!fn){
			fn = when;
			when = 'enter';
		}
		
		if ($type(event) == 'array')
			return multiFn.call(this, event, when, fn);
		
		event = Tricss.Events.get(a)[when];
		if (event) this[method](event, fn);
		
		return this;
	});
});

})();