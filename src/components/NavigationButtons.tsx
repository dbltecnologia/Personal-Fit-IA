// src/components/NavigationButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpIcon from '@mui/icons-material/Help'; // Added for the "Ajuda" button

interface NavigationButtonsProps {
  isPersonal: boolean;
  accessibilityMode: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ isPersonal, accessibilityMode }) => {
  const navigate = useNavigate();

  const buttons = [
    { label: 'Gerenciar Grupos', icon: <PeopleIcon />, path: '/group-management', personalOnly: true },
    { label: 'Gerenciar Treinos', icon: <FitnessCenterIcon />, path: '/workout-management' },
    { label: 'Gerenciar Alunos', icon: <PeopleIcon />, path: '/student-management', personalOnly: true },    
    { label: 'Histórico', icon: <HistoryIcon />, path: '/workout-history' },
    { label: 'Sugestões', icon: <LightbulbIcon />, path: '/suggestions' },
    { label: 'Ajuda', icon: <HelpIcon />, path: '/help' }, // Added "Ajuda" button
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {buttons.map((item, index) => {
        if (item.personalOnly && !isPersonal) return null;
        return (
          <Button
            key={index}
            variant="contained"
            startIcon={item.icon}
            sx={{
              bgcolor: accessibilityMode ? '#1976D2' : 'linear-gradient(45deg, #F77031, #E65E1F)',
              color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
              fontFamily: 'Manrope',
              fontSize: accessibilityMode ? '16px' : '14px',
              borderRadius: '25px',
              textTransform: 'none',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              '&:hover': { boxShadow: '0 6px 15px rgba(247, 112, 49, 0.5)' },
              '&:focus': { outline: '2px solid #E3E3E3', outlineOffset: 2 },
            }}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default NavigationButtons;