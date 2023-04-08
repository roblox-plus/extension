/*
	roblox/thumbnails.js [10/15/2016]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Thumbnails = class extends Extension.BackgroundService {
	constructor() {
		super("Roblox.thumbnails");
		
		this.states = {
			"Error": "Error",
			"Completed": "Completed",
			"InReview": "InReview",
			"Pending": "Pending",
			"Blocked": "Blocked"
		};

		this.types = {
			bundle: "bundle",
			asset: "asset",
			userHeadshot: "userHeadshot",
			groupIcon: "groupIcon"
		};

		this.thumbnailStateImages = {
			"Blocked": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJ1bmFwcHJvdmVkXzFfIj48cGF0aCBpZD0iYmdfMl8iIGZpbGw9IiM2NTY2NjgiIGQ9Ik0wIDBoOTB2OTBIMHoiLz48ZyBpZD0idW5hcHByb3ZlZCIgb3BhY2l0eT0iLjMiPjxjaXJjbGUgY2xhc3M9InN0MiIgY3g9IjQ1IiBjeT0iNDguOCIgcj0iMTAiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNMzggNDEuN2wxNCAxNC4xTTMyLjUgMjMuNWgtNHY0TTI4LjUgNjIuNXY0aDRNMjguNSAzMS44djZNMjguNSA0MnY2TTI4LjUgNTIuMnY2TTU3LjUgNjYuNWg0di00TTYxLjUgNTguMnYtNk02MS41IDQ4di02TTYxLjUgMzcuOHYtNE0zNi44IDY2LjVoNk00Ny4yIDY2LjVoNk0zNi44IDIzLjVoNk00Ny4yIDIzLjVoNE01MS40IDIzLjZsMy41IDMuNU01Ny45IDMwLjFsMy41IDMuNU01MS4yIDIzLjh2M001OC41IDMzLjhoM001MS4yIDMwLjJ2My42aDMuNiIvPjwvZz48L2c+PC9zdmc+",
			"InReview": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJyZXZpZXdfcGVuZGluZ18xXyI+PHBhdGggaWQ9ImJnXzFfIiBmaWxsPSIjNjU2NjY4IiBkPSJNMCAwaDkwdjkwSDB6Ii8+PGcgaWQ9InJldmlld19wZW5kaW5nIiBvcGFjaXR5PSIuMyI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTUxLjkgNjEuNUgyOC42di0zOGgzMi41djE4Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTY2LjQgNTIuOXYtNy40SDU1Ljl2Ny40bDIuNiAzLjEtMi42IDN2Ny41aDEwLjVWNTlsLTIuNi0zek00Mi40IDMxLjVoMTMuMk00Mi40IDQxLjVoMTMuMk00Mi40IDUxLjVoOS41TTMzLjkgMzFsMS41IDEuNSAzLTMiLz48cGF0aCBkPSJNNjMuNCA1Mi44aC00LjVsMi4yIDIuNHpNNjEuMSA2MC4ybC0zLjIgMnYyLjNoNi41di0yLjN6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTMzLjkgMzkuMmg0LjV2NC41aC00LjV6TTMzLjkgNDkuMmg0LjV2NC41aC00LjV6Ii8+PC9nPjwvZz48L3N2Zz4=",
			"Error": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPjxnIGlkPSJib3JrZW4iPjxwYXRoIGlkPSJiZyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJicm9rZW4iIG9wYWNpdHk9Ii4zIj48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNTEuMiAyMy41djEwLjNoMTAuM00yOC41IDQ4Ljl2MTcuNmgzM1Y1My44bC0xMS01LTExIDUtMTEtNXoiLz48cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjEuNSAzMy44TDUxLjIgMjMuNUgyOC41VjQxbDExIDUgMTEtNSAxMSA1eiIvPjwvZz48L2c+PC9zdmc+",
			"Pending": "https://images.rbxcdn.com/c94b4b3bdd1be463ef59dae29f93f882-thumbnail_status_unavailable_dark.svg",
			"Unknown": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlPi5zdDJ7ZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS13aWR0aDoxLjk2NjQ7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwfTwvc3R5bGU+PGcgaWQ9InVua25vd25fMV8iPjxwYXRoIGlkPSJiZ180XyIgZmlsbD0iIzY1NjY2OCIgZD0iTTAgMGg5MHY5MEgweiIvPjxnIGlkPSJ1bmtub3duIiBvcGFjaXR5PSIuMyI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTU2LjUgMzAuNmw1LjguNS0zIDM0LjktMjQuOS0yLjIiLz48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSgtNSA0MS43IDQyLjUwMikiIGNsYXNzPSJzdDIiIGQ9Ik0yOS4yIDI1aDI1djM1aC0yNXoiLz48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBzdHJva2Utd2lkdGg9IjIuNzUiIGQ9Ik00Mi43IDUyLjVoMCIvPjxwYXRoIGQ9Ik0zNS42IDM4LjhjLS4zLTMuMiAyLjEtNiA1LjMtNi4zczYgMi4xIDYuMyA1LjNjLjQgNS01LjQgNS4yLTUgMTAuMiIgc3Ryb2tlLXdpZHRoPSIyLjI1Ii8+PC9nPjwvZz48L2c+PC9zdmc+"
		};

		this.cache = new TimedCache(15 * 60 * 1000);
		this.batchProcessor = new BatchItemProcessor({}, this.processThumbnails.bind(this), console.error.bind(console, "Roblox.thumbnails"));

		this.register([
			this.getThumbnail
		]);
	}

	thumbnailItemToKey(thumbnail) {
		return JSON.stringify(thumbnail);
	}

	getThumbnailForState(state) {
		return this.thumbnailStateImages[state] || this.thumbnailStateImages.Unknown;
	}

	parseSize(sizeString) {
		if (typeof(sizeString) === "string") {
			let sizeSplit = sizeString.split("x");
			let width = Number(sizeSplit[0]);
			let height = Number(sizeSplit[1]);

			if (!isNaN(width) && !isNaN(height)) {
				return {
					width: width,
					height: height
				};
			}
		}
	}

	getLargestAvailableThumbnailSize(thumbnailType) {
		return new Promise((resolve, reject) => {
			switch (thumbnailType) {
				case this.types.bundle:
				case this.types.asset:
					resolve({
						width: 420,
						height: 420
					});
					return;
				case this.types.userHeadshot:
					resolve({
						width: 150,
						height: 150
					});
					return;
				default:
					reject({
						code: 7, // Matches Api site error code for invalid thumbnail size
						message: `Invalid thumbnailType: ${thumbnailType}`
					});
			}
		});
	}

	processThumbnails(thumbnails) {
		return new Promise((resolve, reject) => {
			let requestIds = {};
			let requestData = [];

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
						case this.states.Pending:
							// Retry
							return;
						default:
							let item = requestIds[thumbnail.requestId];
							let cacheKey = this.thumbnailItemToKey(item);
							let thumbnailResult = {
								state: thumbnail.state,
								imageUrl: thumbnail.imageUrl || this.getThumbnailForState(thumbnail.state)
							};

							this.cache.set(cacheKey, thumbnailResult);

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
	}

	getThumbnail(thumbnailType, targetId, width, height) {
		return new Promise((resolve, reject) => {
			let thumbnailApiType;
			switch (thumbnailType) {
				case this.types.bundle:
					thumbnailApiType = "BundleThumbnail";
					break;
				case this.types.asset:
					thumbnailApiType = "Asset";
					break;
				case this.types.userHeadshot:
					thumbnailApiType = "AvatarHeadShot";
					break;
				case this.types.groupIcon:
					thumbnailApiType = "GroupIcon";
					break;
				default:
					reject([
						{
							code: 7, // Matches Api site error code for invalid thumbnail size
							message: `Invalid thumbnailType: ${thumbnailType}`
						}
					]);

					return;
			}

			let thumbnailItem = {
				type: thumbnailApiType,
				targetId: targetId,
				size: `${width}x${height}`
			};

			let cacheKey = this.thumbnailItemToKey(thumbnailItem);
			let cacheItem = this.cache.get(cacheKey);

			if (cacheItem.exists) {
				resolve(cacheItem.item);
				return;
			}

			this.batchProcessor.push(thumbnailItem).then(resolve).catch((error) => {
				resolve({
					state: this.states.Error,
					imageUrl: this.getThumbnailForState(this.states.Error)
				});
			});
		});
	}

	getThumbnailUrl(thumbnailType, targetId, width, height) {
		return new Promise((resolve, reject) => {
			this.getThumbnail(thumbnailType, targetId, width, height).then(thumbnail => {
				resolve(thumbnail.imageUrl);
			}).catch(() => {
				resolve(this.getThumbnailForState(this.states.Error));
			});
		});
	}
	
	getAssetThumbnail(assetId, width, height) {
		return this.getThumbnail(this.types.asset, assetId, width, height);
	}
	
	getAssetThumbnailUrl(assetId, width, height) {
		return this.getThumbnailUrl(this.types.asset, assetId, width, height);
	}
	
	getUserHeadshotThumbnail(userId, width, height) {
		return this.getThumbnail(this.types.userHeadshot, userId, width, height);
	}
	
	getUserHeadshotThumbnailUrl(userId, width, height) {
		return this.getThumbnailUrl(this.types.userHeadshot, userId, width, height);
	}
	
	getBundleThumbnail(bundleId, width, height) {
		return this.getThumbnail(this.types.bundle, bundleId, width, height);
	}
	
	getBundleThumbnailUrl(bundleId, width, height) {
		return this.getThumbnailUrl(this.types.bundle, bundleId, width, height);
	}
	
	getGroupIcon(groupId, width, height) {
		return this.getThumbnail(this.types.groupIcon, groupId, width, height);
	}
	
	getGroupIconUrl(groupId, width, height) {
		return this.getThumbnailUrl(this.types.groupIcon, groupId, width, height);
	}
};

Roblox.thumbnails = new Roblox.Services.Thumbnails();
// WebGL3D
