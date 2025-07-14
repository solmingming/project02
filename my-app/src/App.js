import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/00_Landing/LandingPage';
import GrassArt from './pages/02_GrassArtCanvas/GrassArt';
import FlowerPage from './pages/03_FlowerPage/FlowerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/grass-art" element={<GrassArt />} />
        <Route path="/flower-page" element={<FlowerPage />} />
      </Routes>
    </Router>
  );
}

export default App;



