/*
	roblox/xsrfHandler.js [12/10/2016]
*/
(window.Roblox || (Roblox = {})).xsrfHandler = (function(){
	var token = "";
	var validXsrfMethods = [ "POST", "PUT", "DELETE" ];
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
		var isRoblox = !!(options.url || "").match(/^https?:\/\/\w+\.roblox\.com\//);
		options.beforeSend = function(xhr){
			if(isRoblox && validXsrfMethods.includes(options.type)){
				xhr.setRequestHeader(headerName, getToken());
			}
		};
		jxhr.done(promise.resolve);
		jxhr.fail(function(){
			var token = jxhr.getResponseHeader(headerName);
			if(isRoblox && token){
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
