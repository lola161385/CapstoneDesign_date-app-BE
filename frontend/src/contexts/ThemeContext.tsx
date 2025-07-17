import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' 
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(18, 18, 18, 0.8)',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.8)',
            border: mode === 'light'
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.8)'
              : 'rgba(18, 18, 18, 0.8)',
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 