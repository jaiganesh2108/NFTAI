import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/pages.css';
import ChatbotButton from '../pages/ChatbotButton.jsx';
import image1 from '../assets/images/imgg1.jpg';
import image3 from '../assets/images/imgg3.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image6 from '../assets/images/img6.jpg';
import image7 from '../assets/images/img7.jpg';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="home cosmic-background">
      <div className="stars-layer"></div>
      <div className="planet"></div>
      <div className="shooting-star"></div>
      <div className="shooting-star"></div>



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

      <Navbar />

      <section className="hero">
        <h1 className="hero-title">Welcome to NooSphere</h1>
        <p className="hero-subtitle">
          A decentralized platform to upload, chain, and monetize AI models — HuggingFace meets Web3.
        </p>
        <div className="hero-buttons">
          <Button>Get Started</Button>
          <Button variant="secondary" onClick={() => navigate("/Marketplace")}>
      Learn More
    </Button>
        </div>
      </section>

      <section className="what-is-noosphere">
        <div className="content-wrapper">
          <h2 className="section-title">What is NooSphere?</h2>
          <div className="noosphere-description">
            <p>NooSphere is a decentralized ecosystem for AI.</p>
            <p>We're building a trustless platform where:</p>
            <ul className="benefits-list">
              <li><span className="highlight">AI models - </span> can be shared, searched, and monetized.</li>
              <li><span className="highlight">Datasets - </span> can be exchanged securely with transparency.</li>
              <li><span className="highlight">Contributors - </span> earn $NSP tokens for value they add — from training models to labeling data.</li>
              <li><span className="highlight">Every contribution - </span> is verifiable, permissionless, and reputation-based.</li>
            </ul>
            <p className="noosphere-core">
              At the core of NooSphere is a belief: <span className="highlight-text">AI belongs to everyone</span>
            </p>
          </div>
        </div>
      </section>

      <section className="featured core-features">
        <h2 className="featured-title">Core Features</h2>
        <div className="featured-grid">
          <Card
            icon="🤝"
            title="Decentralized AI Marketplace"
            description="Publish and monetize your AI models with full transparency and control."
            image={image1}
          />
          <Card
            icon="🧠"
            title="Smart Chatbot Assistant (Star)"
            description="Our AI assistant helps you discover, upload, and use models on the platform."
            image={image2}
          />
          <Card
            icon="💾"
            title="Secure Data Exchange"
            description="Share datasets with privacy controls, licensing, and community feedback."
            image={image3}
          />
          <Card
            icon="🎖"
            title="Token Rewards & Reputation"
            description="Earn $NSP tokens and reputation scores for every meaningful contribution."
            image={image4}
          />
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Contribute</h3>
              <p>AI models, data, or compute</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Get Verified</h3>
              <p>On-chain verification</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Earn Rewards</h3>
              <p>Tokens + grow your reputation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2 className="featured-title">Featured Models</h2>
        <div className="featured-grid">
          <Card
            title="TextGenix"
            description="Generate human-like text with this advanced NLP model."
            image={image1}
          />
          <Card
            title="ImageCraft"
            description="Create stunning visuals with AI-powered generation."
            image={image6}
          />
          <Card
            title="ChainBot"
            description="Chain multiple AI models for custom workflows."
            image={image7}
          />
        </div>
      </section>

      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-window">
            <div className="chatbot-header">
              <p>Star AI Assistant</p>
            </div>
            <div className="chatbot-messages">
              <p>Hello! I'm Star, your AI guide to NooSphere. How can I help you today?</p>
            </div>
            <div className="chatbot-input">
              <input type="text" placeholder="Type your message..." />
            </div>
          </div>
        </div>
      )}

      <ChatbotButton onClick={() => setShowChatbot(!showChatbot)} />
    </div>
  );
};

export default Home;