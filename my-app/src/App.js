import { React, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BouncingPage from './pages/00_Bouncing/BouncingPage';
import Wipe from './pages/01_WipeCanvas/WipeCanvas';
import GrassArt from './pages/02_GrassArtCanvas/GrassArt';
import River from './pages/03_RiverCanvas/RiverCanvas';
import Layout from './components/Layout';
import { audioUnlocker } from './AudioUnlocker';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
  };

  const bouncingPageElement = <BouncingPage isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={bouncingPageElement} />

        <Route element={<Layout onLogoClick={toggleSettings} isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />}>
          <Route path="/bouncing" element={bouncingPageElement} />
          <Route path="/wipe" element={<Wipe />} />
          <Route path="/grass-art" element={<GrassArt />} />
          <Route path="/river" element={<River />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;