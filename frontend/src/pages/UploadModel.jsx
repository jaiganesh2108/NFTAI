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
  const fileInputRef = useRef(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [createAsNFT, setCreateAsNFT] = useState(true);
  const [network, setNetwork] = useState('ethereum');

  // Smart Contract Details
  const contractAddress = "0x773b925f0cb2A38AC6BAA001A28dd6643c445C3d"; // Replace with your deployed contract address
  const abi = [{
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
    
  ];

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setWalletConnected(accounts.length > 0);
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, []);

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

  const toggleWalletConnection = async () => {
    if (walletConnected) {
      setWalletConnected(false);
      return;
    }
    
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
      } else {
        alert("Please install MetaMask or another Ethereum wallet provider.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!modelFile || !modelName || !description) {
      alert("Please fill all required fields");
      return;
    }
    
    if(!walletConnected) {
      alert("Please connect your wallet to upload a model");
      return;
    }

    try {
		
      // Upload to IPFS via Pinata
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
	

      // Upload model file to IPFS
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZmEzNjU0Yi0xY2E4LTRlM2UtOTA5Ny00Mzc5YjY4YjY0NjkiLCJlbWFpbCI6ImRpbGxpYmFza2VyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDJlOGMxYjQyMjIyMzMwZTJhYTciLCJzY29wZWRLZXlTZWNyZXQiOiIyMjY3YjFhZWQ4MjZmM2JhMGFmNWExNjU5YzRmZjRjYThhY2VlMWVmODFlZGExNjZlNzUxM2RkOTg1ZWFhYzQ5IiwiZXhwIjoxNzc1ODE4MTgzfQ.HyD1d7p-AnJnBTnV2ruPV-2TwianjjVnK5YSR9uZC3o`,
        },
      });
	
  
      const ipfsHash = res.data.IpfsHash;
      console.log("Model File IPFS Hash:", ipfsHash);
	
      // Create NFT metadata
	 
      const nftMetadata = {
        name: modelName,
        description: description,
        image: `ipfs://${ipfsHash}`,
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Tags", value: tags },
          { trait_type: "Visibility", value: isPublic ? "Public" : "Private" }
        ]
      };
      // Upload NFT metadata to IPFS

	  
      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        nftMetadata,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZmEzNjU0Yi0xY2E4LTRlM2UtOTA5Ny00Mzc5YjY4YjY0NjkiLCJlbWFpbCI6ImRpbGxpYmFza2VyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMDJlOGMxYjQyMjIyMzMwZTJhYTciLCJzY29wZWRLZXlTZWNyZXQiOiIyMjY3YjFhZWQ4MjZmM2JhMGFmNWExNjU5YzRmZjRjYThhY2VlMWVmODFlZGExNjZlNzUxM2RkOTg1ZWFhYzQ5IiwiZXhwIjoxNzc1ODE4MTgzfQ.HyD1d7p-AnJnBTnV2ruPV-2TwianjjVnK5YSR9uZC3o`,
          },
        }
      );

      const tokenURI = `ipfs://${metadataRes.data.IpfsHash}`;
      console.log("Token URI:", tokenURI);


      // Connect to Ethereum wallet
	 
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Format the price (convert to wei)
      const parsedPrice = ethers.parseUnits(price || "0", "ether");
	console.log("signer")
      // Call smart contract function to mint NFT and register model
      const tx = await contract.uploadModel(
        modelName,
        description,
        ipfsHash,
        tags,
        category,
        isPublic,
        parsedPrice,
        tokenURI
      );

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
    } catch(err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
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
              
              {/* NFT Options */}
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
              
              {/* Blockchain Selection - Only visible if creating as NFT */}
              {createAsNFT && (
                <div className="form-group">
                  <label htmlFor="network">Blockchain Network</label>
                  <select
                    id="network"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="form-select"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                  </select>
                  <small>Choose the blockchain network for your NFT</small>
                </div>
              )}
              
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
                <label htmlFor="price">Price (in ETH)</label>
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    min="0"
                    step="0.0000000001"
                    placeholder="0"
                  />
                  <span className="token-suffix">ETH</span>
                </div>
                <small>Leave empty for free access</small>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isUploading || !walletConnected}
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