import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/ThemeContext';
import styled from '@emotion/styled';

const StyledIconButton = styled(IconButton)`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1100;
  backdrop-filter: blur(10px);
  background-color: ${({ theme }) => 
    theme.palette.mode === 'light' 
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(18, 18, 18, 0.8)'
  };
  border: ${({ theme }) =>
    theme.palette.mode === 'light'
      ? '1px solid rgba(255, 255, 255, 0.3)'
      : '1px solid rgba(255, 255, 255, 0.1)'
  };

  &:hover {
    background-color: ${({ theme }) =>
      theme.palette.mode === 'light'
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(18, 18, 18, 0.9)'
    };
  }
`;

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`${mode === 'light' ? '다크' : '라이트'} 모드로 변경`}>
      <StyledIconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </StyledIconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 