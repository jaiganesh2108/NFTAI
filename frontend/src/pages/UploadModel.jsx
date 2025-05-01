import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ethers } from "ethers";
import '../styles/pages.css';
import axios from "axios";
import '../styles/UploadModel.css';
import ChatbotButton from '../pages/ChatbotButton';

const Upload = () => {
  const [modelFile, setModelFile] = useState(null);
  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('vision');
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [createAsNFT, setCreateAsNFT] = useState(true);
  const [network, setNetwork] = useState('ethereum');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  // Smart Contract Details
  const contractAddress = "0xAcEFD40AAE6F7AE01f75B4dD13848Eb37F2a05f7"; // Ensure deployed on Sepolia for testnet
  const abi = [ /* Same ABI as provided, omitted for brevity */ ];

  // Check wallet connection and set up MetaMask listeners
  useEffect(() => {
    console.log("Upload page mounted");
    const checkWalletConnection = async () => {
      if (!window.ethereum) {
        setErrorMessage("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log("Accounts:", accounts);
        setWalletConnected(accounts.length > 0);
        if (accounts.length === 0) {
          setErrorMessage("No wallet connected. Please connect your MetaMask wallet.");
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setErrorMessage("Failed to check wallet connection. Please refresh and try again.");
      }
    };

    checkWalletConnection();

    // Add MetaMask listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log("Accounts changed:", accounts);
        setWalletConnected(accounts.length > 0);
        setErrorMessage(accounts.length === 0 ? "Wallet disconnected. Please reconnect." : "");
      });
      window.ethereum.on('chainChanged', (chainId) => {
        console.log("Network changed:", chainId);
        checkWalletConnection();
      });
    }

    // Cleanup listeners on unmount
    return () => {
      console.log("Upload page unmounted");
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect wallet
  const toggleWalletConnection = async () => {
    if (walletConnected) {
      setWalletConnected(false);
      setErrorMessage("Wallet disconnected.");
      return;
    }

    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed. Please install it to proceed.");
      return;
    }

    try {
      console.log("Requesting wallet connection...");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setErrorMessage('');
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage("Failed to connect wallet. Please try again.");
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  // Handle drag-and-drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setModelFile(e.dataTransfer.files[0]);
      setErrorMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit button clicked, isUploading:", isUploading, "walletConnected:", walletConnected);

    if (!modelFile || !modelName || !description) {
      setErrorMessage("Please fill all required fields: model file, name, and description.");
      return;
    }

    if (!walletConnected) {
      setErrorMessage("Please connect your wallet to upload a model.");
      return;
    }

    if (createAsNFT && (!price || parseFloat(price) < 0)) {
      setErrorMessage("Please enter a valid price (0 or greater) for the NFT.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');

      // Validate environment variable
      const pinataJwt = process.env.REACT_APP_PINATA_JWT;
      if (!pinataJwt) {
        throw new Error("Pinata JWT is not configured. Please add REACT_APP_PINATA_JWT to your .env file.");
      }

      // Check network
      const provider = new ethers.BrowserProvider(window.ethereum);
      const networkInfo = await provider.getNetwork();
      const chainId = Number(networkInfo.chainId); // Convert BigInt to number
      const expectedChainId = {
        ethereum: 1, // Ethereum Mainnet
        polygon: 137, // Polygon
        sepolia: 11155111, // Sepolia Testnet
      }[network];
      console.log("Current chainId:", chainId, "Expected chainId:", expectedChainId, "Network selected:", network);
      if (chainId !== expectedChainId) {
        setErrorMessage(`Please switch to ${network === 'ethereum' ? 'Ethereum Mainnet' : network === 'polygon' ? 'Polygon' : 'Sepolia Testnet'} in MetaMask.`);
        return;
      }

      // Upload to IPFS via Pinata
      const formData = new FormData();
      formData.append("file", modelFile);
      formData.append("pinataMetadata", JSON.stringify({ name: modelName }));
      formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

      console.log("Uploading file to Pinata...");
      const fileUploadRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: `Bearer ${pinataJwt}`,
          },
        }
      ).catch(err => {
        console.error("Pinata file upload error:", err.response?.data || err.message);
        throw new Error(`Failed to upload file to IPFS: ${err.response?.data?.error || err.message}`);
      });

      const ipfsHash = fileUploadRes.data.IpfsHash;
      console.log("Model File IPFS Hash:", ipfsHash);

      // Create NFT metadata
      const nftMetadata = {
        name: modelName,
        description,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Tags", value: tags },
          { trait_type: "Visibility", value: isPublic ? "Public" : "Private" },
        ],
      };

      console.log("Uploading metadata to Pinata...");
      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        nftMetadata,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pinataJwt}`,
          },
        }
      ).catch(err => {
        console.error("Pinata metadata upload error:", err.response?.data || err.message);
        throw new Error(`Failed to upload metadata to IPFS: ${err.response?.data?.error || err.message}`);
      });

      const tokenURI = `ipfs://${metadataRes.data.IpfsHash}`;
      console.log("Token URI:", tokenURI);

      // Call smart contract
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const parsedPrice = ethers.parseUnits(price || "0", "ether");
      console.log("Calling uploadModel on contract...");
      const tx = await contract.uploadModel(
        modelName,
        description,
        ipfsHash,
        tags,
        category,
        isPublic,
        parsedPrice,
        tokenURI
      ).catch(err => {
        console.error("Contract error:", err.reason || err.message);
        throw new Error(`Smart contract error: ${err.reason || err.message}`);
      });

      console.log("Waiting for transaction confirmation...");
      await tx.wait();
      console.log("Transaction confirmed:", tx.hash);

      alert("Model uploaded successfully and minted as an NFT!");

      // Reset form
      setModelFile(null);
      setModelName('');
      setDescription('');
      setTags('');
      setCategory('vision');
      setIsPublic(true);
      setPrice('');
      setCreateAsNFT(true);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(`Upload failed: ${err.message}`);
    } finally {
      console.log("Upload complete, isUploading:", false);
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-home cosmic-background">
      <div className="upload-stars-layer"></div>
      <div className="upload-planet"></div>
      <div className="upload-shooting-star"></div>
      <div className="upload-shooting-star"></div>
      {Array(15).fill().map((_, i) => (
        <div
          key={i}
          className="upload-particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 10}s`,
          }}
        ></div>
      ))}

      <div className="upload-page">
        <Navbar walletConnected={walletConnected} toggleWalletConnection={toggleWalletConnection} />
        
        <div className="upload-container">
          <div className="upload-content">
            <h1 className="upload-title">Upload AI Model</h1>
            <p className="upload-subtitle">Share your model with the NooSphere community</p>
            
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            {!walletConnected && (
              <div className="wallet-notice">
                <p>Please connect your wallet to enable the upload button.</p>
                <button
                  type="button"
                  className="connect-wallet-button"
                  onClick={toggleWalletConnection}
                >
                  Connect Wallet
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="upload-form">
              <div 
                className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${modelFile ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pt,.h5,.onnx,.bin,.pkl,.zip"
                  className="file-input"
                />
                
                {modelFile ? (
                  <div className="file-info">
                    <div className="file-icon">📁</div>
                    <div className="file-name">{modelFile.name}</div>
                    <div className="file-size">{(modelFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">⬆️</div>
                    <p>Drag and drop your model file here</p>
                    <p className="upload-formats">Supported formats: PyTorch (.pt), TensorFlow (.h5), ONNX (.onnx), zip</p>
                    <button type="button" className="browse-button">Browse Files</button>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="modelName">Model Name*</label>
                <input
                  type="text"
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="form-input"
                  required
                  placeholder="Give your model a descriptive name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  required
                  placeholder="Describe what your model does, its architecture, and any special features"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="form-input"
                    placeholder="image-generation, stable-diffusion, etc."
                  />
                  <small>Comma-separated tags to help others find your model</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="vision">Vision</option>
                    <option value="nlp">Natural Language Processing</option>
                    <option value="audio">Audio</option>
                    <option value="multimodal">Multimodal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="label-block">NFT Creation</label>
                <div className="toggle-options">
                  <button 
                    type="button" 
                    className={`toggle-button ${createAsNFT ? 'active' : ''}`}
                    onClick={() => setCreateAsNFT(true)}
                  >
                    Create as NFT
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-button ${!createAsNFT ? 'active' : ''}`}
                    onClick={() => setCreateAsNFT(false)}
                  >
                    Standard Upload
                  </button>
                </div>
                <small>{createAsNFT ? 'Your model will be minted as an NFT on the blockchain' : 'Standard upload without NFT minting'}</small>
              </div>
              
              {createAsNFT && (
                <div className="form-group">
                  <label htmlFor="network">Blockchain Network</label>
                  <select
                    id="network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="form-select"
                  >
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="polygon">Polygon</option>
                    <option value="sepolia">Sepolia Testnet</option>
                  </select>
                  <small>Choose the blockchain network for your NFT</small>
                </div>
              )}
              
              <div className="form-group">
                <label className="label-block">Accessibility</label>
                <div className="toggle-options">
                  <button 
                    type="button" 
                    className={`toggle-button ${isPublic ? 'active' : ''}`}
                    onClick={() => setIsPublic(true)}
                  >
                    Public
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-button ${!isPublic ? 'active' : ''}`}
                    onClick={() => setIsPublic(false)}
                  >
                    Private
                  </button>
                </div>
                <small>{isPublic ? 'Your model will be available to everyone' : 'Access will be restricted based on your settings'}</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price (in ETH)</label>
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    min="0"
                    step="0.000000001"
                    placeholder="0"
                  />
                  <span className="token-suffix">ETH</span>
                </div>
                <small>Leave empty for free access</small>
              </div>
              
              <button
                type="submit"
                className="submit-button"
                disabled={isUploading || !walletConnected}
                onClick={() => console.log("Submit button clicked, disabled:", isUploading || !walletConnected)}
              >
                {isUploading ? "Uploading..." : (createAsNFT ? "Upload & Mint NFT" : "Upload Model")}
              </button>
            </form>
          </div>
          
          <div className="upload-footer">
            <p>By uploading a model, you agree to AIChain's <a href="/terms">Terms of Service</a> and <a href="/guidelines">Community Guidelines</a>.</p>
          </div>
        </div>
      </div>
      <ChatbotButton onClick={() => alert('Open chatbot modal here!')} />
    </div>
  );
};

export default Upload;