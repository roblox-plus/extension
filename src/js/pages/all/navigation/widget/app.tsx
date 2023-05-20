import { Fragment, useEffect, useState } from 'react';
import Search from './search';
import { getIdFromUrl } from '../../../../utils/linkify';

type AppInput = {
  button: HTMLButtonElement;
  panel: HTMLElement;
};

export default function App({ button, panel }: AppInput) {
  const [searchValue, setSearchValue] = useState<string>('');

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

  return (
    <Fragment>
      <Search value={searchValue} setValue={setSearchValue} />
    </Fragment>
  );
}
