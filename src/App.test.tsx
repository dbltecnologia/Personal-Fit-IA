// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

test('renders Muscle Minds app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Muscle Minds/i);
  expect(titleElement).toBeInTheDocument();
});