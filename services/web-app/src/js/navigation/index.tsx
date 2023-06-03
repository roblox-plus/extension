import { AppBar, Box, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { loginPath } from '../constants';
import { Fragment } from 'react';
import NavigationAvatar from './navigationAvatar';
import NavigationButtons from './navigation-buttons';

export default function Navigation() {
  const location = useLocation();
  if (location.pathname === loginPath) {
    return <Fragment />;
  }

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <NavigationButtons />
        </Box>
        <NavigationAvatar />
      </Toolbar>
    </AppBar>
  );
}
