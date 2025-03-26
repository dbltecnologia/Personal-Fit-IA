// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDej98FTdiwS8EKjytVnbPqCs-nP1CC9Og",
    authDomain: "antoniofilho-ef6a2.firebaseapp.com",
    databaseURL: "https://antoniofilho-ef6a2-default-rtdb.firebaseio.com",
    projectId: "antoniofilho-ef6a2",
    storageBucket: "antoniofilho-ef6a2.appspot.com",
    messagingSenderId: "637424531884",
    appId: "1:637424531884:web:ce67539d509bdef9516209"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const exercisesCollection = collection(db, 'exercises');
export const groupsCollection = collection(db, 'muscleGroups');
export const workoutsCollection = collection(db, 'workouts');
export const studentsCollection = collection(db, 'students');
export const studentGroupsCollection = collection(db, 'studentGroups');
export const muscleGroupsCollection = collection(db, 'muscleGroups');
export const completedWorkoutsCollection = collection(db, 'completedWorkouts');