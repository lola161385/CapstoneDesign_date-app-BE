import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import {
    IconButton,
    Typography,
    useTheme,
    CircularProgress,
    Alert,
    Avatar
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import styled from '@emotion/styled';
import { ref, set, get } from 'firebase/database';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth, db } from '../firebase';
/* eslint-disable @typescript-eslint/no-explicit-any */
interface MatchRecommendation {
    email: string;
    name: string;
    mbti: string;
    //commonTags: string[];
    score: number;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 24px;
  gap: 24px;
  background: ${({ theme }) =>
    theme.palette.mode === 'light'
        ? 'linear-gradient(135deg,#f5f7fa 0%,#e4e9f2 100%)'
        : 'linear-gradient(135deg,#1a1a1a 0%,#2d3436 100%)'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  width: 90vw;
  max-width: 450px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  overflow-y: auto;
`;

const Card = styled.div`
  width: 100%;
  height: 70vh;
  background: ${({ theme }) =>
    theme.palette.mode === 'light' ? '#fff' : '#2d2d2d'};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// const Tag = styled.span`
//   display: inline-block;
//   background: ${({ theme }) =>
//     theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.2)'};
//   color: ${({ theme }) => theme.palette.primary.main};
//   padding: 6px 16px;
//   border-radius: 20px;
//   margin: 4px;
//   font-size: 0.875rem;
// `;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 24px;
`;

const sanitizeEmail = (email: string) =>
    email.replace(/\./g, '_dot_').replace(/@/g, '_at_');

const MatchingPage: React.FC = () => {
    const [profiles, setProfiles] = useState<MatchRecommendation[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    // 기존 채팅 목록 가져오기
    const fetchExistingChats = useCallback(async (userId: string) => {
        try {
            const userChatRef = ref(db, `chat_list/${sanitizeEmail(userId)}`);
            const snapshot = await get(userChatRef);
            const chats = new Set<string>();

            if (snapshot.exists()) {
                Object.values(snapshot.val()).forEach((chat: any) => {
                    chats.add(chat.with);
                });
            }

            return chats;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            throw new Error('채팅 목록 불러오기 실패');
        }
    }, []);

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // 1. 추천 목록 가져오기
                const response = await axios.get('/api/match/recommendations', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // 2. 현재 사용자 정보 확인
                const user = auth.currentUser;
                if (!user?.email) return;

                // 3. 기존 채팅 필터링
                const existingChats = await fetchExistingChats(user.email);
                const filtered = response.data.filter(
                    (p: MatchRecommendation) => !existingChats.has(p.email)
                );

                setProfiles(filtered);
            } catch (err) {
                setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, fetchExistingChats]);

    // 채팅방 생성
    const createChatRoom = async (targetEmail: string) => {
        const user = auth.currentUser;
        if (!user?.email) return;

        const myEmail = user.email;
        const roomId = [
            sanitizeEmail(myEmail),
            sanitizeEmail(targetEmail)
        ].sort().join('_');

        try {
            await set(ref(db, `chat_list/${sanitizeEmail(myEmail)}/${roomId}`), {
                with: targetEmail,
                lastMessage: '',
                unreadCount: 0,
                timestamp: Date.now()
            });

            await set(ref(db, `chat_list/${sanitizeEmail(targetEmail)}/${roomId}`), {
                with: myEmail,
                lastMessage: '',
                unreadCount: 0,
                timestamp: Date.now()
            });

            return roomId;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            throw new Error('채팅방 생성 실패');
        }
    };

    // 액션 핸들러
    const handleAction = useCallback(async (direction: 'left' | 'right') => {
        if (!profiles[currentIndex]) return;

        if (direction === 'right') {
            try {
                await createChatRoom(profiles[currentIndex].email);
                navigate(`/chat/room?with=${encodeURIComponent(profiles[currentIndex].email)}`);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                alert('채팅 생성 실패');
            }
        }

        setCurrentIndex(prev => prev + 1);
    }, [profiles, currentIndex, navigate]);

    const handlers = useSwipeable({
        onSwipedLeft: () => handleAction('left'),
        onSwipedRight: () => handleAction('right'),
        trackMouse: true
    });

    const currentProfile = profiles[currentIndex];

    if (loading) {
        return (
            <Container>
                <CircularProgress sx={{ margin: 'auto' }} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ maxWidth: 500, margin: 'auto' }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!currentProfile) {
        return (
            <Container>

                <Header>
                    <Typography variant="h4" fontWeight={700}>
                        매칭하기
                    </Typography>
                </Header>
                <MainContent {...handlers}>
                    <Card>
                        <Typography variant="h4" textAlign="center" sx={{ mt: 4 }}>
                            {profiles.length === 0
                                ? '추천 가능한 대상이 없습니다 😢'
                                : '더 이상 추천 대상이 없습니다 😢'}
                        </Typography>
                    </Card>
                </MainContent>
            </Container>
        );


    }

    return (
        <Container>
            <Header>
                <Typography variant="h4" fontWeight={700}>
                    매칭하기
                </Typography>
            </Header>


            <MainContent {...handlers}>
                <Card>
                    <Avatar sx={{ width: 120, height: 120, mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 60 }} />
                    </Avatar>

                    <Typography variant="h5" fontWeight={600} textAlign="center">
                        {currentProfile.name}
                    </Typography>

                    <Typography variant="subtitle1" textAlign="center" sx={{ mb: 2 }}>
                        {currentProfile.mbti} · {currentProfile.score}점
                    </Typography>

                    {/*<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>*/}
                    {/*    {currentProfile.commonTags.map(tag => (*/}
                    {/*        <Tag key={tag} theme={theme}>*/}
                    {/*            #{tag}*/}
                    {/*        </Tag>*/}
                    {/*    ))}*/}
                    {/*</Box>*/}

                    <ActionButtons>
                        <IconButton
                            size="large"
                            onClick={() => handleAction('left')}
                            sx={{
                                background: theme.palette.error.main,
                                '&:hover': { background: theme.palette.error.dark }
                            }}
                        >
                            <CloseIcon sx={{ color: '#fff', fontSize: 32 }} />
                        </IconButton>

                        <IconButton
                            size="large"
                            onClick={() => handleAction('right')}
                            sx={{
                                background: theme.palette.primary.main,
                                '&:hover': { background: theme.palette.primary.dark }
                            }}
                        >
                            <FavoriteIcon sx={{ color: '#fff', fontSize: 32 }} />
                        </IconButton>
                    </ActionButtons>
                </Card>
            </MainContent>


        </Container>
    );
};

export default MatchingPage;
