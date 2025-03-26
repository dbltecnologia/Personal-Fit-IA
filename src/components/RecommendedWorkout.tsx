// src/components/RecommendedWorkout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Workout } from '../types';

interface RecommendedWorkoutProps {
  recommendedWorkout: Workout | null;
  accessibilityMode: boolean;
}

const getWorkoutType = (workout: Workout): string => {
  const muscleGroups = workout.exercises.flatMap(ex => ex.muscleGroups || []);
  if (muscleGroups.includes('Peito')) return 'Peito';
  if (muscleGroups.includes('Costas')) return 'Costas';
  if (muscleGroups.includes('Pernas')) return 'Pernas';
  return 'Peito';
};

const RecommendedWorkout: React.FC<RecommendedWorkoutProps> = ({ recommendedWorkout, accessibilityMode }) => {
  const navigate = useNavigate();

  if (!recommendedWorkout) {
    return (
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography sx={{ color: accessibilityMode ? '#000000' : '#E3E3E3', fontFamily: 'Manrope' }}>
          Nenhum treino recomendado no momento. Crie um novo treino!
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: 'linear-gradient(45deg, #F77031, #E65E1F)',
            color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
            fontFamily: 'Manrope',
            borderRadius: '25px',
            textTransform: 'none',
          }}
          onClick={() => navigate('/workout-management')}
          aria-label="Criar novo treino"
        >
          Criar Treino
        </Button>
      </Box>
    );
  }

  const images = {
    Peito: [
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2Fgym.png?alt=media&token=e063f6fd-f8f7-4417-bbbb-e23db98d2981',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FBlack%20and%20Yellow%20Grunge%20Professional%20Home%20Fitness%20Trainer%20Instagram%20Post.png?alt=media&token=3792cc2c-f53e-4e88-b533-f9177080f19b',
    ],
    Costas: [
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2Fgym.png?alt=media&token=e063f6fd-f8f7-4417-bbbb-e23db98d2981',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FBlack%20and%20Yellow%20Grunge%20Professional%20Home%20Fitness%20Trainer%20Instagram%20Post.png?alt=media&token=3792cc2c-f53e-4e88-b533-f9177080f19b',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a',
    ],
    Pernas: [
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FBlack%20and%20Yellow%20Grunge%20Professional%20Home%20Fitness%20Trainer%20Instagram%20Post.png?alt=media&token=3792cc2c-f53e-4e88-b533-f9177080f19b',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2Fgym.png?alt=media&token=e063f6fd-f8f7-4417-bbbb-e23db98d2981',
      'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a',
    ],
  };
  const type = getWorkoutType(recommendedWorkout);

  return (
    <Box sx={{ mb: 6, textAlign: 'center' }}>
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          p: 3,
          display: 'inline-block',
          bgcolor: accessibilityMode ? '#DDDDDD' : 'rgba(60, 60, 60, 0.8)',
        }}
      >
        <Carousel
          animation="slide"
          indicators={true}
          navButtonsAlwaysVisible={false}
          autoPlay={true}
          interval={3000}
          sx={{ borderRadius: '20px', overflow: 'hidden' }}
        >
          {(images[type as keyof typeof images] || []).map((img, index) => (
            <Box
              key={index}
              sx={{
                height: 200,
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                },
              }}
            />
          ))}
        </Carousel>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            sx={{
              color: accessibilityMode ? '#000000' : '#E3E3E3',
              fontFamily: 'Manrope',
              fontSize: '16px',
              fontWeight: 'bold',
              mb: 2,
              letterSpacing: '1px',
              textShadow: accessibilityMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.8)',
            }}
          >
            Recomendação: {recommendedWorkout.name} 
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: accessibilityMode ? '#3C3C3C' : '#3C3C3C',
              color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
              fontFamily: 'Manrope',
              fontSize: '14px',
              borderRadius: '25px',
              textTransform: 'none',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              '&:hover': { bgcolor: '#4A4A4A', boxShadow: '0 6px 15px rgba(0, 0, 0, 0.5)' },
            }}
            onClick={() => navigate(`/workout-execution/${recommendedWorkout.id}`)}
            aria-label={`Iniciar treino ${recommendedWorkout.name}`}
          >
            Iniciar Treino
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecommendedWorkout;