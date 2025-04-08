import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../styles/pages.css';
import '../styles/UploadModel.css';

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
  const fileInputRef = useRef(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0]);
    }
  };

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      alert("Please connect your wallet first to upload a model.");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      // Reset form after successful upload
      alert('Model uploaded successfully!');
      setModelFile(null);
      setModelName('');
      setDescription('');
      setTags('');
      setCategory('vision');
      setIsPublic(true);
      setPrice('');
    }, 2000);
    
    // Here you would normally:
    // 1. Create form data
    // 2. Upload to blockchain/IPFS
    // 3. Register metadata on AIChain
  };

  const toggleWalletConnection = () => {
    setWalletConnected(!walletConnected);
  };

  return (
    <div className="home cosmic-background">
      <div className="stars-layer"></div>
      <div className="planet"></div>
      
      {/* Add shooting stars */}
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>
      
      {/* Add floating particles */}
      {Array(15).fill().map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${20 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="upload-page">
        <Navbar walletConnected={walletConnected} toggleWalletConnection={toggleWalletConnection} />
        
        <div className="upload-container">
          <div className="upload-content">
            <h1 className="upload-title">Upload AI Model</h1>
            <p className="upload-subtitle">Share your model with the AIChain community</p>
            
            <form onSubmit={handleSubmit} className="upload-form">
              {/* File Upload Area */}
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
                  accept=".pt,.h5,.onnx,.bin,.pkl"
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
                    <p className="upload-formats">Supported formats: PyTorch (.pt), TensorFlow (.h5), ONNX (.onnx)</p>
                    <button type="button" className="browse-button">Browse Files</button>
                  </div>
                )}
              </div>
              
              {/* Model Details */}
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
              
              {/* Accessibility Options */}
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
              
              {/* Pricing */}
              <div className="form-group">
                <label htmlFor="price">Price (in AIChain tokens)</label>
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    min="0"
                    step="0.001"
                    placeholder="0"
                  />
                  <span className="token-suffix">AIC</span>
                </div>
                <small>Leave empty for free access</small>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-button" 
                disabled={!modelFile || !modelName || !description || isUploading || !walletConnected}
              >
                {isUploading ? 'Uploading...' : 'Upload Model'}
              </button>
              
              {!walletConnected && (
                <div className="wallet-notice">
                  <p>You need to connect your wallet before uploading a model.</p>
                </div>
              )}
            </form>
          </div>
          
          <div className="upload-footer">
            <p>By uploading a model, you agree to AIChain's <a href="/terms">Terms of Service</a> and <a href="/guidelines">Community Guidelines</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;