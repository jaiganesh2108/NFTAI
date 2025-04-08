import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
<<<<<<< HEAD
import '../styles/components.css';

const Navbar = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletClick = () => {
    setIsWalletConnected(!isWalletConnected);
  };
=======
import { BrowserProvider, ethers } from 'ethers';
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
>>>>>>> 53dd81b5e6b1ca4321813c483c6da7d906c791de

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
