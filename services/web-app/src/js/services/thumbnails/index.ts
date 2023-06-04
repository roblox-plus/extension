import { apiBaseUrl } from '../../constants';
import { ThumbnailState } from 'roblox';
import { Thumbnail } from 'roblox';
import wait from '../../utils/wait';
import { getAuthenticatedUser } from '../authentication';

let authenticatedUserThumbnailPromise: Promise<Thumbnail>;

// Retrieves the thumbnail for the authenticated user.
const getAuthenticatedUserThumbnail = (): Promise<Thumbnail> => {
  return (
    authenticatedUserThumbnailPromise ||
    (authenticatedUserThumbnailPromise = new Promise(
      async (resolve, reject) => {
        if (document.body.dataset.extensionId) {
          // The chrome extension is running, load the thumbnail from that.
          while (!document.body.dataset.userThumbnailState) {
            await wait(100);
          }

          // The extension has loaded the thumbnail, yay
          resolve({
            state: document.body.dataset.userThumbnailState as ThumbnailState,
            imageUrl: document.body.dataset.userThumbnailImage || '',
          });

          return;
        }

        const authenticatedUser = await getAuthenticatedUser();
        if (!authenticatedUser) {
          resolve({
            state: ThumbnailState.Blocked,
            imageUrl: '',
          });

          return;
        }

        try {
          const response = await fetch(
            `${apiBaseUrl.href}v1/users/authenticated/thumbnail`,
            {
              credentials: 'include',
            }
          );

          if (response.status === 200) {
            const result = await response.json();
            resolve({
              state: result.data.state,
              imageUrl: result.data.imageUrl,
            });
          } else {
            resolve({
              state: ThumbnailState.Error,
              imageUrl: '',
            });
          }
        } catch (e) {
          reject(e);
        }
      }
    ))
  );
};

export { getAuthenticatedUserThumbnail };
