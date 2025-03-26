// src/components/WorkoutFilters.tsx
import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface WorkoutFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  accessibilityMode: boolean;
}

const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  accessibilityMode,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 3, mb: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <TextField
        label="Buscar Treinos"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: <SearchIcon sx={{ color: accessibilityMode ? '#000000' : '#E3E3E3' }} />,
        }}
        sx={{
          width: { xs: '100%', sm: 300 },
          '& .MuiOutlinedInput-root': {
            bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(42, 42, 42, 0.8)',
            color: accessibilityMode ? '#000000' : '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: '14px',
            borderRadius: '15px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          '& .MuiInputLabel-root': { color: accessibilityMode ? '#000000' : '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
        }}
        aria-label="Buscar treinos"
      />
      <FormControl sx={{ width: { xs: '100%', sm: 200 } }}>
        <InputLabel sx={{ color: accessibilityMode ? '#000000' : '#E3E3E3', fontFamily: 'Manrope', fontSize: '14px' }}>
          Filtrar por Grupo Muscular
        </InputLabel>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          label="Filtrar por Grupo Muscular"
          sx={{
            bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)', // Fundo mais claro para melhor legibilidade
            color: accessibilityMode ? '#000000' : '#E3E3E3',
            fontFamily: 'Manrope',
            fontSize: '14px',
            borderRadius: '15px',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F77031' },
            '& .MuiSvgIcon-root': { color: accessibilityMode ? '#000000' : '#E3E3E3' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: accessibilityMode ? '#FFFFFF' : 'rgba(30, 26, 26, 0.9)', // Fundo do dropdown ajustado
                color: accessibilityMode ? '#000000' : '#E3E3E3',
              },
            },
          }}
          aria-label="Filtrar por grupo muscular"
        >
          <MenuItem value="" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Todos</MenuItem>
          <MenuItem value="Peito" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Peito</MenuItem>
          <MenuItem value="Costas" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Costas</MenuItem>
          <MenuItem value="Pernas" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Pernas</MenuItem>
          <MenuItem value="Braços" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Braços</MenuItem>
          <MenuItem value="Core" sx={{ fontFamily: 'Manrope', color: accessibilityMode ? '#000000' : '#E3E3E3' }}>Core</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default WorkoutFilters;