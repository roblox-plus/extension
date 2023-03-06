import { useEffect, useState } from 'react';
import ThumbnailState from '../../enums/thumbnailState';
import ThumbnailType from '../../enums/thumbnailType';
import {
  getAssetThumbnail,
  getAvatarHeadshotThumbnail,
} from '../../services/thumbnailsService';
import Thumbnail from '../../types/thumbnail';

type ThumbnailInput = {
  targetId: number;
  type: ThumbnailType;
};

export default function ({ targetId, type }: ThumbnailInput) {
  const [thumbnail, setThumbnail] = useState<Thumbnail>({
    imageUrl: '',
    state: ThumbnailState.Pending,
  });

  const setError = (error: any) => {
    console.error('Failed to load thumbnail', type, targetId, error);

    setThumbnail({
      imageUrl: '',
      state: ThumbnailState.Error,
    });
  };

  useEffect(() => {
    switch (type) {
      case ThumbnailType.AvatarHeadShot:
        getAvatarHeadshotThumbnail(targetId).then(setThumbnail).catch(setError);
        return;
      case ThumbnailType.Asset:
        getAssetThumbnail(targetId).then(setThumbnail).catch(setError);
        return;
      default:
        setError('unrecognized thumbnail type');
    }
  }, [targetId, type]);

  if (thumbnail.state !== ThumbnailState.Completed) {
    return (
      <span
        className={`roblox-plus-thumbnail-image roblox-plus-placeholder-thumbnail-${type.toLowerCase()}`}
      ></span>
    );
  }

  return (
    <img className="roblox-plus-thumbnail-image" src={thumbnail.imageUrl} />
  );
}
