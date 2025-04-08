import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import '../styles/components.css';

const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletClick = () => {
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">AIChain</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/marketplace" className="navbar-link">Marketplace</Link>
          <Link to="/upload" className="navbar-link">Upload</Link>
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Button 
            variant={isWalletConnected ? "disconnect" : "secondary"}
            onClick={handleWalletClick}
          >
            {isWalletConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;