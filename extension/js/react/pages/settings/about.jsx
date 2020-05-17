class About extends React.Component {
	constructor(props) {
		super(props);

		let about = this;
		this.state = {
			authenticatedUser: null,

			isPremium: false,
			premiumExpiration: null,
			premium: (<span class="spinner spinner-default"></span>),

			updateLog: (<span class="spinner spinner-default"></span>),
			updateLogDraft: "",
			updateLogPost: "",
			updateLogSaveStatus: "",

			featureList: [
				this.getFeatureRow("Game server pager", "On the game details page the load more servers button is turned into a pager with options to skip to the first or last page of servers."),
				this.getFeatureRow("Game server tracking", "On the game details page on servers it will show you which servers you have already played in. This feature will show up for Roblox+ Premium users only."),
				this.getFeatureRow("New server button", "On the game details page the servers tab will have a button to join a server you haven't played in yet. This feature will show up for Roblox+ Premium users only."),
				this.getFeatureRow("Sales + Revenue charts", "On item details pages and the group configure page charts will be added under the sales tab (or group summary tab) with sales per hour/day. This feature will show up for Roblox+ Premium users only."),
				this.getFeatureRow("Texture download", "A download option is added to Roblox created images."),
				this.getFeatureRow("Asset contents", "On item details pages a tab is added to view content the asset depends on."),
				this.getFeatureRow("Asset owners list", "A list of owners is added as a tab on item details pages depending on the asset type and creator."),
				this.getFeatureRow("Delete from inventory page", "Delete buttons are added to the inventory page for some asset types."),
				this.getFeatureRow("Avatar filter bar", "A text box is added to the avatar page to filter visible items down to items that match the text."),
				this.getFeatureRow("Roblox+ notification stream", "Clicking the extension browser icon while on a Roblox page will take over the notification stream with notifications from Roblox+."),
				this.getFeatureRow("Comment timer", "A timer is added to the asset comment button for how long until you can post another comment.", true),
				this.getFeatureRow("Unfollow all users button on Friends page", "A button is added to your friends page to unfollow all users you are not friends with.", true),
				this.getFeatureRow("Follow all friends button on Friends page", "A button is added to your friends page to follow all users you are friends with.", true),
				this.getFeatureRow("Profile sale statistics", "Buttons are added to the profile page to calculate sales of clothing with user stats.", true),
				this.getFeatureRow("Badge counter", "On the profile page you can calculate how many game badges a user has earned overall.", true),
				this.getFeatureRow("Trade.", "On the Trade. group wall if you click into the context menu, each poster has a Trade button that opens to the trade window for the poster when clicked.", true),
			]
		};

		RPlus.settings.get().then((settings) => about.globalSettingsLoaded(settings)).catch((e) => about.globalSettingsLoadFailure(e));
		Roblox.users.getAuthenticatedUser().then((user) => about.authenticatedUserLoaded(user)).catch((e) => about.authenticatedUserLoadFailure(e));
	}

	getFeatureRow(name, description, deprecated) {
		return (
			<tr>
				<td><span class={"icon-warning" + (deprecated ? "" : " hidden")}></span></td>
				<td class="text-lead">{name}</td>
				<td class="text-description">{description}</td>
			</tr>
		);
	}

	authenticatedUserLoaded(authenticatedUser) {
		let premiumLoaded = this.premiumLoaded.bind(this);
		let premiumLoadFailure = this.premiumLoadFailure.bind(this);

		if (authenticatedUser) {
			RPlus.premium.getPremium(authenticatedUser.id).then(premiumLoaded).catch(premiumLoadFailure);
		}

		this.setState({
			authenticatedUser: authenticatedUser
		});
	}

	authenticatedUserLoadFailure(e) {
		console.error("authenticatedUserLoadFailure", e);

		this.premiumLoadFailure(e);
	}

	premiumLoaded(premium) {
		let hubLink = (
			<a class="text-link"
				target="_blank"
				href={Roblox.games.getGameUrl(258257446, "Roblox+ Hub")}>Roblox+ Hub</a>
		);

		let newState = {};

		if (premium) {
			newState.isPremium = true;

			if (premium.expiration) {
				newState.premiumExpiration = new Date(premium.expiration);
				newState.premium = (
					<div class="section-content">
						You have Roblox+ Premium, thanks for the support!
						<br />
						Your premium membership expires on: {newState.premiumExpiration.toLocaleDateString()}
						<br />
						To keep premium going after this date make sure you have automatic renewal for the VIP server turned on at the {hubLink}.
					</div>
				);
			} else {
				newState.premium = (
					<div class="section-content">
						You have a lifetime Roblox+ Premium membership! Nice!
						<br />
						You are either a friend of WebGL3D, or bought it when it was still a t-shirt.
						<br />
						Either way, thanks for sticking around!
					</div>
				);
			}
		} else {
			newState.premium = (
				<div class="section-content">
					To get Roblox+ Premium buy a VIP server from this place: {hubLink}
				</div>
			);
		}

		this.setState(newState);
	}

	premiumLoadFailure(e) {
		console.error("premiumLoadFailure", e);

		this.setState({
			premium: (<div class="section-content-off">Failed to load premium status.</div>)
		});
	}

	setUpdateLogDraft(event) {
		this.setState({
			updateLogDraft: event.target.value
		});
	}

	viewUpdateLog(settings, event) {
		let about = this;

		if (event.target.tagName !== "TEXTAREA") {
			this.globalSettingsLoaded(settings);

			if (this.state.updateLogDraft !== this.state.updateLogPost) {
				let post = btoa(this.state.updateLogDraft);
				RPlus.settings.set({
					updateLogPost: post
				}).then(function () {
					about.setState({
						updateLogPost: atob(post),
						updateLogSaveStatus: "Saved: " + (new Date().toLocaleString())
					});
				}).catch(function (e) {
					console.error(e);

					about.setState({
						updateLogSaveStatus: "Failed to save update log."
					});
				});
			}
		}
	}

	editUpdateLog(settings) {
		if (!this.state.authenticatedUser || this.state.authenticatedUser.id !== 48103520) {
			return;
		}

		this.setState({
			updateLog: (
				<div class="section-content rplus-update-log-section form-group form-has-feedback"
					onDoubleClick={this.viewUpdateLog.bind(this, settings)}>
					<textarea onChange={this.setUpdateLogDraft.bind(this)}
						defaultValue={this.state.updateLogDraft}></textarea>
					<p class="form-control-label">{this.state.updateLogSaveStatus}</p>
				</div>
			)
		});
	}

	globalSettingsLoaded(settings) {
		let decodedPost = atob(settings.updateLogPost);
		let newState = {
			updateLog: (
				<div class="section-content form-has-feedback"
					onDoubleClick={this.editUpdateLog.bind(this, settings)}>
					<pre class="text-description">{this.state.updateLogPost || decodedPost}</pre>
					<p class="form-control-label">Version {Extension.Singleton.manifest.version}</p>
					<p class="form-control-label">Group: <a class="text-link" href={Roblox.groups.getGroupUrl(2518656, "Roblox+ Fan Group")}>Roblox+ Fan Group</a></p>
				</div>
			)
		};

		if (!this.state.updateLogDraft) {
			newState.updateLogDraft = decodedPost;
		}

		if (!this.state.updateLogPost) {
			newState.updateLogPost = decodedPost;
		}

		this.setState(newState);
	}

	globalSettingsLoadFailure(e) {
		console.error("globalSettingsLoadFailure", e);

		this.setState({
			updateLog: (<div class="section-content-off">Update log failed to load.</div>)
		});
	}

	reloadExtension() {
		Extension.Reload().then(() => {
			setTimeout(function () {
				window.location.reload(true);
			}, 1000);
		}).catch(console.error);
	}

	render() {
		return (
			<div>
				<div class="section">
					<div class="container-header">
						<h3>Roblox+ Premium</h3>
					</div>
					{this.state.premium}
				</div>
				<div class="section rplus-premium-section">
					<div class="container-header">
						<h3>Update Log</h3>
					</div>
					{this.state.updateLog}
				</div>
				<div class="section">
					<div class="container-header">
						<h3>Disaster Recovery</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Click button to "turn off and back on again".</span>
						<button class="btn-control-sm acct-settings-btn"
							type="button"
							onClick={this.reloadExtension}>Reload</button>
					</div>
				</div>
				<div class="section rplus-feature-list">
					<div class="container-header">
						<h3>Feature List</h3>
					</div>
					<div class="section-content">
						<span class="text-description">Features listed are not configurable but are specified for transparency sake about what this extension is responsible for.</span>
						<table class="table table-striped">
							<tbody>
								{this.state.featureList}
							</tbody>
						</table>
						<div class="rbx-divider"></div>
						<p class="text-date-hint"><span class="icon-warning"></span> <span>Deprecated - These features are no longer supported. If they stop working they may not be fixed.</span></p>
					</div>
				</div>
				<div class="section rplus-privacy-policy">
					<div class="container-header">
						<h3>Privacy Policy</h3>
					</div>
					<div class="section-content">
						<span class="text-description">If you're going to use Roblox+ you should be informed of everything it does. Safety first!</span>
						<div class="rbx-divider"></div>
						<h4>Website Access</h4>
						<p class="text-description">
							<span>Any extension that has permission to roblox.com has just as much access to the website as you do! Roblox+ is no exception to that. Any extension that has access to roblox.com has access to anything you can do, including but not limited to:</span>
							<br />
							<ul>
								<li>Your Robux</li>
								<li>Your inventory</li>
								<li>The games you play</li>
								<li>The groups you're in</li>
								<li>Your friends list</li>
								<li>Roblox Authentication</li>
								<li>Everything.</li>
							</ul>
							<span>Why does Roblox+ need access to all of this?</span>
							<br />
							<span>For the most part it doesn't. <b>None of this data is stored.</b> However - some of it used by the extension.</span>
							<br />
							<span>For example: The extension gets your Robux count every few seconds when you turn on the live navigation counters feature.</span>
							<br />
							<span>Another example: The extension loads your friends list every few seconds when you turn on the friend notifications so it knows who to notify you for.</span>
							<br />
							<span>Final example: Roblox authentication tokens are accessed by this extension to launch you into games when you click buttons like the follow button on notifications when your friends play a game.</span>
							<br />
							<span>This extension heavily utilizes your Roblox account data to improve your Roblox experience. That's the entire point of the extension. If you do not trust me as a developer to use this data securely and with good judgement to not expose you to any harm please do not use this extension.</span>
							<br />
							<br />
							<span>Roblox+ needs access to the roblox.com website to be able to modify the website. Without access to the website there is no way to add these features to website.</span>
							<br />
							<span>Roblox+ has access to two other domains:</span>
							<br />
							<ul>
								<li>rbxcdn.com</li>
								<li><a class="text-link" href="https://roblox.plus">roblox.plus</a></li>
							</ul>
							<span>What are these domains?</span>
							<br />
							<span>rbxcdn.com is Roblox's content delivery domain. Any time the extension plays a sound (like when you get a notification) or you view asset contents on an item details page the data is loaded from an rbxcdn.com domain.</span>
							<br />
							<span>What about roblox.plus?</span>
							<br />
							<span>roblox.plus is a domain owned by me (<a class="text-link" href="/users/48103520/profile">WebGL3D</a>). This domain is used for two features of the extension:</span>
							<br />
							<ul>
								<li>Roblox+ Premium</li>
								<li>Roblox Catalog Notifier</li>
							</ul>
							<span>To check whether or not you are a subscriber of Roblox+ Premium a request is sent to roblox.plus which includes your user Id so the Roblox+ servers can check your Roblox+ Premium subscription status. This is only done if it cannot find a subscription by checking VIP servers for the Roblox+ Hub.</span>
							<br />
							<span>There is another time your user Id will be sent to the Roblox+ servers: Roblox Catalog Notifier notifications. Your user Id and cloud messaging token are sent to the Roblox+ servers to subscribe you to the cloud notification topics that are responsible for sending you notifications about Roblox catalog items.</span>
							<br />
							<span>Why does the Roblox Catalog Notifier need your user Id?</span>
							<br />
							<span>There is a process for deciding which notifications to send to you based on whether or not you're a subscriber of Roblox+ Premium. If you have Roblox+ Premium and the catalog item that gets released is limited there will be an additional purchase option directly on the popup notification. The user id is sent to the backend to know which notification topic to subscribe you to.</span>
						</p>
						<div class="rbx-divider"></div>
						<h4>Data</h4>
						<p class="text-description">
							<span>For the most part all data for the extension remains in the extension. All personal and Roblox data is kept inside the extension and is not sent outside of Roblox.</span>
							<br />
							<span>There is one exception to this... your user Id. When you use the Roblox Catalog Notifier your user Id is paired with your cloud messaging token from the extension to the Roblox+ servers to send you notifications based on whether or not you have Roblox+ Premium. See above section on website access for slightly more information on this. This is the only Roblox account information that is sent to a non-Roblox server.</span>
						</p>
						<div class="rbx-divider"></div>
						<h4>Permissions</h4>
						<p class="text-description">
							<span>The extension manifest has the following permissions listed:</span>
							<br />
							<ul>
								<li>
									<span>gcm (Google cloud messaging)</span>
									<ul>
										<li>Used to send notifications for the catalog notifier.</li>
									</ul>
								</li>
								<li>
									<span>contextMenus</span>
									<ul>
										<li>Used to add context menu items when right clicking on Roblox users. Mainly, to be able to open a trade window without going to their profile.</li>
									</ul>
								</li>
								<li>
									<span>webRequest (and webRequestBlocking)</span>
									<ul>
										<li>See Web Request Interception</li>
									</ul>
								</li>
								<li>
									<span>tts (text to speach)</span>
									<ul>
										<li>Used in some notifications that do not have specific sounds associated with them.</li>
									</ul>
								</li>
								<li>
									<span>notifications</span>
									<ul>
										<li>Used to be able to display all notifications.</li>
									</ul>
								</li>
								<li>
									<span>*://*.roblox.com/*</span>
								</li>
								<li>
									<span>*://*.rbxcdn.com/*</span>
								</li>
								<li>
									<span>*://*.roblox.plus/*</span>
									<ul>
										<li>See Website Access</li>
									</ul>
								</li>
							</ul>
						</p>
						<div class="rbx-divider"></div>
						<h4>Web Request Interception</h4>
						<p class="text-description">
							<span>Some requests to roblox.com are intercepted!</span>
							<br />
							<span>Yup. This extension uses webRequest and webRequestBlocking permissions to intercept and modify some requests that go to Roblox. For example: To load the authentication token for game launch additional headers are needed that are not typically accessible via XMLHttpRequest. webRequest is needed for this to add the additional request parameters necessary to launch you into game as... you!</span>
							<br />
							<span>There are other requests being intercepted (like knowing when you visit Roblox for the first time for the extension start notification when enabled) and I could list them all out but imagine being me for a second... what if I missed one? What if I add a new feature and forget to update the privacy policy? I don't know what's legally required or not. How much do I need to specify or forget to specify before Google pulls me off the chrome web store? Instead of me trying to go into the implementation details of every feature this extension has I invite you to the extensions source.</span>
							<br />
							<span class="text-secondary">Roblox+ source code: <a class="text-link" href="https://git.roblox.plus/Chrome">https://git.roblox.plus</a></span>
						</p>
					</div>
				</div>
			</div>
		);
	}
}