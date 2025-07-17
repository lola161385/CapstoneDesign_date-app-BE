import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import WriteIntroPage from './pages/WriteIntroPage';
import IntroFormPage from './pages/IntroFormPage';
import MatchingPage from './pages/MatchingPage';
import ChatPage from './pages/ChatPage';
import Layout from './components/Layout';
import ProfileEditPage from './pages/ProfileEditPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SignupPage from './pages/SignupPage';

const Router: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<Layout />}>
                {/* 로그인 후 메인 페이지를 프로필로 변경 */}
                <Route path="profile/edit/" element={<ProfileEditPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="write" element={<WriteIntroPage />} />
                <Route path="write/intro" element={<IntroFormPage />} />
                <Route path="matching" element={<MatchingPage />} />
                <Route path="chat/:id" element={<ChatPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default Router;