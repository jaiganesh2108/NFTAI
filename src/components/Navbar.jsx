import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import '../styles/components.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">AIChain</Link>
        <div className="navbar-links">
          <Link to="/marketplace" className="navbar-link">Marketplace</Link>
          <Link to="/upload" className="navbar-link">Upload</Link>
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Button variant="secondary">Connect Wallet</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;