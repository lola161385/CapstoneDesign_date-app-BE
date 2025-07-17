import { Box, Container } from '@mui/material';
import styled from '@emotion/styled';
import Header from './Header';
import MainContent from './MainContent';
import BottomNav from './BottomNav'; // ← 네비게이션 바 추가!

const LayoutContainer = styled(Box)`
    min-height: 95vh;
    background-color: #FAFAFA;
`;

const MainLayout = () => {
    return (
        <LayoutContainer>
            <Header />
            <Container
                maxWidth="lg"
                sx={{
                    paddingTop: '24px',
                    paddingBottom: '48px'
                }}
            >
                <MainContent />
            </Container>
            {/* 하단 네비게이션 바 (홈 포함) */}
            <BottomNav />
        </LayoutContainer>
    );
};

export default MainLayout;
