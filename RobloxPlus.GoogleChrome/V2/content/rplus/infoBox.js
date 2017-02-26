/*
	rplus/infoBox.js [12/3/2016]
*/
(window.RPlus || (RPlus = {})).infoBox = (function(){
	var navButton = $("<li id=\"rplus-infobox-button\">");
	var infoBoxNumber = $("<span class=\"notification-red nav-setting-highlight\">");
	navButton.append($("<a class=\"rbx-menu-item\">").append($("<span class=\"icon-rplus\">"), infoBoxNumber));
	var container = $("<div id=\"rplus-infobox\" class=\"section-content\">").hide();
	var inputBar = $("<input type=\"text\" class=\"form-control input-field\" placeholder=\"Drag ROBLOX link here\" maxlength=\"256\">");
	var backButton = $("<span class=\"icon-back\">").hide();
	
	var inputHistory = [];
	
	var tabs = {
		user: {
			container: $("<div>"),
			thumbnail: $("<img>"),
			thumbnailContainer: $("<a class=\"rplus-thumbnail\" target=\"_blank\">"),
			thumbnailOverlay: $("<span>").hide(),
			nameLabel: $("<span class=\"name-label\">"),
			robuxLabel: $("<span class=\"robux-text\">"),
			list: $("<div>"),
			setThumbnailOverlay: function(bc){
				if(bc != "NBC"){
					this.thumbnailOverlay.attr("class", "icon-" + bc.toLowerCase() + "-label").show();
				}else{
					this.thumbnailOverlay.hide();
				}
			},
			setThumbnail: function(userId){
				this.thumbnailContainer.attr("href", Roblox.users.getProfileUrl(userId));
				this.thumbnail.attr("src", Roblox.thumbnails.getUserAvatarThumbnailUrl(userId, 4));
			},
			build: function(){
				this.thumbnailContainer.prepend(this.thumbnail, this.thumbnailOverlay, this.nameLabel, $("<span class=\"icon-robux-16x16\">"), this.robuxLabel);
				return this.container.prepend(this.thumbnailContainer);
			}
		},
		asset: {
			container: $("<div>"),
			thumbnail: $("<img>"),
			thumbnailContainer: $("<a class=\"rplus-thumbnail\" target=\"_blank\">"),
			thumbnailOverlay: $("<span>").hide(),
			nameLabel: $("<span class=\"name-label\">"),
			robuxLabel: $("<span class=\"robux-text\">"),
			setThumbnailOverlay: function(bc, limited, unique, over13){
				bc = bc.toLowerCase();
				var icon = "icon-" + (over13 ? "thirteen-plus-" : "") + (limited ? "limited-" : "") + (unique ? "unique-" : "") + (bc != "nbc" ? bc + "-" : "") + "label";
				if(bc != "icon-label"){
					this.thumbnailOverlay.attr("class", icon).show();
				}else{
					this.thumbnailOverlay.hide();
				}
			},
			setThumbnail: function(assetId){
				this.thumbnailContainer.attr("href", Roblox.catalog.getAssetUrl(assetId));
				this.thumbnail.attr("src", Roblox.thumbnails.getAssetThumbnailUrl(assetId, 4));
			},
			build: function(){
				this.thumbnailContainer.prepend(this.thumbnail, this.thumbnailOverlay, this.nameLabel, $("<span class=\"icon-robux-16x16\">"), this.robuxLabel);
				return this.container.prepend(this.thumbnailContainer);
			}
		}
	};
	
	
	function show(){
		container.slideDown(150);
	}
	
	function hide(){
		container.slideUp(300);
	}
	
	function toggle(){
		if(container.is(":hidden")){
			show();
		}else{
			hide();
		}
	}
	
	
	function loadUser(user){
		if(typeof(user) == "number"){
			Roblox.users.getById(user, loadUser);
			return;
		}else if(typeof(user) == "string"){
			Roblox.users.getByUsername(user, loadUser);
			return;
		}else if(typeof(user) != "object" || !user.id){
			return;
		}
		inputBar.val("user:" + user.username);
		tabs.user.current = user;
		tabs.user.setThumbnail(user.id);
		tabs.user.setThumbnailOverlay(user.bc);
		tabs.user.nameLabel.text(user.username);
		tabs.user.show();
		Roblox.inventory.getCollectibles(user.id).on("loading", function(perc){
			if(tabs.user.current == user){
				tabs.user.robuxLabel.text(global.addCommas(this.value) + " (" + Math.floor(perc) + "%)");
			}
		}).on("ready", function(){
			if(tabs.user.current == user){
				tabs.user.robuxLabel.text(global.addCommas(this.value));
			}
		});
	}
	
	function loadAsset(asset){
		if(typeof(asset) == "number"){
			Roblox.catalog.getAssetInfo(asset, loadAsset);
			return;
		}else if(typeof(asset) != "object" || !asset.id){
			return;
		}
		inputBar.val("asset:" + asset.id);
		tabs.asset.setThumbnail(asset.id);
		tabs.asset.setThumbnailOverlay(asset.minimumMembershipLevel, asset.isLimited, asset.isLimitedUnique, asset.isThirteenPlus);
		tabs.asset.nameLabel.text(asset.name);
		if(asset.isForSale){
			tabs.asset.robuxLabel.text(asset.isFree ? "FREE" : global.addCommas(asset.price)).show();
		}else if(asset.isLimited){
			tabs.asset.robuxLabel.text(global.addCommas(asset.rap)).show();
		}else{
			tabs.asset.robuxLabel.hide();
		}
		tabs.asset.show();
	}
	
	function translateInput(input){
		input = input.toLowerCase();
		var splitCmd = input.split(":");
		var cmd = splitCmd.shift();
		var i = splitCmd[0] || "";
		var url = (input.match(/\W?roblox\.com(\/\S+)/i) || ["", ""])[1];
		
		if(cmd == "userid"){
			return {
				"user": Number(i),
				"input": "userid:" + i
			};
		}else if(cmd == "user"){
			return {
				"user": i,
				"input": "user:" + i
			};
		}else if(cmd == "item" || cmd == "asset"){
			return {
				"asset": Number(i),
				"input": "asset:" + i
			};
		}else if(cmd.sub(0, 3) == "lim"){
			
		}else if(url){
			console.log(url);
			var userId = Roblox.users.getIdFromUrl(url);
			var assetId = Roblox.catalog.getIdFromUrl(url);
			if(userId){
				return {
					"user": userId,
					"input": "userId:" + userId
				};
			}else if(assetId){
				return {
					"asset": assetId,
					"input": "asset:" + assetId
				};
			}
		}
		
		return { "input": "" };
	}
	
	function load(input){
		if(typeof(input) != "object"){
			input = translateInput(input);
		}
		var check = JSON.stringify(input);
		var last = inputHistory[inputHistory.length - 1] || { input: "" };
		
		if(check == "{}" || check == JSON.stringify(last) || !input.input){
			inputBar.val(last.input);
			return;
		}
		inputHistory.push(input);
		inputBar.val(input.input);
		backButton.show();
		
		if(input.hasOwnProperty("user")){
			loadUser(input.user);
		}else if(input.hasOwnProperty("asset")){
			loadAsset(input.asset);
		}
	}
	
	function back(){
		inputHistory.pop();
		if(inputHistory.length < 2){
			backButton.hide();
			for(var n in tabs){
				tabs[n].hide();
			}
		}
		var history = inputHistory.pop() || { "input": "" };
		inputBar.val(history.input);
		load(history);
	}
	
	
	$("body").on("click", "[data-rplus-collectibles]:not([disabled])", function(){
		var userId = Number($(this).data("rplus-collectibles"));
		if(userId){
			load("userId:" + userId);
		}
	});
	
	
	navButton.click(toggle).on("dragenter", show);
	
	inputBar.on("drop", function(e){
		load(e.originalEvent.dataTransfer.getData("Text"));
		e.preventDefault();
	}).keyup(function(e){
		if(e.keyCode == 13){
			$(this).blur();
			load($(this).val());
		}
	});
	
	for(var n in tabs){
		(function(tab){
			tab.show = function(){
				for(var n in tabs){
					tabs[n].hide();
				}
				tab.container.slideDown(100);
				show();
			};
			tab.hide = function(){
				tab.container.slideUp(100);
			};
			tab.container.hide();
			container.append(tab.build.apply(tab, []));
		})(tabs[n]);
	}
	
	backButton.click(back);
	
	$("#header").before(container.prepend(backButton, inputBar));
	$("#navbar-setting").before(navButton);
	return {
		show: show,
		hide: hide,
		toggle: toggle,
		
		load: load,
		back: back
	};
})();



// WebGL3D
