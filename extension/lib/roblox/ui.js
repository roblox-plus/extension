/*
	roblox/ui.js [04/30/2017]
*/
var Roblox = Roblox || {};

Roblox.ui = (function () {
	var modalBackdrop;

	$(function () {
		modalBackdrop = $("div.modal-backdrop");
		if (modalBackdrop.length <= 0) {
			$("body").append(modalBackdrop = $("<div class=\"modal-backdrop fade out\" style=\"z-index: 1040;\">").hide());
		}
	});

	var toggleCalls = 0;
	function toggleBackdrop(isEnabled) {
		var toggleId = ++toggleCalls;
		if (isEnabled) {
			modalBackdrop.show();
		} else {
			setTimeout(function () {
				if (toggleCalls === toggleId) {
					modalBackdrop.hide();
				}
			}, 200);
		}
		modalBackdrop.toggleClass("out", !isEnabled).toggleClass("in", isEnabled);
	}

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
		}),

		confirm: $.promise.cache(function (resolve, reject, details) {
			if (typeof (details) != "object") {
				reject([{
					code: 0,
					message: "details must be object"
				}]);
				return;
			}

			var answer = null;
			var modalWrapper = $("<div class=\"modal fade in\" role=\"dialog\">").hide();
			var modalDialog = $("<div class=\"modal-dialog\">");
			var modalContent = $("<div class=\"modal-content\">");
			var modalHeader = $("<div class=\"modal-header\">");
			var closeButton = $("<button class=\"close\" data-dismiss=\"modal\"><span><span class=\"icon-close\"></span></span></button>");
			var headerText = $("<h5>");
			var modalBody = $("<div class=\"modal-body\">");
			var modalFooter = $("<div class=\"modal-footer\">");
			var modalFootNote = $("<p class=\"small modal-footer-note\">");
			var yesButton = $("<button>").attr("class", typeof (details.yesButtonClass) === "string" ? details.yesButtonClass : "btn-primary-md");
			var noButton = $("<button>").attr("class", typeof (details.noButtonClass) === "string" ? details.noButtonClass : "btn-control-md");

			function closeModal() {
				toggleBackdrop(false);
				modalWrapper.remove();
				if (typeof (answer) == "boolean") {
					resolve(answer);
				} else {
					reject([{
						code: 1,
						message: "Modal closed without answer"
					}]);
				}
			}

			headerText.text(typeof(details.header) === "string" ? details.header.trim() : "Confirm Action");

			closeButton.click(closeModal);
			modalWrapper.click(function (e) {
				if (e.target === modalWrapper[0]) {
					closeModal();
				}
			});

			yesButton.text(typeof (details.yesButtonText) == "string" ? details.yesButtonText : "Yes").css("margin-right", "5px").click(function () {
				answer = true;
				closeModal();
			});
			noButton.text(typeof (details.noButtonText) == "string" ? details.noButtonText : "No").css("margin-left", "5px").click(function () {
				answer = false;
				closeModal();
			});

			if (typeof (details.bodyText) == "string") {
				modalBody.text(details.bodyText);
			} else if (typeof (details.bodyHtml) == "string" || (details.bodyHtml instanceof jQuery)) {
				modalBody.html(details.bodyHtml);
			}

			modalHeader.append(closeButton, headerText);
			modalFooter.append(yesButton, noButton);
			modalContent.append(modalHeader, modalBody, modalFooter);
			if (typeof (details.footNoteText) == "string") {
				modalContent.append(modalFootNote.text(details.footNoteText));
			} else if (typeof (details.footNoteHtml) == "string") {
				modalContent.append(modalFootNote.html(details.footNoteHtml));
			}
			modalWrapper.append(modalDialog.append(modalContent));

			$("body").append(modalWrapper);

			setTimeout(function () {
				toggleBackdrop(true);
				modalWrapper.show();
			}, 50);
		}, {
			queued: true,
			resolveExpiry: 1,
			rejectExpiry: 1
		})
	};
})();

// WebGL3D
