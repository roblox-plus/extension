/*
	roblox/xsrfHandler.js [12/10/2016]
*/
(window.Roblox || (Roblox = {})).xsrfHandler = (function(){
	var token = "";
	var validXsrfMethods = [ "POST", "PATCH", "DELETE" ];
	var headerName = "X-CSRF-TOKEN";
	var xsrfTrigger = $.addTrigger({});
	
	function setToken(t){
		if(typeof(t) == "string"){
			xsrfTrigger.trigger("xsrfTokenChanged", token = t);
		}
	}
	
	function getToken(){
		return token;
	}
	
	
	$.ajaxPrefilter(function(options, originalOptions, jxhr){
		var promise = $.Deferred();
		var robloxSubdomain = ((options.url || "").match(/^https?:\/\/(\w+)\.roblox\.com\//) || ["", ""])[1];
		if (robloxSubdomain && validXsrfMethods.includes((options.type || "").toUpperCase())) {
			jxhr.setRequestHeader(headerName, getToken());
		}
		jxhr.done(promise.resolve);
		jxhr.fail(function(){
			var token = jxhr.getResponseHeader(headerName);
			if (robloxSubdomain && token) {
				setToken(token);
				$.ajax(options).then(promise.resolve, promise.reject);
			}else{
				promise.rejectWith(jxhr, global.parseArguments(arguments));
			}
		});
		return promise.promise(jxhr);
	});
	
	
	xsrfTrigger.setToken = setToken;
	xsrfTrigger.getToken = getToken;
	return xsrfTrigger;
})();


// WebGL3D
