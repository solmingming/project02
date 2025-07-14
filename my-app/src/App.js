import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/00_Landing/LandingPage';
import GrassArt     from './pages/02_GrassArtCanvas/GrassArt';
import FlowerPage   from './pages/03_FlowerPage/FlowerPage';

import ButtonsPage  from './pages/ButtonsPage';
import WipePage     from './pages/01_WipeCanvas/WipeCanvas';
import RiverPage    from './pages/03_RiverCanvas/RiverCanvas';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing / 홈 */}
        <Route path="/" element={<LandingPage />} />

        {/* GrassArt / FlowerPage */}
        <Route path="/grass-art"     element={<GrassArt />} />
        <Route path="/flower-page"   element={<FlowerPage />} />

        {/* Buttons / Wipe / River */}
        <Route path="/buttons" element={<ButtonsPage />} />
        <Route path="/wipe"    element={<WipePage />} />
        <Route path="/river"   element={<RiverPage />} />
      </Routes>
    </Router>
  );
}

export default App;
