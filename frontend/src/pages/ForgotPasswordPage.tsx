import React, { useState } from 'react';
import { Box, Button, Container, Typography, Paper, TextField, IconButton } from '@mui/material';
import styled from '@emotion/styled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useColorMode } from '../contexts/ColorModeContext';

// 이전 LoginPage와 동일한 스타일 컴포넌트를 활용
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

const BackButton = styled(IconButton)`
  position: absolute;
  top: 24px;
  left: 24px;
  color: ${props => props.theme.palette.mode === 'dark' ? '#ffffff' : '#1a1a1a'};
  background: rgba(255,255,255,0.18);
  border-radius: 50%;
  transition: all 0.3s;
  &:hover {
    background: rgba(255,255,255,0.35);
  }
`;

const EmailIcon2 = styled(Box)`
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

const Form = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ErrorMsg = styled(Typography)`
  color: #e53935;
  font-size: 15px;
  margin-top: 2px;
  margin-bottom: 0;
  width: 100%;
  text-align: left;
`;

const SuccessMsg = styled(Typography)`
  color: #4caf50;
  font-size: 15px;
  margin-top: 2px;
  margin-bottom: 0;
  width: 100%;
  text-align: center;
`;

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { mode } = useColorMode();
    const isDarkMode = mode === 'dark';
    console.log(isDarkMode);

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email.includes('@')) {
            setError('올바른 이메일 주소를 입력하세요.');
            return;
        }

        setLoading(true);

        // 실제 비밀번호 찾기 API를 호출할 위치
        await new Promise(res => setTimeout(res, 1500));

        setLoading(false);
        setSuccess(true);
    };

    return (
        <LoginContainer maxWidth={false}>
            <GlassCard elevation={0}>
                <BackButton onClick={() => navigate(-1)} aria-label="뒤로가기">
                    <ArrowBackIcon />
                </BackButton>

                <EmailIcon2>
                    <EmailIcon sx={{ fontSize: 36 }} />
                </EmailIcon2>

                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                    비밀번호 찾기
                </Typography>

                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
                </Typography>

                {success ? (
                    <>
                        <SuccessMsg>
                            비밀번호 재설정 링크가 이메일로 전송되었습니다.
                        </SuccessMsg>
                        <Typography variant="body2" color="text.secondary" align="center">
                            이메일을 확인하시고 링크를 클릭하여 비밀번호를 변경해주세요.
                        </Typography>
                        <GlassButton
                            variant="contained"
                            onClick={() => navigate('/')}
                            fullWidth
                        >
                            로그인 페이지로 돌아가기
                        </GlassButton>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <Form>
                            <TextField
                                label="이메일"
                                type="email"
                                required
                                fullWidth
                                variant="outlined"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
                            />

                            {error && <ErrorMsg>{error}</ErrorMsg>}

                            <GlassButton
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? '처리 중...' : '비밀번호 재설정 링크 전송'}
                            </GlassButton>
                        </Form>
                    </form>
                )}
            </GlassCard>
        </LoginContainer>
    );
};

export default ForgotPasswordPage;