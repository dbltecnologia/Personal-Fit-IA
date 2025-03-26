import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { db, workoutsCollection, completedWorkoutsCollection, exercisesCollection } from '../services/firebase';
import { doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Modal,
  Grid,
  CardMedia,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Workout, Exercise } from '../types';
import { toast } from 'react-toastify';

interface WorkoutExecutionScreenProps {
  user: User;
}

const WorkoutExecutionScreen = ({ user }: WorkoutExecutionScreenProps) => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (workoutId) {
        try {
          // Fetch the workout from workoutsCollection
          const docRef = doc(workoutsCollection, workoutId);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            toast.error('Treino não encontrado.');
            navigate('/dashboard');
            return;
          }

          const workoutData = { id: docSnap.id, ...docSnap.data() } as Workout;

          // Fetch all exercises from exercisesCollection
          const exercisesSnapshot = await getDocs(exercisesCollection);
          const allExercises = exercisesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Exercise[];

          // Map the workout's exercises to include full data (photo, demoImages, video)
          const enrichedExercises = workoutData.exercises.map((exercise: Exercise) => {
            const fullExercise = allExercises.find(ex => ex.name === exercise.name);
            if (fullExercise) {
              return {
                ...exercise,
                photo: fullExercise.photo,
                demoImages: fullExercise.demoImages,
                video: fullExercise.video,
              };
            }
            return exercise; // Fallback to original exercise if no match is found
          });

          setWorkout({
            ...workoutData,
            exercises: enrichedExercises,
          });
        } catch (error) {
          console.error('Erro ao buscar treino:', error);
          toast.error('Erro ao carregar treino.');
          navigate('/dashboard');
        }
      }
    };
    fetchWorkout();
  }, [workoutId, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restTimer !== null && restTimer > 0) {
      timer = setInterval(() => {
        setRestTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restTimer === 0) {
      setIsResting(false);
      setRestTimer(null);
      toast.success('Descanso concluído!');
    }
    return () => clearInterval(timer);
  }, [isResting, restTimer]);

  const handleCompleteExercise = (exercise: Exercise) => {
    if (!completedExercises.includes(exercise.name)) {
      setCompletedExercises([...completedExercises, exercise.name]);
      if (exercise.rest !== undefined) {
        setRestTimer(exercise.rest);
        setIsResting(true);
      }
    }
  };

  const handleFinishWorkout = async () => {
    if (!workout) return;

    const allCompleted = completedExercises.length === workout.exercises.length;
    let confirmMessage = 'Tem certeza que deseja finalizar o treino?';
    if (!allCompleted) {
      confirmMessage = 'Você está pulando alguns exercícios! Tem certeza que quer finalizar mesmo assim?';
    }

    if (!window.confirm(confirmMessage)) return;

    const status = allCompleted ? 'completed' : 'incomplete';
    await addDoc(completedWorkoutsCollection, {
      workoutId: workout.id,
      name: workout.name,
      exercises: workout.exercises,
      trainerId: user.uid,
      studentId: null,
      completedAt: new Date(),
      status,
    });
    toast.success('Treino finalizado!');
    navigate('/workout-history');
  };

  const handleOpenModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedExercise(null);
  };

  if (!workout) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#2A2A2A' }}>
        <CircularProgress sx={{ color: '#F77031' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#2A2A2A', minHeight: '100vh', fontFamily: 'Manrope' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ color: '#F77031', mr: 2 }}>
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
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          Executar: {workout.name}
        </Typography>
      </Box>

      {isResting && restTimer !== null && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ color: '#F77031', fontFamily: 'Manrope', fontSize: '18px' }}>
            Descanso: {restTimer}s
          </Typography>
          <CircularProgress
            variant="determinate"
            value={
              restTimer && completedExercises.length > 0 && workout.exercises[completedExercises.length - 1]?.rest
                ? (restTimer / (workout.exercises[completedExercises.length - 1]?.rest || 1)) * 100
                : 0
            }
            sx={{ color: '#F77031' }}
          />
        </Box>
      )}

      {workout.exercises.map((exercise, index) => (
        <Card
          key={index}
          sx={{
            mb: 2,
            bgcolor: 'rgba(60, 60, 60, 0.8)',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            p: 1,
          }}
        >
          <Box sx={{ flexShrink: 0, mr: 2 }}>
            {exercise.photo ? (
              <CardMedia
                component="img"
                image={exercise.photo}
                alt={exercise.name}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '10px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenModal(exercise)}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '10px',
                  bgcolor: '#555',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#E3E3E3', fontSize: '12px' }}>Sem Imagem</Typography>
              </Box>
            )}
          </Box>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontWeight: 'bold' }}>
              {exercise.name}
            </Typography>
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
              {exercise.sets || 0} séries x {exercise.reps || 0} repetições, {exercise.weight || 0}kg, {exercise.rest || 0}s descanso
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: completedExercises.includes(exercise.name)
                    ? '#555'
                    : 'linear-gradient(45deg, #F77031, #E65E1F)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  fontSize: '12px',
                  padding: '6px 12px',
                  '&:hover': { bgcolor: completedExercises.includes(exercise.name) ? '#555' : '#F77031' },
                }}
                onClick={() => handleCompleteExercise(exercise)}
                disabled={completedExercises.includes(exercise.name) || isResting}
              >
                {completedExercises.includes(exercise.name) ? 'Concluído' : 'Marcar como Concluído'}
              </Button>
              {exercise.video ? (
                <IconButton
                  onClick={() => handleOpenModal(exercise)}
                  sx={{ ml: 1, color: '#F77031' }}
                >
                  <PlayCircleOutlineIcon />
                </IconButton>
              ) : (
                <Typography sx={{ ml: 1, color: '#E3E3E3', fontSize: '12px' }}>Sem Vídeo</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="contained"
        sx={{
          mt: 4,
          bgcolor: 'linear-gradient(45deg, #81BE00, #6A9C00)',
          color: '#E3E3E3',
          fontFamily: 'Manrope',
          borderRadius: '25px',
          padding: '10px 20px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          '&:hover': { boxShadow: '0 6px 15px rgba(129, 190, 0, 0.5)' },
        }}
        onClick={handleFinishWorkout}
      >
        Finalizar Treino
      </Button>

      {/* Modal for displaying video and demo images */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(60, 60, 60, 0.95)',
            borderRadius: '20px',
            p: 3,
            maxWidth: '90%',
            maxHeight: '90%',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {selectedExercise && (
            <>
              <Typography
                variant="h5"
                sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontWeight: 'bold', mb: 2 }}
              >
                {selectedExercise.name}
              </Typography>
              {selectedExercise.video && (
                <Box sx={{ mb: 2 }}>
                  <iframe
                    width="100%"
                    height="315"
                    src={selectedExercise.video.replace('watch?v=', 'embed/')}
                    title={`${selectedExercise.name} video`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              )}
              {selectedExercise.demoImages && selectedExercise.demoImages.length > 0 && (
                <Grid container spacing={2}>
                  {selectedExercise.demoImages.map((img, idx) => (
                    <Grid item xs={4} key={idx}>
                      <CardMedia
                        component="img"
                        image={img}
                        alt={`${selectedExercise.name} demo ${idx + 1}`}
                        sx={{
                          width: '100%',
                          height: 120,
                          borderRadius: '10px',
                          objectFit: 'cover',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              <Button
                onClick={handleCloseModal}
                sx={{
                  mt: 2,
                  bgcolor: '#F77031',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  '&:hover': { bgcolor: '#E65E1F' },
                }}
              >
                Fechar
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default WorkoutExecutionScreen;