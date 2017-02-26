/*
	ROBLOX+ Forums.js
*/
$("a.post-list-subject").each(function(){
	var subject = $(this).text().trim();
	$(this).text(subject).attr("title", subject);
});

$(".forum-post>.forum-content-background:first-child").dblclick(function(){
	$(this).closest(".forum-post").toggleClass("collapsed");
	return false;
});

$("body").on("dblclick", ".forum-post .rplusLua>span", function(){
	var selection = window.getSelection();
	var range = document.createRange();
	range.selectNodeContents($(this).parent().find("code")[0]);
	selection.removeAllRanges();
	selection.addRange(range);
});


(function(isChecked){
	var checkbox = $("<input type=\"checkbox\" id=\"ctl00_cphRoblox_PostView1_ctl00_TrackThread\" name=\"ctl00$cphRoblox$PostView1$ctl00$TrackThread\">").prop("checked", isChecked);
	$("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").replaceWith(checkbox);
	checkbox.change(function(e){
		checkbox.prop("checked", isChecked = !isChecked).attr({ readonly: "readonly", disabled: "disabled" });
		$("#__EVENTTARGET").val("ctl00$cphRoblox$PostView1$ctl00$TrackThread");
		var formData = new FormData(document.getElementById("aspnetForm"));
		formData.append("ctl00$cphRoblox$PostView1$ctl00$TrackThread", isChecked ? "on" :"");
		$.ajax({
			url: location.href,
			type: "POST",
			processData: false,
			contentType: false,
			data: formData
		}).done(function(r){
			$("#__VIEWSTATE").val(r.match(/__VIEWSTATE"\s*value="([^"]+)"/)[1]);
			$("#__EVENTVALIDATION").val(r.match(/__EVENTVALIDATION"\s*value="([^"]+)"/)[1]);
		}).fail(function(){
			checkbox.prop("checked", isChecked = !isChecked);
		}).always(function(){
			checkbox.removeAttr("readonly").removeAttr("disabled");
		});
	});
})($("#ctl00_cphRoblox_PostView1_ctl00_TrackThread").prop("checked"));



$.storage(["forum.postIds", "forum.rap", "forum.signature", "forum.signatureLines", "forum.embedding", "forum.block", "sound.volume"], function(settings){
	var urlPostId = Number((location.search.match(/PostID=(\d+)/i) || ["", 0])[1]);
	
	var getAssetForEmbedding = $.cache(function(assetId, callBack){
		Roblox.catalog.getAssetInfo(assetId, function(asset){
			asset.absoluteUrl = asset.absoluteUrl || Roblox.catalog.getAssetUrl(assetId);
			callBack(asset);
		});
	});
	
	if(urlPostId){
		var firstPostId = Number($(".forum-post a[name]").first().attr("name"));
		var pager = $("#ctl00_cphRoblox_PostView1_ctl00_Pager td>span.normalTextSmallBold").text();
		var pageNumber = Number((pager.match(/Page\s*(\d+)/) || ["", 1])[1]);
		var maxPage = Number((pager.match(/of\s*(\d+)/) || ["", 1])[1]);
		var originalPostId = firstPostId != urlPostId && pageNumber <= 1 ? firstPostId : urlPostId;
		Roblox.social.getBlockedUsers(function(blockedUsers){
			$(".forum-post").each(function(){
				var post = $(this);
				var postHead = post.find("a[name]");
				var thisPostId = Number(postHead.attr("name"));
				var posterInfoBox = post.find(">.forum-content-background:first-child>table>tbody");
				var poster = posterInfoBox.find(">tr:nth-child(2) a[href *= '/users/']");
				var posterId = Roblox.users.getIdFromUrl(poster.attr("href"));
				var postCount = 1;
				
				var replyButton = $(this).find(".post-response-options>a.btn-control.verified-email-act");
				replyButton.attr("href", replyButton.attr("href").replace(/PostID=\d+/i, "PostID=" + thisPostId));
				
				if(settings["forum.postIds"]){
					postHead.parent().prepend($("<a>").attr("href", "/Forum/ShowPost.aspx?PostID=" + originalPostId + (pageNumber > 1 ? "&PageIndex=" + pageNumber : "") + (originalPostId != thisPostId && firstPostId != thisPostId ? "#" + thisPostId: "")).text("#" + thisPostId), " ");
				}
				
				if(settings['forum.block'] && blockedUsers[posterId]){
					post.slideUp();
					return;
				}
				
				if(settings["forum.rap"]){
					if(poster.find("img[src *= 'BCOverlay.aspx']").length >= 0){
						Roblox.users.getCurrentUserInfo(function(user){
							if(user.bc == "NBC" || user.id == posterId){
								return;
							}
							Roblox.tradeService.canTradeWithUser(posterId, function(canTrade){
								if(!canTrade){
									return;
								}
								post.find(".post-response-options").prepend($("<a class=\"btn-control btn-control-medium\">").text("Trade").click(function(){
									Roblox.tradeService.openTradeWindow(posterId, null, function(){ });
									return false;
								}));
							});
						});
					}
					posterInfoBox.find(">tr").each(function(){
						if($(this).find("b").text().startsWith("Joined")){
							var rapLabel = $("<span class=\"robux-text\">").attr("data-rplus-collectibles", posterId);
							$(this).before(
								$("<tr>").append(
									$("<td>").append(
										$("<span class=\"normalTextSmaller\">").append(
											$("<b>").text("RAP: "),
											rapLabel
										)
									)
								)
							);
							Roblox.inventory.getCollectibles(posterId).on("loading", function(perc){
								rapLabel.text(Math.floor(perc) + "%");
							}).on("ready", function(){
								rapLabel.text("R$" + global.addCommas(this.value));
							});
						}
					});
				}
				
				posterInfoBox.find(">tr").each(function(){
					if($(this).find("b").text().startsWith("Total")){
						postCount = Number($(this).text().replace(/\D+/g, "")) || 1;
					}
				});
				
				if(settings["forum.embedding"]){
					var bodyContainer = post.find(".linkify").parent().addClass("linkify");
					var body = bodyContainer.find(">span").html();
					
					body = body.replace(/R\$([\d.,]+)/gi, function(fullMatch, numberMatch){
						var n = Number(numberMatch.replace(/,/g, ""));
						if(isNaN(n)){
							return fullMatch;
						}else{
							return "<span class=\"robux\">" + global.addCommas(n) + "</span>";
						}
					});
					
					body = body.replace(/Ti?x([\d.,]+)/gi, function(fullMatch, numberMatch){
						var n = Number(numberMatch.replace(/,/g, ""));
						if(isNaN(n)){
							return fullMatch;
						}else{
							return "<span class=\"tickets\">" + global.addCommas(n) + "</span>";
						}
					});
					
					body = body.replace(/r\+:\/\/(\d+)/gi, function(fullMatch, numberMatch){
						var n = Number(numberMatch);
						if(isNaN(n)){
							return fullMatch;
						}else{
							return "<a href=\"/catalog/" + n + "/ROBLOXPlus\" target=\"_blank\">" + n + "</a>";
						}
					});
					
					body = body.replace(/(^|\W)R\+/gi, function(fullMatch, front){
						return front.charAt(0) + "<a alt=\"R+\" href=\"/Groups/Group.aspx?gid=2518656\" class=\"icon-rplus-small\" target=\"_blank\"></a>"
					});
					
					body = body.replace(/h?t?t?p?s?:?\/{0,2}w?w?w?\.?(youtu.be|youtube.com)(\/?[^\s<]*)/gi,function(fullUrl, domain, path){
						var timeStart = (path.match(/t=(\w+)/) || ["", ""])[1];
						if(timeStart){
							if(!isNaN(Number(timeStart))){
								timeStart = Number(timeStart) + "s";
							}else{
								timeStart = (timeStart.match(/^(\d+m?)(\d+s?)$/) || [""])[0];
							}
						}
						var videoId = (path.match(/v=([\w-]+)/i) || path.substring(1).match(/([\w-]+)/) || ["", ""])[1];
						console.log(path, path.substring(1).match(/([\w-]+)/));
						if(videoId){
							var url = "https://youtu.be/" + videoId + (timeStart ? "?t=" + timeStart : "");
							var minutes = Number((timeStart.match(/(\d+)m/) || ["", 0])[1]);
							var seconds = Number((timeStart.match(/(\d+)s/) || ["", 0])[1]);
							console.log(seconds + (minutes * seconds));
							return "<br>" + ($("<a>").attr({ target: "_blank", "data-video": videoId, "data-timestamp": seconds + (minutes * seconds), href: url }).text(url)[0].outerHTML);
						}
						return fullUrl;
					});
					
					var newBody = [];
					var scope = [];
					function buildScope(){
						while(scope.length && !scope[0].trim()){
							scope.splice(0, 1);
						}
						if(scope.length < 1){
							return;
						}
						var lineNumbers = $("<span>");
						var code = $("<code>");
						for(var n = 0; n < scope.length; n++){
							lineNumbers.append((n + 1) + "\n");
							code.append(scope[n] + "\n");
						}
						var container = $("<span class=\"rplusLua\">").append(lineNumbers, code).css("height", ((17 * scope.length) + 6) + "px");
						lineNumbers.css("height", (17 * scope.length) + "px");
						code.css("height", (17 * scope.length) + "px");
						hljs.highlightBlock(code[0]);
						scope = [];
						newBody.push(container[0].outerHTML);
					}
					body.split("<br>").forEach(function(line){
						var codeStart = line.match(/^\s*#code(.*)/i);
						if(codeStart){
							buildScope();
							scope.push(codeStart[1].trim());
						}else if(line.startsWith("\t") && scope.length){
							scope.push(line.substr(1));
						}else{
							buildScope();
							newBody.push(line);
						}
					});
					buildScope();
					body = newBody.join("<br>");
					
					var maxImageCount = Math.ceil(Math.max(1, postCount) / 1000);
					function getEmbedHtml(asset){
						var anchor = $("<a>").attr({ href: asset.absoluteUrl, target: "_blank" }).text(asset.absoluteUrl);
						if((asset.assetTypeId == 1 || asset.assetTypeId == 13) && maxImageCount-- > 0){
							anchor.html("<img src=\"" + asset.thumbnail + "\" class=\"rplus-embedded\">");
						} else if(asset.assetTypeId == 3){
							var playButton = Roblox.audio.createPlayButton(settings['sound.volume'] / 100).setAudioId(asset.id).click(function(e){
								e.preventDefault();
							});
							anchor.text(asset.name).prepend(playButton);
						}
						return anchor;
					}
					
					bodyContainer.html(body);
					bodyContainer.find(">a").each(function(){
						var element = $(this);
						var assetId = Roblox.catalog.getIdFromUrl(element.attr("href"));
						if(assetId){
							getAssetForEmbedding(assetId, function(asset){
								element.replaceWith(getEmbedHtml(asset));
							});
						}
					});
					
					bodyContainer.find("a[data-video]").each(function(i){
						if(i < 3){
							var iframe = $("<div>").append($("<iframe allowfullscreen>").attr({ width: "560", height: "315", frameborder: "0", src: "https://www.youtube.com/embed/" + $(this).data("video") + "?start=" + $(this).data("timestamp") })).hide();
							var shown = false;
							$(this).after(iframe).click(function(e){
								if(e.offsetX < 20){
									e.preventDefault();
									iframe[shown ? "slideUp" : "slideDown"]();
									shown = !shown;
								}
							});
						}
					});
				}
				
				postHead.remove();
			});
		});
	}
	
	var body = $("#ctl00_cphRoblox_Createeditpost1_PostForm_PostBody").attr("maxlength", 50000);
	var postingTbody = body.length && body.parent().parent().parent();
	if(postingTbody){
		var subject = $("#ctl00_cphRoblox_Createeditpost1_PostForm_NewPostSubject").attr("maxlength", 60);
		
		$("#ctl00_cphRoblox_Createeditpost1_PostForm_Cancel").click(function(e){
			e.preventDefault();
			history.back();
		});
		
		var signature = {
			current: settings['forum.signature'],
			lines: "\n".repeat(settings['forum.signatureLines']),
			bar: $("<input data-rplus-storage=\"forum.signature\" type=\"text\">").attr("style", subject.attr("style") || body.attr("style")).val(settings['forum.signature']),
			
			get: function(){
				return signature.current.replace(/#Robux/gi, "R$" + global.addCommas(RPlus.navigation.getRobux()));
			},
			check: function(callBack){
				callBack();
			},
			clip: function(){
				var finalBit = signature.lines + signature.get();
				var lastIndex = body.val().lastIndexOf(finalBit);
				if(lastIndex == body.val().length - finalBit.length){
					body.val(body.val().substring(0, lastIndex));
				}
			}
		};
		signature.bar.on("change", function(){
			signature.current = $(this).val();
			signature.check();
		});
		signature.check(signature.clip);
		$("#aspnetForm").submit(function(){
			if(subject.val() || !subject.length){
				body.val(body.val() + signature.lines + signature.get());
			}
		});
		
		body.parent().parent().after($("<tr>").append(
			$("<td valign=\"top\" nowrap align=\"right\">").append($("<span class=\"normalTextSmallBold\">").text("Signature: ")),
			$("<td valign=\"top\" align=\"left\">").append(signature.bar)
		));
	}
});



// WebGL3D
