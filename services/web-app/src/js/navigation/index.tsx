import { ArrowBack } from '@mui/icons-material';
import { AppBar, Box, Button, Link, Toolbar } from '@mui/material';

function Navigation({}) {
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

export default Navigation;
