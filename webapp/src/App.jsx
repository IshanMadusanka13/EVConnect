import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingManagement from '../src/pages/BookingManagement';
import StationManagement from './pages/StationManagement';
import EVOwnerManagement from './pages/EVOwnerManagement';

const App = () => {
  return (
        <Routes>
          <Route path="/booking" element={<BookingManagement />} />
          <Route path="/station" element={<StationManagement />} />
          <Route path="/ev-owners" element={<EVOwnerManagement />} />
        </Routes>
  );
};

export default App;
