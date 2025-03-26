import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Chip } from '@mui/material';
import Tilt from 'react-parallax-tilt';
import { toast } from 'react-toastify';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  trainerId: string;
  workoutIds: string[];
}

interface Workout {
  id: string;
  name: string;
  trainerId: string;
}

interface WorkoutGroup {
  id: string;
  name: string;
  trainerId: string;
  workoutIds: string[];
}

interface StudentManagementScreenProps {
  user: User;
}

const StudentManagementScreen = ({ user }: StudentManagementScreenProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedWorkoutsForStudent, setSelectedWorkoutsForStudent] = useState<string[]>([]);
  const [selectedWorkoutGroup, setSelectedWorkoutGroup] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Fetch students with role 'student' and trainerId either matching user.uid or empty
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('trainerId', 'in', [user.uid, ''])
        );
        const snapshot = await getDocs(q);
        const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        console.log('Fetched students:', studentList); // Debug log
        console.log('Current trainer UID:', user.uid); // Debug log
        setStudents(studentList);
        setFilteredStudents(studentList);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Erro ao buscar alunos.');
      }
    };

    const fetchWorkouts = async () => {
      try {
        const q = query(collection(db, 'workouts'), where('trainerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const workoutList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));
        setWorkouts(workoutList);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast.error('Erro ao buscar treinos.');
      }
    };

    const fetchWorkoutGroups = async () => {
      try {
        const q = query(collection(db, 'workoutGroups'), where('trainerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const groupList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutGroup));
        setWorkoutGroups(groupList);
      } catch (error) {
        console.error('Error fetching workout groups:', error);
        toast.error('Erro ao buscar grupos de treinos.');
      }
    };

    fetchStudents();
    fetchWorkouts();
    fetchWorkoutGroups();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleAssociateWorkouts = async () => {
    if (!selectedStudent) {
      toast.error('Por favor, selecione um aluno.');
      return;
    }
    if (!selectedWorkoutsForStudent.length && !selectedWorkoutGroup) {
      toast.error('Por favor, selecione treinos ou um grupo de treinos.');
      return;
    }

    try {
      const studentRef = doc(db, 'users', selectedStudent);
      const student = students.find(s => s.id === selectedStudent);
      let updatedWorkoutIds = Array.from(new Set(student?.workoutIds || []));

      if (selectedWorkoutGroup) {
        const group = workoutGroups.find(g => g.id === selectedWorkoutGroup);
        if (group) {
          updatedWorkoutIds = Array.from(new Set(updatedWorkoutIds.concat(group.workoutIds)));
        }
      }

      if (selectedWorkoutsForStudent.length) {
        updatedWorkoutIds = Array.from(new Set(updatedWorkoutIds.concat(selectedWorkoutsForStudent)));
      }

      await updateDoc(studentRef, { workoutIds: updatedWorkoutIds });
      const updatedStudents = students.map(student =>
        student.id === selectedStudent ? { ...student, workoutIds: updatedWorkoutIds } : student
      );
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setSelectedStudent('');
      setSelectedWorkoutsForStudent([]);
      setSelectedWorkoutGroup('');
      toast.success('Treinos associados ao aluno com sucesso!');
    } catch (error) {
      console.error('Erro ao associar treinos:', error);
      toast.error('Erro ao associar treinos.');
    }
  };

  const handleAssignTrainer = async (studentId: string) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, { trainerId: user.uid });
      const updatedStudents = students.map(student =>
        student.id === studentId ? { ...student, trainerId: user.uid } : student
      );
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      toast.success('Aluno associado ao treinador com sucesso!');
    } catch (error) {
      console.error('Error assigning trainer:', error);
      toast.error('Erro ao associar treinador.');
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: 'rgba(30, 26, 26, 0.9)', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        sx={{
          color: '#E3E3E3',
          fontFamily: 'Manrope',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          mb: 4,
        }}
      >
        Gerenciar Alunos
      </Typography>

      {/* Associate Workouts Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          bgcolor: 'rgba(42, 42, 42, 0.8)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            mb: 2,
          }}
        >
          Associar Treinos a Aluno
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel sx={{ color: '#E3E3E3' }}>Selecionar Aluno</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value as string)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#E3E3E3',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
                '& .MuiSvgIcon-root': { color: '#E3E3E3' },
              }}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {students
                .filter(student => student.trainerId === user.uid) // Only show students assigned to this trainer
                .map(student => (
                  <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel sx={{ color: '#E3E3E3' }}>Selecionar Treinos</InputLabel>
            <Select
              multiple
              value={selectedWorkoutsForStudent}
              onChange={(e) => setSelectedWorkoutsForStudent(e.target.value as string[])}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#E3E3E3',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
                '& .MuiSvgIcon-root': { color: '#E3E3E3' },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={workouts.find(w => w.id === value)?.name}
                      sx={{ bgcolor: '#F77031', color: '#E3E3E3' }}
                    />
                  ))}
                </Box>
              )}
            >
              {workouts.map(workout => (
                <MenuItem key={workout.id} value={workout.id}>
                  {workout.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel sx={{ color: '#E3E3E3' }}>Selecionar Grupo de Treinos</InputLabel>
            <Select
              value={selectedWorkoutGroup}
              onChange={(e) => setSelectedWorkoutGroup(e.target.value as string)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: '#E3E3E3',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
                '& .MuiSvgIcon-root': { color: '#E3E3E3' },
              }}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {workoutGroups.map(group => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#F77031',
              color: '#E3E3E3',
              fontFamily: 'Manrope',
              textTransform: 'none',
              borderRadius: '25px',
              '&:hover': { bgcolor: '#E65E1F' },
            }}
            onClick={handleAssociateWorkouts}
          >
            Associar Treinos
          </Button>
        </Box>
      </Box>

      {/* Search and Student List Section */}
      <Box
        sx={{
          p: 3,
          bgcolor: 'rgba(42, 42, 42, 0.8)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            mb: 2,
          }}
        >
          Lista de Alunos
        </Typography>
        <TextField
          label="Procurar Aluno por Nome"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 3,
            width: '100%',
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#E3E3E3',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: '#F77031' },
            },
            '& .MuiInputLabel-root': { color: '#E3E3E3' },
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <Tilt key={student.id} tiltMaxAngleX={10} tiltMaxAngleY={10}>
                <Card
                  sx={{
                    width: 200,
                    bgcolor: student.trainerId === '' ? 'rgba(100, 60, 60, 0.9)' : 'rgba(60, 60, 60, 0.9)', // Highlight unassigned students
                    borderRadius: '15px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)', border: '1px solid rgba(247, 112, 49, 0.5)' },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      sx={{
                        color: '#E3E3E3',
                        fontFamily: 'Manrope',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {student.name}
                    </Typography>
                    <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '12px' }}>
                      {student.email}
                    </Typography>
                    {student.trainerId !== '' ? (
                      <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '12px', mt: 1 }}>
                        Treinos: {student.workoutIds.length > 0
                          ? student.workoutIds.map(id => workouts.find(w => w.id === id)?.name).filter(Boolean).join(', ')
                          : 'Nenhum'}
                      </Typography>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 1, bgcolor: '#F77031', '&:hover': { bgcolor: '#E65E1F' } }}
                        onClick={() => handleAssignTrainer(student.id)}
                      >
                        Associar a Mim
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Tilt>
            ))
          ) : (
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
              Nenhum aluno encontrado.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentManagementScreen;