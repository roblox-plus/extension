var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ComposeMessage = function () {
	var id = Number(url.param("recipientId"));
	if(!id){
		return;
	}

	var compose = $("#newmessage-content");
	var original = compose.find(".message-title>a").addClass("text-link").append("<span class=\"icon-alert\"></span>");
	original = { id: Roblox.users.getIdFromUrl(original.attr("href")), username: original.text() };

	function addRecipient(username) {
		if (addRecipient.input.is(":hidden")) { return; }
		addRecipient.input.hide().val("");
		Roblox.users.getByUsername(username).then(function (user) {
			if (!compose.find(".message-title>a[href*='/users/" + user.id + "/']").length) {
				compose.find(".message-title>a").last().after($("<a href=\"/users/" + user.id + "/profile\" class=\"text-link\">").text(user.username).append("<span class=\"icon-alert\"></span>"));
			}
			if (compose.find(".message-title>a").length < 5) {
				addRecipient.input.show();
			}
		}, function () {
			siteUI.feedback({ type: "warning", text: "User not found." }).show();
		});
	}
	function getRecipients() {
		var recipients = [];
		compose.find(".message-title>a").each(function () {
			recipients.push(Roblox.users.getIdFromUrl($(this).attr("href")));
		});
		return recipients;
	}

	addRecipient.input = $("<input>").attr("placeholder", "Add username").enterBlur().blur(function () {
		if ($(this).val()) {
			addRecipient($(this).val());
		}
	});

	compose.on("click", ".icon-alert", function (e) {
		e.preventDefault();
		var id = Roblox.users.getIdFromUrl($(this).parent().attr("href"));
		if (id) {
			$(this).parent().remove();
			if (!compose.find(".message-title>a").length) {
				addRecipient(original.username);
			} else if (compose.find(".message-title>a").length < 5) {
				addRecipient.input.show();
			}
		}
	});

	$("#subject").attr("maxlength", "256");
	$("#body").attr("maxlength", "9000");
	$(".message-title").append(addRecipient.input);
	$("#send-btn").hide().after($("<a class=\"btn-primary-md btn-fixed-width send-btn\">Send</a>").click(function (e) {
		e.preventDefault();
		if (!$("#subject").val() || !$("#body").val()) {
			return;
		}
		$("#subject,#body,.message-title>input").attr("disabled", "disabled");
		privateMessage.send({
			subject: $("#subject").val(),
			body: $("#body").val(),
			id: getRecipients()
		}, function (s) {
			var recipients = [];
			$(".message-title>a").each(function () {
				var id = Roblox.users.getIdFromUrl($(this).attr("href"));
				if (s[id]) {
					recipients.push($(this).text().trim());
					$(this).remove();
					delete s[id];
				}
			});
			if (Object.keys(s).length) {
				siteUI.feedback({ type: "warning", text: "Failed to send private message to remaining recipients" }).show();
			} else {
				siteUI.feedback({ type: "success", text: "Successfully sent message to all recipients (" + recipients.join(", ") + ")" }).show();
			}
		});
	}));

	return {};
};

RPlus.Pages.ComposeMessage.patterns = [/^\/messages\/compose/i];


// WebGL3D
