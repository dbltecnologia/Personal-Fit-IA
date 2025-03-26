import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel } from '@mui/material';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(''); // 'personal' or 'student'
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false); // Show welcome screen after registration

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Erro ao logar');
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword || !role) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        phone,
        email,
        role,
        trainerId: role === 'student' ? '' : null, // Students will need a trainerId later
        workoutIds: [],
      });

      setShowWelcome(true); // Show welcome screen after registration
    } catch (err) {
      setError('Erro ao registrar');
    }
  };

  const handleWelcomeFinish = () => {
    setShowWelcome(false);
    navigate('/'); // Redirect to home after welcome screen
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
    setRole('');
  };

  if (showWelcome) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
        <Box sx={{ width: 400, p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" align="center" color="#16a34a" gutterBottom>
            Bem-vindo ao Muscle Minds!
          </Typography>
          <Typography align="center" sx={{ mb: 3 }}>
            Siga os passos para começar sua jornada.
          </Typography>
          <Stepper activeStep={-1} orientation="vertical">
            <Step>
              <StepLabel>Configure seu perfil</StepLabel>
            </Step>
            <Step>
              <StepLabel>Escolha seus treinos</StepLabel>
            </Step>
            <Step>
              <StepLabel>Comece a treinar</StepLabel>
            </Step>
          </Stepper>
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, bgcolor: '#16a34a', '&:hover': { bgcolor: '#13863b' } }}
            onClick={handleWelcomeFinish}
          >
            Continuar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundImage: 'url(assets/logo.png)', 
        backgroundSize: 'cover'
      }}>
      <Box sx={{ 
          width: 300, 
          p: 4, 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: 2, 
          boxShadow: 3 
        }}>
        <Typography variant="h4" align="center" color="#16a34a" gutterBottom>
          Muscle Minds
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          {isRegistering ? 'Registrar' : 'Login'}
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}

        {isRegistering ? (
          <>
            <TextField
              label="Nome"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Telefone"
              variant="outlined"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirme a Senha"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Você é</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as string)}
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="personal">Personal Trainer</MenuItem>
                <MenuItem value="student">Aluno</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#13863b' } }}
              onClick={handleRegister}
            >
              Registrar
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1, color: '#16a34a' }}
              onClick={toggleForm}
            >
              Já tem uma conta? Faça login
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#13863b' } }}
              onClick={handleLogin}
            >
              Entrar
            </Button>
            <Button
              variant="text"
              fullWidth
              sx={{ mt: 1, color: '#16a34a' }}
              onClick={toggleForm}
            >
              Não tem uma conta? Registre-se
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default LoginScreen;