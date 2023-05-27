import { getPremiumExpirationDate } from '../../services/premium';
import { getAvatarHeadshotThumbnail } from '../../services/thumbnails';
import { getAuthenticatedUser } from '../../services/users';

const load = async () => {
  if (!document.body) {
    // No body yet... try again.
    setTimeout(load, 1);
    return;
  }

  document.body.setAttribute('data-extension-id', chrome.runtime.id);

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      document.body.setAttribute('data-user-id', '0');
      return;
    }

    try {
      const premiumExpiration = await getPremiumExpirationDate(user.id);
      if (premiumExpiration === null) {
        document.body.setAttribute('data-user-premium-expiration', 'null');
      } else if (premiumExpiration) {
        document.body.setAttribute(
          'data-user-premium-expiration',
          premiumExpiration.toISOString()
        );
      }
    } catch (e) {
      document.body.setAttribute('data-user-premium-expiration', 'error');
      console.error('Failed to check user premium subscription', e);
    }

    document.body.setAttribute('data-user-id', `${user.id}`);
    document.body.setAttribute('data-user-name', user.name);
    document.body.setAttribute('data-user-display-name', user.displayName);

    const thumbnail = await getAvatarHeadshotThumbnail(user.id);
    document.body.setAttribute('data-user-thumbnail-state', thumbnail.state);
    document.body.setAttribute('data-user-thumbnail-image', thumbnail.imageUrl);
  } catch (err) {
    console.error('Failed to load page data from extension', err);
  }
};

load();
