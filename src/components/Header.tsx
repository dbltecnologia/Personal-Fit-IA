import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { toast } from 'react-toastify';

interface HeaderProps {
  user: User;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (value: boolean) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  userProfile,
  setUserProfile,
  animationsEnabled,
  setAnimationsEnabled,
  accessibilityMode,
  setAccessibilityMode,
}) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleProfileNavigation = () => {
    setDrawerOpen(false);
    navigate('/settings');
  };

  const handleToggleRole = async () => {
    if (!userProfile) {
      toast.error('Perfil do usuário não encontrado.');
      return;
    }

    const newRole = userProfile.role === 'personal' ? 'user' : 'personal';
    try {
      const userRef = doc(db, 'users', userProfile.id);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: userProfile.id,
          role: newRole,
          name: user.displayName || 'Usuário',
          email: user.email || '',
          createdAt: new Date(),
        });
        toast.success('Perfil criado e tipo de usuário atualizado!');
      } else {
        await updateDoc(userRef, { role: newRole });
        toast.success('Tipo de usuário atualizado com sucesso!');
      }
      setUserProfile({ ...userProfile, role: newRole });
    } catch (error) {
      console.error('Erro ao atualizar o tipo de usuário:', error);
      toast.error('Erro ao atualizar o tipo de usuário.');
    }
    setDrawerOpen(false);
  };

  const drawerContent = (
    <List sx={{ bgcolor: '#121212', color: '#FFFFFF', height: '100%', fontFamily: 'Manrope' }}>
      <ListItem sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }}>
        <ListItemText primary={user.displayName || 'Usuário'} />
      </ListItem>
      <ListItem component="button" onClick={handleProfileNavigation}>
        <ListItemText primary="Perfil" sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }} />
      </ListItem>
      <ListItem component="button" onClick={handleToggleRole}>
        <ListItemText
          primary={userProfile?.role === 'personal' ? 'Mudar para Aluno' : 'Mudar para Personal'}
          sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }}
        />
      </ListItem>
      <ListItem component="button" onClick={() => { setAnimationsEnabled(!animationsEnabled); setDrawerOpen(false); }}>
        <ListItemText
          primary={animationsEnabled ? 'Desativar Animações' : 'Ativar Animações'}
          sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }}
        />
      </ListItem>
      <ListItem component="button" onClick={() => { setAccessibilityMode(!accessibilityMode); setDrawerOpen(false); }}>
        <ListItemText
          primary={accessibilityMode ? 'Desativar Modo Acessível' : 'Ativar Modo Acessível'}
          sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }}
        />
      </ListItem>
      <ListItem component="button" onClick={handleLogout}>
        <ListItemText primary="Sair" sx={{ color: '#FFFFFF', fontFamily: 'Manrope', fontSize: '14px' }} />
      </ListItem>
    </List>
  );

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(30, 26, 26, 0.9)', boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleDrawerToggle}
          aria-label="Abrir menu lateral"
          sx={{ mr: 2 }}
        >
          <MenuIcon sx={{ color: '#E3E3E3' }} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          Muscle Minds
        </Typography>
      </Toolbar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { bgcolor: '#121212', width: 250 } }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Header;