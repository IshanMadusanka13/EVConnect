import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingManagement from '../src/pages/BookingManagement';
import StationManagement from './pages/StationManagement';

const App = () => {
  return (
        <Routes>
          <Route path="/booking" element={<BookingManagement />} />
          <Route path="/station" element={<StationManagement />} />
        </Routes>
  );
};

export default App;
