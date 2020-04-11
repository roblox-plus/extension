// overwrite.js [4/11/16]
rplus = window.rplus || {};

rplus.ajax = [
	{
		match: /^\/games\/getgameinstancesjson/i,
		before: function (d) {
			$("#rbx-running-games .rbx-game-server-item-container").html("");
		}
	}, {
		match: /^\/games\/getgameinstancesjson/i,
		success: function (r) {
			try {
				r = JSON.parse(r);
			} catch (e) {
				console.warn(e);
				return;
			}

			var maxPage = Math.max(1, Math.ceil(r.TotalCollectionSize / 10));
			console.log("Max games page: " + maxPage);

			$(".rbx-running-games-footer .pager-total>span:last-child").text(maxPage);
			$(".rbx-running-games-footer .pager-next,.rbx-running-games-footer .last").toggleClass("disabled", (Number($(".rbx-running-games-footer .pager-cur>span").text()) || 1) >= maxPage);
		}
	}, {
		match: /money\.aspx\/getmytransactions/i,
		success: function (r, d) {
			try { r = JSON.parse(JSON.parse(r).d); } catch (e) { return; }
			try { d = JSON.parse(d); } catch (e) { return; }
			var op = $("#MyTransactions_TransactionTypeSelect>option[value=\"" + d.transactiontype + "\"]");
			op.text(op.text().replace(/\s*\(?\d*\)?$/, "") + (Number(r.TotalCount) ? " (" + r.TotalCount + ")" : ""));
		}
	}
];

rplus.startup = function (x, y) {
	if (window[x]) {
		y();
	} else {
		setTimeout(rplus.startup, 10, x, y);
	}
};

rplus.startup("$", function () {
	$.ajaxPrefilter(function (options, x, xhr) {
		for (var n in rplus.ajax) {
			if (options.url.match(rplus.ajax[n].match) && rplus.ajax[n].before) {
				rplus.ajax[n].before(options, xhr);
			}
		}
	});

	$(document).ajaxSuccess(function (e, xhr, dat) {
		for (var n in rplus.ajax) {
			if (dat.url.match(rplus.ajax[n].match) && rplus.ajax[n].success) {
				rplus.ajax[n].success(xhr.responseText, dat.data, dat);
			}
		}
	});

	$(window).load(function () {
		function datTipsy(elements, data) {
			if (elements.length && elements.tipsy) {
				elements.tipsy(data);
			}
		}

		setInterval(function () {
			datTipsy($("#BuyWithRobux>div[data-item-id='391072534'][title]"), { "gravity": "s" });

			var links = $("[rplus-linkify-ready]").removeAttr("rplus-linkify-ready");
			if (links && links.linkify) {
				links.linkify();
			}
		}, 250);
	});
});


// WebGL3D
