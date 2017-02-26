/*
	ext.js [10/08/2016]
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
browser = (function(userAgentInfo){
	var wholeVersion = userAgentInfo[2].split(".");
	return {
		name: userAgentInfo[1],
		version: userAgentInfo[2],
		wholeVersion: Number(wholeVersion[0]) || 0,
		userAgent: navigator.userAgent,
		userAgentMatch: userAgentInfo[0]
	};
})(navigator.userAgent.match(/(opera|chrome|safari|firefox|msie)\/([\d.]+)/i) || ["Unknown", "0.0"]);



ext = {
	"id": chrome.runtime.id,
	"manifest": chrome.runtime.getManifest(),
	"incognito": chrome.extension.inIncognitoContext,
	"isBackground": location.protocol.startsWith("chrome-extension"),
	"isContentScript": !location.protocol.startsWith("chrome-extension"),
	
	"getUrl": function(path){
		return chrome.extension.getURL(path);
	},
	"reload": function(){
		if(ext.isBackground){
			chrome.runtime.reload();
			return true;
		}else{
			return request.send("ext.reload");
		}
	}
};

console.log(ext.manifest.name + " " + ext.manifest.version + " started" + (ext.incognito ? " in icognito" : ""));



request = {
	connected: true,
	
	callBacks: {
		sent: {},
		requests: {}
	},
	duplicateCatch: {},
	tabs: [],
	thisTab: 0,
	
	generateId: function(){
		return (+new Date) + "_" + (++request.generateId.id);
	},
	
	
	requestHandler: function(data, callBack, sender){
		for(var n in request.callBacks.sent){
			var cb = request.callBacks.sent[n];
			if(!cb.privateId || cb.privateId == data.data.request){
				request.callBacks.sent[n](data.data, function(data){
					if(callBack){
						callBack(data);
						callBack = undefined;
					}
				}, sender);
			}
		}
	},
	
	responseHandler: function(id, data){
		if(request.callBacks.requests[id]){
			request.callBacks.requests[id](data && data.data);
			delete request.callBacks.requests[id];
		}
	},
	
	
	send: function(data, callBack, tab){
		if(!request.connected){
			return "";
		}
		if(typeof(data) == "string"){
			data = {
				request: data
			};
		}else if(typeof(data) != "object"){
			return "";
		}
		
		var id = request.generateId();
		if(typeof(callBack) == "function"){
			request.callBacks.requests[id] = callBack;
		}
		tab = Number(tab) || 0;
		
		var sendData = {
			id: id,
			data: data,
			tab: tab
		};
		
		if(!ext.isBackground || tab === request.thisTab){
			if(tab === request.thisTab){
				request.requestHandler(sendData, function(data){
					request.responseHandler(id, {data: data});
				}, {
					tab: 0,
					frameId: -1,
					id: ext.id,
					url: location.href,
					requestId: id
				});
			}else{
				try{
					chrome.runtime.sendMessage(sendData);
				}catch(e){
					console.warn(ext.manifest.name + " has been disconnected from the background.\n\tRefresh the page to reconnect if the extension is still running.");
				}
			}
		}else{
			chrome.tabs.sendMessage(tab, sendData);
		}
		
		return id;
	},
	
	sent: function(callBack, privateId){
		var currentId = "";
		if(privateId){
			callBack.privateId = privateId;
		}
		return {
			connect: function(){
				if(!currentId){
					currentId = request.generateId();
					request.callBacks.sent[currentId] = callBack;
				}
			},
			disconnect: function(){
				if(currentId){
					delete request.callBacks.sent[currentId];
					currentId = "";
				}
			}
		};
	},
	
	
	backgroundFunction: function(path, func){
		func.functionPath = path;
		if(ext.isBackground){
			return func
		}else{
			var retFunc = function(){
				var args = [];
				var callBack;
				var callBackPosition = -1;
				for(var n = 0; n < arguments.length; n++){
					if(typeof(arguments[n]) == "function"){
						callBack = arguments[n];
						callBackPosition = n;
						args.push("callBack");
					}else{
						args.push(arguments[n]);
					}
				}
				request.send({
					request: "request.backgroundFunction",
					args: args,
					path: path,
					callBackPosition: callBackPosition
				}, callBack || function(){});
			};
			retFunc.functionPath = path;
			return retFunc;
		}
	}
};

request.generateId.id = 0;


chrome.runtime.onMessage.addListener(function(data, sender, respond){
	if(sender.id != ext.id || typeof(data) != "object"){
		return;
	}
	if(data.ping){
		if(request.tabs.indexOf(sender.tab.id) < 0){
			request.tabs.push(sender.tab.id);
		}
		respond(sender.tab.id);
		return;
	}
	if(typeof(data.id) == "string" && typeof(data.tab) == "number"){
		if(data.isResponse){
			request.responseHandler(data.id, data);
		}else{
			sender.requestId = data.id;
			request.requestHandler(data, function(responseData){
				var sendData = {
					id: data.id,
					data: responseData,
					isResponse: true,
					tab: sender.tab.id
				};
				if(ext.isBackground){
					chrome.tabs.sendMessage(sender.tab.id, sendData);
				}else{
					chrome.runtime.sendMessage(sendData);
				}
			}, sender);
		}
	}
});

if(ext.isBackground){
	chrome.tabs.onRemoved.addListener(function(tabId){
		if(request.tabs.indexOf(tabId) >= 0){
			request.tabs.splice(request.tabs.indexOf(tabId), 1);
		}
	});
}else{
	chrome.runtime.sendMessage({
		ping: true
	}, function(tabId){
		request.thisTab = tabId;
	});
}


request.backgroundFunction.connection = request.sent(function(data, callBack, sender){
	var path = data.path.split(".");
	var func = window;
	var namespace = this;
	while(path.length){
		func = func[path.shift()];
		if(path.length == 1){
			namespace = func;
		}
	}
	if(data.callBackPosition >= 0){
		data.args.splice(data.callBackPosition, 1, callBack);
	}
	func.apply(namespace, data.args);
}, "request.backgroundFunction").connect();



if(ext.isBackground){
	$(window).on("unload", function(){
		ext.reload();
	});
	
	ext.reload.connection = request.sent(function(data){
		ext.reload();
	}, "ext.reload").connect();
}


// WebGL3D
