// src/screens/DashboardScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { query, where, getDocs, addDoc, collection } from 'firebase/firestore';
import { auth, db, workoutsCollection, completedWorkoutsCollection } from '../services/firebase';

import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { Workout, CompletedWorkout, UserProfile, Exercise } from '../types';
import Header from '../components/Header';
import Greeting from '../components/Greeting';
import RecommendedWorkout from '../components/RecommendedWorkout';
import ContinueWorkout from '../components/ContinueWorkout';
import NavigationButtons from '../components/NavigationButtons';
import FeaturedWorkouts from '../components/FeaturedWorkouts';
import WorkoutPreviewDialog from '../components/WorkoutPreviewDialog';
import Statistics from '../components/Statistics';
import Achievements from '../components/Achievements';
import BottomNav from '../components/BottomNav';


import { fetchExercises } from '../services/fetchExercises'; // Import the function
import { removeAllExercises } from '../services/removeAllExercises';

const recommendWorkout = (
  user: UserProfile,
  workouts: Workout[],
  exercises: Exercise[],
  completedWorkouts: CompletedWorkout[]
): Workout | null => {
  console.log('Dados para recomendação:', { user, workouts, exercises, completedWorkouts });
  if (!workouts.length) {
    console.log('Nenhum treino disponível para recomendação.');
    return null;
  }

  const hasIncompleteWorkout = completedWorkouts.some(cw => cw.status === 'incomplete');
  if (hasIncompleteWorkout) {
    console.log('Usuário tem treino em andamento, não recomendar novo treino.');
    return null;
  }

  const suitableExercises = exercises.filter(ex => {
    const ageRange = ex.recommendedAgeRange || '18-70';
    const [minAge, maxAge] = ageRange.split('-').map(Number);
    const isAgeSuitable = user.age >= minAge && user.age <= maxAge;
    const isDifficultySuitable =
      user.fitnessLevel === 'beginner' ? ex.difficulty === 'beginner' :
      user.fitnessLevel === 'intermediate' ? ['beginner', 'intermediate'].includes(ex.difficulty) :
      true;
    return isAgeSuitable && isDifficultySuitable;
  });
  console.log('Exercícios adequados:', suitableExercises);

  const completedWorkoutsCount = user.progress.length;
  const averagePerformance = user.progress.reduce((sum, p) => sum + p.performance, 0) / (completedWorkoutsCount || 1);
  const intensityMultiplier = averagePerformance > 80 ? 1.2 : averagePerformance < 50 ? 0.8 : 1;

  const today = new Date().setHours(0, 0, 0, 0);
  const completedTodayIds = completedWorkouts
    .filter(cw => cw.status === 'completed' && cw.completedAt.toDate().setHours(0, 0, 0, 0) === today)
    .map(cw => cw.workoutId);
  console.log('Treinos completados hoje (IDs):', completedTodayIds);

  const completedWorkoutIds = completedWorkouts.filter(cw => cw.status === 'completed').map(cw => cw.workoutId);
  let availableWorkouts = workouts.filter(
    workout => !completedTodayIds.includes(workout.id) && !completedWorkoutIds.includes(workout.id)
  );
  console.log('Treinos disponíveis (não completados hoje e nunca completados):', availableWorkouts);

  let recommendedWorkout = availableWorkouts.find(workout =>
    workout.exercises && workout.exercises.some(ex => suitableExercises.some(se => se.name === ex.name))
  );

  if (!recommendedWorkout) {
    availableWorkouts = workouts.filter(workout => !completedTodayIds.includes(workout.id));
    recommendedWorkout = availableWorkouts.find(workout =>
      workout.exercises && workout.exercises.some(ex => suitableExercises.some(se => se.name === ex.name))
    );

    if (!recommendedWorkout && availableWorkouts.length > 0) {
      recommendedWorkout = availableWorkouts[0];
      console.log('Nenhum treino específico encontrado, sugerindo o primeiro disponível (repetição permitida):', recommendedWorkout);
    }
  }

  if (recommendedWorkout) {
    return {
      ...recommendedWorkout,
      exercises: recommendedWorkout.exercises.map(ex => ({
        ...ex,
        reps: Math.round((ex.reps || 0) * intensityMultiplier),
        sets: Math.round((ex.sets || 0) * intensityMultiplier),
      })),
    };
  }

  console.log('Nenhum treino recomendado encontrado.');
  return null;
};

interface DashboardScreenProps {
  user: User;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<Workout | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const achievementSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [workoutsSnapshot, completedSnapshot, userDoc] = await Promise.all([
          getDocs(query(workoutsCollection, where('trainerId', '==', user.uid))),
          getDocs(query(completedWorkoutsCollection, where('trainerId', '==', user.uid))),
          getDocs(query(collection(db, 'users'), where('id', '==', user.uid))),
        ]);

        // Call the fetchExercises function and pass setExercises
        // await removeAllExercises();
        await fetchExercises(setExercises);
        

        const workoutData = workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
        setWorkouts(workoutData);

        const completedData = completedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedWorkout));
        console.log('Completed Workouts:', completedData);
        setCompletedWorkouts(completedData);

        let userData = userDoc.docs[0]?.data() as UserProfile;
        if (!userData) {
          userData = {
            id: user.uid,
            role: 'user',
            age: 30,
            fitnessLevel: 'beginner',
            progress: [],
          };
          await addDoc(collection(db, 'users'), userData);
        }
        setUserProfile(userData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    clickSoundRef.current = new Audio('https://www.soundjay.com/buttons/button-1.mp3');
    clickSoundRef.current.onerror = () => console.warn('Falha ao carregar som de clique');
    achievementSoundRef.current = new Audio('https://www.soundjay.com/buttons/button-1.mp3');
    achievementSoundRef.current.onerror = () => console.warn('Falha ao carregar som de conquista');

    fetchData();
  }, [user]);

  useEffect(() => {
    if (completedWorkouts.length === 5) {
      toast.success('Parabéns! Você desbloqueou o badge de Iniciante! 🏆');
      setShowConfetti(true);
    }
  }, [completedWorkouts]);

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  const handleStartWorkout = (workoutId: string) => {
    const confirm = window.confirm('Deseja iniciar este treino?');
    if (confirm) {
      setShowSuccess(workoutId);
      clickSoundRef.current?.play();
      setTimeout(() => {
        setShowSuccess(null);
        navigate(`/workout-execution/${workoutId}`);
      }, 1000);
    }
  };

  const handlePreviewOpen = (workout: Workout) => {
    setPreviewWorkout(workout);
  };

  const handlePreviewClose = () => {
    setPreviewWorkout(null);
  };

  const handleShareAchievement = () => {
    const shareText = `Conquistei o badge de Iniciante no Muscle Minds! 🏆 Completei 5 treinos! 💪`;
    if (navigator.share) {
      navigator.share({
        title: 'Minha Conquista no Muscle Minds',
        text: shareText,
        url: window.location.href,
      });
    } else {
      alert('Compartilhamento não suportado. Copie este texto: ' + shareText);
    }
  };

  const hasIncompleteWorkout = completedWorkouts.some(cw => cw.status === 'incomplete');
  const recommendedWorkout = userProfile && !hasIncompleteWorkout ? recommendWorkout(userProfile, workouts, exercises, completedWorkouts) : null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: accessibilityMode ? '#FFFFFF' : '#1E1A1A' }}>
        <CircularProgress sx={{ color: '#F77031' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: accessibilityMode ? '#FFFFFF' : '#1E1A1A',
        minHeight: '100vh',
        fontFamily: 'Manrope',
        fontSize: accessibilityMode ? '18px' : '16px',
        pb: 12,
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box>
        {animationsEnabled && (
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              background: { color: { value: 'transparent' } },
              fpsLimit: 60,
              particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: ['#F77031', '#81BE00'] },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                move: { enable: true, speed: 0.5, direction: 'none', random: true, out_mode: 'out' },
              },
              interactivity: {
                events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
                modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } },
              },
              retina_detect: true,
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          />
        )}

        {animationsEnabled && showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <Box>
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                width: 12,
                height: 12,
                bgcolor: '#F77031',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                width: 12,
                height: 12,
                bgcolor: '#81BE00',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </Box>
        </Box>

        <Header
          user={user}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          animationsEnabled={animationsEnabled}
          setAnimationsEnabled={setAnimationsEnabled}
          accessibilityMode={accessibilityMode}
          setAccessibilityMode={setAccessibilityMode}
        />

        <Box sx={{ pt: 10, mb: 1 }}>
          <Greeting user={user} accessibilityMode={accessibilityMode} completedWorkouts={completedWorkouts} />
        </Box>
        {hasIncompleteWorkout && (
          <Box sx={{ mb: 4 }}>
            <ContinueWorkout completedWorkouts={completedWorkouts} accessibilityMode={accessibilityMode} />
          </Box>
        )}
        {recommendedWorkout ? (
          <Box sx={{ mb: 4 }}>
            <RecommendedWorkout recommendedWorkout={recommendedWorkout} accessibilityMode={accessibilityMode} />
            {completedWorkouts.filter(cw => cw.status === 'completed' && cw.completedAt.toDate().setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)).length > 0 && (
              <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px', mt: 1 }}>
                Você completou {completedWorkouts.filter(cw => cw.status === 'completed' && cw.completedAt.toDate().setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)).length} treino(s) hoje! Deseja continuar com este treino?
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>
              Nenhum treino disponível no momento. Crie ou edite treinos em "Gerenciar Treinos".
            </Typography>
          </Box>
        )}
        <Box sx={{ mb: 4 }}>
          <NavigationButtons isPersonal={userProfile?.role === 'personal'} accessibilityMode={accessibilityMode} />
        </Box>
        <Box sx={{ mb: 4 }}>
          <FeaturedWorkouts
            workouts={workouts}
            handleStartWorkout={handleStartWorkout}
            handlePreviewOpen={handlePreviewOpen}
            showSuccess={showSuccess}
            accessibilityMode={accessibilityMode}
          />
        </Box>
       
        <WorkoutPreviewDialog
          previewWorkout={previewWorkout}
          handlePreviewClose={handlePreviewClose}
          handleStartWorkout={handleStartWorkout}
          accessibilityMode={accessibilityMode}
        />
        <Box sx={{ mb: 4 }}>
          <Statistics completedWorkouts={completedWorkouts} accessibilityMode={accessibilityMode} />
        </Box>
        <Box sx={{ mb: 4 }}>
          <Achievements
            completedWorkouts={completedWorkouts}
            handleShareAchievement={handleShareAchievement}
            accessibilityMode={accessibilityMode}
          />
        </Box>
        <IconButton
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: '#25D366',
            '&:hover': { bgcolor: '#20B058', transform: 'scale(1.1)' },
            transition: 'all 0.3s ease',
            width: 56,
            height: 56,
            zIndex: 1000,
          }}
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
          aria-label="Contato via WhatsApp"
        >
          <WhatsAppIcon sx={{ color: '#FFFFFF' }} />
        </IconButton>
        <BottomNav
          bottomNavValue={bottomNavValue}
          setBottomNavValue={setBottomNavValue}
          accessibilityMode={accessibilityMode}
        />
      </Box>
    </Box>
  );
};

export default DashboardScreen;