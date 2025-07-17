import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Dialog,
  Button,
  Slide,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../contexts/ColorModeContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth, db } from '../firebase.js';
import { ref, onValue } from 'firebase/database';
/* eslint-disable @typescript-eslint/no-explicit-any */

const PageContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 95vh;
  padding: 24px;
  gap: 24px;
  background: ${({ theme }) =>
      theme.palette.mode === 'light'
          ? 'linear-gradient(135deg,#f5f7fa 0%,#e4e9f2 100%)'
          : 'linear-gradient(135deg,#1a1a1a 0%,#2d3436 100%)'};
`;

const Header = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const MainContent = styled('div')`
  flex: 1;
  width: 90vw;
  max-width: 450px;
  margin: 0 auto;
  background: ${({ theme }) =>
      theme.palette.mode === 'light'
          ? 'rgba(255,255,255,0.8)'
          : 'rgba(45,45,45,0.8)'};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
        theme.palette.mode === 'light'
            ? 'rgba(0,0,0,0.2)'
            : 'rgba(255,255,255,0.2)'};
    border-radius: 4px;
  }
`;

const WavingHand = styled('span')`
  font-size: 24px;
  cursor: pointer;
  animation: wave 1.5s infinite;
  transform-origin: 70% 70%;
  @keyframes wave {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
    60% { transform: rotate(0deg); }
    100% { transform: rotate(0deg); }
  }
`;

const SlideUp = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ChatRoom {
  roomId: string;
  with: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: number;
}

const sanitizeEmail = (email: string) =>
    email.replace(/\./g, '_dot_').replace(/@/g, '_at_');

const FriendListItem = memo(({ room, onSelect, onChat }: {
  room: ChatRoom;
  onSelect: (room: ChatRoom) => void;
  onChat: (room: ChatRoom, e: React.MouseEvent) => void;
}) => (
    <ListItem
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(room)}
        sx={{
          cursor: 'pointer',
          borderRadius: 2,
          mb: 1,
          '&:hover': { bgcolor: 'action.hover' }
        }}
        secondaryAction={
          <Tooltip title="채팅하기">
            <IconButton
                edge="end"
                onClick={e => onChat(room, e)}
                aria-label={`${room.with}님과 채팅하기`}
            >
              <WavingHand role="img" aria-label="wave">🤚</WavingHand>
            </IconButton>
          </Tooltip>
        }
    >
      <ListItemAvatar>
        <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={room.unreadCount > 0 ? 'error' : 'default'}
        >
          <Avatar>{room.with && room.with.length > 0 ? room.with[0] : '?'}</Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
          primary={<Typography fontWeight={room.unreadCount > 0 ? 700 : 400}>{room.with}</Typography>}
          secondary={
            <>
              {room.lastMessage}
              {room.unreadCount > 0 && (
                  <span style={{ color: 'red', marginLeft: '8px' }}>
              [{room.unreadCount}]
            </span>
              )}
            </>
          }
          primaryTypographyProps={{ fontWeight: 600 }}
      />
    </ListItem>
));

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const [selected, setSelected] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 스크롤 위치 최상단으로 초기화
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user: { email: string; }) => {
      if (!user || !user.email) {
        navigate('/login');
        return;
      }

      const safeEmail = sanitizeEmail(user.email);
      const chatListRef = ref(db, `chat_list/${safeEmail}`);

      const unsubscribeChatList = onValue(chatListRef, (snapshot) => {
        const data = snapshot.val();
        const rooms: ChatRoom[] = [];

        if (!data) {
          setChatRooms([]);
          return;
        }

        Object.entries(data).forEach(([roomId, roomData]: [string, any]) => {
          rooms.push({
            roomId,
            with: roomData.with || "",
            lastMessage: roomData.lastMessage || "메시지 없음",
            unreadCount: roomData.unreadCount || 0,
            timestamp: roomData.timestamp || 0
          });
        });

        rooms.sort((a, b) => b.timestamp - a.timestamp);
        setChatRooms(rooms);
      });

      return unsubscribeChatList;
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate]);

  const openProfile = useCallback((room: ChatRoom) => setSelected(room), []);
  const closeProfile = useCallback(() => setSelected(null), []);
  const toChat = useCallback((room: ChatRoom, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/room?with=${encodeURIComponent(room.with)}`);
  }, [navigate]);

  const startHold = useCallback(() => {
    if (!selected) return;
    timerRef.current = setTimeout(() => {
      alert(`${selected.with}님의 상세 프로필로 이동`);
    }, 700);
  }, [selected]);

  const cancelHold = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
      <PageContainer>
        <Header>
          <Typography variant="h4" fontWeight={600} component="h1">
            채팅 목록
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Header>
        <MainContent>
          <List>
            {chatRooms.length === 0 ? (
                <Typography color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
                  채팅 내역이 없습니다.
                </Typography>
            ) : (
                chatRooms.map(room => (
                    <FriendListItem
                        key={room.roomId}
                        room={room}
                        onSelect={openProfile}
                        onChat={toChat}
                    />
                ))
            )}
          </List>
        </MainContent>
        {/* 프로필/상세 다이얼로그 */}
        <Dialog
            TransitionComponent={SlideUp}
            open={Boolean(selected)}
            onClose={closeProfile}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: 'visible',
                maxHeight: '90vh',
                background: theme.palette.mode === 'light'
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(45,45,45,0.95)',
                backdropFilter: 'blur(10px)',
              },
            }}
        >
          <Box
              p={3}
              textAlign="center"
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
          >
            <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: 3,
                }}
            >
              {selected?.with && selected.with.length > 0 ? selected.with[0] : "?"}
            </Avatar>
            <Typography variant="h5" fontWeight={700} component="h2">
              {selected?.with}
            </Typography>
            <Typography sx={{ mt: 1 }} color="text.secondary">
              최근 메시지: "{selected?.lastMessage}"
            </Typography>
            <Box mt={3}>
              <Typography variant="body2">
                읽지 않은 메시지: {selected?.unreadCount ?? 0}
              </Typography>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                  variant="contained"
                  onClick={() => {
                    if (selected) navigate(`/chat/room?with=${encodeURIComponent(selected.with)}`);
                  }}
                  sx={{ minWidth: '120px' }}
              >
                채팅하기
              </Button>
              <Button
                  variant="text"
                  onClick={closeProfile}
                  sx={{ minWidth: '120px' }}
              >
                닫기
              </Button>
            </Box>
          </Box>
        </Dialog>
      </PageContainer>
  );
};

export default memo(FriendsPage);