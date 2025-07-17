import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ref, push, update, increment, onChildAdded } from 'firebase/database';
import {
  Box, Typography, TextField, IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useColorMode } from '../contexts/ColorModeContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth, db } from '../firebase';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIosNew from '@mui/icons-material/ArrowBackIosNew';
import styled from "@emotion/styled";
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  background: 'inherit',
}));

const HeaderBar = styled(Box)(({ theme }) => ({
  height: 64,
  minHeight: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 100,
}));

const Messages = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  padding: 8,
  paddingTop: 60,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  overflowY: 'auto',
  background: theme.palette.background.default,
  '&::-webkit-scrollbar': { width: 8 },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'light' ? '#bbb' : '#555',
    borderRadius: 4,
  },
}));

const Bubble = styled(motion.div)<{ mine: boolean }>(({ mine, theme }) => ({
  alignSelf: mine ? 'flex-end' : 'flex-start',
  background: mine
      ? theme.palette.primary.main
      : theme.palette.grey[mine ? 800 : 300],
  color: mine ? theme.palette.primary.contrastText : theme.palette.text.primary,
  padding: '12px 16px',
  borderRadius: 20,
  maxWidth: '70%',
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  fontSize: '0.95rem',
  lineHeight: 1.4,
  border: `1px solid ${theme.palette.divider}`,
}));

const InputArea = styled(Box)(({ theme }) => ({
  minHeight: 72,
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
}));

const sanitizeEmail = (email: string) =>
    email.replace(/\./g, '_dot_').replace(/@/g, '_at_');

const ChatRoomPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  //*const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const withUser = params.get('with') || '';

  // 안읽은 메시지 카운트 초기화 함수
  const markUnreadZero = useCallback(() => {
    if (!auth.currentUser || !withUser) return;

    const safeCurrentEmail = sanitizeEmail(auth.currentUser.email!);
    const safeWithEmail = sanitizeEmail(withUser);
    const roomId = [safeCurrentEmail, safeWithEmail].sort().join('_');

    const currentUserChatRef = ref(db, `chat_list/${safeCurrentEmail}/${roomId}`);
    update(currentUserChatRef, { unreadCount: 0 });
  }, [withUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (!user || !withUser) {
        navigate('/login');
        return;
      }

      const currentUser = user.email!;
      const safeCurrentEmail = sanitizeEmail(currentUser);
      const safeWithEmail = sanitizeEmail(withUser);
      const roomId = [safeCurrentEmail, safeWithEmail].sort().join('_');

      // 1. 입장 시 초기화
      markUnreadZero();

      // 2. 메시지 리스너 설정
      const messagesRef = ref(db, `chats/${roomId}/messages`);
      const off = onChildAdded(messagesRef, (snapshot) => {
        setMessages(prev => [...prev, snapshot.val()]);
        // 3. 새 메시지 도착 시 초기화
        markUnreadZero();
      });

      return () => {
        // 4. 나갈 때 초기화
        markUnreadZero();
        off();
      };
    });

    return () => unsubscribe();
  }, [navigate, withUser, markUnreadZero]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ChatRoomPage.tsx 내 sendMessage 함수 수정
  const sendMessage = async () => {
    if (!input.trim()) return;

    const user = auth.currentUser!;
    const safeCurrentEmail = sanitizeEmail(user.email!);
    const safeWithEmail = sanitizeEmail(withUser);
    const roomId = [safeCurrentEmail, safeWithEmail].sort().join('_');

    // 1. 메시지 저장
    await push(ref(db, `chats/${roomId}/messages`), {
      sender: user.email,
      text: input.trim(),
      timestamp: Date.now(),
      read: false
    });

    // 2. 상대방 chat_list 갱신 (increment 사용)
    const otherUserChatRef = ref(db, `chat_list/${safeWithEmail}/${roomId}`);
    await update(otherUserChatRef, {
      lastMessage: input.trim(),
      timestamp: Date.now(),
      unreadCount: increment(1), // ✅ Firebase increment 함수 사용
      with: user.email
    });

    // 3. 내 chat_list 갱신
    const currentUserChatRef = ref(db, `chat_list/${safeCurrentEmail}/${roomId}`);
    await update(currentUserChatRef, {
      lastMessage: input.trim(),
      timestamp: Date.now(),
      unreadCount: 0,
      with: withUser
    });

    setInput('');
  };

  return (
      <Container>
        <HeaderBar>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNew />
          </IconButton>
          <Typography variant="h6">{withUser}와의 채팅</Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </HeaderBar>

        <Messages>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
                <Bubble
                    key={i}
                    mine={msg.sender === auth.currentUser?.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                  <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        color: msg.sender === auth.currentUser?.email
                            ? 'rgba(255,255,255,0.7)'
                            : 'text.secondary',
                        textAlign: 'right'
                      }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Bubble>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Messages>

        <InputArea>
          <TextField
              fullWidth
              multiline
              maxRows={4}
              variant="outlined"
              size="small"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              sx={{ mr: 1 }}
          />
          <IconButton
              onClick={sendMessage}
              color="primary"
              disabled={!input.trim()}
          >
            <SendIcon />
          </IconButton>
        </InputArea>
      </Container>
  );
};

export default ChatRoomPage;
