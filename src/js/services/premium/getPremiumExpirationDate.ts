import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'premiumService.getPremiumExpirationDate';
const definitelyPremium: { [userId: number]: string | null } = {};
const cache = new ExpirableDictionary<string | null>(
  messageDestination,
  60 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Check whether or not a user has a Roblox+ Premium subscription.
const getPremiumExpirationDate = async (
  userId: number
): Promise<Date | null | undefined> => {
  const expiration = await sendMessage(messageDestination, {
    userId,
  } as BackgroundMessage);

  if (!expiration) {
    return expiration;
  }

  return new Date(expiration);
};

const getPrivateServerExpiration = async (
  id: number
): Promise<string | null> => {
  const response = await fetch(`https://games.roblox.com/v1/vip-servers/${id}`);

  if (!response.ok) {
    console.warn('Failed to load private server details', id, response);
    return null;
  }

  const result = await response.json();
  if (result.subscription?.expired === false) {
    // If it's not expired, return the expiration date.
    return result.subscription.expirationDate;
  }

  return null;
};

// Check if the user has a private server with the Roblox+ hub.
const checkPrivateServerExpirations = async (
  userId: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games/258257446/private-servers`
    );

    if (!response.ok) {
      console.warn('Failed to load private servers', userId, response);
      return null;
    }

    const result = await response.json();
    for (let i = 0; i < result.data.length; i++) {
      const privateServer = result.data[i];
      if (privateServer.owner?.id !== userId) {
        continue;
      }

      try {
        const expirationDate = await getPrivateServerExpiration(
          privateServer.vipServerId
        );
        if (expirationDate) {
          // We found a private server we paid for, we're done!
          return expirationDate;
        }
      } catch (err) {
        console.warn(
          'Failed to check if private server was active',
          privateServer,
          err
        );
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to check private servers', userId, err);
    return null;
  }
};

// Fetch whether or not a user has a Roblox+ Premium subscription.
const loadPremiumMembership = async (
  userId: number
): Promise<string | null> => {
  if (definitelyPremium[userId]) {
    return definitelyPremium[userId];
  }

  const expirationDate = await checkPrivateServerExpirations(userId);
  if (expirationDate) {
    return (definitelyPremium[userId] = expirationDate);
  }

  const response = await fetch(
    `https://api.roblox.plus/v1/rpluspremium/${userId}`
  );

  if (!response.ok) {
    throw new Error(`Failed to check premium membership for user (${userId})`);
  }

  const result = await response.json();
  if (result.data) {
    return (definitelyPremium[userId] = result.data.expiration);
  }

  return '';
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadPremiumMembership(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getPremiumExpirationDate;
