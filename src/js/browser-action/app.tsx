import {
  Alert,
  CircularProgress,
  CssBaseline,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Fragment, useEffect, useState } from 'react';
import { getAuthenticatedUser } from '../services/usersService';
import User from '../types/user';
import Header from './header';

export default function () {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const useLightTheme = useMediaQuery('(prefers-color-scheme: light)');
  const theme = createTheme({
    palette: {
      mode: useLightTheme ? 'light' : 'dark',
    },
  });

  useEffect(() => {
    getAuthenticatedUser()
      .then(setAuthenticatedUser)
      .catch((err) => {
        console.error('Failed to load authenticated user', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const render = () => {
    if (loading) {
      return <CircularProgress size={96} />;
    }

    if (error) {
      return (
        <Alert severity="error">
          {'Failed to check if you are logged in.'}
          <br />
          {'Please re-open the popup to try again.'}
        </Alert>
      );
    }

    if (authenticatedUser) {
      return (
        <Fragment>
          <Header />
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
