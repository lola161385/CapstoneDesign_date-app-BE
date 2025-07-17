import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Chip, Avatar, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, FormHelperText, CircularProgress
} from '@mui/material';
import styled from '@emotion/styled';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 95vh;
  padding: 24px;
  gap: 24px;
  background: ${({ theme }) =>
      theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
          : 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)'};
  @media (max-width: 430px) {
    padding: 16px;
    gap: 16px;
  }
`;

const MainContent = styled(Box)`
  flex: 1;
  width: 90vw;
  max-width: 430px;
  margin: 0 auto;
  background: ${({ theme }) =>
      theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(45, 45, 45, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  overflow-y: auto;
  @media (max-width: 430px) {
    width: 100%;
    padding: 20px;
  }
`;

const Form = styled('form')`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PhotoUpload = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 2px dashed ${({ theme }) =>
      theme.palette.mode === 'light' ? '#2196f3' : '#64b5f6'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: ${({ theme }) =>
        theme.palette.mode === 'light' ? 'rgba(33,150,243,0.1)' : 'rgba(100,181,246,0.1)'};
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover { opacity: 0.8; }
`;

const TagGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
`;

const TagChip = styled(Chip)<{ selected?: boolean }>`
  width: 100%;
  border-radius: 100px;
  background: ${({ theme, selected }) =>
      selected
          ? theme.palette.mode === 'light'
              ? 'rgba(109, 171, 113, 0.1)'
              : 'rgba(165, 214, 183, 0.1)'
          : 'transparent'};
  border: 1px solid ${({ theme, selected }) =>
      selected
          ? theme.palette.mode === 'light'
              ? 'rgba(109, 171, 113, 0.2)'
              : 'rgba(165, 214, 183, 0.2)'
          : theme.palette.mode === 'light'
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ theme, selected }) =>
      selected
          ? theme.palette.mode === 'light'
              ? '#6dab71'
              : '#a5d6b7'
          : theme.palette.mode === 'light'
              ? '#666666'
              : '#cccccc'};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform: ${({ selected }) => selected ? 'scale(1.05)' : 'scale(1)'};
  box-shadow: ${({ selected }) => selected ? '0 3px 5px rgba(0, 0, 0, 0.1)' : 'none'};
  &:hover {
    background: ${({ theme }) =>
        theme.palette.mode === 'light'
            ? 'rgba(109, 171, 113, 0.05)'
            : 'rgba(165, 214, 183, 0.05)'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const availableTags = [
  '긍정적', '창의적', '감성적', '성실함', '도전적',
  '예술가', '낙천적', '배려심', '신중함', '열정적'
];

const mbtiTypes = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

const genderOptions = [
  { value: '남자', label: '남자' },
  { value: '여자', label: '여자' }
];

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthdate: '',
    mbti: '',
    bio: '',
    tags: [] as string[],
    likeTags: [] as string[],
    profileImage: '', // URL
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [likeTagsInput, setLikeTagsInput] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [loading, setLoading] = useState(false);

  // 프로필 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://210.109.54.109:8080/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
          const profile = data.profile || {};
          const personality = profile.personality || {};
          setFormData({
            name: profile.name || '',
            gender: profile.gender || '',
            birthdate: profile.birthdate || '',
            mbti: personality.mbti || '',
            bio: profile.bio || '',
            tags: personality.tags || [],
            likeTags: personality.likeTags || [],
            profileImage: profile.profileImage || ''
          });
          setSelectedTags(personality.tags || []);
          setLikeTagsInput((personality.likeTags || []).join(', '));
          setPhotoUrl(profile.profileImage || '');
        });
  }, [navigate]);

  // 태그 선택 핸들러
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else if (prev.length < 5) {
        return [...prev, tag];
      } else {
        setSnackbarMsg('태그는 최대 5개까지 선택 가능합니다.');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        return prev;
      }
    });
  };

  // 프로필 이미지 업로드 핸들러
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 이미지 클릭 시 파일 선택창 열기
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 같은 파일 재선택 허용
      fileInputRef.current.click();
    }
  };

  // 이미지 서버 업로드
  const uploadImage = async () => {
    if (!photoFile) return '';
    const token = localStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('file', photoFile);
    const res = await fetch('http://210.109.54.109:8080/api/profile/upload-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const data = await res.json();
    return data.imageUrl || '';
  };

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = '이름을 입력하세요';
    if (!formData.gender) errors.gender = '성별을 선택하세요';
    if (!formData.birthdate) errors.birthdate = '생년월일을 입력하세요';
    if (!formData.mbti) errors.mbti = 'MBTI를 선택하세요';
    if (selectedTags.length === 0) errors.tags = '태그를 1개 이상 선택하세요';
    const likeTags = Array.from(new Set(likeTagsInput.split(',').map(s => s.trim()).filter(Boolean)));
    if (likeTags.length > 5) errors.likeTags = '선호 키워드는 최대 5개까지 입력 가능합니다';

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    let imageUrl = formData.profileImage;
    if (photoFile) {
      try {
        imageUrl = await uploadImage();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setSnackbarMsg('이미지 업로드 실패');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        setLoading(false);
        return;
      }
    }

    const token = localStorage.getItem('jwtToken');
    const profileData = {
      name: formData.name,
      gender: formData.gender,
      birthdate: formData.birthdate,
      mbti: formData.mbti,
      bio: formData.bio,
      tags: selectedTags,
      likeTags,
      profileImage: imageUrl
    };

    fetch('http://210.109.54.109:8080/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })
        .then(res => res.ok ? res.text() : Promise.reject(res.text()))
        .then(() => {
          setSnackbarMsg('프로필이 저장되었습니다!');
          setSnackbarSeverity('success');
          setShowSnackbar(true);
          setTimeout(() => navigate('/profile'), 1200);
        })
        .catch(() => {
          setSnackbarMsg('프로필 저장 실패');
          setSnackbarSeverity('error');
          setShowSnackbar(true);
        })
        .finally(() => setLoading(false));
  };

  // AI 자기소개 생성 (백엔드 API 연동)
  const handleGenerateIntro = async () => {
    if (!formData.mbti || selectedTags.length === 0 || likeTagsInput.trim() === '') {
      setSnackbarMsg('MBTI, 태그, 선호 키워드는 필수입니다.');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    setLoading(true);
    const likeTags = Array.from(new Set(likeTagsInput.split(',').map(s => s.trim()).filter(Boolean)));
    const response = await fetch('http://210.109.54.109:8000/generate-introduction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: selectedTags,
        mbti: [formData.mbti],
        likeKeyWords: likeTags,
        profileImageUrl: photoUrl // 업로드된 이미지 URL 사용
      })
    });
    const data = await response.json();
    if (data.introduction) {
      setFormData(prev => ({ ...prev, bio: data.introduction }));
      setSnackbarMsg('AI 자기소개가 생성되었습니다.');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } else {
      setSnackbarMsg('AI 자기소개 생성 실패');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
    setLoading(false);
  };

  return (
      <PageContainer>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>프로필 수정</Typography>
        <MainContent>
          <Form onSubmit={handleSubmit}>
            {/* 프로필 이미지 업로드 */}
            <PhotoUpload>
              <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
              />
              <StyledAvatar
                  src={photoUrl || '/images/default-profile.png'}
                  onClick={handleAvatarClick}
              >
                {!photoUrl && <AddPhotoAlternateIcon />}
              </StyledAvatar>
              <Typography variant="body2" color="textSecondary">프로필 사진을 선택하세요</Typography>
            </PhotoUpload>

            {/* 이름 */}
            <TextField
                label="이름"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
            />

            {/* 성별 */}
            <FormControl fullWidth required error={!!errors.gender}>
              <InputLabel>성별</InputLabel>
              <Select
                  value={formData.gender}
                  label="성별"
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                {genderOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
              {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>

            {/* 생년월일 */}
            <TextField
                label="생년월일"
                type="date"
                value={formData.birthdate}
                onChange={e => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                error={!!errors.birthdate}
                helperText={errors.birthdate}
            />

            {/* MBTI */}
            <FormControl fullWidth required error={!!errors.mbti}>
              <InputLabel>MBTI</InputLabel>
              <Select
                  value={formData.mbti}
                  label="MBTI"
                  onChange={e => setFormData(prev => ({ ...prev, mbti: e.target.value }))}
              >
                {mbtiTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              {errors.mbti && <FormHelperText>{errors.mbti}</FormHelperText>}
            </FormControl>

            {/* 태그 */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>성격 태그 (최대 5개)</Typography>
              {errors.tags && <Typography color="error" variant="caption">{errors.tags}</Typography>}
              <TagGrid>
                {availableTags.map(tag => (
                    <TagChip
                        key={tag}
                        label={tag}
                        onClick={() => handleTagToggle(tag)}
                        selected={selectedTags.includes(tag)}
                        clickable
                        color={selectedTags.includes(tag) ? "primary" : "default"}
                    />
                ))}
              </TagGrid>
            </Box>

            {/* 선호 키워드 */}
            <TextField
                label="선호하는 키워드 (최대 5개, 콤마로 구분)"
                value={likeTagsInput}
                onChange={e => setLikeTagsInput(e.target.value)}
                fullWidth
                error={!!errors.likeTags}
                helperText={errors.likeTags}
            />

            {/* AI 자기소개 생성 버튼 */}
            <Button
                variant="outlined"
                onClick={handleGenerateIntro}
                disabled={loading}
                sx={{ mt: 2 }}
            >
              AI 자기소개글 생성
            </Button>

            {/* 자기소개 */}
            <TextField
                label="자기소개"
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                multiline
                rows={4}
                fullWidth
                required
                sx={{ mt: 2 }}
            />

            {/* 저장 버튼 */}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "저장하기"}
            </Button>
          </Form>
        </MainContent>
        <Snackbar
            open={showSnackbar}
            autoHideDuration={2500}
            onClose={() => setShowSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </PageContainer>
  );
};

export default ProfileEditPage;
