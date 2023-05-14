import ThumbnailState from '../../enums/thumbnailState';
import ThumbnailType from '../../enums/thumbnailType';
import Thumbnail from '../../types/thumbnail';
import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';
import batchProcessor from './batchProcessor';

const messageDestination = 'thumbnailsService.getAvatarHeadshotThumbnail';
const cache = new ExpirableDictionary<Thumbnail>(
  messageDestination,
  5 * 60 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  type: ThumbnailType;
  targetId: number;
};

// Fetches an avatar headshot thumbnail, for the given user ID.
const getAvatarHeadshotThumbnail = (userId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.AvatarHeadShot,
    targetId: userId,
  } as BackgroundMessage);
};

// Fetches an asset thumbnail, for the given asset ID.
const getAssetThumbnail = (assetId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.Asset,
    targetId: assetId,
  } as BackgroundMessage);
};

// Listen for messages sent to the service worker.
addListener(messageDestination, async (message: BackgroundMessage) => {
  const cacheKey = `${message.type}:${message.targetId}`;

  // Check the cache
  const thumbnail = await cache.getOrAdd(cacheKey, () =>
    // Queue up the fetch request, when not in the cache
    batchProcessor.enqueue({
      type: message.type,
      targetId: message.targetId,
      size: '420x420',
    })
  );

  if (thumbnail.state !== ThumbnailState.Completed) {
    setTimeout(() => {
      // If the thumbnail isn't complete, evict it from the cache early.
      cache.evict(cacheKey);
    }, 30 * 1000);
  }

  return thumbnail;
});

export { getAvatarHeadshotThumbnail, getAssetThumbnail };
