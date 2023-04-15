import UserPresence from '../../types/userPresence';
import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../messageService';
import PresenceBatchProcessor from './batchProcessor';

const messageDestination = 'presenceService.getUserPresence';
const presenceProcessor = new PresenceBatchProcessor();
const presenceCache = new ExpirableDictionary<UserPresence>(
  'presenceService',
  15 * 1000
);

// The type for the message being passed to the background.
type PresenceMessage = {
  userId: number;
};

// Fetches the presence for a user.
const getUserPresence = (userId: number): Promise<UserPresence> => {
  return sendMessage(messageDestination, { userId } as PresenceMessage);
};

// Listen for messages of things trying to fetch presence.
addListener(messageDestination, (message: PresenceMessage) => {
  // Check the cache
  return presenceCache.getOrAdd(`${message.userId}`, () =>
    // Queue up the fetch request, when not in the cache
    presenceProcessor.enqueue(message.userId)
  );
});

export { getUserPresence };
