import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Avatar, Chip, IconButton, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import styled from '@emotion/styled';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../contexts/ColorModeContext';

interface UserProfile {
    name: string;
    email: string;
    birthdate: string;
    bio: string;
    gender: string;
    mbti: string;
    tags: string[];
    profileImage: string;
}

const PageContainer = styled(Box)`
    display: flex;
    flex-direction: column;
    height: 95vh;
    padding: 24px;
    gap: 24px;
    background: ${({ theme }) =>
            theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'};
    @media (max-width: 430px) {
        padding: 16px;
        gap: 16px;
    }
`;

const Header = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

const MainContent = styled(Box)`
    flex: 1;
    width: 90vw;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
`;

const ProfileContent = styled(Box)`
    flex: 1;
    width: 100%;
    background: ${({ theme }) =>
            theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(26, 26, 46, 0.8)'};
    backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 24px;
    overflow-y: auto;
    box-shadow: ${({ theme }) => theme.palette.mode === 'light'
            ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'};
    @media (max-width: 430px) {
        width: 100%;
        padding: 20px;
    }
`;

const ProfileHeader = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
    width: 120px;
    height: 120px;
    margin-bottom: 8px;
    background-color: ${({ theme }) =>
            theme.palette.mode === 'light' ? '#f0f0f0' : '#2d2d2d'};
    border: 4px solid ${({ theme }) =>
            theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.1)'};
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    svg {
        width: 60%;
        height: 60%;
        color: ${({ theme }) =>
                theme.palette.mode === 'light' ? '#666' : '#999'};
    }
`;

const TagContainer = styled(Box)`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    margin: 16px 0;
`;

function calculateKoreanAge(birthdateStr: string) {
    const today = new Date();
    const birthDate = new Date(birthdateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBirthdayPassed = today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!isBirthdayPassed) age--;
    return age;
}

const ProfilePage: React.FC = () => {
    const { toggleColorMode, mode } = useColorMode();
    //const theme = useTheme();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await fetch('http://210.109.54.109:8080/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('인증 실패. 다시 로그인하세요.');
                }
                const data = await response.json();
                const profile = data?.profile ?? {};
                setUserProfile({
                    name: profile.name ?? '',
                    email: data?.userEmail ?? '',
                    birthdate: profile.birthdate ?? '',
                    bio: profile.bio ?? '',
                    gender: profile.gender ?? '',
                    mbti: profile.personality?.mbti ?? '',
                    tags: profile.personality?.tags ?? [],
                    profileImage: profile.profileImage ?? '/images/default-profile.png'
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setError("프로필 정보를 불러올 수 없습니다. 다시 로그인 해주세요.");
                localStorage.removeItem('jwtToken');
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    // 로그아웃
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        navigate('/login');
    };

    // 회원탈퇴
    const handleDeleteAccount = async () => {
        if (!window.confirm('정말로 회원탈퇴 하시겠습니까?\n모든 데이터가 삭제됩니다.')) return;
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://210.109.54.109:8080/delete-account', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                localStorage.removeItem('jwtToken');
                navigate('/login');
            } else {
                alert('회원탈퇴 실패');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('회원탈퇴 처리 중 오류 발생');
        }
    };

    if (error) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'red' }}>{error}</Box>;
    }

    if (!userProfile) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>로딩 중...</Box>;
    }

    return (
        <PageContainer>
            <Header>
                <Typography variant="h4" fontWeight={700}>프로필</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={toggleColorMode} color="inherit">
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                    <IconButton
                        onClick={e => setAnchorEl(e.currentTarget)}
                        color="inherit"
                        aria-label="설정"
                    >
                        <SettingsIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>로그아웃</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { setAnchorEl(null); handleDeleteAccount(); }}>
                            <ListItemIcon>
                                <DeleteForeverIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText sx={{ color: 'error.main' }}>회원탈퇴</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Header>
            <MainContent>
                <ProfileContent>
                    <ProfileHeader>
                        <StyledAvatar>
                            <Avatar
                                src={userProfile.profileImage}
                                sx={{ width: 120, height: 120 }}
                            />
                        </StyledAvatar>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {userProfile.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', mt: 0.5 }}>
                                {userProfile.email}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {userProfile.gender}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                ·
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {userProfile.birthdate ? `만 ${calculateKoreanAge(userProfile.birthdate)}세` : ''}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                ·
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                {userProfile.mbti}
                            </Typography>
                        </Box>
                    </ProfileHeader>
                    <TagContainer>
                        {userProfile.tags.map((tag) => (
                            <Chip key={tag} label={`#${tag}`} />
                        ))}
                    </TagContainer>
                    <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
                        {userProfile.bio}
                    </Typography>
                </ProfileContent>
            </MainContent>
        </PageContainer>
    );
};

export default ProfilePage;
