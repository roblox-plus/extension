import { useEffect, useState } from 'react';
import {
  Thumbnail as ThumbnailData,
  ThumbnailState,
  ThumbnailType,
} from 'roblox';
import { getThumbnail } from '../../services/thumbnails';

type ThumbnailInput = {
  targetId: number;
  type: ThumbnailType;
};

export default function Thumbnail({ targetId, type }: ThumbnailInput) {
  const [thumbnail, setThumbnail] = useState<ThumbnailData>({
    imageUrl: '',
    state: ThumbnailState.Pending,
  });

  useEffect(() => {
    getThumbnail(type, targetId)
      .then(setThumbnail)
      .catch((error) => {
        console.error('Failed to load thumbnail', type, targetId, error);

        setThumbnail({
          imageUrl: '',
          state: ThumbnailState.Error,
        });
      });
  }, [targetId, type]);

  if (thumbnail.state !== ThumbnailState.Completed) {
    return (
      <span
        className={`roblox-plus-thumbnail-image roblox-plus-placeholder-thumbnail-${type.toLowerCase()}`}
      ></span>
    );
  }

  return (
    <img
      className="roblox-plus-thumbnail-image"
      src={thumbnail.imageUrl}
      alt={`${type} thumbnail (${targetId})`}
    />
  );
}
