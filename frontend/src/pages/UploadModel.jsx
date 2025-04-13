import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import {ethers} from "ethers"
import '../styles/pages.css';
import axios from "axios"
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
  const fileInputRef = useRef(null);
  const [walletConnected, setWalletConnected] = useState(false);
  //apisecrete = 2267b1aed826f3ba0af5a1659c4ff4ca8acee1ef81eda166e7513dd985eaac49//
  // apikey=02e8c1b42222330e2aa7//
// jwtsecret = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZmEzNjU0Yi0xY2E4LTRlM2UtOTA5Ny00Mzc5YjY4YjY0NjkiLCJlbWFpbCI6ImRpbGxpYmFza2VyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDJlOGMxYjQyMjIyMzMwZTJhYTciLCJzY29wZWRLZXlTZWNyZXQiOiIyMjY3YjFhZWQ4MjZmM2JhMGFmNWExNjU5YzRmZjRjYThhY2VlMWVmODFlZGExNjZlNzUxM2RkOTg1ZWFhYzQ5IiwiZXhwIjoxNzc1ODE4MTgzfQ.HyD1d7p-AnJnBTnV2ruPV-2TwianjjVnK5YSR9uZC3o//
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setModelFile(e.target.files[0]);
    }
  };

  //contract address=0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19
  /* contract abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			}
		],
		"name": "ModelUploaded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_category",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_isPublic",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "uploadModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllModels",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "tags",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isPublic",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "uploader",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct AIModelRegistry.Model[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] */
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

  // Smart Contract
const contractAddress = "0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19";
const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "modelId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			}
		],
		"name": "ModelUploaded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_category",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_isPublic",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "uploadModel",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllModels",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "tags",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "category",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isPublic",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "uploader",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct AIModelRegistry.Model[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "models",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] ;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!modelFile || !modelName || !description){
      alert("please fill all required fields")
    }
    try{
      // it is  Upload to pinata
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", modelFile);

      const metadata = JSON.stringify({
        name: modelName,
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZmEzNjU0Yi0xY2E4LTRlM2UtOTA5Ny00Mzc5YjY4YjY0NjkiLCJlbWFpbCI6ImRpbGxpYmFza2VyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDJlOGMxYjQyMjIyMzMwZTJhYTciLCJzY29wZWRLZXlTZWNyZXQiOiIyMjY3YjFhZWQ4MjZmM2JhMGFmNWExNjU5YzRmZjRjYThhY2VlMWVmODFlZGExNjZlNzUxM2RkOTg1ZWFhYzQ5IiwiZXhwIjoxNzc1ODE4MTgzfQ.HyD1d7p-AnJnBTnV2ruPV-2TwianjjVnK5YSR9uZC3o`,
        },
      });
  
      const ipfsHash = res.data.IpfsHash;
      console.log("Pinata IPFS Hash:", ipfsHash);

         // 2. Connect to Ethereum wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // it is to Format the price (convert to uint256 if needed)
    const parsedPrice = ethers.parseUnits(price || "0", "ether"); // if using ETH-based token

          // 4. Call smart contract function
    const tx = await contract.uploadModel(
      modelName,
      description,
      ipfsHash,
      tags,
      category,
      isPublic,
      parsedPrice
    );
    await tx.wait();

    alert("Model uploaded successfully to AIChain!");
    
      //it is to  Reset form after successfull upload
      alert('Model uploaded successfully!');
      setModelFile(null);
      setModelName('');
      setDescription('');
      setTags('');
      setCategory('vision');
      setIsPublic(true);
      setPrice('');
    }

    catch(err){
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    }
    finally {
      setIsUploading(false);
    }
    
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
            <p className="upload-subtitle">Share your model with the NooSphere community</p>
            
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
                    <p className="upload-formats">Supported formats: PyTorch (.pt), TensorFlow (.h5), ONNX (.onnx), zip</p>
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
>
  {isUploading ? "Uploading..." : "Upload Model"}
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