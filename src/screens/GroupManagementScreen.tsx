import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Collapse,
} from '@mui/material';
import Tilt from 'react-parallax-tilt';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface MuscleGroup {
  id: string;
  name: string;
  imageBackground: string;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  difficulty: string;
  recommendedAgeRange: string;
  imageBackground: string;
}

interface GroupManagementScreenProps {
  user: User;
}

const GroupManagementScreen = ({ user }: GroupManagementScreenProps) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>('');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupImage, setNewGroupImage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [editGroup, setEditGroup] = useState<MuscleGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupImage, setEditGroupImage] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);


  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  const handleToggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData?.role || '');
          setUserProfile({ id: user.uid, role: userData?.role || '' });
        } else {
          toast.error('Perfil do usuário não encontrado.');
          setRole('');
        }
      } catch (error) {
        console.error('Erro ao buscar o papel do usuário:', error);
        toast.error('Erro ao verificar o papel do usuário.');
        setRole('');
      }
    };

    const fetchMuscleGroups = async () => {
      const snapshot = await getDocs(collection(db, 'muscleGroups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MuscleGroup));
      setMuscleGroups(groups);

      if (groups.length === 0) {
        const defaultGroups = [
          { name: 'Costas', imageBackground: 'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2Fgym.png?alt=media&token=e063f6fd-f8f7-4417-bbbb-e23db98d2981' },
          { name: 'Peito', imageBackground: 'https://firebasestorage.googleapis.com/v0/b/antoniofilho-ef6a2.appspot.com/o/Academia%2FYellow%20and%20Black%20Photo%20Personal%20Trainer%20Instagram%20Post.png?alt=media&token=a8450a3a-3c0e-45fa-8590-72e97608497a' },
        ];
        for (const group of defaultGroups) {
          await addDoc(collection(db, 'muscleGroups'), group);
        }
        const newSnapshot = await getDocs(collection(db, 'muscleGroups'));
        setMuscleGroups(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MuscleGroup)));
      }
    };

    const fetchExercises = async () => {
      const snapshot = await getDocs(collection(db, 'exercises'));
      setExercises(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise)));
    };

    fetchUserRole();
    fetchMuscleGroups();
    fetchExercises();
  }, [user]);

  const handleCreateGroup = async () => {
    if (!newGroupName || !newGroupImage) {
      toast.error('Por favor, insira o nome e a imagem do grupo.');
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        imageBackground: newGroupImage,
      };
      const docRef = await addDoc(collection(db, 'muscleGroups'), newGroup);
      setMuscleGroups([...muscleGroups, { id: docRef.id, ...newGroup }]);
      setNewGroupName('');
      setNewGroupImage('');
      toast.success('Grupo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo muscular.');
    }
  };

  const handleAssignExerciseToGroup = async (exerciseId: string) => {
    if (!selectedGroup) {
      toast.error('Selecione um grupo muscular.');
      return;
    }

    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (exercise) {
        const selectedGroupName = muscleGroups.find(g => g.id === selectedGroup)?.name || '';
        const updatedMuscleGroups = [...(exercise.muscleGroups || []), selectedGroupName];
        const exerciseRef = doc(db, 'exercises', exerciseId);
        await updateDoc(exerciseRef, { muscleGroups: updatedMuscleGroups });
        setExercises(exercises.map(ex => (ex.id === exerciseId ? { ...ex, muscleGroups: updatedMuscleGroups } : ex)));
        toast.success(`Exercício "${exercise.name}" associado ao grupo "${selectedGroupName}" com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao associar exercício:', error);
      toast.error('Erro ao associar exercício ao grupo.');
    }
  };

  const handleEditGroup = (group: MuscleGroup) => {
    setEditGroup(group);
    setEditGroupName(group.name);
    setEditGroupImage(group.imageBackground);
    setOpenEditDialog(true);
  };

  const handleUpdateGroup = async () => {
    if (!editGroup || !editGroupName || !editGroupImage) {
      toast.error('Por favor, insira o nome e a imagem do grupo.');
      return;
    }

    try {
      const groupRef = doc(db, 'muscleGroups', editGroup.id);
      await updateDoc(groupRef, {
        name: editGroupName,
        imageBackground: editGroupImage,
      });
      setMuscleGroups(muscleGroups.map(g => (g.id === editGroup.id ? { ...g, name: editGroupName, imageBackground: editGroupImage } : g)));
      setOpenEditDialog(false);
      setEditGroup(null);
      toast.success('Grupo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast.error('Erro ao atualizar grupo muscular.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteDoc(doc(db, 'muscleGroups', groupId));
      setMuscleGroups(muscleGroups.filter(g => g.id !== groupId));
      const updatedExercises = exercises.map(ex => ({
        ...ex,
        muscleGroups: ex.muscleGroups?.filter(mg => mg !== muscleGroups.find(g => g.id === groupId)?.name) || [],
      }));
      for (const ex of updatedExercises) {
        const exerciseRef = doc(db, 'exercises', ex.id);
        await updateDoc(exerciseRef, { muscleGroups: ex.muscleGroups });
      }
      setExercises(updatedExercises);
      toast.success('Grupo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover grupo:', error);
      toast.error('Erro ao remover grupo muscular.');
    }
  };

  if (role !== 'personal') {
    return (
      <Box sx={{ p: 4, bgcolor: 'rgba(30, 26, 26, 0.9)', minHeight: '100vh', fontFamily: 'Manrope' }}>
        <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '16px' }}>
          Acesso restrito a personais.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'rgba(30, 26, 26, 0.9)', minHeight: '100vh', fontFamily: 'Manrope' }}>
      <Header
        user={user}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        animationsEnabled={animationsEnabled}
        setAnimationsEnabled={setAnimationsEnabled}
        accessibilityMode={accessibilityMode}
        setAccessibilityMode={setAccessibilityMode}
      />

      <Box sx={{ p: 4, pt: 10 }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: '#E3E3E3',
            fontFamily: 'Manrope',
            textTransform: 'none',
            mb: 2,
            '&:hover': { color: '#F77031' },
          }}
        >
          Voltar
        </Button>

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
          Gerenciar Grupos Musculares
        </Typography>

        {/* Criar Novo Grupo */}
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
            Criar Novo Grupo
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Nome do Grupo"
              variant="outlined"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: '#F77031' },
                },
                '& .MuiInputLabel-root': { color: '#E3E3E3', fontFamily: 'Manrope' },
              }}
            />
            <TextField
              label="URL da Imagem"
              variant="outlined"
              value={newGroupImage}
              onChange={(e) => setNewGroupImage(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: '#F77031' },
                },
                '& .MuiInputLabel-root': { color: '#E3E3E3', fontFamily: 'Manrope' },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: '#F77031',
                color: '#E3E3E3',
                fontFamily: 'Manrope',
                textTransform: 'none',
                borderRadius: '25px',
                padding: '8px 20px',
                '&:hover': { bgcolor: '#E65E1F' },
              }}
              onClick={handleCreateGroup}
            >
              Criar Grupo
            </Button>
          </Box>
        </Box>

        {/* Associar Exercícios a Grupos */}
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
            Associar Exercícios a Grupos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Selecionar Grupo</InputLabel>
              <Select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
                  '& .MuiSvgIcon-root': { color: '#E3E3E3' },
                }}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {muscleGroups.map(group => (
                  <MenuItem key={group.id} value={group.id} sx={{ fontFamily: 'Manrope', color: '#E3E3E3', bgcolor: 'rgba(60, 60, 60, 0.9)' }}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel sx={{ color: '#E3E3E3', fontFamily: 'Manrope' }}>Adicionar Exercício</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAssignExerciseToGroup(e.target.value as string)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E3E3E3',
                  fontFamily: 'Manrope',
                  borderRadius: '15px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
                  '& .MuiSvgIcon-root': { color: '#E3E3E3' },
                }}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {exercises.map(ex => (
                  <MenuItem key={ex.id} value={ex.id} sx={{ fontFamily: 'Manrope', color: '#E3E3E3', bgcolor: 'rgba(60, 60, 60, 0.9)' }}>
                    {ex.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

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
            Lista de Grupos Musculares
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {muscleGroups.length > 0 ? (
            muscleGroups.map(group => {
              const groupExercises = exercises.filter(ex => ex.muscleGroups?.includes(group.name));
              const isExpanded = expandedGroups[group.id] || false;
              const displayedExercises = isExpanded ? groupExercises : groupExercises.slice(0, 5);
              
              return (
                <Tilt key={group.id} tiltMaxAngleX={10} tiltMaxAngleY={10}>
                  <Card
                    sx={{
                      width: '100%',
                      bgcolor: 'rgba(60, 60, 60, 0.9)',
                      borderRadius: '15px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      backgroundImage: `url(${group.imageBackground})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '15px',
                      },
                      '&:hover': { boxShadow: '0 6px 25px rgba(247, 112, 49, 0.3)', border: '1px solid rgba(247, 112, 49, 0.5)' },
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1, p: 1.5, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          sx={{
                            color: '#E3E3E3',
                            fontFamily: 'Manrope',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {group.name}
                        </Typography>
                        <Box>
                          <IconButton
                            onClick={() => handleEditGroup(group)}
                            sx={{ color: '#E3E3E3', '&:hover': { color: '#F77031' }, padding: '4px' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteGroup(group.id)}
                            sx={{ color: '#E3E3E3', '&:hover': { color: '#F77031' }, padding: '4px' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          color: '#E3E3E3',
                          fontFamily: 'Manrope',
                          fontSize: '10px',
                          mt: 1,
                        }}
                      >
                        Exercícios: {displayedExercises.length > 0 ? displayedExercises.map(ex => ex.name).join(', ') : 'Nenhum'}
                      </Typography>
                      {groupExercises.length > 5 && (
                        <>
                          <Collapse in={isExpanded}>
                            <Box sx={{ mt: 1 }}>
                              {groupExercises.map((ex, index) => (
                                <Typography
                                  key={index}
                                  sx={{
                                    color: '#E3E3E3',
                                    fontFamily: 'Manrope',
                                    fontSize: '10px',
                                    pl: 1,
                                    borderLeft: '2px solid #F77031',
                                    py: 0.5,
                                  }}
                                >
                                  - {ex.name}
                                </Typography>
                              ))}
                            </Box>
                          </Collapse>
                          <Button
                            onClick={() => handleToggleExpand(group.id)}
                            sx={{
                              mt: 1,
                              color: '#F77031',
                              fontFamily: 'Manrope',
                              fontSize: '10px',
                              textTransform: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              p: 0,
                            }}
                          >
                            {isExpanded ? 'Recolher' : 'Detalhes'}
                            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Tilt>
              );
            })
          ) : (
            <Typography sx={{ color: '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
              Nenhum grupo muscular encontrado.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
    </Box>
  );
};

export default GroupManagementScreen;