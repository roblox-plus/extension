/*
	roblox/privateMessages.js [11/25/2016]
*/
(window.Roblox || (Roblox = {})).privateMessages = (function(){
	var tabs = {
		inbox: 0,
		sent: 1,
		archive: 3
	};
	var pageSize = 20;

	var getMessagesPage = $.cache(function(tab, page, callBack){
		var data = {
			nextPage: 0,
			previousPage: 0,
			data: []
		};
		$.get("https://www.roblox.com/messages/api/get-messages", { pageSize: pageSize, messageTab: tab, pageNumber: page }).done(function(r){
			r.Collection.forEach(function(msg){
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
			if(page < r.TotalPages){
				data.nextPage = page + 1;
			}
			if(page > 1){
				data.previousPage = page - 1;
			}
		}).always(function(){
			callBack(data);
		});
	}, 5 * 1000);

	return $.addTrigger({
		tabs: tabs,
		
		getMessagesPage: $.cache(request.backgroundFunction("Roblox.privateMessages.getMessages", function(tab, page, callBack){
			getMessagesPage(tab, page - 1, callBack);
		}), 5 * 1000),
		
		markMessagesAsRead: request.backgroundFunction("Roblox.privateMessages.markMessagesAsRead", function(messageIds, callBack){
			if(messageIds.length <= 0){
				callBack(true);
				return;
			}
			
			$.post("https://www.roblox.com/messages/api/mark-messages-read", {
				messageIds: messageIds
			}).done(function(r){
				callBack(true);
			}).fail(function(){
				callBack(false);
			});
		}),
		
		markMessagesAsUnread: request.backgroundFunction("Roblox.privateMessages.markMessagesAsUnread", function(messageIds, callBack){
			if(messageIds.length <= 0){
				callBack(true);
				return;
			}
			
			$.post("https://www.roblox.com/messages/api/mark-messages-unread", {
				messageIds: messageIds
			}).done(function(r){
				callBack(true);
			}).fail(function(){
				callBack(false);
			});
		}),
		
		sendMessage: request.backgroundFunction("Roblox.privateMessages.sendMessage", function(details, callBack){
			var replyMessageId = Number(details.replyMessageId);
			var recipientId = Number(details.recipientId);
			if(typeof(details.body) != "string"
				|| ((isNaN(replyMessageId) || replyMessageId <= 0)
					&& (typeof(details.subject) != "string" || isNaN(recipientId) || recipientId <= 0))){
				callBack({
					success: false,
					message: "Invalid parameters"
				});
				return;
			}
			
			$.post("https://www.roblox.com/messages/api/send-message", {
				body: details.body,
				recipientId: recipientId,
				includePreviousMessage: !!details.includeReplies,
				subject: details.subject,
				replyMessageId: replyMessageId
			}).done(function(r){
				callBack({
					success: r.success,
					message: r.message
				});
			}).fail(function(){
				callBack({
					success: false,
					message: "Request failed"
				});
			});
		})
	});
})();


// WebGL3D
