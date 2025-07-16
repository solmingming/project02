import { React, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BouncingPage from './pages/00_Bouncing/BouncingPage';
import Wipe from './pages/01_WipeCanvas/WipeCanvas';
import GrassArt from './pages/02_GrassArtCanvas/GrassArt';
import River from './pages/03_RiverCanvas/RiverCanvas';
import Universe from './pages/04_Universe/UniversePage';
import Layout from './components/Layout';
import { AuthProvider } from './AuthContext';
import AccountController from './components/AccountController';
import AudioUnlocker from './AudioUnlocker';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <AccountController />

        <Routes>
          <Route path="/" element={<BouncingPage />} />

          <Route element={<Layout onLogoClick={toggleSettings} isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />}>
            <Route path="/bouncing" element={<BouncingPage isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />} />
            <Route path="/wipe" element={<Wipe isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />} />
            <Route path="/grass-art" element={<GrassArt isSettingsOpen={isSettingsOpen} closeSettings={toggleSettings} />} />
            <Route path="/river" element={<River />} />
            <Route path="/universe" element={<Universe />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;