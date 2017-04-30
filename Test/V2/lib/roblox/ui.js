/*
	roblox/ui.js [04/30/2017]
*/
var Roblox = Roblox || {};

Roblox.ui = (function () {
	return {
		feedbackTypes: {
			success: "success",
			warning: "warning",
			info: "loading"
		},

		feedback: $.promise.cache(function (resolve, reject, text, type, expiry, isTextHtml) {
			if (typeof (type) != "string" || !this.feedbackTypes.hasOwnProperty(type)) {
				reject([{
					code: 0,
					message: "type is invalid"
				}]);
				return;
			}

			if (typeof (text) == "string") {
				text = text.trim();
			}
			type = this.feedbackTypes[type];

			var feedbackWrapper = $("<div class=\"sg-system-feedback\">");
			var feedbackContainer = $("<div class=\"alert-system-feedback\">");
			var feedbackInner = $("<div>").attr("class", "alert alert-" + type);
			var feedbackText = $("<span class=\"alert-context\">");

			if (isTextHtml) {
				feedbackText.html(text);
			} else {
				feedbackText.text(text);
			}

			$("body").append(feedbackWrapper.append(feedbackContainer.append(feedbackInner.append(feedbackText))));

			function closeFeedback() {
				feedbackInner.removeClass("on");
				setTimeout(function () {
					feedbackContainer.remove();
				}, 5000);
				resolve();
			}

			setTimeout(function () {
				feedbackInner.addClass("on");

				if (typeof (expiry) == "number" && expiry > 0) {
					setTimeout(closeFeedback, expiry);
				} else {
					var closeButton = $("<span class=\"icon-close-white\">");
					closeButton.click(closeFeedback);
					feedbackInner.append(closeButton);
				}
			}, 100);
		}, {
			queued: true,
			resolveExpiry: 1,
			rejectExpiry: 1
		})
	};
})();

// WebGL3D
