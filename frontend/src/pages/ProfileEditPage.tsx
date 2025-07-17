import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    MenuItem,
    Select,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    SelectChangeEvent,
    InputLabel,
    FormControl,
    FormHelperText,
    IconButton,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

// 인터페이스 정의 (기존 코드와 동일)
interface UserProfile {
    name: string;
    nickname: string;
    age: string;
    mbti: string;
    tags: string[];
    description: string;
    profileImage: string;
}

// 스타일 컴포넌트 (기존 코드에 새로운 스타일 추가)
const PageContainer = styled(Box)(({ theme }) => ({
    // 기존 스타일과 동일
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    height: 'auto',
    overflowY: 'auto',
    padding: '32px 16px',
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
        : 'linear-gradient(135deg, #121212 0%, #2c2c2c 100%)',
    color: theme.palette.text.primary,
}));

const FormContainer = styled(Box)(({ theme }) => ({
    // 기존 스타일과 동일
    width: '100%',
    maxWidth: 430,
    maxHeight: 'calc(100vh - 160px)',
    overflowY: 'auto',
    background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(18,18,18,0.9)',
    borderRadius: 16,
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxShadow: theme.palette.mode === 'light'
        ? '0 4px 12px rgba(0,0,0,0.05)'
        : '0 4px 12px rgba(0,0,0,0.3)',
    margin: '24px 0',
}));

// 나이 선택 필드를 위한 스타일
const AgeField = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '16px 14px',
    borderRadius: 4,
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'}`,
    cursor: 'pointer',
    '&:hover': {
        borderColor: theme.palette.text.primary,
    },
}));

// 나이 버튼을 위한 스타일
const AgeButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    backgroundColor: selected
        ? theme.palette.primary.main
        : theme.palette.mode === 'light' ? '#f5f5f5' : '#333',
    color: selected
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: selected
            ? theme.palette.primary.dark
            : theme.palette.mode === 'light' ? '#e0e0e0' : '#444',
    },
}));

// 다른 기존 스타일 컴포넌트들 (동일하게 유지)
const AvatarContainer = styled(Box)(({ theme }) => ({
    width: 120,
    height: 120,
    margin: '0 auto',
    borderRadius: '50%',
    background: theme.palette.mode === 'light' ? '#e0e0e0' : '#424242',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    '&:hover::after': {
        content: '"사진 변경"',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        textAlign: 'center',
        padding: '4px 0',
        fontSize: '12px',
    },
}));

const TagContainer = styled(Box)({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
});

const ButtonGroup = styled(Box)({
    display: 'flex',
    gap: 12,
    marginTop: 16,
});

// 상수 데이터 (기존과 동일)
const tagOptions = [
    '긍정적','독창적','무계획','열정적','포용적',
    '창의적','감성적','예술가','활발함','리더십',
    '배려심','성실함','도전적','신중함','낙천적',
];

const mbtiOptions = [
    'ISTJ','ISFJ','INFJ','INTJ',
    'ISTP','ISFP','INFP','INTP',
    'ESTP','ESFP','ENFP','ENTP',
    'ESTJ','ESFJ','ENFJ','ENTJ',
];

// 로컬 스토리지 커스텀 훅 (기존과 동일)
const useProfileStorage = () => {
    const defaultProfile: UserProfile = {
        name: '',
        nickname: '',
        age: '',
        mbti: '',
        tags: [],
        description: '',
        profileImage: '',
    };

    // 프로필 로드
    const loadProfile = useCallback((): UserProfile => {
        try {
            const stored = localStorage.getItem('userProfile');
            return stored ? JSON.parse(stored) : defaultProfile;
        } catch (error) {
            console.error('로컬스토리지 데이터 파싱 오류:', error);
            return defaultProfile;
        }
    }, []);

    // 프로필 저장
    const saveProfile = useCallback((profile: UserProfile): boolean => {
        try {
            localStorage.setItem('userProfile', JSON.stringify(profile));
            return true;
        } catch (error) {
            console.error('프로필 저장 오류:', error);
            return false;
        }
    }, []);

    return { loadProfile, saveProfile, defaultProfile };
};

const ProfileEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const theme = useTheme();
    const { loadProfile, saveProfile} = useProfileStorage();

    // 상태 관리 (기존 상태 + 나이 모달 상태)
    const [form, setForm] = useState<UserProfile>(() => loadProfile());
    const [preview, setPreview] = useState<string | null>(() => form.profileImage || null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
    const [ageDialogOpen, setAgeDialogOpen] = useState(false); // 나이 모달 상태 추가

    // 나이 옵션 생성 (1~100세)
    const ageOptions = useMemo(() => {
        return Array.from({ length: 100 }, (_, i) => String(i + 1));
    }, []);

    // 기존 useEffect 유지
    useEffect(() => {
        // 컴포넌트 언마운트 시 ObjectURL 해제
        return () => {
            if (preview && preview.startsWith('blob:') && preview !== form.profileImage) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview, form.profileImage]);

    // 기존 핸들러들 유지
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (formErrors[name as keyof UserProfile]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [formErrors]);

    const handleMbtiChange = useCallback((e: SelectChangeEvent<string>) => {
        setForm(prev => ({ ...prev, mbti: e.target.value }));
    }, []);

    const handleTagClick = useCallback((tag: string) => {
        setForm(prev => {
            const selected = prev.tags.includes(tag);
            if (selected) return { ...prev, tags: prev.tags.filter(t => t !== tag) };
            if (prev.tags.length < 5) return { ...prev, tags: [...prev.tags, tag] };
            return prev;
        });
    }, []);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage("이미지 크기는 5MB 이하여야 합니다.");
            return;
        }

        // 이전 ObjectURL 해제
        if (preview && preview.startsWith('blob:') && preview !== form.profileImage) {
            URL.revokeObjectURL(preview);
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
        setForm(prev => ({ ...prev, profileImage: url }));
    }, [preview, form.profileImage]);

    // 나이 선택 핸들러 추가
    const handleAgeSelect = useCallback((age: string) => {
        setForm(prev => ({ ...prev, age }));
        setAgeDialogOpen(false);
    }, []);

    // 다른 기존 핸들러 유지
    const validateForm = useCallback((): boolean => {
        const errors: Partial<Record<keyof UserProfile, string>> = {};
        let isValid = true;

        if (!form.name.trim()) {
            errors.name = "이름을 입력해주세요.";
            isValid = false;
        }

        if (!form.nickname.trim()) {
            errors.nickname = "닉네임을 입력해주세요.";
            isValid = false;
        }

        setFormErrors(errors);

        if (!isValid) {
            setErrorMessage("입력 정보를 확인해주세요.");
        }

        return isValid;
    }, [form]);

    const handleSubmit = useCallback(() => {
        if (!validateForm()) return;

        const success = saveProfile(form);
        if (success) {
            setShowSuccess(true);
        } else {
            setErrorMessage("프로필 저장 중 오류가 발생했습니다.");
        }
    }, [form, validateForm, saveProfile]);

    const handleSuccessClose = useCallback(() => {
        setShowSuccess(false);
        navigate(`/profile/${id}`);
    }, [navigate, id]);

    const handleCancel = useCallback(() => {
        if (preview && preview.startsWith('blob:') && preview !== form.profileImage) {
            URL.revokeObjectURL(preview);
        }
        navigate(-1);
    }, [navigate, preview, form.profileImage]);

    const selectedTags = useMemo(() =>
        form.tags.map(tag => (
            <Chip
                key={tag}
                label={`#${tag}`}
                color="primary"
                onDelete={() => handleTagClick(tag)}
                sx={{ margin: '4px 0' }}
            />
        )), [form.tags, handleTagClick]);

    return (
        <PageContainer>
            <FormContainer>
                <Typography variant="h4" fontWeight={700} textAlign="center" mb={2}>
                    프로필 수정
                </Typography>

                {/* 이미지 업로드 (기존과 동일) */}
                <input
                    type="file"
                    accept="image/*"
                    id="upload-avatar"
                    style={{ display:'none' }}
                    onChange={handleImageChange}
                    aria-label="프로필 이미지 업로드"
                />
                <label htmlFor="upload-avatar">
                    <AvatarContainer role="button" aria-label="프로필 이미지 변경">
                        {preview || form.profileImage
                            ? <Avatar
                                src={preview || form.profileImage}
                                sx={{ width:120, height:120 }}
                                alt="프로필 이미지"
                            />
                            : <Avatar
                                sx={{ width:100, height:100 }}
                                alt="기본 프로필 이미지"
                            >
                                <PersonIcon />
                            </Avatar>
                        }
                    </AvatarContainer>
                </label>

                {/* 기본 정보 필드 */}
                <TextField
                    label="이름"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    inputProps={{ 'aria-label': '이름 입력' }}
                />

                <TextField
                    label="닉네임"
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.nickname}
                    helperText={formErrors.nickname}
                    inputProps={{ 'aria-label': '닉네임 입력' }}
                />

                {/* 나이 필드: TextField에서 클릭 가능한 필드로 변경 */}
                <FormControl fullWidth>
                    <InputLabel shrink htmlFor="age-field" sx={{
                        transform: 'translate(0, -9px) scale(0.75)',
                        background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(18,18,18,0.9)',
                        padding: '0 5px'
                    }}>
                        나이
                    </InputLabel>
                    <AgeField
                        onClick={() => setAgeDialogOpen(true)}
                        role="button"
                        aria-haspopup="dialog"
                        aria-label="나이 선택하기"
                        id="age-field"
                    >
                        <Typography
                            sx={{
                                flexGrow: 1,
                                color: form.age ? 'inherit' : 'text.secondary'
                            }}
                        >
                            {form.age ? `만 ${form.age}세` : '나이를 선택해주세요'}
                        </Typography>
                        <EditIcon fontSize="small" sx={{ color: 'action.active' }} />
                    </AgeField>
                </FormControl>

                {/* MBTI 선택 (기존과 동일) */}
                <FormControl fullWidth>
                    <InputLabel id="mbti-select-label">MBTI</InputLabel>
                    <Select
                        labelId="mbti-select-label"
                        value={form.mbti}
                        onChange={handleMbtiChange}
                        displayEmpty
                        label="MBTI"
                        inputProps={{ 'aria-label': 'MBTI 선택' }}
                    >
                        <MenuItem value="">MBTI 선택</MenuItem>
                        {mbtiOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* 태그 선택 (기존과 동일) */}
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                        성격 태그 (최대 5개)
                    </Typography>

                    {selectedTags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {selectedTags}
                        </Box>
                    )}

                    <TagContainer role="group" aria-label="성격 태그 선택">
                        {tagOptions.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                clickable
                                variant={form.tags.includes(tag) ? 'filled' : 'outlined'}
                                color={form.tags.includes(tag) ? 'primary' : 'default'}
                                onClick={() => handleTagClick(tag)}
                                disabled={form.tags.length >= 5 && !form.tags.includes(tag)}
                                aria-selected={form.tags.includes(tag)}
                            />
                        ))}
                    </TagContainer>
                    <FormHelperText>
                        {form.tags.length === 5 ? "최대 5개까지 선택 가능합니다." : `${5 - form.tags.length}개 더 선택 가능합니다.`}
                    </FormHelperText>
                </Box>

                {/* 자기소개 (기존과 동일) */}
                <TextField
                    label="자기소개"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="자신을 소개해 주세요"
                    inputProps={{ 'aria-label': '자기소개 입력' }}
                />

                {/* 버튼 그룹 (기존과 동일) */}
                <ButtonGroup>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleCancel}
                        aria-label="취소하고 이전 화면으로 돌아가기"
                    >
                        취소
                    </Button>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        aria-label="변경사항 저장하기"
                    >
                        저장
                    </Button>
                </ButtonGroup>
            </FormContainer>

            {/* 성공 다이얼로그 (기존과 동일) */}
            <Dialog
                open={showSuccess}
                onClose={handleSuccessClose}
                aria-labelledby="success-dialog-title"
            >
                <DialogTitle id="success-dialog-title">저장되었습니다!</DialogTitle>
                <DialogActions>
                    <Button onClick={handleSuccessClose}>확인</Button>
                </DialogActions>
            </Dialog>

            {/* 오류 다이얼로그 (기존과 동일) */}
            <Dialog
                open={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
            >
                <DialogTitle id="error-dialog-title">알림</DialogTitle>
                <DialogContent>
                    <Typography id="error-dialog-description">
                        {errorMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setErrorMessage(null)}>확인</Button>
                </DialogActions>
            </Dialog>

            {/* 나이 선택 모달 (새로 추가) */}
            <Dialog
                open={ageDialogOpen}
                onClose={() => setAgeDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                aria-labelledby="age-dialog-title"
            >
                <DialogTitle id="age-dialog-title"
                             sx={{
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 alignItems: 'center',
                                 borderBottom: 1,
                                 borderColor: 'divider'
                             }}
                >
                    <Typography variant="h6">나이 선택</Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => setAgeDialogOpen(false)}
                        aria-label="닫기"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 2, height: '50vh', overflowY: 'auto' }}>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        {ageOptions.map((age) => (
                            <AgeButton
                                variant="contained"
                                disableElevation
                                onClick={() => handleAgeSelect(age)}
                                selected={form.age === age}
                            >
                                {age}
                            </AgeButton>
                        ))}
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setForm(prev => ({ ...prev, age: '' }));
                            setAgeDialogOpen(false);
                        }}
                        color="error"
                    >
                        초기화
                    </Button>
                    <Button
                        onClick={() => setAgeDialogOpen(false)}
                        color="primary"
                    >
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default ProfileEditPage;