/** after: var result = this.selector.split(regExps.splitter); **/

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


/** after: var dynamicPseudos = r.clean().erase(' '); \n dynamicPseudos.shift(); **/

var dynamicPseudos = str.match(Css.Selector.RegExps.dynamics);



splitterIe: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g)
