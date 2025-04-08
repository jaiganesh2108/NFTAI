import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { ethers ,Contract} from "ethers"
import '../styles/components.css';

const Navbar = () => {
  const [signer,setSigner]=useState(null)
  const [provider,setprovider]=useState(null)
  const [contract,setContract]=useState(null)
  const [account,setAccount]=useState(null)

  const contractAddress=""
  const contractAbi=[]

  useEffect(()=>{
    const connectWallet=async()=>{
      try{
        const provider=new ethers.BrowserPrivider(window.ethereum)
        setprovider(provider)

        const signer=await provider.getSigner();
        setSigner(signer)

        const address=await signer.getAddress();
        setAccount(address);

        console.log("address is :",address)
        
        const contract=new Contract(contractAddress,contractAbi,signer)
        setContract(contrat)

      }

      catch(err){
        console.log("Please install metamask",err)
        alert("Please install metamsk")
    }
    }
    connectWallet();
  },[])


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