import React, { useState, useEffect, useCallback } from 'react';
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
  ShoppingCart, Play, PlusCircle, Lock, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import "../styles/Marketplace.css";
import ChatbotButton from '../pages/ChatbotButton.jsx';

// Contract ABI and address
const  AIModelNFTABI =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "buyModel",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "EtherTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "ModelPriceUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ModelSold",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
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
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ModelUploaded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "updateModelPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isPublic",
				"type": "bool"
			}
		],
		"name": "updateModelVisibility",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
			},
			{
				"internalType": "string",
				"name": "_tokenURI",
				"type": "string"
			}
		],
		"name": "uploadModel",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
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
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "forSale",
						"type": "bool"
					}
				],
				"internalType": "struct AIModelNFT.Model[]",
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
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getModelsByOwner",
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
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "forSale",
						"type": "bool"
					}
				],
				"internalType": "struct AIModelNFT.Model[]",
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
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "forSale",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] 
const contractAddress = "0xAcEFD40AAE6F7AE01f75B4dD13848Eb37F2a05f7";
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
    const priceInDollars = Math.floor(priceInEth * 2000); // Using a 1 ETH = $2000 conversion rate
    const isNFT = true; // All models are NFTs here
    const blockchain = "Ethereum"; // Or use your chain of choice

    return {
      id: index + 1,
      tokenId: index + 1, // This is crucial for blockchain operations
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
      blockchain: blockchain,
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
        
        if (formattedModels.length > 0) {
          setModels(formattedModels);
        } else {
          setDefaultModels();
        }
      } else {
        console.log("Ethereum provider not found, using default models");
        setDefaultModels();
        setErrorMessage("MetaMask not detected. Please install MetaMask to interact with the blockchain.");
      }
    } catch (err) {
      console.error("Error fetching models:", err);
      setDefaultModels();
      setErrorMessage("Failed to load models from blockchain. Using sample data instead.");
    } finally {
      setLoading(false);
    }
  };

  const setDefaultModels = () => {
    setModels([
      { id: 1, tokenId: 1, name: "NeuralText Pro", category: "Text Generation", tags: ["GPT", "Text", "Generative"], description: "Advanced language model for creative writing and content generation with support for multiple languages.", price: 299, priceInWei: ethers.parseEther("0.1"), previousPrice: 349, rating: 4.8, reviewCount: 256, usageCount: "13.2k", trending: true, new: false, reputation: "High", image: image5, isNFT: true, forSale: true, blockchain: "Ethereum", owner: "0x1234...abcd", ipfsHash: "QmX5NZdH5aEwRVdrk1UjKXYoaKr1L8aCCaNZgxJfAxbUTo", timestamp: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
      { id: 2, tokenId: 2, name: "VisionAI Studio", category: "Image Recognition", tags: ["Vision", "Recognition", "CNN"], description: "State-of-the-art computer vision model for object detection, image classification, and scene understanding.", price: 499, priceInWei: ethers.parseEther("0.25"), previousPrice: 499, rating: 4.6, reviewCount: 183, usageCount: "8.7k", trending: true, new: true, reputation: "High", image: image6, isNFT: true, forSale: true, blockchain: "Ethereum", owner: "0x5678...efgh", ipfsHash: "QmYbT5dJmNuVqfKGtZJKzLCd9WvD1XwM4SJhRYywvXmiUA", timestamp: Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60 },
      { id: 3, tokenId: 3, name: "SynthWave Audio", category: "Audio Processing", tags: ["Audio", "Speech", "Generation"], description: "Audio generation and processing system for creating realistic speech, music, and sound effects.", price: 199, priceInWei: ethers.parseEther("0.08"), previousPrice: 249, rating: 4.3, reviewCount: 127, usageCount: "5.4k", trending: false, new: true, reputation: "Medium", image: image13, isNFT: true, forSale: true, blockchain: "Ethereum", owner: "0x9012...ijkl", ipfsHash: "QmcPXhZ7aULCNTdMY9fkGJrwDWvt9Z6nbEHFXvnNiRJKYr", timestamp: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60 },
      { id: 4, tokenId: 4, name: "DataMiner Pro", category: "Data Analysis", tags: ["Analytics", "Prediction", "ML"], description: "Machine learning model for advanced data analytics, pattern recognition, and predictive modeling.", price: 399, priceInWei: ethers.parseEther("0.15"), previousPrice: 399, rating: 4.5, reviewCount: 164, usageCount: "7.1k", trending: false, new: false, reputation: "High", image: image12, isNFT: true, forSale: true, blockchain: "Ethereum", owner: "0x3456...mnop", ipfsHash: "QmUJLxFoSdG5XMzKdmq4KGVwA9F5HrXLR9y88Kd9iJBTTM", timestamp: Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60 },
    ]);
  };

  const logInteraction = async (modelId, interactionType) => {
    if (!isWalletConnected) return;
    try {
      const userAddress = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
      const response = await fetch('http://localhost:8000/log_interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          model_id: modelId,
          interaction_type: interactionType
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`Logged ${interactionType} for model ${modelId}`);
    } catch (error) {
      console.error(`Error logging ${interactionType}:`, error);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      if (!isWalletConnected) {
        // Default recommendations based on trending models
        const defaultRecommendations = models
          .filter(model => model.trending)
          .slice(0, 3);
        setRecommendedModels(defaultRecommendations);
        return;
      }

      const userAddress = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
      const response = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          preferred_categories: selectedCategory !== 'All' ? [selectedCategory] : null,
          preferred_tags: selectedTags.length > 0 ? selectedTags : null,
          price_range: priceRange,
          top_n: 3,
          search_term: searchTerm
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Enrich recommendations with a random image if missing
      const enrichedRecommendations = (data.recommendations || []).map((model) => ({
        ...model,
        image: model.image || getRandomImage(),
      }));
      
      setRecommendedModels(enrichedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to models with high reputation
      const highRepModels = models
        .filter(model => model.reputation === "High")
        .slice(0, 3);
      setRecommendedModels(highRepModels);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [isWalletConnected, selectedCategory, selectedTags, priceRange, searchTerm, models]);

  // Debounced version of fetchRecommendations
  const debouncedFetchRecommendations = useCallback(
    debounce(fetchRecommendations, 300),
    [fetchRecommendations]
  );

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isWalletConnected) {
      fetchModels();
    } else {
      setDefaultModels();
    }
  }, [isWalletConnected]);

  // Trigger recommendations when wallet connects or filters change
  useEffect(() => {
    debouncedFetchRecommendations();
  }, [isWalletConnected, selectedCategory, selectedTags, searchTerm, debouncedFetchRecommendations, models]);

  // Handle price range changes separately to avoid direct useEffect dependency
  const handlePriceRangeChange = (newPriceRange) => {
    setPriceRange(newPriceRange);
    debouncedFetchRecommendations();
  };

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setIsWalletConnected(accounts.length > 0);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setIsWalletConnected(accounts.length > 0);
          if (accounts.length > 0) {
            fetchModels();
          } else {
            setDefaultModels();
          }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
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
        fetchModels(); // Fetch models after connecting
      } else {
        setErrorMessage("MetaMask not detected. Please install MetaMask to interact with the blockchain.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setErrorMessage("Failed to connect wallet: " + (error.message || "Unknown error"));
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
      setErrorMessage("Please connect your wallet to purchase this model.");
      return;
    }
    
    setBuyLoading(model.id);
    setErrorMessage('');
    setTransactionSuccess(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, AIModelNFTABI, signer);
      
      // Check if model is for sale
      if (!model.forSale) {
        throw new Error("This model is not currently for sale.");
      }
      
      // Check if user is trying to buy their own model
      const userAddress = await signer.getAddress();
      if (model.owner.toLowerCase() === userAddress.toLowerCase()) {
        throw new Error("You cannot buy your own model.");
      }
      
      // Prepare transaction
      const price = BigInt(model.priceInWei);
      const tx = await contract.buyModel(model.tokenId, { value: price });
      
      // Log the transaction
      console.log(`Transaction sent: ${tx.hash}`);
      setTransactionSuccess(`Transaction pending. Hash: ${tx.hash}`);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Log the successful purchase
      console.log(`Model purchased successfully! Transaction: ${receipt.hash}`);
      setTransactionSuccess(`Model purchased successfully! You now own "${model.name}".`);
      
      // Update local model data
      const updatedModels = [...models];
      const modelIndex = updatedModels.findIndex(m => m.id === model.id);
      if (modelIndex !== -1) {
        updatedModels[modelIndex] = {
          ...updatedModels[modelIndex],
          owner: userAddress,
          forSale: false
        };
        setModels(updatedModels);
      }
      
      // Log interaction for analytics
      logInteraction(model.id, 'purchase');
      
      // Refresh models to reflect the change
      setTimeout(fetchModels, 3000);
      
    } catch (error) {
      console.error("Error buying model:", error);
      setErrorMessage(error.message || "Transaction failed. Please try again.");
    } finally {
      setBuyLoading(null);
    }
  };

  const handleDemo = (model) => {
    console.log(`Trying demo for ${model.name}`);
    // This would open a demo modal or navigate to a demo page
    // For now, just log the interaction
    logInteraction(model.id, 'demo');
  };

  const handleAddToWorkflow = (model) => {
    if (!isWalletConnected) {
      setErrorMessage("Please connect your wallet to add this model to your workflow.");
      return;
    }
    console.log(`Adding ${model.name} to workflow`);
    logInteraction(model.id, 'workflow_add');
  };

  const handleFavorite = (model) => {
    if (!isWalletConnected) {
      setErrorMessage("Please connect your wallet to favorite this model.");
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
            placeholder="Search AI models by name or description..."
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
                <p>Loading models from blockchain...</p>
              </div>
            ) : filteredModels.length > 0 ? (
              filteredModels.map(model => (
                <div 
                  key={model.id} 
                  id={`model-${model.id}`} 
                  className="model-card glass-effect"
                >
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
                          <button
                            className="action-button owned-button"
                            disabled
                          >
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
                <p>No models match your current filters.</p>
                <button onClick={resetFilters} className="reset-button">Reset Filters</button>
              </div>
            )}
          </div>
        </section>
  
        <section className="recommended-section">
          <h2><Star className="mr-2 h-6 w-6" /> Recommended for You</h2>
          <div className="recommended-container">
            {loadingRecommendations ? (
              <div className="loading-recommendations glass-effect">
                <p>Loading recommendations...</p>
              </div>
            ) : recommendedModels.length > 0 ? (
              <div className="recommended-grid">
                {recommendedModels.map(model => (
                  <div key={`rec-${model.id}`} className="recommended-card glass-effect">
                    <div className="recommended-image-container">
                      <img src={model.image} alt={model.name} className="model-image" />
                    </div>
                    <div className="recommended-content">
                      <h3>{model.name}</h3>
                      <p className="recommended-description">{model.description}</p>
                      <div className="recommended-meta">
                        <span className="recommended-price">${model.price}</span>
                        <div className="recommended-rating">
                          <Star className="star-icon h-4 w-4" />
                          <span>{model.rating}</span>
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
                <p>No personalized recommendations available. Browse our marketplace to discover models.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Chatbot button for user assistance */}
      <ChatbotButton />
    </div>
  );

}
export default Marketplace
