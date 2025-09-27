import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../src/pages/Home';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
      
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
       
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
