var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ForumAddPost = function () {
	var reply = Number(url.param("PostID"));
	var forum = Number(url.param("ForumID"));
	if (!reply && !forum) {
		return;
	}

	var subject = $("#ctl00_cphRoblox_Createeditpost1_PostForm_NewPostSubject").attr("maxlength", 60).removeAttr("type").css("padding-left", "3px");
	subject.label = $("#ctl00_cphRoblox_Createeditpost1 tbody tbody>tr:first-child>td:first-child>span").css("margin-top", "0px");
	var body = $("#ctl00_cphRoblox_Createeditpost1_PostForm_PostBody").attr("maxlength", 49730);
	body.label = $("#ctl00_cphRoblox_Createeditpost1 tbody tbody>tr:nth-child(2)>td:first-child>span");
	body.parent().css("padding-bottom", "0px");

	storage.get("forums", function (f) {
		if (f.nextPost) {
			if (forum == 35) {
				body.val(f.nextPost);
			}
			delete f.nextPost;
			storage.set("forums", f);
		}
	});

	var postButton = $("#ctl00_cphRoblox_Createeditpost1_PostForm_PostButton");
	var toggleButton = function (button, on) {
		if (on) {
			button.removeAttr("disabled").removeClass("btn-control-disabled").addClass("btn-control");
		} else {
			button.attr("disabled", "").removeClass("btn-control").addClass("btn-control-disabled");
		}
	};
	var postStatus = function (remaining) {
		if (type(remaining) == "number") {
			postButton.val(" Post" + (remaining > 0 ? " (" + Math.ceil(remaining) + ") " : " "));
			remaining = remaining > 0;
		} else {
			remaining = false;
		}
		if (subject.length) {
			subject.label.html("Subject (" + (60 - subject.val().length) + "):");
		}
		if (body.length) {
			body.label.html(addComma(50000 - body.val().length) + "<br>Message:");
		}
		toggleButton(postButton, (!body.length || body.val()) && (!subject.length || subject.val()) && !remaining);
		toggleButton($("#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewButton"), (!body.length || body.val()) && (!subject.length || subject.val()));
	};

	if (body.length) {
		var signature; signature = {
			id: 0,
			lines: 1,
			attempt: "",
			val: "",
			tr: $("<tr><td valign=\"top\" align=\"right\" nowrap><span class=\"normalTextSmallBold\">Signature:</span></td><td valign=\"top\" align=\"left\" style=\"padding-top: 0px;padding-bottom: 10px;\"><input autocomplete=\"off\"/></td></tr>"),
			set: function (sig) {
				var i = ++signature.id;
				signature.input.val(signature.val = signature.attempt = sig);
				forumService.parseSignature(sig, function (s) {
					if (i == signature.id) {
						signature.input.attr("title", signature.val = s);
					}
				});
			}
		};
		body.parent().parent().after(signature.tr);
		signature.input = signature.tr.css({ "padding-top": "0px", "padding-bottom": "0px" }).find("input").css({ "width": body.width() + "px", "padding-left": "3px" }).attr("placeholder", array.random(forumService.signatureTips)).change(function () {
			var sig = ($(this).val() || "").substring(0, 256);
			storage.get("forums", function (f) {
				f.signature = sig;
				storage.set("forums", f);
			});
		}).keyup(function (e) {
			if (e.keyCode == 13) {
				$(this).blur();
			}
		});

		subject.keyup(postStatus).keydown(postStatus).change(postStatus);
		body.keyup(postStatus).keydown(postStatus).change(postStatus).keydown(function (e) {
			if (e.keyCode == 9) {
				var sel = { s: Number(this.selectionStart), e: Number(this.selectionEnd) };
				sel.a = sel.s != sel.e;
				if (sel.a) {
					var val = $(this).val();
					sel.v = val.substring(sel.s, sel.e);
					sel.l = val.split(/\n/);
					var cline = $(this).getCaretLine();
					var eline = cline + (sel.v.split(/\n/).length - 1);
					for (var CN = cline - 1; CN < eline; CN++) {
						sel.e++;
						sel.l[CN] = "\t" + sel.l[CN];
					}
					$(this).val(sel.l.join("\n"));
					var startLineSel = 0;
					for (var CN = 0; CN < cline - 1; CN++) {
						startLineSel += sel.l[CN].length + 1;
					}
					this.selectionStart = startLineSel;
					this.selectionEnd = sel.e;
				} else {
					$(this).val($(this).val().substring(0, sel.s) + "\t" + $(this).val().substring(sel.e));
					this.selectionStart = this.selectionEnd = sel.s + 1;
				}
				e.preventDefault();
			}
		}).keypress(function (e) {
			if (e.keyCode == 13) {
				var val = $(this).val();
				var line = $(this).getCaretLine();
				var tabs = (val.split("\n")[line - 1].match(/^\t+/) || [""])[0];
				var caret = $(this).getCaretPosition();
				$(this).val(val.substring(0, caret) + "\n" + tabs + val.substring(caret));
				this.selectionStart = this.selectionEnd = caret + tabs.length + 1;
				e.preventDefault();
			}
		});

		storage.get("forums", function (f) {
			signature.lines = f.lines;
			signature.set(f.signature);
			var oldBody = body.val().split("\n");
			if (string.endsWith(oldBody[oldBody.length - 1], RegExp.escape(f.signature).replace(/#RAP/gi, "[\\d,]+").replace(/#Robux/gi, "R\\$[\\d,]+").regex("i"))) {
				oldBody[oldBody.length - 1] = "";
				body.val(oldBody.join("\n").trim());
			}
		});
		storage.updated(function (k, v) {
			if (k == "forums" && type(v.lines) == "number") {
				signature.lines = Math.min(4, Math.max(1, Number(v.lines) || 0));
			}
			if (k == "forums" && v && type(v.signature) == "string" && v.signature != signature.attempt) {
				signature.set(v.signature);
			}
		});

		$("#aspnetForm").submit(function () {
			body.val(body.val() + ("\n".repeat(signature.lines)) + signature.val);
			return true;
		});
	} else {
		$("#ctl00_cphRoblox_Createeditpost1 tbody tbody tr:first-child").addClass("forum-post");
		$("#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewBody").parent().css("white-space", "nowrap");
		storage.get("forums", function (f) {
			if (f.embedding) {
				forumService.embed($("#ctl00_cphRoblox_Createeditpost1_PostForm_PreviewBody"), 25, f.embedSize);
			}
		});
	}

	RPlus.settings.get().then(function (settings) {
		var floodcheck = settings.forumFloodCheck || 15;
		setInterval(function () {
			storage.get("forums", function (f) {
				postStatus(floodcheck - ((getMil() - (Number(f.floodcheck) || 0)) / 1000));
			});
		}, 250);
	}).catch(function(e) {
		console.warn("uh oh the floodcheck", e);
	});

	$("#ctl00_cphRoblox_Createeditpost1_PostForm_Cancel").attr("type", "button").click(function (e) {
		e.preventDefault();
		history.back();
	});

	setTimeout(function () {
		if (subject.length) {
			subject.focus();
		} else {
			body.focus();
		}
	}, 100);

	return {};
};

RPlus.Pages.ForumAddPost.patterns = [/^\/Forum\/AddPost\.aspx/i];


// WebGL3D
