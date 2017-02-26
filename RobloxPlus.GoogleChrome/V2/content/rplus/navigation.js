/*
	rplus/navigation.js [11/26/2016]
*/
(window.RPlus || (RPlus = {})).navigation = (function(){
	function updateNavigationButtonText(buttonNumber, text){
		$("#header .nav.rbx-navbar>li:nth-child(" + (buttonNumber + 2) + ")>a").text(text);
	}
	
	function updateNavigationButtonHref(buttonNumber, href){
		$("#header .nav.rbx-navbar>li:nth-child(" + (buttonNumber + 2) + ")>a").attr("href", href);
	}
	
	
	function getCommaPlacement(callBack){
		$.storage("navigation.counters.commas", function(v){
			var match = v.match(/(\d+)(\w+)/) || ["", 0, ""];
			var n = Number(match[1]);
			var e = match[2].toUpperCase();
			if(getCommaPlacement.zeros[e]){
				callBack(Number("1" + "0".repeat(getCommaPlacement.zeros[e])));
			}else{
				callBack(1000);
			}
		});
	}
	getCommaPlacement.zeros = { "K": 3, "M": 6, "B": 9, "T": 12, "Q": 15 };
	
	function cutInto(count, commaAt){
		if(count < commaAt){
			return global.addCommas(count);
		}
		while(count > Number(commaAt + "000")){
			commaAt = Number(commaAt + "000");
		}
		var extension = "K";
		for(var n in getCommaPlacement.zeros){
			if(commaAt >= Number("1" + "0".repeat(getCommaPlacement.zeros[n]))){
				extension = n;
			}else{
				break;
			}
		}
		var commad = global.addCommas(count);
		return (commad.match(/(\d+),/) || ["", 0])[1] + extension + (count % commaAt != 0 ? "+" : "");
	}
	
	
	function getRobux(){
		return Number(($("#nav-robux-balance").text() || "").replace(/\D+/g, "")) || 0;
	}
	
	function setRobux(count){
		getCommaPlacement(function(commaAt){
			$("#nav-robux-balance").text(global.addCommas(count) + " ROBUX");
			$("#nav-robux-amount").text(cutInto(count, commaAt));
		});
	}
	
	function getMessageCount(){
		return Number($("#nav-message").data("count")) || 0;
	}
	
	function setMessageCount(count){
		getCommaPlacement(function(commaAt){
			$("#nav-message").data("count", count);
			$("#nav-message > .notification-blue").attr("title", count).text(cutInto(count, commaAt));
		});
	}
	
	function getFriendRequestCount(){
		return Number($("#nav-friends").data("count")) || 0;
	}
	
	function setFriendRequestCount(count){
		getCommaPlacement(function(commaAt){
			$("#nav-friends").data("count", count);
			$("#nav-friends > .notification-blue").attr("title", count).text(cutInto(count, commaAt));
		});
	}
	
	
	function refreshCounters(callBack){
		var done = 0;
		var cb = function(){
			if(++done == 2){
				callBack();
			}
		}
		if($("#nav-robux-amount").length){
			Roblox.users.getCurrentRobux(function(robux){
				setRobux(robux);
				cb();
			});
		}else{
			cb();
		}
		if($("#nav-friends, #nav-message").length){
			Roblox.users.getNavigationCounts(function(counts){
				setMessageCount(counts.unreadMessageCount);
				setFriendRequestCount(counts.friendRequestCount);
				cb();
			});
		}else{
			cb();
		}
	}
	
	refreshCounters.loop = function(){
		$.storage("navigation.counters.live", function(on){
			if(on){
				refreshCounters(function(){
					setTimeout(refreshCounters.loop, 5000);
				});
			}else{
				setTimeout(refreshCounters.loop, 5000);
			}
		});
	};
	
	
	// Ew.. but okay. http://stackoverflow.com/questions/11371550/change-hover-css-properties-with-javascript#answer-11371599
	var injectedStylesheet = "#nav-rplus:hover .icon-nav-rplus, .icon-rplus {\n\tbackground-image: url(" + ext.getUrl("/images/icons/icon_32x32.png") + ") !important;\n}";
	injectedStylesheet += "\n.icon-rplus-small {\n\tbackground-image: url(" + ext.getUrl("/images/icons/icon_16x16.png") + ") !important;\n}";
	injectedStylesheet += "\n.icon-nav-rplus {\n\tbackground-image: url(" + ext.getUrl("/images/icons/navicon.png") + ");\n}";
	$("head").append("<style>" + injectedStylesheet + "</style>");

	$("#upgrade-now-button").parent().before(
		$("<li id=\"nav-rplus\">").append(
			$("<a>").attr("href", ext.manifest.homepage_url.replace(/\*\.roblox/g, "www.roblox").replace(/\*/g, "")).append(
				$("<span class=\"icon-nav-rplus\">"),
				$("<span>").text("Control Panel")
			)
		)
	);
	
	
	$.storage([
		"navigation.button1.text",
		"navigation.button1.link",
		"navigation.button2.text",
		"navigation.button2.link"
	], function(navigationSettings){
		updateNavigationButtonText(1, navigationSettings['navigation.button1.text']);
		updateNavigationButtonHref(1, navigationSettings['navigation.button1.link']);
		updateNavigationButtonText(2, navigationSettings['navigation.button2.text']);
		updateNavigationButtonHref(2, navigationSettings['navigation.button2.link']);
	});
	
	$.storage.on("set", function(key, val){
		var button = key.match(/^navigation\.button(\d+)\.(\w+)/) || ["", 0, ""];
		if(button[1]){
			if(button[2] == "text"){
				updateNavigationButtonText(Number(button[1]), val)
			}else if(button[2] == "link"){
				updateNavigationButtonHref(Number(button[1]), val);
			}
		}
	});
	
	getCommaPlacement(function(commaAt){
		setRobux(getRobux(), commaAt);
		setMessageCount(getMessageCount(), commaAt);
		setFriendRequestCount(getFriendRequestCount(), commaAt);
	});
	
	refreshCounters.loop();
	
	
	return {
		updateNavigationButtonText: updateNavigationButtonText,
		updateNavigationButtonHref: updateNavigationButtonHref,
		
		getCommaPlacement: getCommaPlacement,
		cutInto: cutInto,
		
		getRobux: getRobux,
		setRobux: setRobux,
		
		getMessageCount: getMessageCount,
		setMessageCount: setMessageCount,
		
		getFriendRequestCount: getFriendRequestCount,
		setFriendRequestCount: setFriendRequestCount,
		
		refreshCounters: refreshCounters
	};
})();



// WebGL3D
