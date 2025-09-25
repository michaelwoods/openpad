import React from 'react';

interface HeaderProps {
  onShowAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAbout }) => {
  return (
    <header>
      <h1>OpenPAD (Open Prompt Aided Design)</h1>
      <button onClick={onShowAbout}>About</button>
    </header>
  );
};

export default Header;
