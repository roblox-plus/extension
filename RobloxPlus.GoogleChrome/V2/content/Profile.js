/*
	Profile.js [12/3/2016]
*/
$.storage([
	"profile.rap.enabled"
], function(settings){
	var profileInfo = $("div[data-profileuserid]");
	var userId = profileInfo.data("profileuserid");
	
	$(".profile-avatar-image").on("dragstart", function(e){
		e.originalEvent.dataTransfer.setData("text/plain", Roblox.users.getProfileUrl(userId));
	});
	
	if(userId == 1){
		$("#about>.profile-collections>.container-header>h3").after("<a href=\"/catalog/browse.aspx?Subcategory=17&SortType=3&IncludeNotForSale=true\" class=\"btn-secondary-sm btn-more inventory-link\">Recent</a>");
	}
	
	if(settings['profile.rap.enabled']){
		var rapLabel = $("<h3>").text("0%");
		$(".details-info").append($("<li>").append(
			$("<div class=\"text-label\">").text("RAP"),
			$("<a class=\"text-name\">").attr("data-rplus-collectibles", userId).append(rapLabel)
		));
		Roblox.inventory.getCollectibles(userId).on("loading", function(perc){
			rapLabel.text(Math.floor(perc) + "%");
		}).on("ready", function(){
			rapLabel.text(global.addCommas(this.value));
		});
	}
	
	function openTradeWindow(e){
		e.preventDefault();
		Roblox.tradeService.openTradeWindow(userId, undefined, function(){});
	}
	$("#profile-trade-items").hide().after($("<a class=\"rplusopentrade\">").text("Trade Items"));
	$(".trade-link").hide().after($("<a class=\"btn-fixed-width btn-control-xs btn-more trade-link\">").text("Trade").click(openTradeWindow));
	$("body").on("click", ".rplusopentrade", openTradeWindow);
	
	[
		{ subcategory: 3, label: "Clothing Sales" },
		{ subcategory: 6, label: "Models Given" }
	].forEach(function(stat){
		var trigger  = $("<a href=\"javascript:/* ROBLOX+ */\">[ Load ]</a>");
		var statLead = $("<p class=\"text-lead\">").append(trigger);
		var pageNumber = 1, load, count = 0;
		function load(){
			statLead.text("Loading" + ".".repeat((pageNumber % 3) + 1));
			$.get("/catalog/json?Subcategory=" + stat.subcategory + "&ResultsPerPage=42&IncludeNotForSale=true&CreatorId=" + userId + "&PageNumber=" + pageNumber).done(function(r){
				pageNumber++;
				r.forEach(function(item){
					count += Number((item.Sales || "").replace(/\D+/g, "")) || 0;
				});
				if(r.length == 42){
					load();
				}else{
					statLead.text(global.addCommas(count));
				}
			}).fail(function(){
				setTimeout(load, 1000);
			});
		}
		trigger.click(load);
		$(".profile-stats-container").append($("<li class=\"profile-stat\">").append($("<p class=\"text-label\">").text(stat.label)).append(statLead));
	});
});



// WebGL3D
