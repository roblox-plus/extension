import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import Group from '../../types/group';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'groupsService.getUserPrimaryGroup';
const cache = new ExpirableDictionary<Group | null>(
  messageDestination,
  30 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the groups the user is a member of.
const getUserPrimaryGroup = (userId: number): Promise<Group | null> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the groups the user is a member of.
const loadUserPrimaryGroup = async (userId: number): Promise<Group | null> => {
  const response = await fetch(
    `https://groups.roblox.com/v1/users/${userId}/groups/primary/role`
  );

  if (!response.ok) {
    throw 'Failed to load primary group for the user';
  }

  const result = await response.json();
  if (!result || !result.group) {
    return null;
  }

  return {
    id: result.group.id,
    name: result.group.name,
  };
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadUserPrimaryGroup(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getUserPrimaryGroup;
