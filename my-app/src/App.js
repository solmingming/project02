import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ButtonsPage from './pages/ButtonsPage';
import WipePage from './pages/01_WipeCanvas/WipeCanvas';
import RiverPage from './pages/03_RiverCanvas/RiverCanvas';

function App() {
  return (
    <Router>
      <Routes>
        {/* 홈 (버튼 페이지만) */}
        <Route path="/" element={<ButtonsPage />} />

        {/* WipeCanvas 전용 페이지 */}
        <Route path="/wipe" element={<WipePage />} />

        {/* RiverCanvas 전용 페이지 */}
        <Route path="/river" element={<RiverPage />} />
      </Routes>
    </Router>
  );
}

export default App;
