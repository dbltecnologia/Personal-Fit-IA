import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, completedWorkoutsCollection } from '../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { CompletedWorkout } from '../types';
import { toast } from 'react-toastify';

interface WorkoutHistoryScreenProps {
  user: User;
}

const WorkoutHistoryScreen = ({ user }: WorkoutHistoryScreenProps) => {
  const navigate = useNavigate();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    const fetchCompletedWorkouts = async () => {
      const q = query(completedWorkoutsCollection, where('trainerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setCompletedWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedWorkout)));
    };
    fetchCompletedWorkouts();
  }, [user]);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este treino do histórico?')) return;

    await deleteDoc(doc(db, 'completedWorkouts', workoutId));
    toast.success('Treino removido do histórico!');
    setCompletedWorkouts(completedWorkouts.filter(workout => workout.id !== workoutId));
  };

  const filteredWorkouts = completedWorkouts.filter(workout => 
    filterStatus === 'all' || workout.status === filterStatus
  );

  return (
    <Box sx={{ p: 4, bgcolor: '#2A2A2A', minHeight: '100vh', fontFamily: 'Manrope' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ color: '#F77031', mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#E3E3E3', 
            fontFamily: 'Manrope', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' 
          }}
        >
          Histórico de Treinos
        </Typography>
      </Box>

      {/* Filter */}
      <FormControl sx={{ minWidth: 200, mb: 4 }}>
        <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Filtrar por Status</InputLabel>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'incomplete')}
          sx={{
            bgcolor: 'rgba(60, 60, 60, 0.8)',
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiSvgIcon-root': { color: '#E3E3E3' },
          }}
        >
          <MenuItem value="all" sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>Todos</MenuItem>
          <MenuItem value="completed" sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>Completados</MenuItem>
          <MenuItem value="incomplete" sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>Incompletos</MenuItem>
        </Select>
      </FormControl>

      {/* Workouts List or Fallback */}
      {filteredWorkouts.length > 0 ? (
        filteredWorkouts.map(workout => (
          <Card 
            key={workout.id} 
            sx={{ 
              mb: 2, 
              bgcolor: 'rgba(60, 60, 60, 0.8)', 
              borderRadius: '20px', 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            <CardContent sx={{ position: 'relative', pb: 6 }}>
              <Typography variant="h6" sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontWeight: 'bold', fontSize: '16px' }}>
                {workout.name}
              </Typography>
              <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
                Data: {workout.completedAt ? moment(workout.completedAt.toDate()).format('DD/MM/YYYY HH:mm') : 'Sem Data'}
              </Typography>
              <Typography sx={{ color: workout.status === 'completed' ? '#81BE00' : '#FF4444', fontFamily: 'Manrope', fontSize: '14px' }}>
                Status: {workout.status === 'completed' ? 'Completado' : 'Incompleto'}
              </Typography>
              {workout.exercises && workout.exercises.map((ex, index) => (
                <Typography key={index} sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
                  {ex.name}: {ex.sets}x{ex.reps}, {ex.weight || 0}kg
                </Typography>
              ))}
              <Button
                variant="outlined"
                startIcon={<DeleteIcon sx={{ fontSize: '16px' }} />}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  color: '#FF4444',
                  borderColor: '#FF4444',
                  fontFamily: 'Manrope',
                  fontSize: '12px',
                  padding: '4px 8px',
                  minWidth: 'auto',
                  '&:hover': { borderColor: '#FF6666', color: '#FF6666' },
                }}
                onClick={() => handleDeleteWorkout(workout.id)}
              >
                Remover
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Box 
          sx={{ 
            mt: 4, 
            textAlign: 'center', 
            bgcolor: 'rgba(60, 60, 60, 0.8)', 
            p: 4, 
            borderRadius: '20px', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', 
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a"
            alt="Nenhum treino no histórico"
            style={{ maxWidth: '300px', marginBottom: '16px', borderRadius: '10px' }}
          />
          <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '18px' }}>
            Nenhum treino no histórico ainda. Complete um treino para começar!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkoutHistoryScreen;