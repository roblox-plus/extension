import { AppBar, Box, Toolbar } from '@mui/material';
import NavigationButtons from './navigation-buttons';

export default function Navigation() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <NavigationButtons />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
