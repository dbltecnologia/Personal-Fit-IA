import React from 'react';
import { Box, Typography, Card, CardContent, Button, LinearProgress } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import Tilt from 'react-parallax-tilt';

interface AchievementsProps {
  completedWorkouts: any[];
  handleShareAchievement: () => void;
  accessibilityMode: boolean;
}

const Achievements: React.FC<AchievementsProps> = ({
  completedWorkouts,
  handleShareAchievement,
  accessibilityMode,
}) => {
  return (
    <Box
      sx={{
        bgcolor: accessibilityMode ? '#F5F5F5' : 'rgba(42, 42, 42, 0.5)',
        borderRadius: '20px',
        p: 2,
        backdropFilter: accessibilityMode ? 'none' : 'blur(10px)',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: accessibilityMode ? '#000000' : '#E3E3E3',
          fontFamily: 'Manrope',
          fontSize: accessibilityMode ? '18px' : '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: accessibilityMode ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.3)',
          mb: 1,
        }}
      >
        Conquistas
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
          <Card
            sx={{
              width: 150,
              height: 120, // Fixed height to ensure consistency
              bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(42, 42, 42, 0.8)',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: accessibilityMode ? 'none' : 'blur(15px)',
              border: accessibilityMode ? '1px solid #000000' : '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              p: 1,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)' },
            }}
          >
            <CardContent sx={{ p: 1 }}>
              <Typography
                sx={{
                  color: accessibilityMode ? '#000000' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '14px' : '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textShadow: accessibilityMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                Streak
              </Typography>
              <Typography
                sx={{
                  color: accessibilityMode ? '#1976D2' : '#F77031',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '20px' : '18px',
                  fontWeight: 'bold',
                  my: 0.5,
                  textShadow: accessibilityMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                {completedWorkouts.length} dias
              </Typography>
              <Typography
                sx={{
                  color: accessibilityMode ? '#000000' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '12px' : '10px',
                }}
              >
                Continue assim!
              </Typography>
            </CardContent>
          </Card>
        </Tilt>
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
          <Card
            sx={{
              width: 150,
              height: 120, // Fixed height to match "Streak" card
              bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(42, 42, 42, 0.8)',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              backdropFilter: accessibilityMode ? 'none' : 'blur(15px)',
              border: completedWorkouts.length >= 5
                ? (accessibilityMode ? '2px solid #FFD700' : '2px solid #FFD700')
                : (accessibilityMode ? '1px solid #000000' : '1px solid rgba(255, 255, 255, 0.1)'),
              textAlign: 'center',
              p: 1,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)' },
            }}
          >
            <CardContent sx={{ p: 1 }}>
              <Typography
                sx={{
                  color: accessibilityMode ? '#000000' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '14px' : '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textShadow: accessibilityMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              >
                Badge
              </Typography>
              <Typography
                sx={{
                  color: accessibilityMode ? '#000000' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '20px' : '18px',
                  my: 0.5,
                }}
              >
                {completedWorkouts.length >= 5 ? '🏆' : '🔒'}
              </Typography>
              <Typography
                sx={{
                  color: accessibilityMode ? '#000000' : '#E3E3E3',
                  fontFamily: 'Manrope',
                  fontSize: accessibilityMode ? '12px' : '10px',
                }}
              >
                {completedWorkouts.length >= 5 ? 'Iniciante' : 'Complete 5 treinos!'}
              </Typography>
              {completedWorkouts.length < 5 && (
                <Box sx={{ mt: 0.5 }}> {/* Further reduced margin-top */}
                  <Typography
                    sx={{
                      color: accessibilityMode ? '#000000' : '#E3E3E3',
                      fontFamily: 'Manrope',
                      fontSize: accessibilityMode ? '10px' : '8px', // Further reduced font size
                      mb: 0.3, // Further reduced margin-bottom
                    }}
                  >
                    Progresso: {completedWorkouts.length}/5
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(completedWorkouts.length / 5) * 100}
                    sx={{
                      bgcolor: accessibilityMode ? '#E0E0E0' : 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': { bgcolor: accessibilityMode ? '#1976D2' : '#F77031' },
                      height: 4, // Further reduced height of progress bar
                    }}
                  />
                </Box>
              )}
              {completedWorkouts.length >= 5 && (
                <Button
                  startIcon={<ShareIcon />}
                  sx={{
                    mt: 0.5, // Further reduced margin-top
                    color: accessibilityMode ? '#1976D2' : '#E3E3E3',
                    fontFamily: 'Manrope',
                    fontSize: accessibilityMode ? '10px' : '8px', // Further reduced font size
                    textTransform: 'none',
                    '&:hover': { color: accessibilityMode ? '#1565C0' : '#F77031' },
                  }}
                  onClick={handleShareAchievement}
                  aria-label="Compartilhar conquista"
                >
                  Compartilhar
                </Button>
              )}
            </CardContent>
          </Card>
        </Tilt>
      </Box>
    </Box>
  );
};

export default Achievements;