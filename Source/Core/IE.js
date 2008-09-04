(function(){

function regExpSplit(str, pattern){
	var r = [];

	var a = str.split(regExps.dynamics);
	var b = str.match(regExps.dynamics);

	for (var i = 0, l = a.length; i < l; i++){
		r.push(a[i]);
		if (b[i]) r.push(b[i].slice(1));
	}

	return r;
}


})