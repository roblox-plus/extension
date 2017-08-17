var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.TradeWindow = function () {
	setInterval(function () {
		storage.get("tradeChecker", function (on) {
			if (!on) { return; }
			ipc.send("RPlus.notifiers.trade:outboundTrades", {}, function (list) {
				$(".InventoryItemContainerOuter[userassetid]").each(function () {
					$(this).find(".InventoryItemContainerInner").css("background-color", list.indexOf(Number($(this).attr("userassetid"))) >= 0 ? "rgb(255,230,230)" : "#FFF");
				});
			});
		});
	}, 250);

	return {};
};

RPlus.Pages.TradeWindow.patterns = [/^\/Trade\/TradeWindow\.aspx/i];


// WebGL3D
