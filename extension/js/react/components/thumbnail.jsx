class Thumbnail extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			imageUrl: Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Pending)
		};

		let size = Roblox.thumbnails.parseSize(props.size);
		this.init(props.thumbnailType, props.thumbnailTargetId, size);
	}

	init(thumbnailType, thumbnailTargetId, size) {
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

	loadThumbnail(thumbnailType, thumbnailTargetId, width, height) {
		Roblox.thumbnails.getThumbnail(thumbnailType, thumbnailTargetId, width, height).then((thumbnail) => {
			this.setState({
				imageUrl: thumbnail.imageUrl
			});
		}).catch((err) => {
			this.handleError(err);
		});
	}

	handleError(err) {
		console.error(err);

		this.setState({
			imageUrl: Roblox.thumbnails.getThumbnailForState(Roblox.thumbnails.states.Error)
		});
	}

	render() {
		return (
			<img class="rplus-react-thumbnail" src={this.imageUrl}/>
		);
	}
}