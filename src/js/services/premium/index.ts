import { default as getPremiumExpirationDate } from './getPremiumExpirationDate';

const isPremiumUser = async (userId: number): Promise<boolean> => {
  const expiration = await getPremiumExpirationDate(userId);
  if (expiration || expiration === null) {
    // We have an expiration date, or it's a lifetime subscription.
    // They are definitely premium.
    return true;
  }

  // No expiration date, no premium.
  return false;
};

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { isPremiumUser, getPremiumExpirationDate };
