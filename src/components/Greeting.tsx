import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CompletedWorkout } from '../types';
import { Typography } from '@mui/material';

interface GreetingProps {
  user: User;
  accessibilityMode: boolean;
  completedWorkouts: CompletedWorkout[];
}

const Greeting: React.FC<GreetingProps> = ({ user, accessibilityMode, completedWorkouts }) => {
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 20000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <Typography
      variant="h5"
      sx={{
        color: accessibilityMode ? '#000000' : '#E3E3E3',
        fontFamily: 'Manrope',
        fontWeight: 'bold',
        mb: 1,
      }}
    >
      {showGreeting && `Olá, ${user.displayName || 'Usuário'}!`}
    </Typography>
  );
};

export default Greeting;