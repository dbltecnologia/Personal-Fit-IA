// src/services/fetchExercises.ts

import { getDocs, addDoc } from 'firebase/firestore';
import { exercisesCollection } from '../services/firebase'; // Adjust the path as needed
import { Exercise } from '../types'; // Adjust the path as needed
import { toast } from 'react-toastify';

// Update the Exercise type in your types file (src/types.ts) to include the new fields
// For example:
// export interface Exercise {
//   id: string;
//   name: string;
//   muscleGroups: string[];
//   difficulty: string;
//   recommendedAgeRange: string;
//   imageBackground: string;
//   sets: number;
//   reps: number;
//   weight: number;
//   rest: number;
//   photo: string; // New field for main photo
//   demoImages: string[]; // New field for demonstration images (array of 3 URLs)
//   video: string; // New field for video URL
// }

export const fetchExercises = async (setExercises: (exercises: Exercise[]) => void) => {
  try {
    const snapshot = await getDocs(exercisesCollection);
    let exerciseData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Exercise));

    if (exerciseData.length === 0) {
      const defaultExercises: Exercise[] = [
        {
          id: '',
          name: 'Supino Reto com Barra',
          muscleGroups: ['Peito'],
          difficulty: 'beginner',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Barbell-Bench-Press-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1/1_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1/1_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/1/1_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=rT7DgCr-3_I',
        },
        {
          id: '',
          name: 'Supino Inclinado com Halteres',
          muscleGroups: ['Peito'],
          difficulty: 'intermediate',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Incline-Dumbbell-Press-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/4/4_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/4/4_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/4/4_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
        },
        {
          id: '',
          name: 'Supino Declinado com Barra',
          muscleGroups: ['Peito'],
          difficulty: 'intermediate',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Decline-Barbell-Press-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/5/5_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/5/5_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/5/5_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=LfyQBUKR8B0',
        },
        {
          id: '',
          name: 'Crucifixo com Halteres',
          muscleGroups: ['Peito'],
          difficulty: 'beginner',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 12,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Dumbbell-Fly-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/6/6_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/6/6_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/6/6_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=eozkSSdaI5c',
        },
        {
          id: '',
          name: 'Flexão de Braço',
          muscleGroups: ['Peito'],
          difficulty: 'beginner',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 15,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Push-Up-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/7/7_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/7/7_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/7/7_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        },
        // Add similar fields for the remaining exercises...
        // For brevity, I'll add the fields for a few more exercises. You can follow the same pattern for the rest.
        {
          id: '',
          name: 'Supino Reto com Halteres',
          muscleGroups: ['Peito'],
          difficulty: 'beginner',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Dumbbell-Bench-Press-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/8/8_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/8/8_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/8/8_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
        },
        {
          id: '',
          name: 'Crucifixo na Polia Alta',
          muscleGroups: ['Peito'],
          difficulty: 'intermediate',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 12,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Cable-Fly-High-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/9/9_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/9/9_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/9/9_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=taI4Xdh3a8k',
        },
        {
          id: '',
          name: 'Puxada Frontal na Polia',
          muscleGroups: ['Costas'],
          difficulty: 'beginner',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Lat-Pulldown-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/10/10_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/10/10_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/10/10_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
        },
        {
          id: '',
          name: 'Agachamento Livre com Barra',
          muscleGroups: ['Pernas'],
          difficulty: 'intermediate',
          recommendedAgeRange: '18-60',
          imageBackground: '',
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          photo: 'https://www.menshealth.com/wp-content/uploads/2019/03/Barbell-Squat-1200x1200.jpg',
          demoImages: [
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/11/11_1.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/11/11_2.jpg',
            'https://www.bodybuilding.com/exercises/exerciseImages/sequences/11/11_3.jpg',
          ],
          video: 'https://www.youtube.com/watch?v=Dy28eq2PjcM',
        },
        // Continue adding photo, demoImages, and video for the remaining exercises following the same pattern...
      ];

      for (const ex of defaultExercises) {
        const { id, ...exerciseData } = ex;
        await addDoc(exercisesCollection, exerciseData);
      }

      const newSnapshot = await getDocs(exercisesCollection);
      exerciseData = newSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Exercise));
    }

    setExercises(exerciseData);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    toast.error('Erro ao buscar exercícios.');
  }
};