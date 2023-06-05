import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import { Thumbnail, ThumbnailState, ThumbnailType } from 'roblox';
import ExpirableDictionary from '../../utils/expireableDictionary';
import batchProcessor from './batchProcessor';

const messageDestination = 'thumbnailsService.getThumbnail';
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

// Fetches a group icon.
const getGroupIcon = (groupId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.GroupIcon,
    targetId: groupId,
  } as BackgroundMessage);
};

// Fetches a game pass icon.
const getGamePassIcon = (gamePassId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.GamePass,
    targetId: gamePassId,
  } as BackgroundMessage);
};

// Fetches a developer product icon.
const getDeveloperProductIcon = (gamePassId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.DeveloperProduct,
    targetId: gamePassId,
  } as BackgroundMessage);
};

// Fetches a game icon.
const getGameIcon = (gamePassId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    type: ThumbnailType.GameIcon,
    targetId: gamePassId,
  } as BackgroundMessage);
};

// Gets the default size for the thumbnail, by type.
const getThumbnailSize = (thumbnailType: ThumbnailType) => {
  switch (thumbnailType) {
    case ThumbnailType.GamePass:
      return '150x150';
    case ThumbnailType.GameIcon:
      return '256x256';
    default:
      return '420x420';
  }
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
      size: getThumbnailSize(message.type),
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

export {
  getAvatarHeadshotThumbnail,
  getAssetThumbnail,
  getGroupIcon,
  getGamePassIcon,
  getDeveloperProductIcon,
  getGameIcon,
};
