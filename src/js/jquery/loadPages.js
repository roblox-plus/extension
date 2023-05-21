var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.init = function() {
	if (!window.React) {
		setTimeout(RPlus.Pages.init, 10);
		return;
	}

	RPlus.style.syncPremiumClass();
};

(function () {
	// TODO: Remove chat-data-model as source of truth, it appears this has been removed.
	Roblox.users.authenticatedUserId = $("meta[name='user-data']").data("userid")
		|| $("#chat-data-model").data("userid")
		|| $("#push-notification-registrar-settings").data("userid")
		|| Number((($(".TradeWindowContainer>script").html() || "").match(/Offer\.initialize\((\d+),/) || [0, 0])[1])
		|| 0;

	RPlus.Pages.init();
})();


// WebGL3D
