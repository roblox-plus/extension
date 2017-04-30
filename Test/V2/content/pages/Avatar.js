var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.Avatar = function () {
	var input = $("<input>").attr({
		type: "text",
		class: "form-control input-field",
		placeholder: "Filter inventory"
	});

	function filterItem(element, search) {
		if (element.data("name").toLowerCase().indexOf(search.toLowerCase()) >= 0) {
			element.show();
		} else {
			element.hide();
		}
	}

	function filterInventory(search) {
		$("#clothing div[avatar-items] .item-card[data-name]").each(function () {
			filterItem($(this), search);
		});
	}

	input.keyup(function () {
		filterInventory(input.val());
	});

	$(document).on('DOMNodeInserted', function (e) {
		var element = $(e.target);
		if (element.hasClass('list-item')
			&& element.hasClass("item-card")
			&& element.closest("#clothing div[avatar-items]").length > 0) {
			setTimeout(function () {
				element.attr("data-name", element.find(".item-card-name").text());
				filterItem(element, input.val());
			}, 100);
		}
	});

	$("#clothing").prepend(input);

	return {
		filterInventory: function (search) {
			input.val(search);
			filterInventory(search);
		}
	};
};

RPlus.Pages.Avatar.patterns = [/^\/my\/avatar/i];

// WebGL3D
