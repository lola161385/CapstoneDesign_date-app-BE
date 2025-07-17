import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import styled from '@emotion/styled';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useLocation } from 'react-router-dom';

const StyledPaper = styled(Paper)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledPaper elevation={3}>
      <BottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => {
          navigate(newValue);
        }}
      >
        <BottomNavigationAction
          label="채팅"
          value="/chat"
          icon={<ChatIcon />}
        />
        <BottomNavigationAction
          label="홈"
          value="/profile"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="친구"
          value="/friends"
          icon={<GroupIcon />}
        />
        <BottomNavigationAction
          label="글쓰기"
          value="/write"
          icon={<EditIcon />}
        />
      </BottomNavigation>
    </StyledPaper>
  );
};

export default BottomNav; 