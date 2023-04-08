class Thumbnail extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			imageUrl: Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Pending),
			thumbnailType: props.thumbnailType
		};

		this.componentWillReceiveProps(props);
	}

	init(thumbnailType, thumbnailTargetId, size) {
		this.setState({
			thumbnailType: thumbnailType,
			imageUrl: Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Pending)
		});

		if (size) {
			this.loadThumbnail(thumbnailType, thumbnailTargetId, size.width, size.height);
		} else {
			Roblox.thumbnails.getLargestAvailableThumbnailSize(thumbnailType).then((size) => {
				this.loadThumbnail(thumbnailType, thumbnailTargetId, size.width, size.height);
			}).catch((err) => {
				this.handleError(err);
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		let size = Roblox.thumbnails.parseSize(nextProps.size);
		this.init(nextProps.thumbnailType, nextProps.thumbnailTargetId, size);
	}

	loadThumbnail(thumbnailType, thumbnailTargetId, width, height) {
		Roblox.thumbnails.getThumbnail(thumbnailType, thumbnailTargetId, width, height).then((thumbnail) => {
			if (this.props.thumbnailTargetId !== thumbnailTargetId) {
				return;
			}

			this.setState({
				imageUrl: thumbnail.imageUrl
			});
		}).catch((err) => {
			if (this.props.thumbnailTargetId !== thumbnailTargetId) {
				return;
			}

			this.handleError(err);
		});
	}

	handleError(err) {
		console.error(err);

		this.setState({
			imageUrl: Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Error)
		});
	}

	getClassName() {
		let className = "rplus-react-thumbnail";

		switch (this.state.thumbnailType) {
			case Roblox.thumbnails.types.userHeadshot:
				className += " avatar";
				break;
		}

		return className;
	}

	render() {
		return (
			<img class={this.getClassName()}
				src={this.state.imageUrl}
				onError={this.handleError.bind(this)}/>
		);
	}
}