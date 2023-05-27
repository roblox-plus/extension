import { useLocation, Link as AppLink } from 'react-router-dom';
import { settingsPath } from '../constants';
import { Button, Link } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Fragment } from 'react';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';

export default function NavigationButtons() {
  const location = useLocation();
  const authenticatedUser = useAuthenticatedUser();

  return (
    <Fragment>
      <Link
        href="https://www.roblox.com/my/account"
        sx={{ textDecoration: 'none' }}
      >
        <Button startIcon={<ArrowBack />} sx={{ color: 'text.primary' }}>
          Roblox Settings
        </Button>
      </Link>
      <AppLink className="navigation-link" to={settingsPath}>
        <Button sx={{ color: 'text.primary', ml: 2 }}>Settings</Button>
      </AppLink>
      {authenticatedUser.premiumExpiration !== undefined ? (
        <AppLink to="/transactions" className="navigation-link">
          <Button sx={{ color: 'text.primary', ml: 2 }}>Transactions</Button>
        </AppLink>
      ) : null}
    </Fragment>
  );
}
