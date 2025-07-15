import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import GlobalHeader from './GlobalHeader';

const Layout = ({ onLogoClick, isSettingsOpen, closeSettings }) => {
  return (
    <div>
      <GlobalHeader onLogoClick={onLogoClick} />
      <main>
        <Outlet context={{ isSettingsOpen, closeSettings }} />
      </main>
    </div>
  );
};

export default Layout;