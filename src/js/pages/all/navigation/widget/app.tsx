import { Fragment, useEffect, useState } from 'react';
import Search from './search';
import { getIdFromUrl } from '../../../../utils/linkify';
import UserInfo from './user';
import { LoadingState } from '@tix-factory/extension-utils';
import User from '../../../../types/user';
import loadUser from './load-user';
import { openClassName } from './panel';

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
    const openWidget = (e: MessageEvent<any>) => {
      if (
        e.data &&
        e.data.messageType === 'open-roblox-plus-widget' &&
        e.data.searchValue
      ) {
        panel.classList.add(openClassName);
        setSearchValue(e.data.searchValue);
      }
    };

    window.addEventListener('message', openWidget);

    return () => {
      window.removeEventListener('message', openWidget);
    };
  }, [setSearchValue]);

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
    setUser(null);

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
      <div className="rplus-user-widget">
        {user && <UserInfo user={user} />}
        {loadingState === LoadingState.Loading && (
          <div className="spinner spinner-default" />
        )}
        {loadingState === LoadingState.Error && (
          <div className="section-content-off">
            Failed to lookup user. Please refresh and try again.
          </div>
        )}
        {loadingState === LoadingState.Success && !user && searchValue && (
          <div className="section-content-off">User does not exist.</div>
        )}
      </div>
    </Fragment>
  );
}
