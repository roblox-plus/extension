/*
	roblox/privateMessages.js [04/02/2017]
*/
var Roblox = Roblox || {};

Roblox.privateMessages = (function () {
	var privateMessageBoxes = { "inbox": 0, "sent": 1, "archive": 3 };

	return {
		getMessagesPage: $.promise.cache(function (resolve, reject, messageBox, pageNumber) {
			if (typeof (pageNumber) != "number" || pageNumber <= 0) {
				reject([{
					code: 0,
					message: "Invalid pageNumber"
				}]);
				return;
			} else if (!privateMessageBoxes.hasOwnProperty(messageBox)) {
				reject([{
					code: 0,
					message: "Invalid messageBox"
				}]);
				return;
			}

			var data = {
				nextPage: 0,
				previousPage: 0,
				data: []
			};
			$.get("https://www.roblox.com/messages/api/get-messages", {
				pageSize: 20,
				messageTab: privateMessageBoxes[messageBox],
				pageNumber: pageNumber
			}).done(function (r) {
				r.Collection.forEach(function (msg) {
					data.data.push({
						id: msg.Id,
						sender: {
							userId: msg.Sender.UserId,
							username: msg.Sender.UserName,
							buildersClubMembershipType: msg.Sender.BuildersClubStatus
						},
						recipient: {
							userId: msg.Recipient.UserId,
							username: msg.Recipient.UserName,
							buildersClubMembershipType: msg.Recipient.BuildersClubStatus
						},
						subject: msg.Subject,
						body: msg.Body,
						created: new Date(msg.Created.replace(/\|/g, "")).getTime(),
						updated: new Date(msg.Updated.replace(/\|/g, "")).getTime(),
						isRead: msg.IsRead,
						isSystemMessage: msg.IsSystemMessage,
						reportAbuseUrl: msg.IsReportAbuseDisplayed ? msg.AbuseReportAbsoluteUrl : ""
					});
				});
				if (pageNumber < r.TotalPages) {
					data.nextPage = pageNumber + 1;
				}
				if (pageNumber > 1) {
					data.previousPage = pageNumber - 1;
				}
				resolve(data);
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed"
				}]);
			});
		}, {
			queued: true
		}),
		markAsRead: $.promise.cache(function (resolve, reject, messageIds) {
			if (typeof (messageIds) == "number") {
				messageIds = [messageIds];
			} else if (!Array.isArray(messageIds)) {
				reject([{
					code: 0,
					message: "Invalid messageIds"
				}]);
				return;
			} else if (messageIds.length <= 0) {
				resolve();
				return;
			}

			$.post("https://www.roblox.com/messages/api/mark-messages-read", {
				messageIds: messageIds
			}).done(function (r) {
				resolve();
			}).fail(function () {
				reject();
			});
		}, {
			queued: true
		}),
		markAsUnread: $.promise.cache(function (resolve, reject, messageIds) {
			if (typeof (messageIds) == "number") {
				messageIds = [messageIds];
			} else if (!Array.isArray(messageIds)) {
				reject([{
					code: 0,
					message: "Invalid messageIds"
				}]);
				return;
			} else if (messageIds.length <= 0) {
				resolve();
				return;
			}

			$.post("https://www.roblox.com/messages/api/mark-messages-unread", {
				messageIds: messageIds
			}).done(function (r) {
				resolve();
			}).fail(function () {
				reject();
			});
		}, {
			queued: true
		}),
		archive: $.promise.cache(function (resolve, reject, messageIds) {
			if (typeof (messageIds) == "number") {
				messageIds = [messageIds];
			} else if (!Array.isArray(messageIds)) {
				reject([{
					code: 0,
					message: "Invalid messageIds"
				}]);
				return;
			} else if (messageIds.length <= 0) {
				resolve();
				return;
			}

			$.post("https://www.roblox.com/messages/api/archive-messages", {
				messageIds: messageIds
			}).done(function (r) {
				resolve();
			}).fail(function () {
				reject();
			});
		}, {
			queued: true
		}),
		moveToInbox: $.promise.cache(function (resolve, reject, messageIds) {
			if (typeof (messageIds) == "number") {
				messageIds = [messageIds];
			} else if (!Array.isArray(messageIds)) {
				reject([{
					code: 0,
					message: "Invalid messageIds"
				}]);
				return;
			} else if (messageIds.length <= 0) {
				resolve();
				return;
			}

			$.post("https://www.roblox.com/messages/api/unarchive-messages", {
				messageIds: messageIds
			}).done(function (r) {
				resolve();
			}).fail(function () {
				reject();
			});
		}, {
			queued: true
		}),
		sendMessage: $.promise.cache(function (resolve, reject, details){
			var replyMessageId = Number(details.replyMessageId);
			var recipientId = Number(details.recipientId);
			if (typeof (details.body) != "string") {
				reject([{
					code: 0,
					message: "Invalid body"
				}]);
				return;
			} else if ((isNaN(replyMessageId) || replyMessageId <= 0)
				&& (typeof (details.subject) != "string" || isNaN(recipientId) || recipientId <= 0)) {
				reject([{
					code: 0,
					message: "Invalid reply message id, subject, or recipientId."
				}]);
				return;
			}
			
			$.post("https://www.roblox.com/messages/api/send-message", {
				body: details.body,
				recipientId: recipientId,
				includePreviousMessage: !!details.includeReplies,
				subject: details.subject,
				replyMessageId: replyMessageId
			}).done(function (r) {
				if (r.success) {
					resolve(r.message);
				} else {
					reject(r.message);
				}
			}).fail(function () {
				reject([{
					code: 0,
					message: "HTTP request failed."
				}]);
				});
		}, {
				queued: true
		})
	};
})();

Roblox.privateMessages = $.addTrigger($.promise.background("Roblox.privateMessages", Roblox.privateMessages));


// WebGL3D
