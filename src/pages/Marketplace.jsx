import React, { useState } from 'react';
import { 
  Search, Filter, Star, Users, TrendingUp, Plus, 
  ShoppingCart, Play, PlusCircle, Lock 
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx'; // Import the existing Navbar component
import "../styles/MarketPlace.css";
import ChatbotButton from '../pages/ChatbotButton.jsx';
const Marketplace = () => {
  const [models] = useState([
    { id: 1, name: "NeuralText Pro", category: "Text Generation", tags: ["GPT", "Text", "Generative"], description: "Advanced language model for creative writing and content generation with support for multiple languages.", price: 299, previousPrice: 349, rating: 4.8, reviewCount: 256, usageCount: "13.2k", trending: true, new: false, reputation: "High", image: "https://via.placeholder.com/300x200", isNFT: true, blockchain: "Ethereum", owner: "0x1234...abcd" },
    { id: 2, name: "VisionAI Studio", category: "Image Recognition", tags: ["Vision", "Recognition", "CNN"], description: "State-of-the-art computer vision model for object detection, image classification, and scene understanding.", price: 499, previousPrice: 499, rating: 4.6, reviewCount: 183, usageCount: "8.7k", trending: true, new: true, reputation: "High", image: "https://via.placeholder.com/300x200", isNFT: false },
    { id: 3, name: "SynthWave Audio", category: "Audio Processing", tags: ["Audio", "Speech", "Generation"], description: "Audio generation and processing system for creating realistic speech, music, and sound effects.", price: 199, previousPrice: 249, rating: 4.3, reviewCount: 127, usageCount: "5.4k", trending: false, new: true, reputation: "Medium", image: "https://via.placeholder.com/300x200", isNFT: true, blockchain: "Polygon", owner: "0x5678...efgh" },
    { id: 4, name: "DataMiner Pro", category: "Data Analysis", tags: ["Analytics", "Prediction", "ML"], description: "Machine learning model for advanced data analytics, pattern recognition, and predictive modeling.", price: 399, previousPrice: 399, rating: 4.5, reviewCount: 164, usageCount: "7.1k", trending: false, new: false, reputation: "High", image: "https://via.placeholder.com/300x200", isNFT: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReputation, setSelectedReputation] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedModel, setExpandedModel] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['All', 'Text Generation', 'Image Recognition', 'Audio Processing', 'Data Analysis'];
  const reputations = ['All', 'High', 'Medium', 'Low'];
  const allTags = ['GPT', 'Text', 'Generative', 'Vision', 'Recognition', 'CNN', 'Audio', 'Speech', 'Analytics', 'Prediction', 'ML'];

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

  const connectWallet = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsWalletConnected(prev => !prev);
      setIsLoading(false);
    }, 500); // Simulate async action
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

  const handleBuy = (model) => {
    console.log(`Buying ${model.name} for $${model.price}`);
    // Add actual buy logic here
  };

  const handleDemo = (model) => {
    console.log(`Trying demo for ${model.name}`);
    // Add demo logic here
  };

  const handleAddToWorkflow = (model) => {
    console.log(`Adding ${model.name} to workflow`);
    // Add workflow logic here
  };

  return (
    <div className="marketplace-container">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      {/* Added the imported Navbar component */}
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
            {isLoading ? (
              <div className="loading-state">Loading...</div>
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
                      {model.isNFT && (
                        <div className="expanded-section">
                          <h4>Web3 Details</h4>
                          <p>Blockchain: {model.blockchain}</p>
                          <p>Owner: {model.owner}</p>
                        </div>
                      )}
                      <div className="expanded-section">
                        <h4>Usage</h4>
                        <p><Users className="inline mr-1 h-4 w-4" /> {model.usageCount} users</p>
                      </div>
                      <div className="button-group">
                        <button 
                          className="action-button buy-button"
                          onClick={() => handleBuy(model)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                        </button>
                        <button 
                          className="action-button demo-button"
                          onClick={() => handleDemo(model)}
                        >
                          <Play className="mr-2 h-4 w-4" /> Try Dashboard
                        </button>
                        <button 
                          className="action-button workflow-button"
                          onClick={() => handleAddToWorkflow(model)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add to Workflow
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state glass-effect">
                <p className="empty-message">No models found matching your criteria.</p>
                <button className="clear-filters-button" onClick={resetFilters}>
                  Clear Filters
                </button>
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