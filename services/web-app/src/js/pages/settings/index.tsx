import { Fragment } from 'react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import LoadingState from '../../enums/loadingState';
import { useParams } from 'react-router-dom';
import LoginRedirect from '../login/redirect';

export default function Settings() {
  const authenticatedUser = useAuthenticatedUser();
  const { tab } = useParams();

  if (authenticatedUser.loadingState !== LoadingState.Success) {
    // Loading and failure states are handled by the parent.
    return <Fragment />;
  } else if (!authenticatedUser.user) {
    console.warn(
      'Settings page: We finished loading, and there was no authenticated user. Must be time to redirect.'
    );

    // This page requires you to be logged in first.
    return <LoginRedirect />;
  }

  return <Fragment />;
}
