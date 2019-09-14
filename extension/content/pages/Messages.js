var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Messages = function () {
	$("body").on("dragstart", ".roblox-message-row .avatar-card-image", function (e) {
		var username = $(this).closest(".roblox-message-row").find(".message-summary-username").text();
		e.originalEvent.dataTransfer.setData("text/plain", "user:" + username);
	});

	return {};
};

RPlus.Pages.Messages.patterns = [/^\/my\/messages/i];


// WebGL3D
