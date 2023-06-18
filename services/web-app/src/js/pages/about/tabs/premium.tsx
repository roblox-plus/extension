import { Alert } from '@mui/material';
import { Fragment, useMemo } from 'react';
import twemoji from 'twemoji';
import markdown from '../../../../markdown.json';
import Markdown from '../../../components/markdown';
import useAuthenticatedUser from '../../../hooks/useAuthenticatedUser';

export default function AboutPremium() {
  const authenticatedUser = useAuthenticatedUser();
  const premiumAlert = useMemo<JSX.Element>(() => {
    console.log(authenticatedUser);
    if (authenticatedUser.premiumExpiration === undefined) {
      return <Fragment />;
    }

    if (authenticatedUser.premiumExpiration) {
      return (
        <Alert severity="info" sx={{ mb: 1 }}>
          You are currently subscribed to Roblox+ Premium. It will expire on{' '}
          {authenticatedUser.premiumExpiration.toLocaleDateString()}
        </Alert>
      );
    }

    return (
      <Alert severity="info" sx={{ mb: 1 }}>
        You have a lifetime subscription to Roblox+ Premium, very nice! Thanks
        for sticking around all these years. {twemoji.parse('🧓')}
      </Alert>
    );
  }, [authenticatedUser]);

  return (
    <Fragment>
      {premiumAlert}
      <Markdown>{markdown.premium}</Markdown>
    </Fragment>
  );
}
