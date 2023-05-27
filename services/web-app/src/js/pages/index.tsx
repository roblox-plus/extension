import { Fragment } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './login';
import { loginPath } from '../constants';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';
import LoadingState from '../enums/loadingState';
import { Alert, CircularProgress } from '@mui/material';
import Settings from './settings';

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

  return (
    <Routes>
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/:tab" element={<Settings />} />
    </Routes>
  );
}
