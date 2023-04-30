import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';
import BadgeAwardBatchProcessor, {
  BadgeAwardBatchItem,
} from './batchProcessor';

const messageDestination = 'badgesService.getBadgeAwardDate';
const badgeAwardProcessor = new BadgeAwardBatchProcessor();
const badgeAwardCache = new ExpirableDictionary<number | undefined>(
  'badgesService',
  60 * 1000
);

// Fetches the date when a badge was awarded to the specified user.
const getBadgeAwardDate = async (
  userId: number,
  badgeId: number
): Promise<Date | undefined> => {
  const date = await sendMessage(messageDestination, {
    userId,
    badgeId,
  } as BadgeAwardBatchItem);

  return date ? new Date(date) : undefined;
};

// Listen for messages of things trying to fetch presence.
addListener(messageDestination, (message: BadgeAwardBatchItem) => {
  // Check the cache
  return badgeAwardCache.getOrAdd(
    badgeAwardProcessor.getKey(message),
    async () => {
      // Queue up the fetch request, when not in the cache
      const date = await badgeAwardProcessor.enqueue(message);
      return date?.getTime();
    }
  );
});

export { getBadgeAwardDate };
