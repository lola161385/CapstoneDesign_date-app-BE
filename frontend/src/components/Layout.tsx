
import React from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getCurrentValue = () => {
        const path = location.pathname;
        if (path === '/' || path === '/main') return 0; // /main 경로도 추가
        if (path === '/friends') return 1;
        if (path === '/matching') return 2;
        if (path.startsWith('/write')) return 3;
        return 0;
    };

    return (
        <Box sx={{ pb: 7, height: '100vh', overflow: 'hidden' }}>
            {/* 페이지 컨텐츠 - children 대신 Outlet 사용 */}
            <Outlet />

            {/* 하단 네비게이션 */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    background: theme =>
                        theme.palette.mode === 'light'
                            ? 'rgba(255, 255, 255, 0.8)'
                            : 'rgba(18, 18, 18, 0.8)',
                    backdropFilter: 'blur(10px)',
                }}
                elevation={3}
            >
                <BottomNavigation
                    value={getCurrentValue()}
                    onChange={(_, newValue) => {
                        switch (newValue) {
                            case 0:
                                navigate('/profile'); // 로그인 후에는 /main으로 이동
                                break;
                            case 1:
                                navigate('/friends');
                                break;
                            case 2:
                                navigate('/matching');
                                break;
                            case 3:
                                navigate('/write');
                                break;
                            default:
                                break;
                        }
                    }}
                >
                    <BottomNavigationAction label="프로필" icon={<PersonIcon />} />
                    <BottomNavigationAction label="친구" icon={<PeopleIcon />} />
                    <BottomNavigationAction label="매칭" icon={<FavoriteIcon />} />
                    <BottomNavigationAction label="작성" icon={<EditIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default Layout;