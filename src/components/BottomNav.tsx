// src/components/BottomNav.tsx
import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';

interface BottomNavProps {
  bottomNavValue: number;
  setBottomNavValue: (value: number) => void;
  accessibilityMode: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ bottomNavValue, setBottomNavValue, accessibilityMode }) => {
  return (
    <BottomNavigation
      value={bottomNavValue}
      onChange={(event, newValue) => setBottomNavValue(newValue)}
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(30, 26, 26, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 1200, // Aumentado para ficar na frente
      }}
    >
      <BottomNavigationAction
        label="Início"
        icon={<HomeIcon />}
        sx={{
          color: accessibilityMode ? '#000000' : '#E3E3E3',
          '&.Mui-selected': { color: '#F77031' },
          fontFamily: 'Manrope',
          fontSize: '12px',
        }}
      />
      <BottomNavigationAction
        label="Treinos"
        icon={<FitnessCenterIcon />}
        sx={{
          color: accessibilityMode ? '#000000' : '#E3E3E3',
          '&.Mui-selected': { color: '#F77031' },
          fontFamily: 'Manrope',
          fontSize: '12px',
        }}
      />
      <BottomNavigationAction
        label="Perfil"
        icon={<PersonIcon />}
        sx={{
          color: accessibilityMode ? '#000000' : '#E3E3E3',
          '&.Mui-selected': { color: '#F77031' },
          fontFamily: 'Manrope',
          fontSize: '12px',
        }}
      />
    </BottomNavigation>
  );
};

export default BottomNav;