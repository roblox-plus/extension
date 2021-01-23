var RPlus = RPlus || {};
RPlus.Pages = RPlus.Pages || {};

RPlus.Pages.DeveloperStats = function (urlMatch) {
	var game = {
		universeId: Number($("#dev-stats-data").data("universeid") || $("#engagement-payout-page-container").data("universe-id")),
		placeId: Number(urlMatch[1])
	};

	console.log("Game", game);

	Extension.Storage.Singleton.get("premiumPayoutsSummary").then(function(premiumPayoutsSummaryEnabled) {
		if (!premiumPayoutsSummaryEnabled) {
			return;
		}

		RPlus.premium.isPremium(Roblox.users.authenticatedUserId).then(isPremium => {
			if (!isPremium) {
				return;
			}
			const parseDateSelection = (dateValue) => {
				const split = dateValue.split("-");
				if (split.length !== 2) {
					return null;
				}

				return {
					startDate: split[0].trim(),
					endDate: split[1].trim()
				};
			};

			const payoutContainer = $("#payout");
			const summaryContainer = $("<div>");
			const dateSelection = $("#engagement-payout-page-container .calendar-container input");

			const renderSummary = (selectedDate) => {
				if (!selectedDate) {
					return;
				}

				const premiumPayoutsSummary = React.createElement(PremiumPayoutsSummary, {
					universeId: game.universeId,
					startDate: selectedDate.startDate,
					endDate: selectedDate.endDate
				});

				ReactDOM.render(premiumPayoutsSummary, summaryContainer[0]);
			};
	
			payoutContainer.append(summaryContainer);
			renderSummary(parseDateSelection(dateSelection.val()));

			dateSelection.on("change", () => {
				renderSummary(parseDateSelection(dateSelection.val()));
			});
		}).catch(console.warn);
	}).catch(console.warn);

	return {};
};

RPlus.Pages.DeveloperStats.patterns = [/^\/places\/(\d+)\/stats/i];


// WebGL3D
