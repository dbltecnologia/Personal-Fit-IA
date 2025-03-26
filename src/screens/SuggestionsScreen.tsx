// src/screens/SuggestionsScreen.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { db, completedWorkoutsCollection, muscleGroupsCollection, workoutsCollection } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { CompletedWorkout, Workout } from '../types';

interface MuscleGroup {
  id: string;
  name: string;
}

interface SuggestionsScreenProps {
  user: User;
}

const SuggestionsScreen = ({ user }: SuggestionsScreenProps) => {
  const navigate = useNavigate();
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [suggestedWorkouts, setSuggestedWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const completedQ = query(completedWorkoutsCollection, where('trainerId', '==', user.uid));
      const completedSnapshot = await getDocs(completedQ);
      setCompletedWorkouts(completedSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as CompletedWorkout)));

      const groupsSnapshot = await getDocs(muscleGroupsCollection);
      setMuscleGroups(groupsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as MuscleGroup)));

      const workoutsQ = query(workoutsCollection, where('trainerId', '==', user.uid));
      const workoutsSnapshot = await getDocs(workoutsQ);
      setWorkouts(workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Workout)));
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const suggestWorkouts = () => {
      const workedGroups = new Set<string>();
      completedWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => {
          if (ex.muscleGroups) {
            ex.muscleGroups.forEach(group => workedGroups.add(group));
          }
        });
      });

      const allGroups = muscleGroups.map(g => g.name);
      const underworkedGroups = allGroups.filter(group => !workedGroups.has(group));

      const suggestions = workouts.filter(workout =>
        workout.exercises.some(ex =>
          ex.muscleGroups && ex.muscleGroups.some(group => underworkedGroups.includes(group))
        )
      );
      setSuggestedWorkouts(suggestions);
    };
    if (completedWorkouts.length > 0 && muscleGroups.length > 0 && workouts.length > 0) {
      suggestWorkouts();
    }
  }, [completedWorkouts, muscleGroups, workouts]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" color="#16a34a" gutterBottom>
        Sugestões de Treinos
      </Typography>
      {suggestedWorkouts.length > 0 ? (
        suggestedWorkouts.map(workout => (
          <Card key={workout.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{workout.name}</Typography>
              <Typography>
                Foca em: {workout.exercises.flatMap(ex => ex.muscleGroups || []).join(', ')}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2, bgcolor: '#16a34a' }}
                onClick={() => navigate(`/workout-execution/${workout.id}`)}
              >
                Executar
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>Nenhum treino sugerido no momento.</Typography>
      )}
    </Box>
  );
};

export default SuggestionsScreen;