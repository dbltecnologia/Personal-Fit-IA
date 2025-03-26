import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, exercisesCollection, workoutsCollection } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { Exercise, Workout, WorkoutGroup, UserProfile } from '../types'; // Import types

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  trainerId: string;
  workoutIds: string[];
}

interface WorkoutManagementScreenProps {
  user: User;
}

const WorkoutManagementScreen = ({ user }: WorkoutManagementScreenProps) => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedWorkoutsForGroup, setSelectedWorkoutsForGroup] = useState<string[]>([]);
  const [groupValidityDays, setGroupValidityDays] = useState<number>(30);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentForGroup, setSelectedStudentForGroup] = useState('');
  const [editingGroup, setEditingGroup] = useState<WorkoutGroup | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      const snapshot = await getDocs(exercisesCollection);
      let exerciseData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Exercise));
      setExercises(exerciseData);
    };

    const fetchWorkouts = async () => {
      const q = query(workoutsCollection, where('trainerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
    };

    const fetchWorkoutGroups = async () => {
      const q = query(collection(db, 'workoutGroups'), where('trainerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setWorkoutGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutGroup)));
    };

    const fetchStudents = async () => {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('trainerId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    };

    fetchExercises();
    fetchWorkouts();
    fetchWorkoutGroups();
    fetchStudents();
  }, [user]);

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise && !selectedExercises.find(ex => ex.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, { ...exercise, sets: exercise.sets || 3, reps: exercise.reps || 10, weight: exercise.weight || 0, rest: exercise.rest || 60 }]);
    }
  };

  const handleCreateWorkout = async () => {
    if (!newWorkoutName || selectedExercises.length === 0) {
      toast.error('Insira um nome e selecione pelo menos um exercício.');
      return;
    }
    if (!window.confirm('Confirmar criação do treino?')) return;

    const workoutData: Workout = {
      id: '',
      name: newWorkoutName,
      exercises: selectedExercises,
      trainerId: user.uid,
      studentId: null,
      groupId: null,
      reps: null,
      duration: null,
    };
    const { id, ...dataToSave } = workoutData; // Remove id when adding to Firestore
    await addDoc(workoutsCollection, dataToSave);
    toast.success('Treino criado com sucesso!');
    resetForm();
    await fetchWorkouts();
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setNewWorkoutName(workout.name);
    setSelectedExercises(workout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      weight: ex.weight || 0,
      rest: ex.rest || 60,
    })));
  };

  const handleUpdateWorkout = async () => {
    if (!editingWorkout || !newWorkoutName || selectedExercises.length === 0) {
      toast.error('Insira um nome e selecione pelo menos um exercício.');
      return;
    }
    if (!window.confirm('Confirmar edição do treino?')) return;

    const workoutRef = doc(db, 'workouts', editingWorkout.id);
    await updateDoc(workoutRef, { name: newWorkoutName, exercises: selectedExercises });
    toast.success('Treino atualizado com sucesso!');
    resetForm();
    await fetchWorkouts();
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!window.confirm('Confirmar exclusão do treino?')) return;

    await deleteDoc(doc(db, 'workouts', workoutId));
    toast.success('Treino removido com sucesso!');
    await fetchWorkouts();
  };

  const handleAutoGenerateWorkout = async () => {
    if (exercises.length < 5) {
      toast.error('Não há exercícios suficientes para gerar um treino.');
      return;
    }
    if (!window.confirm('Gerar um treino automaticamente com 5 exercícios?')) return;

    const randomExercises = exercises
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(ex => ({ ...ex, sets: ex.sets || 3, reps: ex.reps || 10, weight: ex.weight || 0, rest: ex.rest || 60 }));
    const workoutData: Workout = {
      id: '',
      name: `Treino Automático ${new Date().toLocaleDateString()}`,
      exercises: randomExercises,
      trainerId: user.uid,
      studentId: null,
      groupId: null,
      reps: null,
      duration: null,
    };
    const { id, ...dataToSave } = workoutData;
    await addDoc(workoutsCollection, dataToSave);
    toast.success('Treino automático criado!');
    await fetchWorkouts();
  };

  const handleCreateWorkoutGroup = async () => {
    if (!newGroupName || selectedWorkoutsForGroup.length === 0 || !groupValidityDays) {
      toast.error('Insira um nome, selecione treinos e defina a validade do grupo.');
      return;
    }
    if (!window.confirm(editingGroup ? 'Confirmar edição do grupo de treinos?' : 'Confirmar criação do grupo de treinos?')) return;

    const groupData: WorkoutGroup = {
      id: editingGroup ? editingGroup.id : '',
      name: newGroupName,
      trainerId: user.uid,
      workoutIds: selectedWorkoutsForGroup,
      validityDays: groupValidityDays,
    };

    if (editingGroup) {
      const groupRef = doc(db, 'workoutGroups', editingGroup.id);
      const { id, ...dataToSave } = groupData;
      await updateDoc(groupRef, dataToSave);
      toast.success('Grupo de treinos atualizado com sucesso!');
    } else {
      const { id, ...dataToSave } = groupData;
      const groupRef = await addDoc(collection(db, 'workoutGroups'), dataToSave);
      toast.success('Grupo de treinos criado com sucesso!');

      if (selectedStudentForGroup) {
        const studentRef = doc(db, 'users', selectedStudentForGroup);
        const student = students.find(s => s.id === selectedStudentForGroup);
        const updatedWorkoutIds = Array.from(new Set([...(student?.workoutIds || []), ...selectedWorkoutsForGroup]));
        await updateDoc(studentRef, { workoutIds: updatedWorkoutIds });
        toast.success('Grupo de treinos associado ao aluno com sucesso!');
      }
    }

    resetGroupForm();
    await fetchWorkoutGroups();
  };

  const handleEditWorkoutGroup = (group: WorkoutGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedWorkoutsForGroup(group.workoutIds);
    setGroupValidityDays(group.validityDays);
    setSelectedStudentForGroup(''); // Reset student selection when editing
  };

  const handleDeleteWorkoutGroup = async (groupId: string) => {
    if (!window.confirm('Confirmar exclusão do grupo de treinos?')) return;

    await deleteDoc(doc(db, 'workoutGroups', groupId));
    toast.success('Grupo de treinos removido com sucesso!');
    await fetchWorkoutGroups();
  };

  const resetForm = () => {
    setNewWorkoutName('');
    setSelectedExercises([]);
    setEditingWorkout(null);
  };

  const resetGroupForm = () => {
    setNewGroupName('');
    setSelectedWorkoutsForGroup([]);
    setGroupValidityDays(30);
    setSelectedStudentForGroup('');
    setEditingGroup(null);
  };

  const fetchWorkouts = async () => {
    const q = query(workoutsCollection, where('trainerId', '==', user.uid));
    const snapshot = await getDocs(q);
    setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
  };

  const fetchWorkoutGroups = async () => {
    const q = query(collection(db, 'workoutGroups'), where('trainerId', '==', user.uid));
    const snapshot = await getDocs(q);
    setWorkoutGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutGroup)));
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#2A2A2A', minHeight: '100vh', fontFamily: 'Manrope' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, position: 'relative' }}>
        <IconButton onClick={() => navigate('/')} sx={{ color: '#F77031', position: 'absolute', left: 0 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          Gerenciar Treinos
        </Typography>
      </Box>

      {/* Workout Creation/Edit Form */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Nome do Treino"
            variant="outlined"
            value={newWorkoutName}
            onChange={(e) => setNewWorkoutName(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(60, 60, 60, 0.8)', color: '#E3E3E3', fontFamily: 'Manrope', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' },
              '& .MuiInputLabel-root': { color: '#E3E3E3', fontFamily: 'Manrope' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Adicionar Exercício</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAddExercise(e.target.value as string)}
                sx={{
                  bgcolor: 'rgba(60, 60, 60, 0.8)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiSvgIcon-root': { color: '#E3E3E3' },
                }}
              >
                {exercises.map(ex => (
                  <MenuItem key={ex.id} value={ex.id} sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>
                    {ex.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          {selectedExercises.map((ex, index) => (
            <Chip
              key={index}
              label={`${ex.name} (${ex.sets}x${ex.reps}, ${ex.weight}kg)`}
              onDelete={() => setSelectedExercises(selectedExercises.filter((_, i) => i !== index))}
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(247, 112, 49, 0.8)', color: '#E3E3E3', fontFamily: 'Manrope' }}
            />
          ))}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'linear-gradient(45deg, #F77031, #E65E1F)',
              color: '#E3E3E3',
              fontFamily: 'Manrope',
              borderRadius: '25px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              '&:hover': { boxShadow: '0 6px 15px rgba(247, 112, 49, 0.5)' },
            }}
            onClick={editingWorkout ? handleUpdateWorkout : handleCreateWorkout}
          >
            {editingWorkout ? 'Atualizar Treino' : 'Criar Treino'}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'linear-gradient(45deg, #81BE00, #6A9C00)',
              color: '#E3E3E3',
              fontFamily: 'Manrope',
              borderRadius: '25px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              '&:hover': { boxShadow: '0 6px 15px rgba(129, 190, 0, 0.5)' },
            }}
            onClick={handleAutoGenerateWorkout}
          >
            Gerar Treino Automático
          </Button>
        </Box>
      </Box>

      {/* Workout Group Creation/Edit Form */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            mb: 2,
          }}
        >
          {editingGroup ? 'Editar Grupo de Treinos' : 'Criar Grupo de Treinos'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Nome do Grupo"
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(60, 60, 60, 0.8)', color: '#E3E3E3', fontFamily: 'Manrope', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' },
              '& .MuiInputLabel-root': { color: '#E3E3E3', fontFamily: 'Manrope' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Selecionar Treinos</InputLabel>
            <Select
              multiple
              value={selectedWorkoutsForGroup}
              onChange={(e) => setSelectedWorkoutsForGroup(e.target.value as string[])}
              sx={{
                bgcolor: 'rgba(60, 60, 60, 0.8)',
                color: '#E3E3E3',
                fontFamily: 'Manrope',
                borderRadius: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '& .MuiSvgIcon-root': { color: '#E3E3E3' },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={workouts.find(w => w.id === value)?.name}
                      sx={{ bgcolor: 'rgba(247, 112, 49, 0.8)', color: '#E3E3E3' }}
                    />
                  ))}
                </Box>
              )}
            >
              {workouts.map(workout => (
                <MenuItem key={workout.id} value={workout.id} sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>
                  {workout.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Validade (dias)"
            type="number"
            variant="outlined"
            value={groupValidityDays}
            onChange={(e) => setGroupValidityDays(Number(e.target.value))}
            sx={{
              width: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(60, 60, 60, 0.8)', color: '#E3E3E3', fontFamily: 'Manrope', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.1)' },
              '& .MuiInputLabel-root': { color: '#E3E3E3', fontFamily: 'Manrope' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
            }}
          />
          {!editingGroup && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Associar a Aluno (Opcional)</InputLabel>
              <Select
                value={selectedStudentForGroup}
                onChange={(e) => setSelectedStudentForGroup(e.target.value as string)}
                sx={{
                  bgcolor: 'rgba(60, 60, 60, 0.8)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '& .MuiSvgIcon-root': { color: '#E3E3E3' },
                }}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {students.map(student => (
                  <MenuItem key={student.id} value={student.id} sx={{ fontFamily: 'Manrope', color: '#E3E3E3' }}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            sx={{
              bgcolor: 'linear-gradient(45deg, #F77031, #E65E1F)',
              color: '#E3E3E3',
              fontFamily: 'Manrope',
              borderRadius: '25px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
              '&:hover': { boxShadow: '0 6px 15px rgba(247, 112, 49, 0.5)' },
            }}
            onClick={handleCreateWorkoutGroup}
          >
            {editingGroup ? 'Atualizar Grupo' : 'Criar Grupo'}
          </Button>
        </Box>
      </Box>

      {/* Workout Groups List */}
      <Typography
        variant="h6"
        sx={{
          color: '#E3E3E3',
          fontFamily: 'Manrope',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          mt: 4,
        }}
      >
        Grupos de Treinos Criados
      </Typography>
      {workoutGroups.length > 0 ? (
        workoutGroups.map(group => (
          <Box key={group.id} sx={{ p: 2, mt: 2, bgcolor: 'rgba(60, 60, 60, 0.8)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontWeight: 'bold' }}>
              {group.name}
            </Typography>
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>
              Validade: {group.validityDays} dias
            </Typography>
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>
              Treinos: {group.workoutIds.map(id => workouts.find(w => w.id === id)?.name).filter(Boolean).join(', ') || 'Nenhum'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" sx={{ color: '#F77031', borderColor: '#F77031', fontFamily: 'Manrope' }} onClick={() => handleEditWorkoutGroup(group)}>
                Editar
              </Button>
              <Button variant="outlined" sx={{ color: '#FF4444', borderColor: '#FF4444', fontFamily: 'Manrope' }} onClick={() => handleDeleteWorkoutGroup(group.id)}>
                Remover
              </Button>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center', bgcolor: 'rgba(60, 60, 60, 0.8)', p: 4, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '18px' }}>
            Nenhum grupo de treinos criado ainda. Crie seu primeiro grupo acima!
          </Typography>
        </Box>
      )}

      {/* Workouts List */}
      <Typography
        variant="h6"
        sx={{
          color: '#E3E3E3',
          fontFamily: 'Manrope',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          mt: 4,
        }}
      >
        Treinos Criados
      </Typography>
      {workouts.length > 0 ? (
        workouts.map(workout => (
          <Box key={workout.id} sx={{ p: 2, mt: 2, bgcolor: 'rgba(60, 60, 60, 0.8)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontWeight: 'bold' }}>
              {workout.name}
            </Typography>
            {workout.exercises.map((ex, index) => (
              <Typography key={index} sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>
                {ex.name}: {ex.sets}x{ex.reps}, {ex.weight}kg, {ex.rest}s descanso
              </Typography>
            ))}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" sx={{ color: '#F77031', borderColor: '#F77031', fontFamily: 'Manrope' }} onClick={() => handleEditWorkout(workout)}>
                Editar
              </Button>
              <Button variant="outlined" sx={{ color: '#FF4444', borderColor: '#FF4444', fontFamily: 'Manrope' }} onClick={() => handleDeleteWorkout(workout.id)}>
                Remover
              </Button>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ mt: 4, textAlign: 'center', bgcolor: 'rgba(60, 60, 60, 0.8)', p: 4, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <img
            src="https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a"
            alt="Nenhum treino criado"
            style={{ maxWidth: '300px', marginBottom: '16px', borderRadius: '10px' }}
          />
          <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '18px' }}>
            Nenhum treino criado ainda. Crie seu primeiro treino acima!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkoutManagementScreen;