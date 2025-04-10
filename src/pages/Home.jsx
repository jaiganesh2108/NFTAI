import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import '../styles/pages.css';
import ChatbotButton from '../pages/ChatbotButton.jsx';

const Home = () => {
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
        
        <Navbar />
        <section className="hero">
          <h1 className="hero-title">Welcome to NooSphere</h1>
          <p className="hero-subtitle">
            A decentralized platform to upload, chain, and monetize AI models — HuggingFace meets Web3.
          </p>
          <div className="hero-buttons">
            <Button>Get Started</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </section>
        
        <section className="featured">
          <h2 className="featured-title">Featured Models</h2>
          <div className="featured-grid">
            <Card
              title="TextGenix"
              description="Generate human-like text with this advanced NLP model."
              image="https://via.placeholder.com/300x150"
            />
            <Card
              title="ImageCraft"
              description="Create stunning visuals with AI-powered generation."
              image="https://via.placeholder.com/300x150"
            />
            <Card
              title="ChainBot"
              description="Chain multiple AI models for custom workflows."
              image="https://via.placeholder.com/300x150"
            />
          </div>
        </section>
        <ChatbotButton onClick={() => alert('Open chatbot modal here!')} />
      </div>
    );
  };

export default Home;
