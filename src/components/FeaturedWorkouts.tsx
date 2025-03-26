// src/components/FeaturedWorkouts.tsx
import React from 'react';
import { Box, Typography, Button, Card, CardContent, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Carousel from 'react-material-ui-carousel';
import LazyLoad from 'react-lazy-load';
import Tilt from 'react-parallax-tilt';
import { Workout } from '../types';

interface FeaturedWorkoutsProps {
  workouts: Workout[];
  handleStartWorkout: (workoutId: string) => void;
  handlePreviewOpen: (workout: Workout) => void;
  showSuccess: string | null;
  accessibilityMode: boolean;
}

const FeaturedWorkouts: React.FC<FeaturedWorkoutsProps> = ({
  workouts,
  handleStartWorkout,
  handlePreviewOpen,
  showSuccess,
  accessibilityMode,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: accessibilityMode ? '#000000' : '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: accessibilityMode ? '22px' : '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'uppercase',
            mb: 4,
            letterSpacing: '2px',
            textShadow: accessibilityMode ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          Treinos em Destaque
        </Typography>        
        <Carousel
          animation="slide"
          indicators={true}
          navButtonsAlwaysVisible={true}
          sx={{
            maxWidth: isFullscreen ? '100%' : { xs: '100%', sm: '800px' }, // Increased maxWidth to match NavigationButtons
            mx: 'auto',
            height: isFullscreen ? '80vh' : 'auto',
            bgcolor: isFullscreen ? (accessibilityMode ? '#FFFFFF' : 'rgba(30, 26, 26, 0.9)') : 'transparent',
            borderRadius: isFullscreen ? 0 : '20px',
          }}
        >
          {workouts.slice(0, 3).map(workout => (
            <LazyLoad key={workout.id} height={200} offset={100}>
              <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
                <Card
                  sx={{
                    maxWidth: 400,
                    mx: 'auto',
                    bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(42, 42, 42, 0.8)',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    backdropFilter: accessibilityMode ? 'none' : 'blur(15px)',
                    border: accessibilityMode ? '1px solid #000000' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)' },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: accessibilityMode ? '#000000' : '#E3E3E3',
                        fontFamily: 'Manrope',
                        fontSize: accessibilityMode ? '18px' : '20px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: accessibilityMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {workout.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: accessibilityMode ? '#000000' : '#E3E3E3',
                        fontFamily: 'Manrope',
                        fontSize: accessibilityMode ? '16px' : '14px',
                        mb: 3,
                      }}
                    >
                      {workout.exercises.length} exercícios
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: accessibilityMode ? '#1976D2' : 'linear-gradient(45deg, #F77031, #E65E1F)',
                          color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                          fontFamily: 'Manrope',
                          fontSize: accessibilityMode ? '16px' : '16px',
                          borderRadius: '30px',
                          textTransform: 'uppercase',
                          padding: '12px 40px',
                          boxShadow: '0 4px 15px rgba(247, 112, 49, 0.5)',
                          '&:hover': { boxShadow: '0 6px 20px rgba(247, 112, 49, 0.7)' },
                          '&:focus': { outline: '2px solid #E3E3E3', outlineOffset: 2 },
                          position: 'relative',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            opacity: 0,
                            transition: 'opacity 0.5s ease',
                          },
                          '&:hover::after': { opacity: 1 },
                        }}
                        onClick={() => handleStartWorkout(workout.id)}
                        aria-label={`Iniciar treino ${workout.name}`}
                      >
                        {showSuccess === workout.id ? <CheckCircleIcon /> : 'Iniciar'}
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: accessibilityMode ? '#000000' : '#E3E3E3',
                          color: accessibilityMode ? '#000000' : '#E3E3E3',
                          fontFamily: 'Manrope',
                          fontSize: accessibilityMode ? '16px' : '14px',
                          borderRadius: '25px',
                          textTransform: 'none',
                          '&:hover': { borderColor: '#F77031', color: '#F77031' },
                        }}
                        onClick={() => handlePreviewOpen(workout)}
                        aria-label={`Pré-visualizar treino ${workout.name}`}
                      >
                        Pré-visualizar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Tilt>
            </LazyLoad>
          ))}
        </Carousel>
      </Box>
    </Box>
  );
};

export default FeaturedWorkouts;