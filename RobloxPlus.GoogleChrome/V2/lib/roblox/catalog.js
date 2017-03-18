/*
	roblox/catalog.js [03/18/2017]
*/
var Roblox = Roblox || {};

Roblox.catalog = (function () {
	return {
		assetTypeIds: {
			[1]: "Image",
			[2]: "T-Shirt",
			[3]: "Audio",
			[4]: "Mesh",
			[5]: "Lua",
			[6]: "HTML",
			[7]: "Text",
			[8]: "Hat",
			[9]: "Place",
			[10]: "Model",
			[11]: "Shirt",
			[12]: "Pants",
			[13]: "Decal",
			[16]: "Avatar",
			[17]: "Head",
			[18]: "Face",
			[19]: "Gear",
			[21]: "Badge",
			[22]: "Group Emblem",
			[24]: "Animation",
			[25]: "Arms",
			[26]: "Legs",
			[27]: "Torso",
			[28]: "Right Arm",
			[29]: "Left Arm",
			[30]: "Left Leg",
			[31]: "Right Leg",
			[32]: "Package",
			[33]: "YoutubeVideo",
			[34]: "Game Pass",
			[35]: "App",
			[37]: "Code",
			[38]: "Plugin",
			[39]: "SolidModel",
			[40]: "MeshPart",
			[41]: "Hair Accessory",
			[42]: "Face Accessory",
			[43]: "Neck Accessory",
			[44]: "Shoulder Accessory",
			[45]: "Front Accessory",
			[46]: "Back Accessory",
			[47]: "Waist Accessory",
			[48]: "Climb Animation",
			[49]: "Death Animation",
			[50]: "Fall Animation",
			[51]: "Idle Animation",
			[52]: "Jump Animation",
			[53]: "Run Animation",
			[54]: "Swim Animation",
			[55]: "Walk Animation",
			[56]: "Pose Animation"
		},
		wearableAssetTypeIds: [2, 8, 11, 12, 17, 18, 19, 25, 26, 27, 28, 29, 30, 31, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
		collectibleAssetTypeIds: [8, 18, 19, 41, 42, 43, 44, 45, 46, 47],
		
		getIdFromUrl: function (url) {
			return Number((url.match(/\/catalog\/(\d+)\//i) || url.match(/\/library\/(\d+)\//i) || url.match(/item\.aspx.*id=(\d+)/i) || url.match(/item\?.*id=(\d+)/i) || ["", 0])[1]) || 0;
		},

		getAssetUrl: function (assetId, assetName) {
			if (typeof (assetName) != "string" || !assetName) {
				assetName = "redirect";
			} else {
				assetName = assetName.replace(/\W+/g, "-").replace(/^-+/, "").replace(/-+$/, "") || "redirect";
			}
			return "https://www.roblox.com/catalog/" + assetId + "/" + assetName;
		}
	};
})();



// WebGL3D
