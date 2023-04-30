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
  userId: number;
};

// Fetches the list of friends for the user.
const getAvatarHeadshotThumbnail = (userId: number): Promise<Thumbnail> => {
  return sendMessage(messageDestination, {
    userId,
  } as BackgroundMessage);
};

// Listen for messages sent to the service worker.
addListener(messageDestination, async (message: BackgroundMessage) => {
  // Check the cache
  const thumbnail = await cache.getOrAdd(`${message.userId}`, () =>
    // Queue up the fetch request, when not in the cache
    batchProcessor.enqueue({
      type: ThumbnailType.AvatarHeadShot,
      targetId: message.userId,
      size: '420x420',
    })
  );

  if (thumbnail.state !== ThumbnailState.Completed) {
    setTimeout(() => {
      // If the thumbnail isn't complete, evict it from the cache early.
      cache.evict(`${message.userId}`);
    }, 30 * 1000);
  }

  return thumbnail;
});

export default getAvatarHeadshotThumbnail;
