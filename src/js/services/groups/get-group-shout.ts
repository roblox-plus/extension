import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'groupsService.getGroupShout';
const cache = new ExpirableDictionary<string>(messageDestination, 90 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  groupId: number;
};

// Fetches the group shout.
const getGroupShout = (groupId: number): Promise<string> => {
  return sendMessage(messageDestination, { groupId } as BackgroundMessage);
};

// Loads the groups the user is a member of.
const loadGroupShout = async (groupId: number): Promise<string> => {
  const response = await fetch(
    `https://groups.roblox.com/v1/groups/${groupId}`
  );

  if (!response.ok) {
    throw `Failed to load group shout for group ${groupId}`;
  }

  const result = await response.json();
  return result.shout?.body || '';
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.groupId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadGroupShout(message.groupId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getGroupShout;
