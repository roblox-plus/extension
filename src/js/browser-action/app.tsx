import {
  Alert,
  CircularProgress,
  CssBaseline,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Fragment, useEffect, useState } from 'react';
import User from '../types/user';
import Header from './header';

export default function () {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const useLightTheme = useMediaQuery('(prefers-color-scheme: light)');
  const theme = createTheme({
    palette: {
      mode: useLightTheme ? 'light' : 'dark',
    },
  });

  useEffect(() => {
    setLoading(true);

    const connectionPort = chrome.runtime.connect({
      name: 'browser-action',
    });

    connectionPort.onMessage.addListener((message) => {
      if (message.user) {
        setUser(message.user);
        setLoading(false);
      }
    });

    return () => {
      connectionPort.disconnect();
    };
  }, []);

  const render = () => {
    if (loading) {
      return <CircularProgress size={96} />;
    }

    if (user) {
      return (
        <Fragment>
          <Header user={user} />
        </Fragment>
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {render()}
    </ThemeProvider>
  );
}
