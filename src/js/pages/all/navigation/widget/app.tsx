import { Fragment, useEffect, useState } from 'react';
import Search from './search';
import { getIdFromUrl } from '../../../../utils/linkify';
import UserInfo from './user';
import LoadingState from '../../../../enums/loadingState';
import User from '../../../../types/user';
import loadUser from './load-user';

type AppInput = {
  button: HTMLButtonElement;
  panel: HTMLElement;
};

export default function App({ button, panel }: AppInput) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Success
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const ondrop = (e: DragEvent) => {
      const value = e.dataTransfer?.getData('text/plain');
      if (!value || typeof value !== 'string') {
        return;
      }

      try {
        const url = new URL(value);
        if (!url.pathname.startsWith('/users/')) {
          return;
        }

        const userId = getIdFromUrl(url);
        if (!userId) {
          return;
        }
      } catch {
        // oh well? URL probably failed to parse, which is fine
        return;
      }

      console.debug('Link dropped into Roblox+ widget', value);
      setSearchValue(value);
    };

    panel.addEventListener('drop', ondrop);
    button.addEventListener('drop', ondrop);

    return () => {
      panel.removeEventListener('drop', ondrop);
      button.removeEventListener('drop', ondrop);
    };
  }, [panel, button, setSearchValue]);

  useEffect(() => {
    if (!searchValue?.trim()) {
      setUser(null);
      return;
    }

    let cancelled = false;
    setLoadingState(LoadingState.Loading);

    loadUser(searchValue)
      .then((user) => {
        if (cancelled) {
          return;
        }

        setUser(user);
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.warn('Failed to load user info', searchValue, err);
        setLoadingState(LoadingState.Error);
      });

    return () => {
      cancelled = true;
    };
  }, [searchValue]);

  return (
    <Fragment>
      <Search value={searchValue} setValue={setSearchValue} />
      {user && <UserInfo user={user} />}
      {loadingState === LoadingState.Loading && (
        <div className="spinner spinner-default" />
      )}
    </Fragment>
  );
}
