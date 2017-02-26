/*
	global.js [10/08/2016]
*/
global = {};

global.parseArguments = function(list, startIndex, prepend){
	var args = [];
	for(var n = startIndex || 0; n < list.length; n++){
		args.push(list[n]);
	}
	return prepend ? prepend.concat(args) : args;
}

$._ = function(r){
	return $("<div>").html(r.replace(/<img/gi, "<noimg"));
}

global.addCommas = function(num){
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};



// WebGL3D
