var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.ForumDefault = function () {
	$(".last-post div.notranslate,.post-list-author>div>div").attr("draggable", "true").on("dragstart", function (e) {
		e.originalEvent.dataTransfer.setData("text/plain", "user:" + ($(this).text() || "").trim());
	});

	return {};
};

RPlus.Pages.ForumDefault.patterns = [/^\/Forum\//i];


// WebGL3D
