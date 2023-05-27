import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Pages from './pages';
import Navigation from './navigation';

function App() {
  const useLightTheme = useMediaQuery('(prefers-color-scheme: light)');
  const theme = createTheme({
    palette: {
      mode: useLightTheme ? 'light' : 'dark',
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navigation />
        <Pages />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
