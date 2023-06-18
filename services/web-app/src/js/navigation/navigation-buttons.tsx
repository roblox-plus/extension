import { ArrowBack } from '@mui/icons-material';
import { Button, Link } from '@mui/material';
import { Fragment } from 'react';
import { Link as AppLink } from 'react-router-dom';
import { aboutPath, settingsPath } from '../constants';
import useAuthenticatedUser from '../hooks/useAuthenticatedUser';

export default function NavigationButtons() {
  const authenticatedUser = useAuthenticatedUser();

  return (
    <Fragment>
      <Link
        href="https://www.roblox.com/my/account"
        sx={{ textDecoration: 'none' }}
      >
        <Button startIcon={<ArrowBack />} sx={{ color: 'text.primary' }}>
          Back to Roblox
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
      <AppLink className="navigation-link" to={aboutPath}>
        <Button sx={{ color: 'text.primary', ml: 2 }}>About</Button>
      </AppLink>
    </Fragment>
  );
}
