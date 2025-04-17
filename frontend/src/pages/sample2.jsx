import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import image1 from '../assets/images/imgg1.jpg';
import image3 from '../assets/images/imgg3.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image5 from '../assets/images/img5.jpg';
import image6 from '../assets/images/img6.jpg';
import image13 from '../assets/images/img13.jpg';
import image12 from '../assets/images/img12.jpg';
import { 
  Search, Filter, Star, Users, TrendingUp, Plus, 
  ShoppingCart, Play, PlusCircle, Lock, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import "../styles/MarketPlace.css";
import ChatbotButton from '../pages/ChatbotButton.jsx';

const Marketplace = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReputation, setSelectedReputation] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedModel, setExpandedModel] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'error'

  const categories = ['All', 'Text Generation', 'Image Recognition', 'Audio Processing', 'Data Analysis'];
  const reputations = ['All', 'High', 'Medium', 'Low'];
  const allTags = ['GPT', 'Text', 'Generative', 'Vision', 'Recognition', 'CNN', 'Audio', 'Speech', 'Analytics', 'Prediction', 'ML'];

  // Contract information - NFT Contract
  const contractAddress = "0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19";
  const abi = [
    // Uploading models
    {
      "inputs": [
        {"internalType": "string", "name": "_name", "type": "string"},
        {"internalType": "string", "name": "_description", "type": "string"},
        {"internalType": "string", "name": "_ipfsHash", "type": "string"},
        {"internalType": "string", "name": "_tags", "type": "string"},
        {"internalType": "string", "name": "_category", "type": "string"},
        {"internalType": "bool", "name": "_isPublic", "type": "bool"},
        {"internalType": "uint256", "name": "_price", "type": "uint256"},
        {"internalType": "string", "name": "_tokenURI", "type": "string"}
      ],
      "name": "uploadModel",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // Buy model
    {
      "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
      "name": "buyModel",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    // Get all models
    {
      "inputs": [],
      "name": "getAllModels",
      "outputs": [
        {
          "components": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "string", "name": "ipfsHash", "type": "string"},
            {"internalType": "string", "name": "tags", "type": "string"},
            {"internalType": "string", "name": "category", "type": "string"},
            {"internalType": "bool", "name": "isPublic", "type": "bool"},
            {"internalType": "uint256", "name": "price", "type": "uint256"},
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "bool", "name": "forSale", "type": "bool"}
          ],
          "internalType": "struct AIModelNFT.Model[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // Get models by tokenId
    {
      "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "name": "models",
      "outputs": [
        {"internalType": "string", "name": "name", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "string", "name": "ipfsHash", "type": "string"},
        {"internalType": "string", "name": "tags", "type": "string"},
        {"internalType": "string", "name": "category", "type": "string"},
        {"internalType": "bool", "name": "isPublic", "type": "bool"},
        {"internalType": "uint256", "name": "price", "type": "uint256"},
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "bool", "name": "forSale", "type": "bool"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    // Events
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
        {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
        {"indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string"},
        {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
      ],
      "name": "ModelUploaded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
        {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
        {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"},
        {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
      ],
      "name": "ModelSold",
      "type": "event"
    }
  ];

  // Helper function to get a random image for models
  const getRandomImage = () => {
    const images = [image1, image2, image3, image4, image5, image6, image12, image13];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Helper to generate random reputation
  const getRandomReputation = () => {
    const reputations = ['High', 'Medium', 'Low'];
    const weights = [0.7, 0.2, 0.1]; // 70% chance for High, 20% for Medium, 10% for Low
    
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) return reputations[i];
    }
    return reputations[0];
  };

  // Function to convert blockchain model to UI model
  const transformBlockchainModel = (model, index) => {
    // Parse tags from comma-separated string to array
    const tagsArray = model.tags ? model.tags.split(',').map(tag => tag.trim()) : [];
    
    // Generate random values for UI display
    const randomRating = (4 + Math.random()).toFixed(1);
    const randomReviews = Math.floor(Math.random() * 300) + 1;
    const randomUsage = `${(Math.random() * 15).toFixed(1)}k`;
    const isTrending = Math.random() > 0.7; // 30% chance of being trending
    const isNew = Number(model.timestamp) > (Date.now() / 1000 - 7 * 24 * 60 * 60); // New if less than a week old
    
    // Format price (convert from wei to ETH)
    const priceInEth = parseFloat(ethers.formatEther(model.price.toString()));
    const priceInDollars = Math.floor(priceInEth * 200); // Assuming 1 ETH = $200 for simplicity
    
    return {
      id: index + 1,
      tokenId: index + 1, // Store the token ID for purchase
      name: model.name,
      category: model.category || "Text Generation", // Default if missing
      tags: tagsArray.length > 0 ? tagsArray : allTags.slice(0, 3 + Math.floor(Math.random() * 4)),
      description: model.description,
      price: priceInDollars || 299, // Default price if 0
      priceInEth: priceInEth,
      rawPrice: model.price, // Store the raw price for transactions
      previousPrice: priceInDollars < 400 ? priceInDollars + 50 : priceInDollars, // Create a "discount" effect
      rating: parseFloat(randomRating),
      reviewCount: randomReviews,
      usageCount: randomUsage,
      trending: isTrending,
      new: isNew,
      reputation: getRandomReputation(),
      image: getRandomImage(),
      isNFT: true, // All models are NFTs
      blockchain: Math.random() > 0.5 ? "Ethereum" : "Polygon",
      owner: model.owner,
      formattedOwner: `${model.owner.substring(0, 6)}...${model.owner.substring(model.owner.length - 4)}`,
      ipfsHash: model.ipfsHash,
      forSale: model.forSale
    };
  };

  // Function to show status modal
  const showStatus = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setShowStatusModal(true);
    
    // Hide after 5 seconds
    setTimeout(() => {
      setShowStatusModal(false);
    }, 5000);
  };

  // Fetch models from blockchain
  const fetchModels = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        // Get models from blockchain
        const blockchainModels = await contract.getAllModels();
        
        // Transform models for UI
        const formattedModels = blockchainModels.map(transformBlockchainModel);
        
        // If blockchain returned models, use them; otherwise fall back to default models
        if (formattedModels.length > 0) {
          setModels(formattedModels);
        } else {
          setDefaultModels();
        }
      } else {
        console.log("Ethereum provider not found, using default models");
        setDefaultModels();
      }
    } catch (err) {
      console.error("Error fetching models:", err);
      setDefaultModels();
    } finally {
      setLoading(false);
    }
  };

  // Set default models when blockchain fetch fails or returns empty
  const setDefaultModels = () => {
    setModels([
      { id: 1, tokenId: 1, name: "NeuralText Pro", category: "Text Generation", tags: ["GPT", "Text", "Generative"], description: "Advanced language model for creative writing and content generation with support for multiple languages.", price: 299, priceInEth: 1.5, rawPrice: ethers.parseEther("1.5"), previousPrice: 349, rating: 4.8, reviewCount: 256, usageCount: "13.2k", trending: true, new: false, reputation: "High", image: image5, isNFT: true, blockchain: "Ethereum", owner: "0x1234abcd5678efgh9012ijkl", formattedOwner: "0x1234...ijkl", ipfsHash: "QmXa7NRFCKuDWKWyBRWdvyAhCKkm877LBfP8jewWWt6JZe", forSale: true },
      { id: 2, tokenId: 2, name: "VisionAI Studio", category: "Image Recognition", tags: ["Vision", "Recognition", "CNN"], description: "State-of-the-art computer vision model for object detection, image classification, and scene understanding.", price: 499, priceInEth: 2.5, rawPrice: ethers.parseEther("2.5"), previousPrice: 499, rating: 4.6, reviewCount: 183, usageCount: "8.7k", trending: true, new: true, reputation: "High", image: image6, isNFT: true, blockchain: "Polygon", owner: "0x5678efgh9012ijkl3456mnop", formattedOwner: "0x5678...mnop", ipfsHash: "QmYbT7uDrQzJGtWQR3LswyJ5oKvDcXUHqFRmFpSQ5uBLje", forSale: true },
      { id: 3, tokenId: 3, name: "SynthWave Audio", category: "Audio Processing", tags: ["Audio", "Speech", "Generation"], description: "Audio generation and processing system for creating realistic speech, music, and sound effects.", price: 199, priceInEth: 1.0, rawPrice: ethers.parseEther("1.0"), previousPrice: 249, rating: 4.3, reviewCount: 127, usageCount: "5.4k", trending: false, new: true, reputation: "Medium", image: image13, isNFT: true, blockchain: "Polygon", owner: "0x9012ijkl3456mnop7890qrst", formattedOwner: "0x9012...qrst", ipfsHash: "QmTzF5LxiNmYJKYeRDkiXQbtRMGxY5HBstN6NCUgK3WZHb", forSale: true },
      { id: 4, tokenId: 4, name: "DataMiner Pro", category: "Data Analysis", tags: ["Analytics", "Prediction", "ML"], description: "Machine learning model for advanced data analytics, pattern recognition, and predictive modeling.", price: 399, priceInEth: 2.0, rawPrice: ethers.parseEther("2.0"), previousPrice: 399, rating: 4.5, reviewCount: 164, usageCount: "7.1k", trending: false, new: false, reputation: "High", image: image12, isNFT: true, blockchain: "Ethereum", owner: "0x3456mnop7890qrst1234abcd", formattedOwner: "0x3456...abcd", ipfsHash: "QmVbNnMuJBYDyFBr3SXs5nGYJMWVdM6Jh4TG8yYgVNDRXe", forSale: true },
    ]);
  };

  // Fetch models when component mounts
  useEffect(() => {
    fetchModels();
    
    // Check if wallet is connected
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsWalletConnected(accounts.length > 0);
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, []);

  // Filter models based on selected filters
  const filteredModels = models.filter(model => {
    if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !model.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCategory !== 'All' && model.category !== selectedCategory) return false;
    if (selectedReputation !== 'All' && model.reputation !== selectedReputation) return false;
    if (model.price < priceRange[0] || model.price > priceRange[1]) return false;
    if (selectedTags.length > 0 && !selectedTags.some(tag => model.tags.includes(tag))) return false;
    if (activeTab === 'trending' && !model.trending) return false;
    if (activeTab === 'new' && !model.new) return false;
    if (activeTab === 'high-reputation' && model.reputation !== 'High') return false;
    return true;
  });

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
        setWalletAddress(accounts[0]);
        showStatus('Wallet connected successfully!', 'success');
      } else {
        showStatus("Please install MetaMask or another Ethereum wallet provider.", 'error');
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      showStatus("Failed to connect wallet: " + (error.message || "Unknown error"), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedReputation('All');
    setPriceRange([0, 500]);
    setSelectedTags([]);
    setActiveTab('all');
    setExpandedModel(null);
  };

  const handleBuy = async (model) => {
    if (!isWalletConnected) {
      showStatus("Please connect your wallet to purchase this model.", 'error');
      return;
    }
    
    // Check if the model is already owned by the user
    if (model.owner.toLowerCase() === walletAddress.toLowerCase()) {
      showStatus("You already own this model!", 'info');
      return;
    }
    
    // Check if the model is for sale
    if (!model.forSale) {
      showStatus("This model is not currently for sale.", 'error');
      return;
    }
    
    setPurchaseLoading(true);
    setTxStatus('pending');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      // Call the buyModel function with the appropriate amount of ETH
      const tx = await contract.buyModel(model.tokenId, {
        value: model.rawPrice
      });
      
      setTxHash(tx.hash);
      showStatus(`Transaction submitted! Please wait for confirmation...`, 'info');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Update the model in the UI
      setModels(prevModels => prevModels.map(m => {
        if (m.id === model.id) {
          return {
            ...m,
            owner: walletAddress,
            formattedOwner: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
            forSale: false
          };
        }
        return m;
      }));
      
      setTxStatus('success');
      showStatus(`Congratulations! You've successfully purchased ${model.name}!`, 'success');
      
    } catch (error) {
      console.error("Error buying model:", error);
      setTxStatus('failed');
      showStatus(`Transaction failed: ${error.message || "Unknown error"}`, 'error');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleDemo = (model) => {
    showStatus(`Opening demo dashboard for ${model.name}...`, 'info');
  };

  const handleAddToWorkflow = (model) => {
    if (!isWalletConnected) {
      showStatus("Please connect your wallet to add this model to your workflow.", 'error');
      return;
    }
    showStatus(`${model.name} added to your workflow!`, 'success');
  };

  // Status Modal Component
  const StatusModal = () => {
    if (!showStatusModal) return null;
    
    return (
      <div className="status-modal glass-effect">
        <div className={`status-content ${statusType}`}>
          {statusType === 'info' && <AlertCircle className="status-icon" />}
          {statusType === 'success' && <div className="checkmark">✓</div>}
          {statusType === 'error' && <div className="error-mark">✗</div>}
          <p>{statusMessage}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="marketplace-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <Navbar />
      
      <header className="marketplace-header">
        <div className="header-content">
          <h1>AI Model Marketplace</h1>
        </div>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search AI models by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search models"
          />
        </div>
        <div className="wallet-connection">
          <button 
            className={`wallet-button ${isWalletConnected ? 'connected' : ''}`}
            onClick={connectWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : (isWalletConnected ? 
              `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 
              'Connect Wallet')}
          </button>
        </div>
      </header>

      <main className="marketplace-main">
        <aside className="sidebar glass-effect">
          <h2><Filter className="mr-2 h-5 w-5" /> Filters</h2>
          <div className="filter-section">
            <h3>Category</h3>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Select category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="filter-section">
            <h3>Tags</h3>
            <div className="tags-container">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <h3>Reputation</h3>
            <select 
              value={selectedReputation}
              onChange={(e) => setSelectedReputation(e.target.value)}
              aria-label="Select reputation"
            >
              {reputations.map(rep => (
                <option key={rep} value={rep}>{rep}</option>
              ))}
            </select>
          </div>
          <div className="filter-section">
            <h3>Price Range</h3>
            <div>
              <label>Min: ${priceRange[0]}</label>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                aria-label="Minimum price"
              />
            </div>
            <div>
              <label>Max: ${priceRange[1]}</label>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                aria-label="Maximum price"
              />
            </div>
          </div>
          <button className="reset-filters-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </aside>

        <section className="models-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`} 
              onClick={() => setActiveTab('all')}
              aria-label="All models"
            >
              All Models
            </button>
            <button 
              className={`tab ${activeTab === 'trending' ? 'active' : ''}`} 
              onClick={() => setActiveTab('trending')}
              aria-label="Trending models"
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Trending
            </button>
            <button 
              className={`tab ${activeTab === 'new' ? 'active' : ''}`} 
              onClick={() => setActiveTab('new')}
              aria-label="New models"
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </button>
            <button 
              className={`tab ${activeTab === 'high-reputation' ? 'active' : ''}`} 
              onClick={() => setActiveTab('high-reputation')}
              aria-label="High reputation models"
            >
              <Star className="mr-2 h-4 w-4" /> High Reputation
            </button>
          </div>

          <div className="models-grid">
            {loading ? (
              <div className="loading-state glass-effect">
                <p>Loading models from blockchain...</p>
              </div>
            ) : filteredModels.length > 0 ? (
              filteredModels.map(model => (
                <div key={model.id} className="model-card glass-effect">
                  <div className="model-image-container">
                    <img src={model.image} alt={model.name} className="model-image" />
                    <div className="model-badge">
                      {model.trending && <span className="badge trending">Trending</span>}
                      {model.new && <span className="badge new">New</span>}
                      {model.isNFT && (
                        <span className="badge nft" title={`NFT on ${model.blockchain}`}>
                          <Lock className="mr-1 h-3 w-3" /> NFT
                        </span>
                      )}
                      {walletAddress && model.owner && walletAddress.toLowerCase() === model.owner.toLowerCase() && (
                        <span className="badge owned">Owned</span>
                      )}
                    </div>
                  </div>
                  <div className="model-content">
                    <div className="model-header">
                      <h3 className="model-title">{model.name}</h3>
                      <div className="model-rating">
                        <Star className="star-icon h-4 w-4" />
                        <span>{model.rating} ({model.reviewCount})</span>
                      </div>
                    </div>
                    <p className="model-category">{model.category}</p>
                    <p className="model-description">{model.description}</p>
                    <div className="model-price-container">
                      <span className="model-price">${model.price}</span>
                      {model.previousPrice > model.price && (
                        <span className="model-original-price">${model.previousPrice}</span>
                      )}
                      <span className="model-eth-price">({model.priceInEth} ETH)</span>
                    </div>
                    <button 
                      className="view-details-button"
                      onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                      aria-expanded={expandedModel === model.id}
                    >
                      {expandedModel === model.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                  {expandedModel === model.id && (
                    <div className="expanded-view glass-effect">
                      <div className="expanded-section">
                        <h4>Tags</h4>
                        <div className="tags-container">
                          {model.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="expanded-section">
                        <h4>Creator/Owner</h4>
                        <p>{model.formattedOwner}</p>
                      </div>
                      {model.isNFT && (
                        <div className="expanded-section">
                          <h4>Web3 Details</h4>
                          <p>Blockchain: {model.blockchain}</p>
                          <p>Status: {model.forSale ? 'For Sale' : 'Not For Sale'}</p>
                        </div>
                      )}
                      {model.ipfsHash && (
                        <div className="expanded-section">
                          <h4>IPFS Hash</h4>
                          <p>{model.ipfs