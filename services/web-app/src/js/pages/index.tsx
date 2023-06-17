import { Alert, CircularProgress } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  aboutPath,
  loginPath,
  settingsPath,
  transactionsPath,
} from '../constants';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';
import About from './about';
import Login from './login';
import LoginRedirect from './login/redirect';
import Settings from './settings';
import Transactions from './transactions';

export default function Pages() {
  const location = useLocation();
  const authenticatedUser = useAuthenticatedUser();

  if (location.pathname === loginPath) {
    // We're logging in, this page has its own loading logic.
    return (
      <Routes>
        <Route path={loginPath} element={<Login />} />
      </Routes>
    );
  }

  if (authenticatedUser.loadingState === LoadingState.Loading) {
    return <CircularProgress />;
  }

  if (authenticatedUser.loadingState === LoadingState.Error) {
    return (
      <Alert severity="error">
        Failed to load user data. Please refresh the page to try again.
      </Alert>
    );
  }

  if (
    authenticatedUser.user &&
    document.body.dataset.userId &&
    `${authenticatedUser.user.id}` !== document.body.dataset.userId
  ) {
    console.warn(
      'Redirecting to login because',
      document.body.dataset.userId,
      `doesn't match`,
      authenticatedUser.user.id
    );

    // If the extension is enabled, and gives us a user ID, and the user isn't the same
    // as the currently logged in Roblox+ user.. send them to the login page to reauthenticate.
    return <LoginRedirect />;
  }

  return (
    <Routes>
      <Route path={settingsPath} element={<Settings />} />
      <Route path={`${settingsPath}/:tab`} element={<Settings />} />
      <Route path={transactionsPath} element={<Transactions />} />
      <Route path={`${transactionsPath}/:groupId`} element={<Transactions />} />

      {/* About page, and related redirects */}
      <Route path={aboutPath} element={<About />} />
      <Route path={`${aboutPath}/:tab`} element={<About />} />
      <Route
        path="/privacy-policy"
        element={<Navigate to={aboutPath + '/privacy-policy'} />}
      />
      <Route
        path="/terms-of-service"
        element={<Navigate to={aboutPath + '/terms-of-service'} />}
      />
    </Routes>
  );
}
