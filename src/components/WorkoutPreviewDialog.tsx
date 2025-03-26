// src/components/WorkoutPreviewDialog.tsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { Workout } from '../types';

interface WorkoutPreviewDialogProps {
  previewWorkout: Workout | null;
  handlePreviewClose: () => void;
  handleStartWorkout: (workoutId: string) => void;
  accessibilityMode: boolean;
}

const WorkoutPreviewDialog: React.FC<WorkoutPreviewDialogProps> = ({
  previewWorkout,
  handlePreviewClose,
  handleStartWorkout,
  accessibilityMode,
}) => {
  return (
    <Dialog
      open={!!previewWorkout}
      onClose={handlePreviewClose}
      PaperProps={{
        sx: { bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(42, 42, 42, 0.9)', color: accessibilityMode ? '#000000' : '#E3E3E3', borderRadius: '20px', backdropFilter: 'blur(15px)' },
      }}
    >
      <DialogTitle sx={{ fontFamily: 'Manrope', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {previewWorkout?.name}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontFamily: 'Manrope', mb: 2 }}>
          <strong>Número de Exercícios:</strong> {previewWorkout?.exercises?.length || 0}
        </Typography>
        <Typography sx={{ fontFamily: 'Manrope', mb: 2 }}>
          <strong>Duração Estimada:</strong> {(previewWorkout?.exercises?.length || 0) * 2} minutos
        </Typography>
        <Typography sx={{ fontFamily: 'Manrope', fontWeight: 'bold', mb: 1 }}>
          Exercícios:
        </Typography>
        <ul>
          {previewWorkout?.exercises.map((exercise, index) => (
            <li key={index}>
              <Typography sx={{ fontFamily: 'Manrope' }}>
                {exercise.name} - {exercise.sets} séries x {exercise.reps} repetições
              </Typography>
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePreviewClose} sx={{ color: accessibilityMode ? '#000000' : '#E3E3E3', fontFamily: 'Manrope' }}>
          Fechar
        </Button>
        <Button
          onClick={() => {
            handlePreviewClose();
            handleStartWorkout(previewWorkout!.id);
          }}
          sx={{
            bgcolor: 'linear-gradient(45deg, #F77031, #E65E1F)',
            color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
            fontFamily: 'Manrope',
            borderRadius: '25px',
            '&:hover': { bgcolor: '#E65E1F' },
          }}
          aria-label={`Iniciar treino ${previewWorkout?.name}`}
        >
          Iniciar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutPreviewDialog;