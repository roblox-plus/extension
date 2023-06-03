import Group from '../../types/group';
import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';

const messageDestination = 'groupsService.getUserGroups';
const cache = new ExpirableDictionary<Group[]>(messageDestination, 30 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the groups the user is a member of.
const getUserGroups = (userId: number): Promise<Group[]> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the groups the user is a member of.
const loadUserGroups = async (userId: number): Promise<Group[]> => {
  const response = await fetch(
    `https://groups.roblox.com/v1/users/${userId}/groups/roles`
  );

  if (!response.ok) {
    throw 'Failed to load groups the user is a member of';
  }

  const result = await response.json();
  return result.data.map((g: any) => {
    return {
      id: g.group.id,
      name: g.group.name,
    } as Group;
  });
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadUserGroups(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getUserGroups;
