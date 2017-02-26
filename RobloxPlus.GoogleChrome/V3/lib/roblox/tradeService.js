/*
	roblox/tradeService.js [10/16/2016]
*/
(window.Roblox || (Roblox = {})).tradeService = $.addTrigger({
	getTradeWindowUrl: function(id){
		return "https://www.roblox.com/Trade/TradeWindow.aspx?TradePartnerID=" + id;
	},
	
	openTradeWindow: request.backgroundFunction("Roblox.tradeService.openTradeWindow", function(id, openInTab, callBack){
		if(id <= 0){
			callBack(false);
			return;
		}
		openInTab = typeof(openInTab) == "boolean" ? openInTab : !!Roblox.tradeService.openTradeWindow.AreTradeWindowsOpenedInTabs;
		var url = this.getTradeWindowUrl(id);
		this.canTradeWithUser(id, function(canTrade){
			if(canTrade){
				if(openInTab){
					window.open(url);
				}else{
					window.open(url, "", "width=930,height=700", false);
				}
				callBack(true);				
			}else{
				callBack(false);
			}
		});
	}),
	
	canTradeWithUser: $.cache(request.backgroundFunction("Roblox.tradeService.canTradeWithUser", function(id, callBack){
		$.get(this.getTradeWindowUrl(id)).done(function(r){
			callBack(($._(r).find("#aspnetForm").attr("action") || "").indexOf("/Trade/") >= 0);
		}).fail(function(){
			callBack(false);
		});
	}), 60 * 1000)
});


$.storage("AreTradeWindowsOpenedInTabs", function(v){
	Roblox.tradeService.openTradeWindow.AreTradeWindowsOpenedInTabs = !!v;
});


// WebGL3D
