import React from 'react';
import { TrialProvider } from './context/TrialContext';
import AppRouter from './router';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TrialProvider>
          <AppRouter />
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
