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
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );

  useEffect(() => {
    if (location.pathname === loginPath) {
      setLoadingState(LoadingState.Success);
      return;
    }

    getAuthenticatedUser()
      .then((u) => {
        setUser(u);
        setLoadingState(LoadingState.Success);
      })
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
      });
  }, [location.pathname]);

  return {
    user,
    thumbnail,
    loadingState,
  };
}

export default useAuthenticatedUser;
