import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import Group from '../../types/group';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'groupsService.getCreatorGroups';
const cache = new ExpirableDictionary<Group[]>(messageDestination, 30 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the groups the user has access privileged roles in.
const getCreatorGroups = (userId: number): Promise<Group[]> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the groups the user has access privileged roles in.
const loadAuthenticatedUserCreatorGroups = async (): Promise<Group[]> => {
  const response = await fetch(
    `https://develop.roblox.com/v1/user/groups/canmanage`
  );

  if (response.status === 401) {
    throw 'User is unauthenticated';
  } else if (!response.ok) {
    throw 'Failed to load creation groups for the authenticated user';
  }

  const result = await response.json();
  return result.data.map((g: any) => {
    return {
      id: g.id,
      name: g.name,
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
      loadAuthenticatedUserCreatorGroups()
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getCreatorGroups;
