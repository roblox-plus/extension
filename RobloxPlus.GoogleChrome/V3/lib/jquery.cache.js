/*
	jquery.cache.js [10/15/2016]
*/
$.cache = (function(){
	var cache = {
		global: {}
	};
	var expiries = {
		global: {}
	};
	var cacheId = 0;
	var cacheObject;
	
	
	cacheObject = $.addTrigger(function(key, value, expiry){
		if(typeof(key) == "function"){
			var name = key.name || key.functionPath;
			var id = ++cacheId;
			expiry = value;
			var inProgress = {};
			var completed = {};
			
			return function(){
				var cacheKey = {};
				var callBack;
				var args = [];
				for(var n = 0; n < arguments.length; n++){
					if(typeof(arguments[n]) != "function"){
						args.push(cacheKey[n] = arguments[n]);
					}else{
						callBack = arguments[n];
						args.push(function(){
							completed[cacheKey] = global.parseArguments(arguments);
							while(inProgress[cacheKey] && inProgress[cacheKey].length){
								inProgress[cacheKey].shift().apply(this, completed[cacheKey]);
							}
							delete inProgress[cacheKey];
							if(expiry > 0){
								setTimeout(function(){
									delete completed[cacheKey];
								}, expiry);
							}
						});
					}
				}
				cacheKey = JSON.stringify(cacheKey).toLowerCase();
				
				if(callBack){
					if(completed.hasOwnProperty(cacheKey)){
						callBack.apply(this, completed[cacheKey]);
					}else{						
						if(inProgress.hasOwnProperty(cacheKey)){
							inProgress[cacheKey].push(callBack);
							return;
						}else{
							inProgress[cacheKey] = [callBack];
						}
						key.apply(this, args);
					}
				}else{
					key.apply(this, args);
				}
			};
		}
		
		if(typeof(value) == "function"){
			return request.send({
				request: "$.cache.get",
				key: key
			}, value);
		}
		
		return request.send({
			request: "$.cache.set",
			key: key,
			value: value,
			expiry: Number(expiry) || 0
		});
	}, "$.cache");
	
	cacheObject.delete = function(key){
		request.send({
			request: "$.cache.delete",
			key: key
		});
	};
	
	
	
	if(ext.isBackground){
		function cache_get(key){
			return cache.global[key];
		}
		
		function cache_set(key, value, expiry){
			cache.global[key] = value;
			if(expiries.global.hasOwnProperty(key)){
				clearTimeout(expiries.global[key]);
			}
			if(expiry > 0){
				expiries.global[key] = setTimeout(cache_delete, expiry, key);
			}
		}
		
		function cache_delete(key){
			delete expiries.global[key];
			delete cache.global[key];
		}
		
		
		cacheObject.getListener = request.sent(function(data, callBack){
			if(Array.isArray(data.key)){
				var values = {};
				data.key.forEach(function(key){
					values[key] = cache_get(key);
				});
				callBack(values);
			}else if(typeof(data.key) == "string"){
				callBack(cache_get(data.key));
			}else{
				callBack();
			}
		}, "$.cache.get").connect();
		
		cacheObject.updateListner = request.sent(function(data, callBack){
			if(typeof(data.key) == "string"){
				cache_set(data.key, data.value, data.expiry);
			}else if(typeof(data.key) == "object"){
				for(var n in data.key){
					cache_set(n, data.key[n], data.expiry);
				}
			}
		}, "$.cache.set").connect();
		
		cacheObject.deleteListener = request.sent(function(data, callBack){
			if(typeof(data.key) == "string"){
				cache_delete(data.key);
			}else if(Array.isArray(data.key)){
				data.key.forEach(function(key){
					cache_delete(key);
				});
			}
		}, "$.cache.delete").connect();
	}
	
	
	
	return cacheObject;
})();



// WebGL3D
