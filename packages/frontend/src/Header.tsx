import React from 'react';

interface HeaderProps {
  onShowAbout: () => void;
  onShowHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout, onShowHistory }) => {
  return (
    <header>
      <h1>OpenPAD (Open Prompt Aided Design)</h1>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onShowHistory}>History</button>
        <button onClick={onShowAbout}>About</button>
      </div>
    </header>
  );
};

export default Header;
