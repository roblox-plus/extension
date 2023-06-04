import { Fragment } from 'react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import LoadingState from '../../enums/loadingState';
import { useParams } from 'react-router-dom';
import LoginRedirect from '../login/redirect';
import { Alert, Link, Typography } from '@mui/material';

export default function Settings() {
  const authenticatedUser = useAuthenticatedUser();
  const { tab } = useParams();

  if (authenticatedUser.loadingState !== LoadingState.Success) {
    // Loading and failure states are handled by the parent.
    return <Fragment />;
  } else if (!authenticatedUser.user) {
    console.warn(
      'Settings page: We finished loading, and there was no authenticated user. Must be time to redirect.',
      authenticatedUser
    );

    // This page requires you to be logged in first.
    return <LoginRedirect />;
  }

  return (
    <Alert>
      Hello, and welcome. If you are reading this, then you should know.. this
      site is not quite ready yet. The extension can be downloaded{' '}
      <Link href="https://chrome.google.com/webstore/detail/roblox%20/jfbnmfgkohlfclfnplnlenbalpppohkm">
        here
      </Link>
      , and the settings can be found{' '}
      <Link href="https://www.roblox.com/my/account?tab=rplus">here</Link>.
      <br />
      Visit this page again in July, it might be done by then.
    </Alert>
  );
}
