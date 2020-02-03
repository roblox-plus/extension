/*
	roblox/thumbnails.js [10/15/2016]
*/
var Roblox = Roblox || {};

Roblox.thumbnails = (function () {
	let thumbnailCache = new TimedCache(15 * 60 * 1000);

	let thumbnailStates = {
		"Error": "Error",
		"Completed": "Completed",
		"InReview": "InReview",
		"Pending": "Pending",
		"Blocked": "Blocked"
	};

	let thumbnailStateImages = {
		"Blocked": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGZpbGw9IiM2NTY2NjgiIGQ9Ik0wIDBoOTB2OTBIMHoiLz48ZyBpZD0idW5hcHByb3ZlZCIgb3BhY2l0eT0iLjMiPjxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNMzggNDEuN2wxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk0zNi44IDIzLjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIvPjwvZz48L2c+PC9zdmc+",
		"InReview": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJyZXZpZXdfcGVuZGluZ18xXyI+PHBhdGggaWQ9ImJnXzFfIiBmaWxsPSIjNjU2NjY4IiBkPSJNMCAwaDkwdjkwSDB6Ii8+PGcgaWQ9InJldmlld19wZW5kaW5nIiBvcGFjaXR5PSIuMyI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTUxLjkgNjEuNUgyOC42di0zOGgzMi41djE4Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTY2LjQgNTIuOXYtNy40SDU1Ljl2Ny40bDIuNiAzLjEtMi42IDN2Ny41aDEwLjVWNTlsLTIuNi0zek00Mi40IDMxLjVoMTMuMk00Mi40IDQxLjVoMTMuMk00Mi40IDUxLjVoOS41TTMzLjkgMzFsMS41IDEuNSAzLTMiLz48cGF0aCBkPSJNNjMuNCA1Mi44aC00LjVsMi4yIDIuNHpNNjEuMSA2MC4ybC0zLjIgMnYyLjNoNi41di0yLjN6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTMzLjkgMzkuMmg0LjV2NC41aC00LjV6TTMzLjkgNDkuMmg0LjV2NC41aC00LjV6Ii8+PC9nPjwvZz48L3N2Zz4=",
		"Error": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJib3JrZW4iPjxwYXRoIGlkPSJiZyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJicm9rZW4iIG9wYWNpdHk9Ii4zIj48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNTEuMiAyMy41djEwLjNoMTAuM00yOC41IDQ4Ljl2MTcuNmgzM1Y1My44bC0xMS01LTExIDUtMTEtNXoiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjEuNSAzMy44TDUxLjIgMjMuNUgyOC41VjQxbDExIDUgMTEtNSAxMSA1eiIvPjwvZz48L2c+PC9zdmc+",
		"Pending": "https://images.rbxcdn.com/c94b4b3bdd1be463ef59dae29f93f882-thumbnail_status_unavailable_dark.svg",
		"Unknown": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoxLjk2NjQ7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwfTwvc3R5bGU+PGcgaWQ9InVua25vd25fMV8iPjxwYXRoIGlkPSJiZ180XyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJ1bmtub3duIiBvcGFjaXR5PSIuMyI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTU2LjUgMzAuNmw1LjguNS0zIDM0LjktMjQuOS0yLjIiLz48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSgtNSA0MS43IDQyLjUwMikiIGNsYXNzPSJzdDIiIGQ9Ik0yOS4yIDI1aDI1djM1aC0yNXoiLz48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBzdHJva2Utd2lkdGg9IjIuNzUiIGQ9Ik00Mi43IDUyLjVoMCIvPjxwYXRoIGQ9Ik0zNS42IDM4LjhjLS4zLTMuMiAyLjEtNiA1LjMtNi4zczYgMi4xIDYuMyA1LjNjLjQgNS01LjQgNS4yLTUgMTAuMiIgc3Ryb2tlLXdpZHRoPSIyLjI1Ii8+PC9nPjwvZz48L2c+PC9zdmc+"
	};

	let thumbnailItemToKey = function (thumbnail) {
		return JSON.stringify(thumbnail);
	};

	let getThumbnailForState = function (state) {
		return thumbnailStateImages[state] || thumbnailStateImages.Unknown;
	};

	let processThumbnails = function (thumbnails) {
		return new Promise((resolve, reject) => {
			let requestIds = {};
			let requestData = [];

			thumbnails.forEach((thumbnail, i) => {
				let key = `${thumbnail.type}:${thumbnail.targetId}:${thumbnail.size}:${(+new Date)}:${i}`;
				requestIds[key] = thumbnail;

				requestData.push({
					requestId: key,
					targetId: thumbnail.targetId,
					type: thumbnail.type,
					size: thumbnail.size
				});
			});

			$.post("https://thumbnails.roblox.com/v1/batch", requestData).done((r) => {
				let result = [];

				r.data.forEach((thumbnail) => {
					switch (thumbnail.state) {
						case thumbnailStates.Pending:
							// Retry
							return;
						default:
							let item = requestIds[thumbnail.requestId];
							let cacheKey = thumbnailItemToKey(item);
							let thumbnailResult = {
								state: thumbnail.state,
								imageUrl: thumbnail.imageUrl || getThumbnailForState(thumbnail.state)
							};

							thumbnailCache.set(cacheKey, thumbnailResult);

							result.push({
								success: true,
								item: requestIds[thumbnail.requestId],
								value: thumbnailResult
							});

							return;
					}
				});

				resolve(result);
			}).fail((jxhr, errors) => {
				reject(errors);
			});
		});
	};

	let batchThumbnailProcessor = new BatchItemProcessor({}, processThumbnails, console.error.bind(console, "Roblox.thumbnails"));

	let getThumbnail = function (type, targetId, size) {
		return new Promise(function (resolve, reject) {
			let thumbnailItem = {
				type: type,
				targetId: targetId,
				size: size
			};

			let cacheKey = thumbnailItemToKey(thumbnailItem);
			let cacheItem = thumbnailCache.get(cacheKey);

			if (cacheItem.exists) {
				resolve(cacheItem);
				return;
			}

			batchThumbnailProcessor.push(thumbnailItem).then(resolve).catch(function (error) {
				resolve({
					state: thumbnailStates.Error,
					imageUrl: getThumbnailForState(thumbnailStates.Error)
				});
			});
		});
	};

	/* https://thumbnails.roblox.com/docs/json/v1
	"Roblox.Thumbnails.Apis.Models.ThumbnailBatchRequest": {
		"type": "object",
		"properties": {
			"requestId": {
				"description": "The request id. (Generated client side, used to represent the items in the request)",
				"type": "string"
			},
			"targetId": {
				"format": "int64",
				"description": "The thumbnail target id",
				"type": "integer"
			},
			"type": {
				"description": "The type of the thumbnails",
				"enum": [
					"Avatar",
					"AvatarHeadShot",
					"GameIcon",
					"BadgeIcon",
					"GameThumbnail",
					"GamePass",
					"Asset",
					"BundleThumbnail",
					"Outfit",
					"GroupIcon"
				],
				"type": "string"
			},
			"size": {
				"description": "The thumbnail size",
				"type": "string"
			}
		}
	},
	*/

	let thumbnails = {
		states: thumbnailStates,

		getThumbnailForState: getThumbnailForState,

		getAssetThumbnail: $.promise.cache(function (resolve, reject, assetId, width, height) {
			getThumbnail("Asset", assetId, `${width}x${height}`).then(resolve).catch(reject);
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		}),

		getAssetThumbnailUrl: $.promise.cache(function (resolve, reject, assetId, width, height) {
			Roblox.thumbnails.getAssetThumbnail(assetId, width, height).then(function(thumbnail) {
				resolve(thumbnail.imageUrl);
			}).catch(function() {
				resolve(getThumbnailForState(thumbnailStates.Error));
			});
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		}),

		getUserHeadshotThumbnail: $.promise.cache(function (resolve, reject, userId, width, height) {
			getThumbnail("AvatarHeadShot", userId, `${width}x${height}`).then(resolve).catch(reject);
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		}),

		getUserHeadshotThumbnailUrl: $.promise.cache(function (resolve, reject, userId, width, height) {
			Roblox.thumbnails.getUserHeadshotThumbnail(userId, width, height).then(function(thumbnail) {
				resolve(thumbnail.imageUrl);
			}).catch(function() {
				resolve(getThumbnailForState(thumbnailStates.Error));
			});
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		}),

		getBundleThumbnail: $.promise.cache(function (resolve, reject, bundleId, width, height) {
			getThumbnail("BundleThumbnail", bundleId, `${width}x${height}`).then(resolve).catch(reject);
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		}),

		getBundleThumbnailUrl: $.promise.cache(function (resolve, reject, bundleId, width, height) {
			Roblox.thumbnails.getBundleThumbnail(bundleId, width, height).then(function(thumbnail) {
				resolve(thumbnail.imageUrl);
			}).catch(function() {
				resolve(getThumbnailForState(thumbnailStates.Error));
			});
		}, {
			rejectExpiry: 15 * 1000,
			resolveExpiry: 15 * 60 * 1000
		})
	};

	if (ext.isBackground) {
		thumbnails.thumbnailCache = thumbnailCache;
		thumbnails.thumbnailProcessor = batchThumbnailProcessor;
		thumbnailCache.getThumbnail = getThumbnail;
	}

	return thumbnails;
})();

Roblox.thumbnails = $.addTrigger($.promise.background("Roblox.thumbnails", Roblox.thumbnails));


// WebGL3D
