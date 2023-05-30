import { Fragment } from 'react';
import useAuthenticatedUser from '../../hooks/useAuthenticatedUser';
import LoadingState from '../../enums/loadingState';
import LoginRedirect from '../login/redirect';
import CreatorTabs from './creator-tabs';
import { Alert, Box, Link } from '@mui/material';
import TransactionsHeader from './header';
import { extensionId } from '../../constants';
import '../../../css/transactions.scss';
import TransactionsList from './list';
import TransactionsCharts from './charts';
import TransactionsSummary from './summary';

export default function Transactions() {
  const authenticatedUser = useAuthenticatedUser();

  if (authenticatedUser.loadingState !== LoadingState.Success) {
    // Loading and failure states are handled by the parent.
    return <Fragment />;
  } else if (!authenticatedUser.user) {
    console.warn(
      'Transactions page: We finished loading, and there was no authenticated user. Must be time to redirect.',
      authenticatedUser
    );

    // This page requires you to be logged in first.
    return <LoginRedirect />;
  } else if (
    authenticatedUser.premiumExpiration === undefined ||
    !extensionId
  ) {
    return (
      <Alert severity="warning">
        You must have a private server created under{' '}
        <Link href="https://www.roblox.com/games/258257446/Roblox-Hub">
          this place
        </Link>
        , and have <Link href="https://roblox.plus">the extension</Link>{' '}
        installed to use this page.
      </Alert>
    );
  }

  return (
    <Box id="transactions-page" sx={{ display: 'flex', flexDirection: 'row' }}>
      <CreatorTabs />
      <Box sx={{ p: 1, flexGrow: 1, flexWrap: 'wrap' }}>
        <TransactionsHeader />
        <TransactionsSummary />
        <TransactionsCharts />
        <TransactionsList />
      </Box>
    </Box>
  );
}
