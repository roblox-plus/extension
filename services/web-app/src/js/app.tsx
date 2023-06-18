import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import Navigation from './navigation';
import Pages from './pages';

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
