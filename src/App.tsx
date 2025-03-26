// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { User } from 'firebase/auth';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkoutManagementScreen from './screens/WorkoutManagementScreen';
import StudentManagementScreen from './screens/StudentManagementScreen';
import GroupManagementScreen from './screens/GroupManagementScreen';
import WorkoutExecutionScreen from './screens/WorkoutExecutionScreen';
import WorkoutHistoryScreen from './screens/WorkoutHistoryScreen';
import SuggestionsScreen from './screens/SuggestionsScreen';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<DashboardScreen user={user} />} />
            <Route path="/workout-management" element={<WorkoutManagementScreen user={user} />} />
            <Route path="/student-management" element={<StudentManagementScreen user={user} />} />
            <Route path="/group-management" element={<GroupManagementScreen user={user} />} />
            <Route path="/workout-execution/:workoutId" element={<WorkoutExecutionScreen user={user} />} />
            <Route path="/workout-history" element={<WorkoutHistoryScreen user={user} />} />
            <Route path="/suggestions" element={<SuggestionsScreen user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;