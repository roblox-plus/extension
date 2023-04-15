/*
	roblox/ui.js [04/30/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.UI = class {
	constructor() {
		this.modalBackdrop = null;
		this.toggleCalls = 0;
	}

	toggleBackdrop(isEnabled) {
		let toggleId = ++this.toggleCalls;
		if (isEnabled) {
			this.modalBackdrop.show();
		} else {
			setTimeout(() => {
				if (this.toggleCalls === toggleId) {
					this.modalBackdrop.hide();
				}
			}, 200);
		}

		this.modalBackdrop.toggleClass("out", !isEnabled).toggleClass("in", isEnabled);
	}

	confirm(details) {
		return QueuedPromise(`Roblox.ui.confirm`, (resolve, reject) => {
			if (typeof (details) != "object") {
				reject([{
					code: 0,
					message: "details must be object"
				}]);
				return;
			}

			let answer = null;
			let modalWrapper = $("<div class=\"modal fade in\" role=\"dialog\">").hide();
			let modalDialog = $("<div class=\"modal-dialog\">");
			let modalContent = $("<div class=\"modal-content\">");
			let modalHeader = $("<div class=\"modal-header\">");
			let closeButton = $("<button class=\"close\" data-dismiss=\"modal\"><span><span class=\"icon-close\"></span></span></button>");
			let headerText = $("<h5>");
			let modalBody = $("<div class=\"modal-body\">");
			let modalFooter = $("<div class=\"modal-footer\">");
			let modalFootNote = $("<p class=\"small modal-footer-note\">");
			let yesButton = $("<button>").attr("class", typeof (details.yesButtonClass) === "string" ? details.yesButtonClass : "btn-primary-md");
			let noButton = $("<button>").attr("class", typeof (details.noButtonClass) === "string" ? details.noButtonClass : "btn-control-md");

			const closeModal = () => {
				this.toggleBackdrop(false);
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
			modalWrapper.click((e) => {
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

			setTimeout(() => {
				this.toggleBackdrop(true);
				modalWrapper.show();
			}, 50);
		});
	}
};

Roblox.ui = new Roblox.Services.UI();

$(function () {
	Roblox.ui.modalBackdrop = $("div.modal-backdrop");
	if (Roblox.ui.modalBackdrop.length <= 0) {
		$("body").append(Roblox.ui.modalBackdrop = $("<div class=\"modal-backdrop fade out\" style=\"z-index: 1040;\">").hide());
	}
});

// WebGL3D
