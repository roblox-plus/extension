var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.TradeWindow = function () {
	users.userId = Number(($(".TradeWindowContainer>script").html().match(/Offer\.initialize\((\d+),/) || [0, 0])[1]) || 0;

	setInterval(function () {
		storage.get("tradeChecker", function (on) {
			if (!on) { return; }
			request.send({ request: "outboundTrades" }, function (list) {
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
