import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import styled from '@emotion/styled';

const ContentBox = styled(Box)`
    padding: 48px 0;
`;

const StyledPaper = styled(Paper)`
    padding: 24px;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

const MainContent = () => {
    return (
        <ContentBox>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: '28px',
                    fontWeight: 600,
                    marginBottom: '32px'
                }}
            >
                소개글
            </Typography>
            <Grid container spacing={3}>
                <StyledPaper>
                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{
                            fontSize: '20px',
                            fontWeight: 500,
                            marginBottom: '16px'
                        }}
                    >
                        자기소개
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.6,
                            color: '#333'
                        }}
                    >
                        안녕하세요. 저는 개발자입니다.
                        새로운 기술을 배우고 적용하는 것을 좋아합니다.
                        사용자 경험을 개선하는 것에 관심이 많습니다.
                    </Typography>
                </StyledPaper>
                <StyledPaper>
                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{
                            fontSize: '20px',
                            fontWeight: 500,
                            marginBottom: '16px'
                        }}
                    >
                        기술 스택
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.6,
                            color: '#333'
                        }}
                    >
                        Frontend: React, TypeScript, Material-UI
                        Backend: Node.js, Express
                        Database: MongoDB, PostgreSQL
                        기타: Git, Docker
                    </Typography>
                </StyledPaper>
            </Grid>
        </ContentBox>
    );
};

export default MainContent;
