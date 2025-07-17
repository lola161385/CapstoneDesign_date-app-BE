import React, { useState, useRef } from 'react';
import { Box, Button, Container, Typography, Paper, TextField, Collapse, IconButton } from '@mui/material';
import styled from '@emotion/styled';
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../contexts/ColorModeContext';

// Firebase import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth, googleProvider } from '../firebase.js';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";

const LoginContainer = styled(Container)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #18191a 0%, #232526 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'};
  transition: background 0.3s;
`;

const GlassCard = styled(Paper)`
  border-radius: 36px;
  max-width: 420px;
  width: 100%;
  padding: 48px 32px 40px 32px;
  background: ${props => props.theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.7)'
    : 'rgba(255, 255, 255, 0.6)'};
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.18), 0 1.5px 0 0 rgba(255,255,255,0.25) inset;
  border: 1.5px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  position: relative;
  transition: all 0.3s, transform 0.1s;
  &:active {
    transform: scale(0.98);
  }
`;

const LogoIcon = styled(Box)`
  background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
  border-radius: 50%;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
  box-shadow: 0 4px 16px rgba(33,150,243,0.15);
`;

const GlassButton = styled(Button)`
  width: 100%;
  padding: 14px 0;
  font-size: 17px;
  font-weight: 600;
  border-radius: 16px;
  background: rgba(255,255,255,0.25);
  color: ${props => props.theme.palette.mode === 'dark' ? '#fff' : '#2196F3'};
  border: 1.5px solid rgba(255,255,255,0.25);
  box-shadow: 0 2px 8px rgba(31, 38, 135, 0.10);
  backdrop-filter: blur(8px);
  margin-bottom: 10px;
  transition: all 0.2s, transform 0.08s;
  &:hover {
    background: rgba(255,255,255,0.35);
    color: ${props => props.theme.palette.mode === 'dark' ? '#90CAF9' : '#1976D2'};
  }
  &:active {
    transform: scale(0.97);
  }
`;

const GoogleButton = styled(GlassButton)`
  background: rgba(255,255,255,0.85);
  color: #222;
  border: none;
  font-weight: 700;
  margin-bottom: 16px;
  &:hover {
    background: rgba(255,255,255,1);
    color: #1976D2;
  }
`;

const EmailButton = styled(GlassButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.18);
  color: ${props => props.theme.palette.mode === 'dark' ? '#fff' : '#2196F3'};
  border: 1.5px solid rgba(255,255,255,0.25);
`;

const Divider = styled(Box)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${props => props.theme.palette.mode === 'dark' ? '#b0b0b0' : '#5f6368'};
  font-size: 14px;
  margin: 18px 0 0 0;
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1.5px;
    background-color: ${props => props.theme.palette.mode === 'dark' ? '#404040' : '#dadce0'};
  }
`;

const ThemeToggleButton = styled(IconButton)`
  position: absolute;
  top: 24px;
  right: 24px;
  color: ${props => props.theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
  background: rgba(255,255,255,0.18);
  border-radius: 50%;
  transition: all 0.3s;
  &:hover {
    transform: rotate(30deg);
    background: rgba(255,255,255,0.35);
  }
`;

const EmailForm = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
  padding: 18px 0 0 0;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ForgotPassword = styled(Box)`
  width: 100%;
  text-align: right;
  margin-top: 4px;
  margin-bottom: 0;
`;

const ForgotPasswordLink = styled(Typography)`
  color: #2196F3;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.85;
  display: inline-block;
  &:hover {
    opacity: 1;
    color: #1976D2;
  }
`;

const ErrorMsg = styled(Typography)`
  color: #e53935;
  font-size: 15px;
  margin-top: 2px;
  margin-bottom: 0;
  width: 100%;
  text-align: left;
`;


const LoginPage = () => {
  const { toggleColorMode, mode } = useColorMode();
  const isDarkMode = mode === 'dark';

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (showEmailForm && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [showEmailForm]);

  // Google 로그인
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 백엔드에 토큰 전송
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      localStorage.setItem("jwtToken", data.token);
      setTimeout(() => {
        navigate("/profile");
      }, 0);
      setLoading(false);
      if (data.newUser === 'true') {
        navigate("/profile/edit");
      } else {
        navigate("/profile");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Google 로그인 실패: " + (err.message || ""));
      } else {
        setError("Google 로그인 실패: 알 수 없는 오류");
      }
      setLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified && !user.providerData[0].providerId.includes("google.com")) {
        setError("❌ 이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      localStorage.setItem("jwtToken", data.token);
      setTimeout(() => {
        navigate("/profile");
      }, 0);

      setLoading(false);
      if (data.newUser === 'true') {
        navigate("/profile/edit");
      } else {
        navigate("/profile");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("❌ 로그인 실패: " + (err.message || "오류 발생"));
      } else {
        setError("❌ 로그인 실패: 알 수 없는 오류");
      }
      setLoading(false);
    }
  };

  // 비밀번호 재설정
  const handleForgotPassword = async () => {
    if (!email) {
      setError("이메일을 입력하세요.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("✅ 비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("❌ " + (error.message || "비밀번호 재설정 중 오류 발생"));
      } else {
        setError("❌ 비밀번호 재설정 중 알 수 없는 오류");
      }
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
      <LoginContainer maxWidth={false}>
        <GlassCard elevation={0}>
          <ThemeToggleButton onClick={toggleColorMode} aria-label="toggle theme">
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ThemeToggleButton>
          <LogoIcon>
            <LockOutlinedIcon sx={{ fontSize: 36 }} />
          </LogoIcon>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            환영합니다!
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
            서비스를 이용하시려면 로그인이 필요합니다
          </Typography>
          <GoogleButton
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              fullWidth
              disabled={loading}
          >
            Google 계정으로 로그인
          </GoogleButton>
          <EmailButton
              variant="outlined"
              startIcon={<EmailIcon />}
              onClick={() => setShowEmailForm(v => !v)}
              fullWidth
              disabled={loading}
          >
            이메일로 로그인
          </EmailButton>
          <Collapse in={showEmailForm} sx={{ width: '100%' }}>
            <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
              <EmailForm>
                <TextField
                    label="이메일"
                    type="email"
                    required
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    inputRef={emailInputRef}
                    disabled={loading}
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    required
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                />
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <GlassButton type="submit" variant="contained" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </GlassButton>
                <ForgotPassword>
                  <ForgotPasswordLink onClick={handleForgotPassword} variant="body2">
                    비밀번호를 잊으셨나요?
                  </ForgotPasswordLink>
                </ForgotPassword>
              </EmailForm>
            </form>
          </Collapse>
          <GlassButton variant="outlined" onClick={handleSignup} sx={{ mt: 1 }}>
            회원가입
          </GlassButton>
          <Divider>약관</Divider>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            로그인함으로써 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다
          </Typography>
        </GlassCard>
      </LoginContainer>
  );
};

export default LoginPage;