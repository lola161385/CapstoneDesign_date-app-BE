import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import styled from '@emotion/styled';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { app } from '../firebase.js'; // 반드시 app만 import

// paste.txt 스타일 적용
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

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 비밀번호 복잡성 검사
    const isPasswordValid = (pwd: string) => {
        const regex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid(password)) {
            setError('비밀번호는 8자 이상, 영소문자 1개, 숫자 1개, 특수문자 1개를 포함해야 합니다.');
            return;
        }

        try {
            setLoading(true);
            const auth = getAuth(app);

            // 회원가입
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // 이메일 인증 메일 발송
            await sendEmailVerification(userCredential.user);

            alert('회원가입 완료! 이메일 인증을 완료해주세요.');
            navigate('/login');
        } catch (err: any) {
            setError(mapFirebaseError(err.code));
        } finally {
            setLoading(false);
        }
    };

    // Firebase 오류 코드 매핑
    const mapFirebaseError = (code: string) => {
        switch (code) {
            case 'auth/email-already-in-use':
                return '이미 사용 중인 이메일입니다.';
            case 'auth/invalid-email':
                return '유효하지 않은 이메일 형식입니다.';
            case 'auth/weak-password':
                return '비밀번호 보안 강도가 약합니다.';
            default:
                return '회원가입 중 오류가 발생했습니다.';
        }
    };

    return (
        <LoginContainer maxWidth={false}>
            <GlassCard elevation={0}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
                    회원가입
                </Typography>
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="이메일"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="비밀번호"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            helperText="8자 이상, 영소문자/숫자/특수문자 포함"
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                background: 'rgba(255,255,255,0.25)',
                                backdropFilter: 'blur(8px)',
                                '&:hover': { background: 'rgba(255,255,255,0.35)' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : '회원가입'}
                        </Button>
                    </Box>
                </form>
            </GlassCard>
        </LoginContainer>
    );
};

export default RegisterForm;
