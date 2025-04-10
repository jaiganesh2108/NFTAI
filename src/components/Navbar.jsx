import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { ethers } from 'ethers';
import '../styles/components.css';

const Navbar = () => {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  
  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      const signer = await provider.getSigner(); 
      setSigner(signer);

      const address = await signer.getAddress();
      setAccount(address);

      console.log("Connected address:", address);
    } catch (err) {
      console.error("Please install Metamask", err);
      alert("Please install Metamask");
    }
  };
  
  const disconnectWallet = () => {
    try {
      setProvider(null);
      setSigner(null);
      setAccount(null);
      console.log("Disconnected");
    } catch (err) {
      console.error("Failed to disconnect", err);
    }
  };

  const isWalletConnected = !!account;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">NooSphere</Link>
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/marketplace" className="navbar-link">Marketplace</Link>
          <Link to="/upload" className="navbar-link">Upload</Link>
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Button 
            variant={isWalletConnected ? "disconnect" : "secondary"}
            onClick={isWalletConnected ? disconnectWallet : connectWallet}
          >
            {isWalletConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;            