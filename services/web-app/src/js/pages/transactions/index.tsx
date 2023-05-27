import { Fragment } from 'react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import LoadingState from '../../enums/loadingState';
import LoginRedirect from '../login/redirect';

export default function Transactions() {
  const authenticatedUser = useAuthenticatedUser();

  if (authenticatedUser.loadingState !== LoadingState.Success) {
    // Loading and failure states are handled by the parent.
    return <Fragment />;
  } else if (!authenticatedUser.user) {
    // This page requires you to be logged in first.
    return <LoginRedirect />;
  }

  return <Fragment />;
}
