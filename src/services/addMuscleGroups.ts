// src/services/addMuscleGroups.ts

import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase'; // Adjust path as needed
import { toast } from 'react-toastify';

export const addMuscleGroups = async () => {
  try {
    const muscleGroupsCollection = collection(db, 'muscleGroups');
    const muscleGroups = [
      { name: 'Peito' },
      { name: 'Costas' },
      { name: 'Pernas' },
      { name: 'Bíceps' },
      { name: 'Tríceps' },
      { name: 'Ombros' },
      { name: 'Core' },
      { name: 'Glúteos' },
    ];

    for (const group of muscleGroups) {
      await addDoc(muscleGroupsCollection, group);
    }
    toast.success('Grupos musculares adicionados com sucesso.');
  } catch (error) {
    console.error('Erro ao adicionar grupos musculares:', error);
    toast.error('Erro ao adicionar grupos musculares.');
  }
};