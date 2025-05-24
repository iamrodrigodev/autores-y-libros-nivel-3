import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/App.css';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;