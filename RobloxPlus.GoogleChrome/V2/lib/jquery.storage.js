/*
	jquery.storage.js [10/15/2016]
	
	$.storage("key", function(value){}); // Get
	$.storage(["key1", "key2"], function(valuesObject){}); // Get
	$.storage("key", value); // Set
	$.storage({"key1":"value1","key2":"value2"}); // Set
	$.storage.delete("key"); // Delete
	$.storage.delete(["key1", "key2"]); // Delete
	
	$.storage.on("set", function(key, value){});
	$.storage.on("delete", function(key){});
*/
$.storage = $.addTrigger(function(key, value){
	if(typeof(value) == "function"){
		return request.send({
			request: "$.storage.get",
			key: key
		}, value);
	}
	return request.send({
		request: "$.storage.set",
		key: key,
		value: value
	});
}, "$.storage");

$.storage.delete = function(key){
	request.send({
		request: "$.storage.delete",
		key: key
	});
};



(function(){
	if(ext.isBackground){
		function storage_get(key){
			try{
				return JSON.parse(localStorage.getItem(key));
			}catch(e){
				console.warn(e);
			}
		}
		
		function storage_set(key, value){
			var oldValue = storage_get(key);
			if(oldValue != value){
				localStorage.setItem(key, JSON.stringify(value));
				$.storage.broadcast("set", key, value);
			}
		}
		
		function storage_delete(key){
			if(localStorage.hasOwnProperty(key)){
				localStorage.removeItem(key);
				$.storage.broadcast("delete", key);
			}
		}
		
		
		$.storage.getListener = request.sent(function(data, callBack){
			if(Array.isArray(data.key)){
				var values = {};
				data.key.forEach(function(key){
					values[key] = storage_get(key);
				});
				callBack(values);
			}else if(typeof(data.key) == "string"){
				callBack(storage_get(data.key));
			}else{
				callBack();
			}
		}, "$.storage.get").connect();
		
		$.storage.setListener = request.sent(function(data, callBack){
			if(typeof(data.key) == "string"){
				storage_set(data.key, data.value);
			}else if(typeof(data.key) == "object"){
				for(var n in data.key){
					storage_set(n, data.key[n]);
				}
			}
		}, "$.storage.set").connect();
		
		$.storage.deleteListener = request.sent(function(data, callBack){
			if(typeof(data.key) == "string"){
				storage_delete(data.key);
			}else if(Array.isArray(data.key)){
				data.key.forEach(function(key){
					storage_delete(key);
				});
			}
		}, "$.storage.delete").connect();
	}
})();



// WebGL3D
