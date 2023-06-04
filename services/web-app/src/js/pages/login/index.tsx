import { Alert, CircularProgress, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { login } from '../../services/authentication';
import User from '../../types/user';
import useQuery from '../../hooks/useQuery';
import { clientId, requestedScopes } from '../../constants';
import { LoadingState } from '@tix-factory/extension-utils';

export default function Login() {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );
  const [user, setUser] = useState<User | null>();
  const { code, returnUrl, state } = useQuery();

  useEffect(() => {
    if (!code) {
      const returnState = btoa(returnUrl);
      window.location.href = `https://apis.roblox.com/oauth/v1/authorize?client_id=${clientId}&redirect_uri=${
        window.location.origin
      }/login&scope=${requestedScopes.join(
        '+'
      )}&response_type=code&state=${returnState}`;
      return;
    }

    login(code)
      .then(setUser)
      .catch((err) => {
        console.error('Failed to login.', err);
        setLoadingState(LoadingState.Error);
      });
  }, [code, returnUrl]);

  if (loadingState === LoadingState.Error) {
    return (
      <Alert severity="error">
        Login failed. Please <Link href="/login">try again</Link>.
      </Alert>
    );
  }

  if (user) {
    try {
      if (state) {
        const redirectUrl = atob(state);
        if (!redirectUrl.includes('..') && redirectUrl.startsWith('/')) {
          return <Navigate to={redirectUrl} />;
        }
      }
    } catch (e) {
      console.error('Failed to decode returnUrl', e);
    }

    return <Navigate to="/settings" />;
  }

  return <CircularProgress />;
}
