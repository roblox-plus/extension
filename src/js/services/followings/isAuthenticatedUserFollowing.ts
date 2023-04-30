import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';
import AuthenticatedUserFollowingProcessor from './authenticatedUserFollowingProcessor';

const messageDestination = 'followingsService.isAuthenticatedUserFollowing';
const batchProcessor = new AuthenticatedUserFollowingProcessor();
const cache = new ExpirableDictionary<boolean>(messageDestination, 60 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Checks if the authenticated user is following another user.
const isAuthenticatedUserFollowing = (userId: number): Promise<boolean> => {
  return sendMessage(messageDestination, {
    userId,
  } as BackgroundMessage);
};

// Listen for messages sent to the service worker.
addListener(messageDestination, (message: BackgroundMessage) => {
  // Check the cache
  return cache.getOrAdd(`${message.userId}`, () =>
    // Queue up the fetch request, when not in the cache
    batchProcessor.enqueue(message.userId)
  );
});

export default isAuthenticatedUserFollowing;
