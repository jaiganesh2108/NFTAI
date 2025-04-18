import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
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
  ShoppingCart, Play, PlusCircle, Lock
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import '../styles/Marketplace.css';
import ChatbotButton from '../pages/ChatbotButton.jsx';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Marketplace = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedModels, setRecommendedModels] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReputation, setSelectedReputation] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedModel, setExpandedModel] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const categories = ['All', 'Text Generation', 'Image Recognition', 'Audio Processing', 'Data Analysis'];
  const reputations = ['All', 'High', 'Medium', 'Low'];
  const allTags = ['GPT', 'Text', 'Generative', 'Vision', 'Recognition', 'CNN', 'Audio', 'Speech', 'Analytics', 'Prediction', 'ML'];

  const contractAddress = '0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19';
  const abi = [
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'uint256', name: 'modelId', type: 'uint256' },
        { indexed: false, internalType: 'string', name: 'name', type: 'string' },
        { indexed: false, internalType: 'string', name: 'ipfsHash', type: 'string' },
        { indexed: true, internalType: 'address', name: 'uploader', type: 'address' },
      ],
      name: 'ModelUploaded',
      type: 'event',
    },
    {
      inputs: [
        { internalType: 'string', name: '_name', type: 'string' },
        { internalType: 'string', name: '_description', type: 'string' },
        { internalType: 'string', name: '_ipfsHash', type: 'string' },
        { internalType: 'string', name: '_tags', type: 'string' },
        { internalType: 'string', name: '_category', type: 'string' },
        { internalType: 'bool', name: '_isPublic', type: 'bool' },
        { internalType: 'uint256', name: '_price', type: 'uint256' },
      ],
      name: 'uploadModel',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getAllModels',
      outputs: [
        {
          components: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'description', type: 'string' },
            { internalType: 'string', name: 'ipfsHash', type: 'string' },
            { internalType: 'string', name: 'tags', type: 'string' },
            { internalType: 'string', name: 'category', type: 'string' },
            { internalType: 'bool', name: 'isPublic', type: 'bool' },
            { internalType: 'uint256', name: 'price', type: 'uint256' },
            { internalType: 'address', name: 'uploader', type: 'address' },
            { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          ],
          internalType: 'struct AIModelRegistry.Model[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const getRandomImage = () => {
    const images = [image1, image2, image3, image4, image5, image6, image12, image13];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getRandomReputation = () => {
    const reputations = ['High', 'Medium', 'Low'];
    const weights = [0.7, 0.2, 0.1];
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) return reputations[i];
    }
    return reputations[0];
  };

  const transformBlockchainModel = (model, index) => {
    const tagsArray = model.tags ? model.tags.split(',').map(tag => tag.trim()) : [];
    const randomRating = (4 + Math.random()).toFixed(1);
    const randomReviews = Math.floor(Math.random() * 300) + 1;
    const randomUsage = `${(Math.random() * 15).toFixed(1)}k`;
    const isTrending = Math.random() > 0.7;
    const isNew = Number(model.timestamp) > (Date.now() / 1000 - 7 * 24 * 60 * 60);
    const priceInEth = parseFloat(ethers.formatEther(model.price.toString()));
    const priceInDollars = Math.floor(priceInEth * 200);
    const isNFT = !model.isPublic;
    const blockchain = isNFT ? (Math.random() > 0.5 ? 'Ethereum' : 'Polygon') : null;

    return {
      id: index + 1,
      name: model.name,
      category: model.category || 'Text Generation',
      tags: tagsArray.length > 0 ? tagsArray : allTags.slice(0, 3 + Math.floor(Math.random() * 4)),
      description: model.description,
      price: priceInDollars || 299,
      previousPrice: priceInDollars < 400 ? priceInDollars + 50 : priceInDollars,
      rating: parseFloat(randomRating),
      reviewCount: randomReviews,
      usageCount: randomUsage,
      trending: isTrending,
      new: isNew,
      reputation: getRandomReputation(),
      image: getRandomImage(),
      isNFT,
      blockchain,
      owner: model.uploader ? `${model.uploader.substring(0, 6)}...${model.uploader.substring(model.uploader.length - 4)}` : null,
      ipfsHash: model.ipfsHash,
      uploader: model.uploader,
    };
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        console.error('Ethereum provider not found');
        setModels([]);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const blockchainModels = await contract.getAllModels();
      const formattedModels = blockchainModels.map(transformBlockchainModel);
      setModels(formattedModels);

      // Sync with FastAPI backend
      await fetch('http://localhost:8000/sync_models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: formattedModels }),
      });

      // Listen for new model uploads
      contract.on('ModelUploaded', async (modelId, name, ipfsHash, uploader) => {
        const newModel = {
          name,
          description: 'Newly uploaded model',
          ipfsHash,
          tags: '',
          category: 'Unknown',
          isPublic: false,
          price: ethers.parseEther('0'),
          uploader,
          timestamp: Math.floor(Date.now() / 1000),
        };
        const transformedModel = transformBlockchainModel(newModel, models.length);
        setModels(prev => [...prev, transformedModel]);

        // Sync new model with backend
        await fetch('http://localhost:8000/sync_models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ models: [transformedModel] }),
        });
      });
    } catch (err) {
      console.error('Error fetching models:', err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const logInteraction = async (modelId, interactionType, searchTerm = null) => {
    if (!isWalletConnected || !userAddress) return;
    try {
      const response = await fetch('http://localhost:8000/log_interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          model_id: modelId,
          interaction_type: interactionType,
          search_term: interactionType === 'search' ? searchTerm : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`Logged ${interactionType} for model ${modelId}${searchTerm ? ` with search term "${searchTerm}"` : ''}`);
    } catch (error) {
      console.error(`Error logging ${interactionType}:`, error);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    if (!isWalletConnected || !userAddress) {
      setRecommendedModels([]);
      setLoadingRecommendations(false);
      return;
    }
    setLoadingRecommendations(true);
    try {
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          preferred_categories: selectedCategory !== 'All' ? [selectedCategory] : [],
          preferred_tags: selectedTags.length > 0 ? selectedTags : [],
          price_range: priceRange,
          top_n: 3,
          search_term: searchTerm || '',
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const enrichedRecommendations = (data.recommendations || []).map(model => ({
        ...model,
        image: model.image || getRandomImage(),
        rating: model.rating || (4 + Math.random()).toFixed(1),
        reviewCount: model.reviewCount || Math.floor(Math.random() * 300) + 1,
        usageCount: model.usageCount || `${(Math.random() * 15).toFixed(1)}k`,
      }));
      setRecommendedModels(enrichedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedModels([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [isWalletConnected, userAddress, selectedCategory, selectedTags, priceRange, searchTerm]);

  const debouncedFetchRecommendations = useCallback(debounce(fetchRecommendations, 300), [fetchRecommendations]);

  const debouncedLogSearch = useCallback(
    debounce((term) => {
      if (term && isWalletConnected && userAddress) {
        // Log search interaction for the first matching model
        const matchingModel = models.find(
          model =>
            model.name.toLowerCase().includes(term.toLowerCase()) ||
            model.description.toLowerCase().includes(term.toLowerCase())
        );
        if (matchingModel) {
          setSearchLoading(true);
          logInteraction(matchingModel.id, 'search', term).finally(() => setSearchLoading(false));
        }
      }
    }, 500),
    [models, isWalletConnected, userAddress]
  );

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setUserAddress(accounts[0]);
        }
        window.ethereum.on('accountsChanged', accounts => {
          setIsWalletConnected(accounts.length > 0);
          setUserAddress(accounts.length > 0 ? accounts[0] : null);
          if (accounts.length > 0) {
            fetchRecommendations();
          } else {
            setRecommendedModels([]);
          }
        });
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
        setUserAddress(accounts[0]);
        fetchRecommendations();
      } else {
        alert('Please install MetaMask or another Ethereum wallet provider.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isWalletConnected && userAddress) {
      debouncedFetchRecommendations();
    }
    if (searchTerm) {
      debouncedLogSearch(searchTerm);
    }
  }, [isWalletConnected, userAddress, selectedCategory, selectedTags, priceRange, searchTerm, debouncedFetchRecommendations, debouncedLogSearch]);

  const handlePriceRangeChange = newPriceRange => {
    setPriceRange(newPriceRange);
  };

  const filteredModels = models.filter(model => {
    if (
      searchTerm &&
      !model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !model.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (selectedCategory !== 'All' && model.category !== selectedCategory) return false;
    if (selectedReputation !== 'All' && model.reputation !== selectedReputation) return false;
    if (model.price < priceRange[0] || model.price > priceRange[1]) return false;
    if (selectedTags.length > 0 && !selectedTags.some(tag => model.tags.includes(tag))) return false;
    if (activeTab === 'trending' && !model.trending) return false;
    if (activeTab === 'new' && !model.new) return false;
    if (activeTab === 'high-reputation' && model.reputation !== 'High') return false;
    return true;
  });

  const toggleTag = tag => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
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

  const handleBuy = model => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to purchase this model.');
      return;
    }
    console.log(`Buying ${model.name} for $${model.price}`);
    logInteraction(model.id, 'purchase');
  };

  const handleDemo = model => {
    console.log(`Trying demo for ${model.name}`);
  };

  const handleAddToWorkflow = model => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to add this model to your workflow.');
      return;
    }
    console.log(`Adding ${model.name} to workflow`);
    logInteraction(model.id, 'workflow');
  };

  const handleFavorite = model => {
    if (!isWalletConnected) {
      alert('Please connect your wallet to favorite this model.');
      return;
    }
    console.log(`Favoriting ${model.name}`);
    logInteraction(model.id, 'favorite');
  };

  return (
    <div className="marketplace-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <Navbar />

      <header className="marketplace-header">
        <div className="header-content">
          <h1>AI Model Marketplace</h1>
          <button className="connect-wallet-button" onClick={connectWallet} disabled={isLoading}>
            {isLoading
              ? 'Connecting...'
              : isWalletConnected
              ? `Connected: ${userAddress?.substring(0, 6)}...${userAddress?.substring(userAddress.length - 4)}`
              : 'Connect Wallet'}
          </button>
        </div>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search AI models by name or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search models"
            disabled={searchLoading}
          />
          {searchLoading && <span className="search-loading">Searching...</span>}
        </div>
      </header>

      <main className="marketplace-main">
        <aside className="sidebar glass-effect">
          <h2>
            <Filter className="mr-2 h-5 w-5" /> Filters
          </h2>
          <div className="filter-section">
            <h3>Category</h3>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Select category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
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
              onChange={e => setSelectedReputation(e.target.value)}
              aria-label="Select reputation"
            >
              {reputations.map(rep => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
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
                onChange={e => handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])}
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
                onChange={e => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
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
                    <img
                      src={model.image}
                      alt={model.name}
                      className="model-image"
                      onError={e => {
                        e.target.src = getRandomImage();
                      }}
                    />
                    <div className="model-badge">
                      {model.trending && <span className="badge trending">Trending</span>}
                      {model.new && <span className="badge new">New</span>}
                      {model.isNFT && (
                        <span className="badge nft" title={`NFT on ${model.blockchain}`}>
                          <Lock className="mr-1 h-3 w-3" /> NFT
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="model-content">
                    <div className="model-header">
                      <h3 className="model-title">{model.name}</h3>
                      <div className="model-rating">
                        <Star className="star-icon h-4 w-4" />
                        <span>
                          {model.rating} ({model.reviewCount})
                        </span>
                      </div>
                    </div>
                    <p className="model-category">{model.category}</p>
                    <p className="model-description">{model.description}</p>
                    {model.isNFT && (
                      <p className="model-blockchain">
                        Blockchain: {model.blockchain} | Owner: {model.owner}
                      </p>
                    )}
                    <div className="model-price-container">
                      <span className="model-price">${model.price}</span>
                      {model.previousPrice > model.price && (
                        <span className="model-original-price">${model.previousPrice}</span>
                      )}
                    </div>
                    <button
                      className="view-details-button"
                      onClick={() => {
                        setExpandedModel(expandedModel === model.id ? null : model.id);
                        logInteraction(model.id, 'view');
                      }}
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
                            <span key={tag} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {model.uploader && (
                        <div className="expanded-section">
                          <h4>Creator</h4>
                          <p>{model.owner}</p>
                        </div>
                      )}
                      {model.isNFT && (
                        <div className="expanded-section">
                          <h4>Web3 Details</h4>
                          <p>Blockchain: {model.blockchain}</p>
                          <p>Owner: {model.owner}</p>
                        </div>
                      )}
                      {model.ipfsHash && (
                        <div className="expanded-section">
                          <h4>IPFS Hash</h4>
                          <p>
                            {model.ipfsHash.substring(0, 16)}...{model.ipfsHash.substring(model.ipfsHash.length - 10)}
                          </p>
                        </div>
                      )}
                      <div className="expanded-section">
                        <h4>Usage</h4>
                        <p>
                          <Users className="inline mr-1 h-4 w-4" /> {model.usageCount} users
                        </p>
                      </div>
                      <div className="button-group">
                        <button className="action-button buy-button" onClick={() => handleBuy(model)}>
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                        </button>
                        <button className="action-button demo-button" onClick={() => handleDemo(model)}>
                          <Play className="mr-2 h-4 w-4" /> Try Dashboard
                        </button>
                        <button className="action-button workflow-button" onClick={() => handleAddToWorkflow(model)}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add to Workflow
                        </button>
                        <button className="action-button favorite-button" onClick={() => handleFavorite(model)}>
                          <Star className="mr-2 h-4 w-4" /> Favorite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state glass-effect">
                <p className="empty-message">
                  {window.ethereum ? 'No models available on the blockchain.' : 'Please install MetaMask to view models.'}
                </p>
                {window.ethereum && (
                  <button className="clear-filters-button" onClick={resetFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="recommendations-section">
            <h2>Recommended Models</h2>
            {loadingRecommendations ? (
              <div className="loading-state glass-effect">
                <p>Loading recommendations...</p>
              </div>
            ) : recommendedModels.length > 0 ? (
              <div className="models-grid">
                {recommendedModels.map(model => (
                  <div key={model.id} className="model-card glass-effect">
                    <div className="model-image-container">
                      <img
                        src={model.image}
                        alt={model.name}
                        className="model-image"
                        onError={e => {
                          e.target.src = getRandomImage();
                        }}
                      />
                      <div className="model-badge">
                        <span className="badge recommended">Recommended</span>
                        {model.trending && <span className="badge trending">Trending</span>}
                        {model.new && <span className="badge new">New</span>}
                        {model.isNFT && (
                          <span className="badge nft" title={`NFT on ${model.blockchain}`}>
                            <Lock className="mr-1 h-3 w-3" /> NFT
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="model-content">
                      <div className="model-header">
                        <h3 className="model-title">{model.name}</h3>
                        <div className="model-rating">
                          <Star className="star-icon h-4 w-4" />
                          <span>
                            {model.rating} ({model.reviewCount})
                          </span>
                        </div>
                      </div>
                      <p className="model-category">{model.category}</p>
                      <p className="model-description">{model.description}</p>
                      {model.isNFT && (
                        <p className="model-blockchain">
                          Blockchain: {model.blockchain} | Owner: {model.owner}
                        </p>
                      )}
                      <div className="model-price-container">
                        <span className="model-price">${model.price}</span>
                        {model.previousPrice > model.price && (
                          <span className="model-original-price">${model.previousPrice}</span>
                        )}
                      </div>
                      <button
                        className="view-details-button"
                        onClick={() => {
                          setExpandedModel(expandedModel === model.id ? null : model.id);
                          logInteraction(model.id, 'view');
                        }}
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
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {model.uploader && (
                          <div className="expanded-section">
                            <h4>Creator</h4>
                            <p>{model.owner}</p>
                          </div>
                        )}
                        {model.isNFT && (
                          <div className="expanded-section">
                            <h4>Web3 Details</h4>
                            <p>Blockchain: {model.blockchain}</p>
                            <p>Owner: {model.owner}</p>
                          </div>
                        )}
                        {model.ipfsHash && (
                          <div className="expanded-section">
                            <h4>IPFS Hash</h4>
                            <p>
                              {model.ipfsHash.substring(0, 16)}...{model.ipfsHash.substring(model.ipfsHash.length - 10)}
                            </p>
                          </div>
                        )}
                        <div className="expanded-section">
                          <h4>Usage</h4>
                          <p>
                            <Users className="inline mr-1 h-4 w-4" /> {model.usageCount} users
                          </p>
                        </div>
                        <div className="button-group">
                          <button className="action-button buy-button" onClick={() => handleBuy(model)}>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                          </button>
                          <button className="action-button demo-button" onClick={() => handleDemo(model)}>
                            <Play className="mr-2 h-4 w-4" /> Try Dashboard
                          </button>
                          <button className="action-button workflow-button" onClick={() => handleAddToWorkflow(model)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add to Workflow
                          </button>
                          <button className="action-button favorite-button" onClick={() => handleFavorite(model)}>
                            <Star className="mr-2 h-4 w-4" /> Favorite
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state glass-effect">
                <p className="empty-message">
                  {isWalletConnected
                    ? 'No recommendations available. Try adjusting filters or searching.'
                    : 'Connect your wallet to see personalized recommendations.'}
                </p>
                {!isWalletConnected && (
                  <button className="connect-wallet-button" onClick={connectWallet}>
                    Connect Wallet
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <ChatbotButton onClick={() => alert('Open chatbot modal here!')} />
    </div>
  );
};

export default Marketplace;