import ThumbnailState from '../enums/thumbnail-state';

// A loaded thumbnail.
type Thumbnail = {
  // The state the thumbnail is in.
  state: ThumbnailState;

  // The thumbnail image URL, if it has completed rendering.
  imageUrl: string;
};

export default Thumbnail;
