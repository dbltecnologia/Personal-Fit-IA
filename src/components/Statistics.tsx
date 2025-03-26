import React from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import Tilt from 'react-parallax-tilt';
import { CompletedWorkout } from '../types';

interface StatisticsProps {
  completedWorkouts: CompletedWorkout[];
  accessibilityMode: boolean;
}

const Statistics: React.FC<StatisticsProps> = ({ completedWorkouts, accessibilityMode }) => {
  const muscleGroupFrequency = completedWorkouts.reduce((acc, workout) => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(ex => {
        if (ex.muscleGroups && Array.isArray(ex.muscleGroups)) {
          ex.muscleGroups.forEach(group => {
            acc[group] = (acc[group] || 0) + 1;
          });
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: accessibilityMode ? '#000000' : '#E3E3E3',
          fontFamily: 'Manrope',
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: accessibilityMode ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
        gutterBottom
      >
        Estatísticas
      </Typography>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
          <Card
            sx={{
              width: 280,
              bgcolor: accessibilityMode ? 'rgba(60, 60, 60, 0.9)' : 'rgba(42, 42, 42, 0.8)', // Match the "Grupos Musculares" card
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              p: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)',
                border: '1px solid rgba(247, 112, 49, 0.5)',
              },
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  textShadow: accessibilityMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                Treinos Concluídos
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', my: 1.5 }}>
                <CircularProgress
                  variant="determinate"
                  value={(completedWorkouts.length / 10) * 100}
                  size={90}
                  thickness={5}
                  sx={{
                    color: 'url(#progressGradient)',
                    filter: 'drop-shadow(0 0 5px rgba(129, 190, 0, 0.5))',
                  }}
                />
                <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#81BE00', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#5A8C00', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                </svg>
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                      fontFamily: 'Manrope',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      textShadow: accessibilityMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {`${Math.round((completedWorkouts.length / 10) * 100)}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: '12px',
                }}
              >
                {completedWorkouts.length} treinos
              </Typography>
            </CardContent>
          </Card>
        </Tilt>
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
          <Card
            sx={{
              width: 280,
              bgcolor: accessibilityMode ? 'rgba(60, 60, 60, 0.9)' : 'rgba(42, 42, 42, 0.8)',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              p: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)',
                border: '1px solid rgba(247, 112, 49, 0.5)',
              },
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  textShadow: accessibilityMode ? '0 1px 2px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                Grupos Musculares
              </Typography>
              <Box sx={{ my: 1 }}>
                {Object.keys(muscleGroupFrequency).length > 0 ? (
                  Object.entries(muscleGroupFrequency).map(([group, count]) => (
                    <Typography
                      key={group}
                      sx={{
                        color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                        fontFamily: 'Manrope',
                        fontSize: '12px',
                        lineHeight: 1.3,
                      }}
                    >
                      {group}: {count} treinos
                    </Typography>
                  ))
                ) : (
                  <Typography
                    sx={{
                      color: accessibilityMode ? '#FFFFFF' : '#E3E3E3',
                      fontFamily: 'Manrope',
                      fontSize: '12px',
                    }}
                  >
                    Nenhum grupo muscular trabalhado ainda.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Tilt>
      </Box>
    </Box>
  );
};

export default Statistics;