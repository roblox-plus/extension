import { ArrowBack } from '@mui/icons-material';
import { AppBar, Box, Button, Link, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { loginPath } from '../constants';
import { Fragment } from 'react';

export default function Navigation() {
  const location = useLocation();
  if (location.pathname === loginPath) {
    return <Fragment />;
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Link
            href="https://www.roblox.com/my/account"
            sx={{ textDecoration: 'none' }}
          >
            <Button startIcon={<ArrowBack />}>Roblox Settings</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
