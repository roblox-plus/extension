var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Money = function () {
	var trid = $("<a target=\"_blank\" id=\"RPlusTradeId\">");
	$("body").on("click", ".ViewTradeLink", function () { trid.text("Trade Id: #" + $(this).attr("tradesessionid")).attr("href", "/My/Money.aspx?tradeId=" + $(this).attr("tradesessionid") + "#/#TradeItems_tab"); });
	$("#TradeRequest>div:first").prepend(trid);
	if (url.param("tradeId") && url.hash().indexOf("#TradeItems_tab") >= 0) {
		Roblox.trades.get(Number(url.param("tradeId"))).then(function (trade) {
			console.log(trade);
			var falseTrade = $("<tr class=\"datarow\"><td class=\"TradePartner\"></td><td class=\"Action\"><a class=\"ViewTradeLink\" tradepartnerid=\"" + trade.tradePartnerOffer.user.id + "\" tradesessionid=\"" + trade.id + "\"></a></td></tr>").hide();
			falseTrade.find(".TradePartner").attr("tradepartnername", trade.tradePartnerOffer.user.username);
			$(".TradeItemsContainer>table>tbody").append(falseTrade);
			falseTrade.find("a.ViewTradeLink")[0].click();
		}, function (e) {
			console.error(e);
		});
	}

	storage.get("tradeTab", function (on) {
		if (on) {
			$("#ButtonCounterTrade").hide().after($("<a class=\"btn-large btn-neutral\" href=\"javascript:/* Roblox+ */\">Counter</a>").click(function () {
				Roblox.trades.openSettingBasedTradeWindow(Roblox.users.getIdFromUrl($(".TradePartnerName").last().attr("href")), trid.text().replace(/\D+/g, ""));
			}));
		}
	});
	
	setInterval(function () {
		storage.get("tradePageRapAssist", function (on) {
			if (!on) { return; }
			$("#TradeItems_tab .TradeItemsContainer>table>tbody>tr.datarow:not([rplus])").each(function () {
				var el = $(this).attr("rplus", getMil());
				Roblox.trades.get(Number(el.find(".ViewTradeLink").attr("tradesessionid"))).then(function (trade) {
					el.find(".Status").css("color", "rgb(" + (trade.authenticatedUserOffer.totalValue < trade.tradePartnerOffer.totalValue ? "0, 175" : "255, 0") + ", 0)");
				}, function () {
					el.removeAttr("rplus");
				});
			});
		});

		$("#TradeRequest .InventoryItemContainerOuter:not([rplus])").each(function () {
			$(this).attr("rplus", getMil());
			if (Number($(this).find(".SerialNumberTotal").text())) {
				$(this).attr("withserial", "");
			} else {
				$(this).find(".SerialNumberTotal").parent().remove();
			}
			$(this).find("img.ItemImg").replaceWith("<div class=\"ItemImg\" style=\"background-image: url(" + $(this).find(".ItemImg").attr("src") + ");background-size: 100%;\"></div>");
		});
		$("#TradeRequest .RBXImg[alt='RBX']").attr("alt", "R$");
		$("#TradeRequest .BuildersClubOverlay:not([src])").remove();
	}, 250);
	
	function cancelAll(callBack) {
		Roblox.trades.getTradesPaged("outbound", 1, "cacheBust:" + (+new Date)).then(function (trades) {
			if (trades.data.length <= 0) {
				callBack();
				return;
			}
			var dcb = 0;
			trades.data.forEach(function (trade) {
				Roblox.trades.decline(trade.id).then(function () {
					var row = $("a.ViewTradeLink[tradesessionid='" + trade.id + "']");
					if (row.length) {
						row.parent().parent().remove();
					}
					if (++dcb == trades.data.length) {
						cancelAll(callBack);
					}
				}, function () {
					if (++dcb == trades.data.length) {
						cancelAll(callBack);
					}
				});
			});
		}, function () {
			setTimeout(cancelAll, 5000, callBack);
		});
	}
	$("#TradeItems_tab>.SortsAndFilters>.TradeType").after($("<a id=\"rplusCancelOutbound\" href=\"javascript:/* Roblox+ */;\" class=\"btn-small btn-neutral\">Cancel All</a>").hide().click(function () {
		var el = $(this);
		if (confirm("Cancel all outbound trades?")) {
			cancelAll(function () {
				$("#TradeItems_TradeType>option[value=\"outbound\"]").text("Outbound");
				el.prop("disabled", true).attr("class", "btn-small btn-disabled-neutral");
			});
		}
	}));

	return {};
};

RPlus.Pages.Money.patterns = [/^\/My\/Money\.aspx/i];


// WebGL3D
