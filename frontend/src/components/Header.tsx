import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import styled from '@emotion/styled';

const StyledAppBar = styled(AppBar)`
  background-color: transparent;
  color: #000;
  box-shadow: none;
  border-bottom: 1px solid #E0E0E0;
`;

const StyledButton = styled(Button)`
  font-size: 16px;
  font-weight: 400;
  text-transform: none;
  padding: 6px 16px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const Header = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: '20px',
            fontWeight: 500
          }}
        >
          소개글
        </Typography>
        <Box>
          <StyledButton color="inherit">로그인</StyledButton>
          <StyledButton color="inherit">회원가입</StyledButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header; 