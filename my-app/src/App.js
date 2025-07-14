import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/00_Landing/LandingPage';
import Wipe from './pages/01_WipeCanvas/WipeCanvas';
import GrassArt from './pages/02_GrassArtCanvas/GrassArt';
import River from './pages/03_RiverCanvas/RiverCanvas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/wipe" element={<Wipe />} />
        <Route path="/grass-art" element={<GrassArt />} />
        <Route path="/river" element={<River />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;