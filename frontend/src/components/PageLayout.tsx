import { Box } from '@mui/material';
import styled from '@emotion/styled';
import BottomNav from './BottomNav';

const PageContainer = styled(Box)`
  padding-bottom: 56px; // BottomNavigation의 높이만큼 여백 추가
  min-height: 100vh;
  background-color: #FAFAFA;
`;

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <PageContainer>
      {children}
      <BottomNav />
    </PageContainer>
  );
};

export default PageLayout; 