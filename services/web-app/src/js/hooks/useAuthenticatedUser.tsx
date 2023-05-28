import { useEffect, useState } from 'react';
import ThumbnailState from '../enums/thumbnailState';
import AuthenticatedUser from '../types/authenticated-user';
import Thumbnail from '../types/thumbnail';
import User from '../types/user';
import LoadingState from '../enums/loadingState';
import { useLocation } from 'react-router-dom';
import { loginPath } from '../constants';
import { getAuthenticatedUser } from '../services/authentication';
import { getAuthenticatedUserThumbnail } from '../services/thumbnails';

function useAuthenticatedUser(): AuthenticatedUser {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [thumbnail, setThumbnail] = useState<Thumbnail>({
    state: ThumbnailState.Pending,
    imageUrl: '',
  });
  const [premiumExpiration, setPremiumExpiration] = useState<
    Date | null | undefined
  >();
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );

  useEffect(() => {
    if (location.pathname === loginPath) {
      setLoadingState(LoadingState.Success);
      return;
    }

    getAuthenticatedUser()
      .then(setUser)
      .catch((err) => {
        console.error('Failed to load authenticated user', err);
        setLoadingState(LoadingState.Error);
      });

    getAuthenticatedUserThumbnail()
      .then(setThumbnail)
      .catch((err) => {
        console.warn('Failed to load authenticated user thumbnail', err);
        setThumbnail({
          state: ThumbnailState.Error,
          imageUrl: '',
        });
      })
      .finally(() => {
        // HACK: Ensure the thumbnail is set as the last piece of data on the page
        // to ensure the premium information is on the page when we go to look for it.
        const rawPremiumExpiration =
          document.body.dataset.userPremiumExpiration;
        if (rawPremiumExpiration === 'null') {
          setPremiumExpiration(null);
        } else if (rawPremiumExpiration && rawPremiumExpiration !== 'error') {
          setPremiumExpiration(new Date(rawPremiumExpiration));
        }

        setLoadingState(
          rawPremiumExpiration === 'error'
            ? LoadingState.Error
            : LoadingState.Success
        );
      });
  }, [location.pathname]);

  return {
    user,
    thumbnail,
    premiumExpiration,
    loadingState,
  };
}

export default useAuthenticatedUser;
