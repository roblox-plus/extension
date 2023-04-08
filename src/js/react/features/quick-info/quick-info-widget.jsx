class QuickInfoWidget extends React.Component {
	constructor(props) {
		super(props);

		this.processingId = 0;
		this.lastDisplay = "";
		this.state = {
			open: false
		};

		this.childRefs = {
			input: null,
			typeDisplays: {
				user: React.createRef()
			}
		};
	}

	switchDisplay(processingId, displayType, displayId) {
		if (this.processingId !== processingId) {
			return;
		}

		let displayKey = `${displayType}:${displayId}`;
		if (displayKey === this.lastDisplay) {
			return;
		}

		this.lastDisplay = displayKey;

		for (let type in QuickInfoWidget.DisplayTypes) {
			let childRef = this.childRefs.typeDisplays[type];
			if (childRef) {
				if (displayType === type) {
					childRef.current.show(displayId);
				} else {
					childRef.current.hide();
				}
			}
		}

		switch (displayType) {
			case QuickInfoWidget.DisplayTypes.user:
				this.childRefs.input.value = Roblox.users.getProfileUrl(displayId);
				break;
			default:
				this.childRefs.input.value = "";
				return;
		}

		this.open();
	}

	processInput(input) {
		if (typeof(input) !== "string" || input.length <= 0) {
			return;
		}

		let processingId = ++this.processingId;

		let userId = Roblox.users.getIdFromUrl(input);
		if (userId) {
			this.switchDisplay(processingId, QuickInfoWidget.DisplayTypes.user, userId);
			return;
		}
		
		let usernameMatch = input.match(/^user:(.+)/i) || ["", ""];
		if (usernameMatch[1].length > 0) {
			Roblox.users.getByUsername(usernameMatch[1]).then((user) => {
				this.switchDisplay(processingId, QuickInfoWidget.DisplayTypes.user, user.id);
			}).catch((e) => {
				console.error(e);
				this.switchDisplay(processingId, QuickInfoWidget.DisplayTypes.user, 0);
			});

			return;
		}

		let userIdMatch = input.match(/^userid:(\d+)/i) || ["", ""];
		if (userIdMatch[1].length > 0) {
			this.switchDisplay(processingId, QuickInfoWidget.DisplayTypes.user, Number(userIdMatch[1]));
			return;
		}
	}

	processInputKeyUp(e) {
		if (e.keyCode === 13) {
			this.processInput(e.target.value);
		}
	}

	processDropData(e) {
		let dropText = e.dataTransfer && e.dataTransfer.getData("text");
		this.processInput(dropText);
	}

	processDragOver(e) {
		e.preventDefault();
	}

	open() {
		if (!this.state.open) {
			this.setState({
				open: true
			});
		}
	}

	toggle() {
		this.setState({
			open: !this.state.open
		});
	}

	getClassName() {
		let className = "rplus-quick-info-widget roblox-popover-container";

		if (this.state.open) {
			className += " rplus-quick-info-widget-open";
		}

		return className;
	}
	
	render() {
		return (
			<div className={this.getClassName()} 
				onDrop={this.processDropData.bind(this)} 
				onDragOver={this.processDragOver.bind(this)}>
				<div class="form-group">
					<input ref={input => { this.childRefs.input = input; }}
						onKeyUp={this.processInputKeyUp.bind(this)}
						class="form-control input-field" 
						type="text"
						placeholder="Drag user profile links here!"/>
				</div>
				<div>
					<UserInfoWidget ref={this.childRefs.typeDisplays.user}/>
				</div>
			</div>
		);
	}
}

QuickInfoWidget.DisplayTypes = {
	"none": "none",
	"user": "user"
};
