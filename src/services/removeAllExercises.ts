// src/services/removeAllExercises.ts

import { getDocs, deleteDoc } from 'firebase/firestore';
import { exercisesCollection } from '../services/firebase'; // Adjust path as needed
import { toast } from 'react-toastify';

export const removeAllExercises = async () => {
  try {
    const snapshot = await getDocs(exercisesCollection);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    toast.success('Todos os exercícios foram removidos.');
  } catch (error) {
    console.error('Erro ao remover exercícios:', error);
    toast.error('Erro ao remover exercícios.');
  }
};