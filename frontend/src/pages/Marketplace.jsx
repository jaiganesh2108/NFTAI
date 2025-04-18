import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Search, Filter, Star, Users, TrendingUp, Plus, ShoppingCart, Play, PlusCircle, Lock, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ChatbotButton from '../pages/ChatbotButton.jsx';
import "../styles/Marketplace.css";

// Import images
import image1 from '../assets/images/imgg1.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image3 from '../assets/images/imgg3.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image5 from '../assets/images/img5.jpg';
import image6 from '../assets/images/img6.jpg';
import image12 from '../assets/images/img12.jpg';
import image13 from '../assets/images/img13.jpg';

// Contract ABI and address
const AIModelNFTABI = [/* Your ABI remains unchanged, omitted for brevity */];
const contractAddress = "0x773b925f0cb2A38AC6BAA001A28dd6643c445C3d";

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
  const [isLoading, setIsLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionSuccess, setTransactionSuccess] = useState(null);

  const categories = ['All', 'Text Generation', 'Image Recognition', 'Audio Processing', 'Data Analysis'];
  const reputations = ['All', 'High', 'Medium', 'Low'];
  const allTags = ['GPT', 'Text', 'Generative', 'Vision', 'Recognition', 'CNN', 'Audio', 'Speech', 'Analytics', 'Prediction', 'ML'];

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
    const priceInDollars = Math.floor(priceInEth * 2000);
    const isNFT = true;

    return {
      id: index + 1,
      tokenId: index + 1,
      name: model.name,
      category: model.category || "Text Generation",
      tags: tagsArray.length > 0 ? tagsArray : allTags.slice(0, 3 + Math.floor(Math.random() * 4)),
      description: model.description,
      price: priceInDollars || 299,
      priceInWei: model.price.toString(),
      previousPrice: priceInDollars < 400 ? priceInDollars + 50 : priceInDollars,
      rating: parseFloat(randomRating),
      reviewCount: randomReviews,
      usageCount: randomUsage,
      trending: isTrending,
      new: isNew,
      reputation: getRandomReputation(),
      image: getRandomImage(),
      isNFT: isNFT,
      forSale: model.forSale,
      blockchain: "Ethereum",
      owner: model.owner,
      ipfsHash: model.ipfsHash,
      timestamp: Number(model.timestamp)
    };
  };

  const fetchModels = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, AIModelNFTABI, signer);
        const blockchainModels = await contract.getAllModels();
        const formattedModels = blockchainModels.map(transformBlockchainModel);
        setModels(formattedModels.length > 0 ? formattedModels : setDefaultModels());
      } else {
        setDefaultModels();
        setErrorMessage("MetaMask not detected. Please install MetaMask.");
      }
    } catch (err) {
      console.error("Error fetching models:", err);
      setDefaultModels();
      setErrorMessage("Failed to load models from blockchain.");
    } finally {
      setLoading(false);
    }
  };

  const setDefaultModels = () => {
    setModels([
      {
        id: 1, tokenId: 1, name: "NeuralText Pro", category: "Text Generation", tags: ["GPT", "Text", "Generative"],
        description: "Advanced language model for creative writing.", price: 299, priceInWei: ethers.parseEther("0.1"),
        previousPrice: 349, rating: 4.8, reviewCount: 256, usageCount: "13.2k", trending: true, new: false,
        reputation: "High", image: image5, isNFT: true, forSale: true, blockchain: "Ethereum",
        owner: "0x1234...abcd", ipfsHash: "QmX5NZdH5aEwRVdrk1UjKXYoaKr1L8aCCaNZgxJfAxbUTo",
        timestamp: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
      },
      // Other default models remain unchanged, omitted for brevity
    ]);
  };

  const logInteraction = async (modelId, interactionType) => {
    if (!isWalletConnected) return;
    try {
      const userAddress = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
      await fetch('http://localhost:8000/log_interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_address: userAddress, model_id: modelId, interaction_type: interactionType })
      });
    } catch (error) {
      console.error(`Error logging ${interactionType}:`, error);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      if (!isWalletConnected) {
        setRecommendedModels(models.filter(model => model.trending).slice(0, 4));
        return;
      }
      const userAddress = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          preferred_categories: selectedCategory !== 'All' ? [selectedCategory] : null,
          preferred_tags: selectedTags.length > 0 ? selectedTags : null,
          price_range: priceRange,
          top_n: 4,
          search_term: searchTerm
        })
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendedModels(data.recommendations.map(model => ({
        ...model,
        image: model.image || getRandomImage(),
      })));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedModels(models.filter(model => model.reputation === "High").slice(0, 4));
    } finally {
      setLoadingRecommendations(false);
    }
  }, [isWalletConnected, selectedCategory, selectedTags, priceRange, searchTerm, models]);

  const debouncedFetchRecommendations = useCallback(debounce(fetchRecommendations, 300), [fetchRecommendations]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isWalletConnected) fetchModels();
    else setDefaultModels();
  }, [isWalletConnected]);

  useEffect(() => {
    debouncedFetchRecommendations();
  }, [isWalletConnected, selectedCategory, selectedTags, searchTerm, models, debouncedFetchRecommendations]);

  const handlePriceRangeChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
    debouncedFetchRecommendations();
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsWalletConnected(accounts.length > 0);
        window.ethereum.on('accountsChanged', (accounts) => {
          setIsWalletConnected(accounts.length > 0);
          if (accounts.length > 0) fetchModels();
          else setDefaultModels();
        });
        window.ethereum.on('chainChanged', () => window.location.reload());
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

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
    setErrorMessage('');
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
        fetchModels();
      } else {
        setErrorMessage("MetaMask not detected.");
      }
    } catch (error) {
      setErrorMessage("Failed to connect wallet: " + error.message);
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
      setErrorMessage("Please connect your wallet.");
      return;
    }
    setBuyLoading(model.id);
    setErrorMessage('');
    setTransactionSuccess(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, AIModelNFTABI, signer);
      if (!model.forSale) throw new Error("Model not for sale.");
      const userAddress = await signer.getAddress();
      if (model.owner.toLowerCase() === userAddress.toLowerCase()) throw new Error("Cannot buy your own model.");
      const tx = await contract.buyModel(model.tokenId, { value: BigInt(model.priceInWei) });
      setTransactionSuccess(`Transaction pending. Hash: ${tx.hash}`);
      const receipt = await tx.wait();
      setTransactionSuccess(`Model purchased successfully!`);
      const updatedModels = [...models];
      const modelIndex = updatedModels.findIndex(m => m.id === model.id);
      if (modelIndex !== -1) {
        updatedModels[modelIndex] = { ...updatedModels[modelIndex], owner: userAddress, forSale: false };
        setModels(updatedModels);
      }
      logInteraction(model.id, 'purchase');
      setTimeout(fetchModels, 3000);
    } catch (error) {
      setErrorMessage(error.message || "Transaction failed.");
    } finally {
      setBuyLoading(null);
    }
  };

  const handleDemo = (model) => {
    logInteraction(model.id, 'demo');
  };

  const handleAddToWorkflow = (model) => {
    if (!isWalletConnected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }
    logInteraction(model.id, 'workflow_add');
  };

  const handleFavorite = (model) => {
    if (!isWalletConnected) {
      setErrorMessage("Please connect your wallet.");
      return;
    }
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
          {!isWalletConnected && (
            <button
              className="connect-wallet-button"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search AI models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search models"
          />
        </div>
      </header>
      {errorMessage && (
        <div className="error-message glass-effect">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {errorMessage}
        </div>
      )}
      {transactionSuccess && (
        <div className="success-message glass-effect">
          <Star className="mr-2 h-5 w-5" />
          {transactionSuccess}
        </div>
      )}
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
                onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])}
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
                onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
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
                <p>Loading models...</p>
              </div>
            ) : filteredModels.length > 0 ? (
              filteredModels.map(model => (
                <div key={model.id} id={`model-${model.id}`} className="model-card glass-effect">
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
                      {model.forSale && <span className="badge for-sale">For Sale</span>}
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
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="expanded-section">
                        <h4>Creator</h4>
                        <p>{model.owner.substring(0, 6)}...{model.owner.substring(model.owner.length - 4)}</p>
                      </div>
                      <div className="expanded-section">
                        <h4>Web3 Details</h4>
                        <p>Blockchain: {model.blockchain}</p>
                        <p>Status: {model.forSale ? 'For Sale' : 'Not For Sale'}</p>
                      </div>
                      {model.ipfsHash && (
                        <div className="expanded-section">
                          <h4>IPFS Hash</h4>
                          <p>{model.ipfsHash.substring(0, 16)}...{model.ipfsHash.substring(model.ipfsHash.length - 10)}</p>
                        </div>
                      )}
                      <div className="expanded-section">
                        <h4>Usage</h4>
                        <p><Users className="inline mr-1 h-4 w-4" /> {model.usageCount} users</p>
                      </div>
                      <div className="button-group">
                        {model.forSale ? (
                          <button
                            className="action-button buy-button"
                            onClick={() => handleBuy(model)}
                            disabled={buyLoading === model.id}
                          >
                            {buyLoading === model.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                              </>
                            )}
                          </button>
                        ) : (
                          <button className="action-button owned-button" disabled>
                            <Lock className="mr-2 h-4 w-4" /> Not For Sale
                          </button>
                        )}
                        <button
                          className="action-button demo-button"
                          onClick={() => handleDemo(model)}
                        >
                          <Play className="mr-2 h-4 w-4" /> Try Demo
                        </button>
                        <button
                          className="action-button workflow-button"
                          onClick={() => handleAddToWorkflow(model)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add to Workflow
                        </button>
                        <button
                          className="action-button favorite-button"
                          onClick={() => handleFavorite(model)}
                        >
                          <Star className="mr-2 h-4 w-4" /> Favorite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results glass-effect">
                <p>No models match your filters.</p>
                <button onClick={resetFilters} className="reset-button">Reset Filters</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <section className="recommended-section glass-effect">
        <div className="recommended-header">
          <h2><Star className="mr-2 h-6 w-6" /> Recommended for You</h2>
        </div>
        {loadingRecommendations ? (
          <div className="loading-recommendations glass-effect">
            <p>Loading recommendations...</p>
          </div>
        ) : recommendedModels.length > 0 ? (
          <div className="recommended-grid">
            {recommendedModels.map(model => (
              <div key={`rec-${model.id}`} className="recommended-card glass-effect">
                <div className="recommended-image-container">
                  <img src={model.image} alt={model.name} className="recommended-image" />
                  <span className="badge recommended">Recommended</span>
                </div>
                <div className="recommended-content">
                  <h3 className="recommended-title">{model.name}</h3>
                  <p className="recommended-category">{model.category}</p>
                  <p className="recommended-description">{model.description}</p>
                  <div className="recommended-meta">
                    <span className="recommended-price">${model.price}</span>
                    <div className="recommended-rating">
                      <Star className="star-icon h-4 w-4" />
                      <span>{model.rating} ({model.reviewCount})</span>
                    </div>
                  </div>
                  <button
                    className="view-model-button"
                    onClick={() => {
                      const modelElement = document.getElementById(`model-${model.id}`);
                      if (modelElement) {
                        modelElement.scrollIntoView({ behavior: 'smooth' });
                        setExpandedModel(model.id);
                      }
                      logInteraction(model.id, 'recommendation_click');
                    }}
                  >
                    View Model
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations glass-effect">
            <p>No recommendations available. Explore the marketplace!</p>
          </div>
        )}
      </section>
      <footer className="marketplace-footer glass-effect">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About AIChain Marketplace</h3>
            <p>Buy, sell, and discover AI models as NFTs on the blockchain.</p>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#tutorials">Tutorials</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#discord">Discord Community</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#licenses">Licenses</a></li>
            </ul>
          </div>
        </div>
      </footer>
      <ChatbotButton />
    </div>
  );
};

export default Marketplace;