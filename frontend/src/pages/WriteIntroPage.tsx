import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 24px;
  gap: 24px;
  background: ${({ theme }) =>
    theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
      : 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)'};

  @media (max-width: 430px) {
    padding: 16px;
    gap: 16px;
  }
`;

const MainContent = styled(Box)`
  flex: 1;
  width: 90vw;
  max-width: 430px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 32px;
  background: ${({ theme }) =>
    theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(45, 45, 45, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;

  @media (max-width: 430px) {
    width: 100%;
    gap: 24px;
    padding: 24px;
  }
`;

const StyledButton = styled(Button)`
  width: 100%;
  max-width: 280px;
  padding: 16px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  background: ${({ theme }) =>
    theme.palette.mode === 'light'
      ? 'rgba(33, 150, 243, 0.1)'
      : 'rgba(33, 150, 243, 0.2)'};
  color: ${({ theme }) =>
    theme.palette.mode === 'light' ? '#2196f3' : '#64b5f6'};
  border: 1px solid ${({ theme }) =>
    theme.palette.mode === 'light'
      ? 'rgba(33, 150, 243, 0.2)'
      : 'rgba(33, 150, 243, 0.3)'};
  
  &:hover {
    background: ${({ theme }) =>
      theme.palette.mode === 'light'
        ? 'rgba(33, 150, 243, 0.2)'
        : 'rgba(33, 150, 243, 0.3)'};
  }
`;

const WriteIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <PageContainer>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: theme.palette.mode === 'light' ? '#1a1a1a' : '#ffffff',
          fontWeight: 600,
        }}
      >
        자기소개 작성
      </Typography>

      <MainContent>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.mode === 'light' ? '#1a1a1a' : '#ffffff',
              fontWeight: 500,
              mb: 2,
            }}
          >
            나를 소개해보세요!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.mode === 'light' ? '#666666' : '#cccccc',
              maxWidth: '400px',
            }}
          >
            자신만의 매력을 담은 자기소개를 작성하고
            새로운 친구들을 만나보세요.
          </Typography>
        </Box>

        <StyledButton
          onClick={() => navigate('/write/intro')}
        >
          시작하기
        </StyledButton>
      </MainContent>
    </PageContainer>
  );
};

export default WriteIntroPage; 