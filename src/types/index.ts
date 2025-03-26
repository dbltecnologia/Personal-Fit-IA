
  export interface Exercise {
    id: string;
    name: string;
    muscleGroups: string[];
    difficulty: string;
    recommendedAgeRange: string;
    imageBackground: string;
    sets: number;
    reps: number;
    weight: number;
    rest: number;
    photo: string;
    demoImages: string[];
    video: string;
  }

  export interface Workout {
    id: string;
    name: string;
    exercises: Exercise[];
    trainerId: string;
    studentId: string | null;
    groupId: string | null;
    reps: string | null;
    duration: string | null;
  }
  
  export interface CompletedWorkout {
    status: string;
    id: string;
    workoutId: string;
    name: string;
    exercises: Exercise[];
    trainerId: string;
    studentId: string | null;
    completedAt: any;
  }


  export interface UserProfile {
    id: string;
    role: string;
    age: number;
    fitnessLevel: string;
    progress: { workoutId: string; completedAt: string; performance: number }[];
  }

  export interface WorkoutGroup {
    id: string;
    name: string;
    trainerId: string;
    workoutIds: string[];
    validityDays: number;
  }



export const recommendWorkout = (
    user: UserProfile,
    workouts: Workout[],
    sets: number,
    reps: number,
    exercises: Exercise[]
  ): Workout | null => {
    // Filtrar exercícios adequados à faixa etária e nível de condicionamento
    const suitableExercises = exercises.filter(ex => {
      const [minAge, maxAge] = ex?.recommendedAgeRange.split('-').map(Number);
      return (
        user.age >= minAge &&
        user.age <= maxAge &&
        (user.fitnessLevel === 'beginner' ? ex.difficulty === 'beginner' : true)
      );
    });
  
    // Calcular progresso do usuário
    const completedWorkouts = user.progress.length;
    const averagePerformance = user.progress.reduce((sum, p) => sum + p.performance, 0) / (completedWorkouts || 1);
  
    // Ajustar intensidade com base no progresso
    const intensityMultiplier = averagePerformance > 80 ? 1.2 : averagePerformance < 50 ? 0.8 : 1;
  
    // Selecionar um treino com base nos exercícios adequados
    const recommendedWorkout = workouts.find(workout =>
      workout.exercises.some(ex => suitableExercises.some(se => se.name === ex.name))
    );
  
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
    return null;
  };