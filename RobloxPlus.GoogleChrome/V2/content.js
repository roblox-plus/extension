// content.js [4/4/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
fixCB(({
	"text/html": function (subdomain, upath, list, mainLoop) {
		if (document.querySelector("#navigation .rplus-icon") || (["help", "corp", "developer", "wiki", "devforum", "blog", "api", "m", "bloxcon", "setup", "content", "polls"]).indexOf(subdomain = subdomain[subdomain.length - 3]) >= 0) { return; }
		var isTradeWindow = !!url.send().match(/\/Trade\/TradeWindow\.aspx/i);


		function plusSlider(input) {
			return input.each(function () {
				var max = Number($(this).attr("max")) || 100;
				var v = math.bound(round($(this).val(), $(this).attr("step") || 1), $(this).attr("min") || 0, max);
				var perc = Math.floor((v / max) * 100);
				$(this).attr("title", max > 10 ? perc + "%" : v).css("background", "-webkit-linear-gradient(left, " + plusSlider.activeColor + ", " + plusSlider.activeColor + " " + perc + "%, " + plusSlider.backgroundColor + " " + perc + "%, " + plusSlider.backgroundColor + ")");
			});
		}
		plusSlider.selector = "input.rplusslider[type='range']";
		plusSlider.activeColor = "rgb(31,115,255)";
		plusSlider.backgroundColor = "rgb(175,175,175)";


		soundService.robloxSound.button = function (id, tag) {
			var v2, button, volume, state, connect, sound, stopper;
			if (v2 = !!document.querySelector(".container-main>.content")) {
				button = $("<" + (tag || "div") + " class=\"rplusaudio icon-audio\">");
			} else {
				button = $("<" + (tag || "div") + " class=\"rplusaudio MediaPlayerIcon Play\">");
			}
			button.append(volume = plusSlider($("<input type=\"range\" step=\"1\" min=\"0\" max=\"100\" class=\"rplusslider\">").change(function () {
				var v = (Number($(this).val()) || 0) / 100;
				if (sound) {
					sound.volume(v);
				}
				storage.set("mediaVolume", v);
			}))).click(function (e) {
				e.preventDefault();
				if (sound && e.currentTarget == e.target) {
					if (sound.playing()) {
						state("Play");
					}
					sound.volume((Number(volume.val()) || 0) / 100)[sound.playing() ? "stop" : "play"]();
				}
			});
			state = function (c) { setTimeout(function () { button.attr("class", v2 ? "rplusaudio MediaPlayerIcon icon-" + (c == "Error" ? "brokenpage" : c.toLowerCase()) : "rplusaudio MediaPlayerIcon " + (c == "Audio" ? "Error" : c)); }, 10); };
			var afterSound = function (s) {
				sound = s;
				state("Play");
				s.play(function () {
					state("Pause");
					stopper = setInterval(function () {
						if (!$("body").find(button).length) {
							s.stop();
						}
					}, 500);
				}).stop(function () {
					if (stopper) {
						clearInterval(stopper);
					}
					state("Play");
				}).error(function () {
					state("Error");
				});
			};
			connect = function (i) {
				soundService.robloxSound(i, function (s) {
					if (s) {
						afterSound(s);
					} else {
						state(Number(i) === 0 ? "Audio" : "Error");
					}
				});
			};
			if (type(id) == "string") {
				afterSound(soundService(id, true));
			} else {
				connect(type(id) == "number" ? id : id.change(function () { connect(id.val()); }).val());
			}
			storage.get("mediaVolume", function (v) {
				if (type(v) == "number") {
					plusSlider(volume.val(Math.min(v * 100, 100)));
					if (sound) {
						sound.volume(v);
					}
				}
			});
			return button;
		};


		forumService.signatureTips = [
			"Up to 256 characters, one line",
			"Start with #code to use Lua syntax",
			"Compress item links with r+://ID",
			"Add #Robux to display your Robux",
			"Add #RAP to display your RAP"
		];

		forumService.parseSignature = function (sig, callBack) {
			if (sig.toLowerCase().indexOf("#rap") >= 0) {
				Roblox.users.getCurrentUserId().then(function (id) {
					Roblox.inventory.getCollectibles(id).then(function (inv) {
						callBack(forumService.parseSignature.finish(sig.replace(/#rap/gi, addComma(inv.rap))));
					}, function() {
						callBack(forumService.parseSignature.finish(sig));
					});
				}, function () {
					callBack(forumService.parseSignature.finish(sig));
				});
			} else {
				callBack(forumService.parseSignature.finish(sig));
			}
		};
		forumService.parseSignature.finish = function (sig) {
			return sig.replace(/#Robux/gi, "R$" + addComma($("#nav-robux-balance").text())).trim();
		};

		forumService.embed = function (content, maxImages, size) {
			if (content.html(content.html().replace(/<\s*br\s*\/?>/g, "\n")).html().toLowerCase().indexOf("#code") >= 0) {
				var newHtml = "";
				var lines = 0;
				var blankLine = false;
				content.html().split(/\n/).forEach(function (line) {
					var newBlock = line.trim().toLowerCase().startsWith("#code");
					if (newBlock) {
						if (lines) {
							newHtml += "</code></span>";
							lines = 0;
						}
						newHtml += "<span class=\"rplusLua\"><span></span><code class=\"lua hljs\">";
					}
					if (newBlock || (lines && line.startsWith("\t"))) {
						newHtml += (lines++ && !blankLine ? "\n" : "") + (line = line.substring(newBlock ? 6 : 1).trim());
						blankLine = lines == 1 && !line;
					} else if (lines) {
						newHtml += "</code></span>" + line + "\n";
						lines = 0;
					} else {
						newHtml += line + "\n";
					}
				});
				if (lines) {
					newHtml += "</code></span>";
					lines = 0;
				}
				content.html(newHtml).find(".rplusLua").each(function () {
					for (var lines = 0; lines < $(this).find("code").html().split(/\n/).length; ++lines) {
						$(this).find("span").append((lines === 0 ? "" : "\n") + (lines + 1).toString());
					}
					$(this).css("height", ((17 * lines) + 6) + "px").find("span").css("height", (17 * lines) + "px");
					if ($(this).find("code").html()) {
						hljs.highlightBlock($(this).find("code").css("height", (17 * lines) + "px")[0]);
					} else {
						$(this).remove();
					}
				});
			}
			content.html(content.html().replace(/(^|\W)R\$(\d[\d,]+)/gi, function (x, y, z) {
				return y + "<span class=\"robux\">" + z + "</span>";
			}).replace(/(^|\W)Ti?x(\d[\d,]+)/gi, function (x, y, z) {
				return y + "<span class=\"tickets\">" + z + "</span>";
			}).replace(/h?t?t?p?s?:?\/{0,2}w?w?w?\.?(youtu.be|youtube.com)(\/?[^\s<]*)/gi, function (x, y, z) {
				var t = url.param("t", z) ? "?t=" + url.param("t", z) : "";
				if (!t.match(/^\d*m?\d+s?$/) && !Number(t)) {
					t = "";
				}
				var vid = y.toLowerCase() == "youtu.be" ? url.path(z).substring(1) : url.param("v", z);
				return vid ? $("<a target=\"_blank\">").attr("data-video", vid).attr("href", "https://youtu.be/" + vid + t).text(" youtu.be/" + vid + t).prepend($("<span>")).outerHtml() : x;
			}).replace(/r\+:\/\/(\d+)/gi, function (x, y) {
				return "<a href=\"" + Roblox.catalog.getAssetUrl(y) + "\" target=\"_blank\">" + Roblox.catalog.getAssetUrl(y) + "</a>";
			}).replace(/(^|\W)R\+/gi, function (x, y) {
				return y + "<a href=\"/Groups/Group.aspx?gid=2518656\"><span></span></a>";
			})).find("a[href*='item'],a[href*='/catalog/']").each(function () {
				var anc = $(this);
				var u = anc.attr("href") || "";
				var assetId = Roblox.catalog.getIdFromUrl(u);
				if (assetId > 0) {
					Roblox.catalog.getAssetInfo(Roblox.catalog.getIdFromUrl(u)).then(function (asset) {
						if (asset.assetType == "Audio") {
							anc.text(" " + asset.name.trim()).before(soundService.robloxSound.button(asset.id));
						} else if ((asset.assetType == "Image" || asset.assetType == "Decal") && maxImages-- > 0) {
							anc.html("").append($("<img>").css({ "width": size + "px", "height": size + "px" }).attr("alt", u).attr("title", asset.name).attr("src", Roblox.thumbnails.getAssetThumbnailUrl(asset.id, 9)));
						} else if (asset.assetType == "Image" || asset.assetType == "Decal") {
							anc.text(asset.name);
						}
					});
				}
			});
			content.find("a[href*='youtu.be'][data-video]").each(function (i) {
				if (i < 3) {
					var anc = $(this);
					forumService.youtube(anc.attr("data-video")).then(function (t) {
						var time = 0;
						var turl = url.param("t", anc.attr("href"));
						if (turl.match(/\d+s/i)) {
							time = Number((turl.match(/(\d+)s/i) || [0, 0])[1]) || 0;
							time += (Number((turl.match(/(\d+)m/i) || [0, 0])[1]) || 0) * 60;
						} else {
							time = Number(turl) || 0;
						}
						var frame = $("<iframe width=\"560\" height=\"315\" frameborder=\"0\" allowfullscreen>").attr("src", "https://www.youtube-nocookie.com/embed/" + anc.attr("data-video") + "?rel=0&start=" + time).attr("style", "margin-right: calc(100% - 560px);").hide();
						anc.after(frame);
						content.find(".rplusLua").each(function () {
							var s = $(this);
							$(this).find("iframe").each(function () {
								s.after($(this));
							});
						});
						anc.find("span").attr("title", t).click(function (e) {
							e.preventDefault();
							frame[frame.is(":hidden") ? "slideDown" : "slideUp"]();
						});
					}).catch(function(e) {
						console.warn("Failed to get video title", anc.attr("data-video"), e);
					});
				}
			});
		};

		mainLoop = function () {
			Roblox.social.getFriends(4810352).then(function (friends) {
				var ids = [];
				friends.forEach(function (friend) {
					ids.push(friend.id);
				});
				if (ids.includes(Roblox.users.authenticatedUserId)) {
					$(".ad-slot[rplus!='replacedAd']").html("<iframe allowtransparency=\"true\" frameborder=\"0\" height=\"" + $(this).parent().attr("data-ad-height") + "\" scrolling=\"no\" src=\"/userads/3\" width=\"" + $(this).parent().attr("data-ad-width") + "\" data-js-adtype=\"iframead\">").attr("rplus", "replacedAd");
					$(".adp-gpt-container[rplus!='replacedAd'],.ads-container[rplus!='replacedAd'],.roblox-skyscraper[rplus!='replacedAd'],#Skyscraper[rplus!='replacedAd']").attr("rplus", "replacedAd").each(function () { var width = $(this).width(); if (width) { $(this).html("<iframe allowtransparency=\"true\" frameborder=\"0\" height=\"" + (({ 300: 270, 160: 600, 728: 90 })[width] || 0) + "\" scrolling=\"no\" src=\"/userads/" + (({ 300: 3, 160: 2, 728: 1 })[width] || 1) + "\" width=\"" + width + "\" data-js-adtype=\"iframead\">"); } });
				}
			});

			storage.get("navigation", function (n) {
				$("ul.nav.rbx-navbar").each(function () {
					var li = $(this).find(">li>a");
					for (var CN = 0; CN < Math.min(2, n.buttons.length) ; CN++) {
						var button = n.buttons[CN];
						if (li[CN + 2] && type(button) == "object") {
							$(li[CN + 2]).text(button.text).attr("href", button.href);
						}
					}
				});
			});

			var total = 0;
			$("#navigation .notification-blue").each(function (x, el) { total += (x = Number((el = $(this)).attr("title").replace(/,/g, "")) || 0); mainLoop.comma(x, function (t) { el.text(x > 0 ? t : ""); }); });
			$(".rbx-nav-collapse .notification-red").attr("title", addComma(total)).text(total > 0 ? (total < 100 ? total : (total < 1000 ? "99+" : Math.floor(Math.min(9999, total) / 1000) + "k+")) : "");

			/* Load once */
			if ($("#navigation").length && !$("#navigation .rplus-icon").length) {
				$("#nav-trade").append("<span class=\"notification-blue\" title=\"0\"></span>");
				$("#navigation .rbx-upgrade-now").before("<li><a href=\"/my/account?tab=rplus\"><span class=\"rplus-icon\"></span><span>Control Panel</span></a></li>");
				$(".notification-blue:empty,.notification-red:empty").removeClass("hide");
				$("#nav-message").attr("href", "/my/messages");
				var robux = Number($("#nav-robux-balance").html().split("<br>")[0].replace(/\D+/g, ""));
				if (robux) {
					mainLoop.comma(robux, function (t) {
						$("#nav-robux-amount").text(t);
					});
				}
				storage.get("navigation", function (v) {
					if (v.sideOpen && !$("#navigation.nav-show").length) {
						$(".rbx-nav-collapse")[0].click();
					}
				});
				storage.get("siteTheme", function (x) {
					localStorage.setItem("rplusTheme", x);
					if (!url.send().match(/^\/games\/341017984\//)) {
						$("body").addClass(x);
					}
				});
			}

			storage.get("navcounter", function (x) {
				// they're not really dummies, but ya know I need something to know when to set the timeout for mainLoop
				var dummyCounter = 0;
				var dummyGoal = 1;
				function upgradeTheDummy() {
					if (++dummyCounter == dummyGoal) {
						setTimeout(mainLoop, 500);
					}
				}
				if (x) {
					Roblox.users.getAuthenticatedUser().then(function (user) {
						if (!user) {
							setTimeout(mainLoop, 500);
							return;
						}
						if (user.bc != "NBC") {
							dummyGoal++;
							Roblox.trades.getTradesPaged("inbound", 1).then(function (trades) {
								$("#nav-trade .notification-blue").attr("title", trades.count);
								upgradeTheDummy();
							}, upgradeTheDummy);
						}
						dummyGoal++;
						Roblox.navigation.getNavigationCounters().then(function (counters) {
							$("#nav-message .notification-blue").attr("title", counters.unreadMessageCount);
							$("#nav-friends .notification-blue").attr("title", counters.friendRequestCount);
							upgradeTheDummy();
						}, upgradeTheDummy);
						Roblox.economy.getCurrencyBalance().then(function (currency) {
							var orig = ($("#nav-robux-balance").first().html() || "").split("<br>");
							mainLoop.comma(currency.robux, function (t) {
								$("#nav-robux-amount").text(t);
								$("#nav-robux-balance").html(addComma(currency.robux) + " ROBUX" + (orig.length > 1 ? "<br>$" + (currency.robux * .0025).toFixed(2) : ""));
							});
							upgradeTheDummy();
						}, upgradeTheDummy);
					}, upgradeTheDummy);
				} else {
					upgradeTheDummy();
				}
			});
		};
		mainLoop.comma = function (n, cb) {
			if (!isCB(cb)) { return "0"; }
			storage.get("navigation", function (x) {
				x = Math.max(1000, Number(x && x.counterCommas) || 100000000);
				cb(n < x ? addComma(n) : Math.floor(n / (n < 1000000 ? 1000 : 1000000)) + (n >= 1000000 ? "m+" : "k+"));
			});
		};
		mainLoop();
		window.comma = mainLoop.comma;

		storage.updated(function (k, v) {
			if (k == "siteTheme") {
				localStorage.setItem("rplusTheme", v);
				if (url.send().match(/^\/games\/341017984\//)) {
					$("body").attr("class", "easter-theme");
				} else if (url.send().match(/\/users\/\d+\/profile/) && document.querySelector(".profile-avatar-image .icon-obc")) {
					$("body").attr("class", "obc-theme");
				} else if (!isTradeWindow) {
					$("body").attr("class", v);
				}
			}
		});


		$("body").on("change", "*[storage]", function (s, v) {
			s = $(this).attr("storage"), v = $(this).val();
			if ($(this).attr("type") == "checkbox") {
				storage.set(s, $(this).prop("checked"));
			} else if ($(this).prop("tagName") == "SELECT") {
				storage.set(s, v);
			} else {
				console.warn("Unhandled storage attempt", s, v);
			}
		}).on("input", plusSlider.selector, function () {
			plusSlider($(this));
		}).on("change", plusSlider.selector, function () {
			plusSlider($(this));
		}).on("click", ".friend-status.icon-game", function (e) {
			e.preventDefault();
			var id = Roblox.users.getIdFromUrl($(this).parent().parent().find(">.friend-link").attr("href"));
			if (id) {
				Roblox.games.launch({
					followUserId: id
				});
			}
		}).on("dblclick", ".rplusLua>span:first-child", function () {
			$(this).parent().find(">code").selectText();
		}).on("click", ".rplusinventory[userid]", function () {
			RPlus.quickInfo.trigger(Roblox.users.getProfileUrl(Number($(this).attr("userid"))));
		});

		plusSlider($(plusSlider.selector));

		$(".MediaPlayerIcon[data-mediathumb-url]").each(function () { $(this).replaceWith(soundService.robloxSound.button($(this).attr("data-mediathumb-url"), $(this).prop("tagName"))); });



	}
})[document.contentType])(window.location.hostname.split("."), url.send(), []);



// WebGL3D
