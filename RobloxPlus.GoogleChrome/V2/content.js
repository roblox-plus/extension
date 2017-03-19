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


		users.userId = Number($("#chat-data-model").data("userid")) || 0;


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

		url.roblox.subdomain = subdomain == "forum" ? "www" : subdomain;


		forumService.signatureTips = [
			"Up to 256 characters, one line",
			"Start with #code to use Lua syntax",
			"Compress item links with r+://ID",
			"Add #Robux to display your Robux",
			"Add #RAP to display your RAP"
		];

		forumService.parseSignature = function (sig, callBack) {
			if (sig.toLowerCase().indexOf("#rap") >= 0) {
				users.currentId(function (id) {
					users.inventory(id, function (inv) {
						if (inv.load.total >= 100) {
							callBack(forumService.parseSignature.finish(sig.replace(/#rap/gi, addComma(inv.rap))));
						}
					});
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
				return "<a href=\"" + url.roblox("/item.aspx?id=" + y) + "\" target=\"_blank\">https://www.roblox.com/item.aspx?id=" + y + "</a>";
			}).replace(/(^|\W)R\+/gi, function (x, y) {
				return y + "<a href=\"/Groups/Group.aspx?gid=2518656\"><span></span></a>";
			})).find("a[href*='item']").each(function () {
				var anc = $(this);
				var u = anc.attr("href") || "";
				if (u.match(/-item\?/) || u.match(/\/item\.aspx\?/)) {
					catalog.info(Number(url.param("id", u)), function (info) {
						if (info.success) {
							if (info.assetType == "Audio") {
								anc.text(" " + info.name.trim()).before(soundService.robloxSound.button(info.id));
							} else if ((info.assetType == "Image" || info.assetType == "Decal") && maxImages-- > 0) {
								anc.html("").append($("<img>").css({ "width": size + "px", "height": size + "px" }).attr("alt", u).attr("title", info.name).attr("src", info.thumbnail));
							} else if (info.assetType == "Image" || info.assetType == "Decal") {
								anc.text(info.name);
							}
						}
					});
				}
			});
			content.find("a[href*='youtu.be'][data-video]").each(function (i) {
				if (i < 3) {
					var anc = $(this);
					forumService.youtube(anc.attr("data-video"), function (t) {
						if (t) {
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
						}
					});
				}
			});
		};



		popbox = {
			id: 0,
			history: [],
			search: "",
			current: "",

			box: $("<div id=\"rplusPopbox\">").append(
				$("<span id=\"rplusPopboxHover\">").append($("<img>").attr("src", ext.getUrl("images/icons/icon_32x32.png"))).click(function () {
					popbox.box.addClass("open");
				}).on("dragenter", function () {
					popbox.box.addClass("open");
				})
			).append(
				$("<span class=\"icon-back\">").click(function () {
					popbox.back();
				}).hide()
			).append("<p><a></a></p>").append(
				$("<span class=\"icon-close\">").click(function () {
					popbox.box.removeClass("open");
				})
			).append(
				$("<input class=\"input-field\" placeholder=\"Drag a link here to load a preview\">").keyup(function (e) {
					if (e.keyCode == 13) {
						if ($(this).val()) {
							popbox.display($(this).val());
						} else {
							$(this).val(popbox.current);
						}
					}
				}).on("drop", function (e) { popbox.drop(e); })
			),

			drop: function (e) {
				e.preventDefault();
				var v = e.originalEvent.dataTransfer.getData("text");
				if (type(v) == "string") {
					popbox.display(v);
				} else {
					$(this).val("");
				}
			},
			back: function () {
				popbox.display(popbox.history.pop(), true);
				popbox.box.find(">.icon-back")[popbox.history.length ? "show" : "hide"]();
			},
			display: function (arg, back) {
				if (type(arg) == "string") {
					if (arg.toLowerCase() == popbox.search.toLowerCase() || arg.toLowerCase() == popbox.current.toLowerCase()) {
						popbox.input.val(popbox.current);
						popbox.box.addClass("open");
						return;
					}
				}
				var i = ++popbox.id;
				var header = popbox.box.find(">p>a").removeAttr("href").removeClass("fail").text("...").removeAttr("title");
				var go = function (x, a) {
					popbox.div.find(">div").hide();
					var elem = popbox.action[x].div;
					elem = elem && {
						div: elem,
						icon: {
							anchor: elem.find(">a.icon").removeAttr("href").removeAttr("title"),
							img: elem.find(">a.icon>img").attr("src", "https://t0.rbxcdn.com/eee964cc46e3dd3e9081325a5c91e720"),
							label: elem.find(">a.icon>span").removeAttr("class")
						}
					};
					popbox.action[x](a, elem, i);
					if (elem) {
						elem.div.show();
					}
				};

				if (type(arg) == "string") {
					if (!back && popbox.current) {
						popbox.history.push(popbox.current);
					}
					popbox.current = popbox.search = arg;

					var sc = arg.split(":");
					var ac = sc.splice(1).join(":");
					sc = sc[0].toLowerCase();
					if (arg.match(url.roblox.linkify)) {
						var path = url.path(arg).toLowerCase();
						if (string.startsWith(path, /\/users?\//i) || string.startsWith(path, /\/User\.aspx/i)) {
							go("user", url.param("username", arg) || users.urlId(arg));
						} else if (path.endsWith("-item") || path.startsWith("/item.aspx")) {
							go("item", url.param("id", arg));
						} else if (path.match(/^\/catalog\/\d+\//i) || path.match(/^\/library\/\d+\//i)) {
							go("item", (path.match(/^\/\w+\/(\d+)/) || ["", 0])[1]);
						} else {
							popbox.clear();
							return;
						}
					} else if (sc == "user") {
						go("user", ac);
					} else if (sc == "userid") {
						go("user", Number(ac));
					} else if (sc == "item") {
						go("item", ac);
					} else if (sc == "lim" || sc == "limited") {
						go("lim", ac);
					} else if (arg.length >= 3) {
						catalog.limiteds(function (lims) {
							var possible = catalog.limiteds.search(lims, arg, true);
							if (possible.length == 1) {
								go("item", possible[0].id);
							} else {
								popbox.clear();
							}
						});
					} else {
						popbox.clear();
						return;
					}
				} else if (!arg) {
					popbox.history = [];
					popbox.current = popbox.search = "";
					popbox.clear();
				}
				popbox.box.find(">.icon-back")[popbox.history.length ? "show" : "hide"]();
				popbox.box.addClass("open");
			},
			clear: function () {
				popbox.header.text("");
				popbox.input.val("");
				popbox.div.find(">div").hide();
			},

			action: {
				"user": function (arg, elem, i) {
					elem.inv = elem.div.find(">div>div:first-child>ul").html("");
					elem.outfit = elem.div.find(">div>div:last-child>ul").html("");
					elem.div.find("#rppbuRAP>span:last-child,#rppbuItems>span:last-child").text("0");
					popbox.action.user.resort();

					users[type(arg) == "string" ? "getByUsername" : "getById"](arg, function (u) {
						if (popbox.id != i) { return; }
						if (u.id) {
							popbox.header.attr("href", url.roblox("/users/" + u.id + "/profile")).text(u.username);
							popbox.input.val(popbox.current = "user:" + u.username);
							elem.icon.anchor.attr("href", popbox.header.attr("href"));
							elem.icon.img.attr("src", users.thumbnail(u.id, 4));
							if (u.bc != "NBC") {
								elem.icon.label.attr("class", "icon-" + u.bc.toLowerCase() + "-label");
							}

							users.inventory(u.id, function (inv) {
								if (popbox.id != i) { return; }
								var perc = elem.div.find("#rppbuFlipper>span:nth-child(2)");
								foreach(inv.data, function (n, o) {
									var box = elem.inv.find(".list-item>a[href='/item.aspx?id=" + o.id + "']");
									var count = box.find(".item-serial-number");
									if (!box.length) {
										elem.inv.append($("<li class=\"list-item\">").append(
											box = $("<a class=\"store-card\" target=\"_blank\" href=\"/item.aspx?id=" + Number(o.id) + "\">").attr("data-rap", o.rap).attr("title", o.name).append(
												$("<img class=\"store-card-thumb\">").attr("src", o.image),
												count = $("<div class=\"item-serial-number\">").text("x1"),
												$("<div class=\"store-card-caption\">").append(
													$("<div class=\"text-overflow store-card-name\">").text(o.name),
													"<div class=\"store-card-price\" title=\"RAP: " + addComma(o.rap) + "\"><span class=\"icon-robux\"></span><span class=\"text-robux\">" + addComma(o.rap) + "</span></div>"
												)
											)
										));
									}
									count.text("x" + Object.keys(o.userAssetId).length);
									if (o.stock) {
										var serials = "";
										foreach(o.userAssetId, function (u, s) { serials += (serials ? ", " : "") + "#" + s; });
										count.attr("title", serials);
									}
								});
								elem.div.find("#rppbuRAP>span:last-child").text(addComma(inv.rap));
								elem.div.find("#rppbuItems>span:last-child").text(addComma(inv.count.total));
								if (inv.load.total < 100) {
									if (perc.text() != "Outfit") {
										perc.text("Inventory (" + Math.floor(inv.load.total) + "%)");
									}
								} else {
									if (perc.text() != "Outfit") { perc.text("Inventory"); }
									popbox.action.user.resort();
								}
							});

							outfit.get(u.id, function (outfit) {
								if (popbox.id != i) { return; }
								var display = function (o) {
									if (type(o) == "object" && o.id) {
										elem.outfit.append($("<li class=\"list-item\">").attr("data-type", o.type).append(
											$("<a class=\"store-card\">").attr("href", "/item.aspx?id=" + o.id).attr("title", o.name).append(
												$("<img class=\"store-card-thumb\">").attr("src", Roblox.thumbnails.getAssetThumbnailUrl(o.id, 3)),
												$("<div class=\"store-card-caption\">").append($("<div class=\"text-overflow store-card-name\">").text(o.name))
											)
										));
									}
								};
								foreach(outfit, function (n, o) {
									if (n == "hats") {
										for (var x in o) {
											display(o[x]);
										}
									} else if (n != "id" && n != "username") {
										display(o);
									}
								});
							});
						} else {
							popbox.header.text("No user found");
							popbox.input.val("");
						}
					});
				},
				"item": function (arg, elem, i) {
					elem.div.find(">table,.btn-toggle,#rppbiPrice>*").hide();
					elem.div.find(">table>tbody").html("");
					elem.div.find("#rppbiDescription").val("");

					catalog.info(Number(arg), function (info) {
						if (popbox.id != i) { return; }
						if (info.success) {
							popbox.action.item.current = info;
							popbox.header.attr("href", url.roblox("/item.aspx?id=" + info.id)).text(info.name).attr("title", info.name);
							popbox.input.val(popbox.current = "item:" + info.id);
							elem.icon.anchor.attr("href", popbox.header.attr("href"));
							elem.icon.img.attr("src", Roblox.thumbnails.getAssetThumbnailUrl(info.id, 4)).attr("title", info.assetType);
							if (info.limited || info.bc != "NBC") {
								elem.icon.label.attr("class", "icon" + (info.limited ? "-limited" : "") + (info.limitedUnique ? "-unique" : "") + (info.bc != "NBC" ? "-" + info.bc.toLowerCase() : "") + "-label");
							}

							elem.div.find("#rppbiPrice")[info.assetType == "Decal" || info.assetType == "Audio" || info.assetType == "Model" || info.free || info.robuxPrice || info.editable || info.lowestPrice ? "show" : "hide"]().find(">.btn-toggle").toggleClass("on", info.free);
							if (info.assetType == "Decal" || info.assetType == "Audio" || info.assetType == "Model" || info.free) {
								elem.div.find("#rppbiPrice>*").hide();
								elem.div.find("#rppbiPrice>.btn-toggle").show();
							} else {
								elem.div.find("#rppbiPrice>*").show();
								elem.div.find("#rppbiPrice>.btn-toggle").hide();
								elem.div.find("#rppbiPrice>input").val(addComma(info.lowestPrice || info.robuxPrice) + (info.privateSellers.length && info.privateSellers[0].seller.id == users.userId ? " (You)" : ""))[info.editable ? "removeAttr" : "attr"]("readonly", "readonly");
							}
							elem.div.find("#rppbiDescription").val(info.description)[info.editable ? "removeAttr" : "attr"]("readonly", "readonly");
							elem.div.find("#rppbiPrice>input").css("height", info.rap ? "14px" : "28px");
							elem.div.find("#rppbiPrice>span:last-child")[info.rap ? "show" : "hide"]().text("RAP: " + addComma(info.rap));

							foreach(info.privateSellers, function (n, o) {
								elem.div.find(">table>tbody").append($("<tr>").append($("<td>").append($("<a>").attr({ "title": o.seller.username, "href": url.roblox("/users/" + o.seller.id + "/profile") }).append($("<img>").attr("src", users.thumbnail(o.seller.id, 0)), o.seller.username)), $("<td>").append("<span class=\"icon-robux\"></span> " + addComma(o.price))));
							});
							elem.div.find(">table")[info.privateSellers.length ? "show" : "hide"]();
						} else {
							popbox.header.text("Failed to load item");
							popbox.input.val("");
						}
					});
				},
				"lim": function (arg, elem, i) {
					elem.div.find(">ul").html(arg ? "" : "Enter at least one character");
					popbox.input.val("lim:" + arg);
					if (!arg) {
						popbox.header.text("0 limiteds found");
						return;
					}
					catalog.limiteds(function (lims) {
						if (popbox.id != i) { return; }
						var displayed = catalog.limiteds.search(lims, arg);
						displayed.forEach(function (o) {
							elem.div.find(">ul").append($("<li class=\"list-item\">").append(
								$("<a class=\"store-card\" target=\"_blank\" href=\"/item.aspx?id=" + Number(o.id) + "\">").attr("data-rap", o.rap).attr("title", o.name).append(
									$("<img class=\"store-card-thumb\">").attr("src", Roblox.thumbnails.getAssetThumbnailUrl(o.id, 4)),
									$("<div class=\"store-card-caption\">").append(
										$("<div class=\"text-overflow store-card-name\">").text(o.name),
										"<div class=\"store-card-price\" title=\"RAP: " + addComma(o.rap) + "\"><span class=\"icon-robux\"></span><span class=\"text-robux\">" + addComma(o.rap) + "</span></div>"
									)
								)
							));
						});
						popbox.header.text(displayed.length + " limiteds found");
						if (!displayed.length) {
							elem.div.find(">ul").text("No limiteds match that name partial.");
						} else if (displayed.length == 1) {
							popbox.display("item:" + displayed[0].id);
						}
					});
				}
			}
		};

		if (!isTradeWindow) {
			popbox.header = popbox.box.find(">p>a");
			popbox.input = popbox.box.find(">input");
			popbox.box.append(popbox.div = $("<div>").on("dragover", function (e) {
				e.preventDefault();
			}).on("drop", popbox.drop));


			popbox.action.user.div = $("<div id=\"rplusPopboxUser\">").append($("<a class=\"icon\">").append($("<img>"), $("<span>"))).append($("<p id=\"rppbuFlipper\">").append($("<span class=\"icon-left-16x16\">").click(function () { popbox.action.user.flip(); }), "<span>Inventory</span>", $("<span class=\"icon-right-16x16\">").click(function () { popbox.action.user.flip(); })), "<p id=\"rppbuRAP\"><span class=\"icon-robux\"></span><span>0</span></p>", "<p id=\"rppbuItems\"><span class=\"text-label\">Items</span><span class=\"text-lead\">0</span></p>", $("<select>").change(function () { popbox.action.user.resort(); }).append($("<option>").val("rap").text("RAP"), $("<option>").val("hoard").text("Hoard"), $("<option>").val("combined").text("Combined"), $("<option>").val("new").text("Newest"), $("<option>").val("old").text("Oldest"), $("<option>").val("alphabetical").text("Alphabetical"))).append($("<div>").append("<div><ul class=\"hlist store-cards\"></ul></div>", $("<div><ul class=\"hlist store-cards\"></ul></div>").hide()));

			popbox.action.user.flip = function (x) {
				var i = ++popbox.action.user.flip.id;
				var flip = popbox.action.user.div.find(">div");
				var c = flip.find(">div:last-child:hidden").length > 0;
				x = x == undefined ? !c : !!x;
				if (c != x) {
					tween(pround(((flip.attr("style") || "0deg").match(/Y\(\d+deg\)/) || [""])[0]), x ? -180 : 180, "linear", "in", 300, function (r) {
						if (i != popbox.action.user.flip.id) { return; }
						flip.attr("style", "transform: rotateY(" + r + "deg);");
						if ((r >= -95 && r <= -85) || (r >= 85 && r <= 95)) {
							flip.find(">div:first-child")[x ? "show" : "hide"]();
							popbox.action.user.div.find("#rppbuRAP,#rppbuItems,select")[x ? "show" : "hide"]();
							flip.find(">div:last-child")[x ? "hide" : "show"]();
						}
					}, function () {
						if (i != popbox.action.user.flip.id) { return; }
						flip.attr("style", "transform: rotateY(0deg);");
						flip.find(">div:first-child")[x ? "show" : "hide"]();
						popbox.action.user.div.find("#rppbuRAP,#rppbuItems,select")[x ? "show" : "hide"]();
						flip.find(">div:last-child")[x ? "hide" : "show"]();
						popbox.action.user.div.find("#rppbuFlipper>span:nth-child(2)").text(x ? "Inventory" : "Outfit");
					});
				}
			};
			popbox.action.user.flip.id = 0;

			popbox.action.user.resort = function () {
				var i = ++popbox.action.user.resort.id;
				var list = [];
				var ul = popbox.action.user.div.find(">div>div:first-child>ul");
				ul.find(">li").each(function () {
					list.push({
						li: $(this),
						id: Number(url.param("id", $(this).find(">a").attr("href"))) || 0,
						rap: Number(($(this).find(".store-card-price").attr("title") || "").replace(/\D+/g, "")) || 0,
						name: $(this).find(">a").attr("title") || "",
						amount: Number(($(this).find(".item-serial-number").text() || "").substring(1)) || 0
					});
				});
				var s = popbox.action.user.div.find("select").val();
				list.sort(function (a, b) {
					if (s == "hoard") {
						return b.amount - a.amount;
					} else if (s == "combined") {
						return (b.amount * b.rap) - (a.amount * a.rap);
					} else if (s == "new") {
						return b.id - a.id;
					} else if (s == "old") {
						return a.id - b.id;
					} else if (s == "alphabetical") {
						return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
					} else {
						return b.rap - a.rap;
					}
				});
				var pop; pop = function () {
					if (i != popbox.action.user.resort.id || !list.length) { return; }
					ul.prepend(list.pop().li);
					setTimeout(pop, 1);
				};
				pop();
			};
			popbox.action.user.resort.id = 0;


			popbox.action.item.div = $("<div id=\"rplusPopboxItem\">").append($("<a class=\"icon\">").append($("<img>"), $("<span>"))).append($("<div id=\"rppbiPrice\" class=\"icon-text-wrapper\">").append($("<span class=\"btn-toggle\"><span class=\"toggle-flip\"></span><span class=\"toggle-on\">Free</span><span class=\"toggle-off\">Free</span></span>").click(function () {
				var info = popbox.action.item.current;
				if (info && info.editable) {
					catalog.update({
						id: info.id,
						free: $(this).toggleClass("on", !$(this).hasClass("on")).hasClass("on")
					}, function () { });
				}
			}), $("<span class=\"icon-robux\">"), $("<input type=\"input-field\" readonly=\"readonly\">").enterBlur().change(function () {
				var info = popbox.action.item.current;
				if (info && info.editable) {
					if ($(this).val()) {
						catalog.update({
							id: info.id,
							robux: pround($(this).val())
						}, function () { });
					} else {
						$(this).val(addComma(info.robuxPrice));
					}
				}
			}), $("<span>"))).append($("<textarea id=\"rppbiDescription\" maxlength=\"1000\">").change(function () {
				var info = popbox.action.item.current;
				if (info && info.editable) {
					catalog.update({
						id: info.id,
						description: $(this).val()
					}, function () { });
				}
			})).append("<table class=\"table table-striped\"><thead><tr><th>Seller</th><th>Price</th></tr></thead><tbody></tbody></table>");


			popbox.action.lim.div = $("<div id=\"rplusPopboxLimiteds\">").append("<ul></ul>");


			foreach(popbox.action, function (n, o) { popbox.div.append(o.div.hide()); });
			storage.get("rplusPopbox", function (on) {
				if (!on) {
					popbox.box.find("#rplusPopboxHover").hide();
				}
				$("body").append(popbox.box);
			});
		}



		foreach(list, function (n, o) {
			if (foreach(type(o.match) == "string" || type(o.match) == "regexp" ? [o.match] : (type(o.match) == "array" ? o.match : []), function (n, m) {
				if (m = upath.match(m)) {
					o.fill(m);
			}
			})) {
				return true;
			}
		});


		mainLoop = function () {
			if ($("#navigation .text-lead>.text-overflow[href*='/profile']").length && friendService.creatorFriends.cache[users.urlId($("#navigation .text-lead>.text-overflow[href*='/profile']").attr("href"))]) {
				$(".ad-slot[rplus!='replacedAd']").html("<iframe allowtransparency=\"true\" frameborder=\"0\" height=\"" + $(this).parent().attr("data-ad-height") + "\" scrolling=\"no\" src=\"/userads/3\" width=\"" + $(this).parent().attr("data-ad-width") + "\" data-js-adtype=\"iframead\">").attr("rplus", "replacedAd");
				$(".adp-gpt-container[rplus!='replacedAd'],.ads-container[rplus!='replacedAd'],.roblox-skyscraper[rplus!='replacedAd'],#Skyscraper[rplus!='replacedAd']").attr("rplus", "replacedAd").each(function () { var width = $(this).width(); if (width) { $(this).html("<iframe allowtransparency=\"true\" frameborder=\"0\" height=\"" + (({ 300: 270, 160: 600, 728: 90 })[width] || 0) + "\" scrolling=\"no\" src=\"/userads/" + (({ 300: 3, 160: 2, 728: 1 })[width] || 1) + "\" width=\"" + width + "\" data-js-adtype=\"iframead\">"); } });
			}

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
				if (x) {
					users.current(function (u) {
						if (!u.id) { setTimeout(mainLoop, 500); return; }
						if (u.bc != "NBC") {
							tradeSystem.get({}, function (trades) {
								setTimeout(mainLoop, 500);
								$("#nav-trade .notification-blue").attr("title", trades.total);
							});
						} else {
							setTimeout(mainLoop, 500);
						}
						$("#nav-message .notification-blue").attr("title", u.messages.unread);
						$("#nav-friends .notification-blue").attr("title", u.friendRequests);
						var orig = ($("#nav-robux-balance").first().html() || "").split("<br>");
						mainLoop.comma(u.robux, function (t) {
							$("#nav-robux-amount").text(t);
							$("#nav-robux-balance").html(addComma(u.robux) + " ROBUX" + (orig.length > 1 ? "<br>$" + (u.robux * .0025).toFixed(2) : ""));
						});
					});
				} else {
					setTimeout(mainLoop, 500);
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
		friendService.creatorFriends(function (friends) {
			friendService.creatorFriends.cache = friends;
			mainLoop();
		});
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
			var id = users.urlId($(this).parent().parent().find(">.friend-link").attr("href"));
			if (id) {
				Roblox.games.launch({
					followUserId: id
				});
			}
		}).on("dblclick", ".rplusLua>span:first-child", function () {
			$(this).parent().find(">code").selectText();
		}).on("click", ".rplusinventory[userid]", function () {
			popbox.display("www.roblox.com/users/" + $(this).attr("userid") + "/profile");
		});

		plusSlider($(plusSlider.selector));

		$(".MediaPlayerIcon[data-mediathumb-url]").each(function () { $(this).replaceWith(soundService.robloxSound.button($(this).attr("data-mediathumb-url"), $(this).prop("tagName"))); });



	}
})[document.contentType])(window.location.hostname.split("."), url.send(), []);



// WebGL3D
