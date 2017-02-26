// notifications.js [4/15/2016]
browser.runtime.sendMessage({ notification: "get" }, function (list) {
	var origHTML = $("body").html();
	if (Object.keys(list).length) { $("body").html("<div></div>"); }
	foreach(list, function (list, o) {
		var note = $("<div class=\"notification\">").css("cursor", o.clickable ? "pointer" : "default").click(function (e) {
			if (e.target.localName != "button" && e.target.localName != "span") {
				browser.runtime.sendMessage({ notification: "click", id: o.id })
			}
		});
		note.append($("<img class=\"icon\">").attr("src", o.icon));
		note.append($("<span class=\"close\">").text("X").click(function () {
			note.css("height", "0px");
			browser.runtime.sendMessage({ notification: "close", id: o.id });
			setTimeout(function () {
				note.remove();
			}, 250);
		}));
		note.append($("<p class=\"header\">").text(o.header));
		note.append($("<p class=\"lite\">").text(o.lite));
		note.append($("<table>").append(list = $("<tbody>")));
		foreach(o.items, function (n, o) { list.append($("<tr>").append($("<td>").text(n)).append($("<td>").text(o))); });
		var buttons = $("<div class=\"buttons\">");
		foreach(o.buttons, function (n, b) {
			var e;
			buttons.append(e = $("<button>").text(b.text).click(function () {
				browser.runtime.sendMessage({ notification: "button" + (Number(n) + 1) + "Click", id: o.id });
			}));
			if (b.icon) {
				e.prepend($("<img>").attr("src", b.icon));
			}
		});
		$("body>div").prepend(note.append(buttons));
		setTimeout(function () {
			if (note.height() <= 75) {
				note.css("height", note.height() + (o.buttons.length * 20));
				buttons.css({ "position": "absolute", "top": "75px" });
			} else {
				note.css(note.height() + "px");
			}
		}, 500);
	});
});



// WebGL3D
