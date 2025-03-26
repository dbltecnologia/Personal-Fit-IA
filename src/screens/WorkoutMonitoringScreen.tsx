// src/screens/WorkoutMonitoringScreen.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const WorkoutMonitoringScreen = () => {
  const { workoutId } = useParams();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" color="#16a34a">
        Monitoramento de Treino - ID: {workoutId}
      </Typography>
    </Box>
  );
};

export default WorkoutMonitoringScreen;