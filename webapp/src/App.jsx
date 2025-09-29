import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingManagement from '../src/pages/BookingManagement';

const App = () => {
  return (
        <Routes>
          <Route path="/" element={<BookingManagement />} />
        </Routes>
  );
};

export default App;
