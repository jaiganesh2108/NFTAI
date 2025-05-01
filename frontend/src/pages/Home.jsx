import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Card from '../components/Card';
import ChatbotButton from '../pages/ChatbotButton.jsx';
import image1 from '../assets/images/imgg1.jpg';
import image2 from '../assets/images/imagg2.jpg';
import image3 from '../assets/images/imgg3.jpg';
import image4 from '../assets/images/imagg4.jpg';
import image6 from '../assets/images/img6.jpg';
import image7 from '../assets/images/img7.jpg';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

const Home = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('three-canvas').appendChild(renderer.domElement);

    // Create Circular Texture for Stars
    const createStarTexture = () => {
      const size = 128; // Increased resolution for clarity
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      context.beginPath();
      const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = gradient;
      context.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      context.fill();
      return new THREE.CanvasTexture(canvas);
    };

    // Starfield with Circular Texture
    const starTexture = createStarTexture();
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      color: 0xffffff,
      size: 0.5, // Increased size for better visibility
      transparent: true,
      opacity: 0.9,
      alphaTest: 0.05, // Finer transparency cutoff
      depthWrite: false, // Prevent z-fighting artifacts
      blending: THREE.AdditiveBlending, // Enhance glow effect
    });
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Planet
    const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.5,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(10, 5, -20);
    scene.add(planet);

    // Planet Ring
    const ringGeometry = new THREE.RingGeometry(6, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(planet.position);
    scene.add(ring);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const particleVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      particleVertices.push(x, y, z);
    }
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particleVertices, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 30;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0005;
      planet.rotation.y += 0.01;
      ring.rotation.z += 0.005;
      particles.rotation.y += 0.001;
      camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.getElementById('three-canvas').removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="home">
      <div id="three-canvas"></div>
      <Navbar />
      <section className="hero">
        <h1 className="hero-title">Welcome to NooSphere</h1>
        <p className="hero-subtitle">
          A decentralized platform to upload, chain, and monetize AI models — HuggingFace meets Web3.
        </p>
        <div className="hero-buttons">
          <Button>Get Started</Button>
          <Button variant="secondary" onClick={() => navigate('/Marketplace')}>
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
              <li><span className="highlight">Contributors - </span> earn $NSP tokens for value they add.</li>
              <li><span className="highlight">Every contribution - </span> is verifiable and permissionless.</li>
            </ul>
            <p className="noosphere-core">
              At the core of NooSphere: <span className="highlight-text">AI belongs to everyone</span>
            </p>
          </div>
        </div>
      </section>
      <section className="why-choose-noosphere">
        <div className="content-wrapper">
          <h2 className="section-title">Why Choose NooSphere?</h2>
          <div className="solution-container">
            <div className="solution-text">
              <h3 className="solution-heading">Our Solution</h3>
              <ul className="solution-list">
                <li>A decentralized AI marketplace where users can contribute, access, and monetize AI models and data securely using blockchain.</li>
                <li>Users can train AI models collaboratively while ensuring data privacy and transparency.</li>
              </ul>
            </div>
            <div className="problem-solving-text">
              <h3 className="solution-heading">How It Solves the Problem</h3>
              <ul className="solution-list">
                <li><span className="highlight">Decentralization: </span> No single entity controls the AI models or data.</li>
                <li><span className="highlight">Token-based Incentives: </span> Users earn tokens for contributing models, datasets, or compute power.</li>
                <li><span className="highlight">Transparency & Trust: </span> Blockchain ensures an immutable record of AI training, reducing biases and manipulation.</li>
              </ul>
            </div>
            <div className="usp-text">
              <h3 className="solution-heading">Unique Selling Points</h3>
              <ul className="solution-list">
                <li><span className="highlight">Decentralized Governance: </span> Through DAOs for community-driven decisions.</li>
                <li><span className="highlight">Privacy-preserving AI Training: </span> Using blockchain technology.</li>
                <li><span className="highlight">Smart Contract-based Rewards: </span> Automated and fair reward distribution.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="featured core-features">
        <h2 className="featured-title">Core Features</h2>
        <div className="featured-grid">
          <Card
            icon="🤝"
            title="Decentralized AI Marketplace"
            description="Publish and monetize your AI models with transparency."
            image={image1}
          />
          <Card
            icon="🧠"
            title="Smart Chatbot Assistant (Star)"
            description="Discover, upload, and use models with AI assistance."
            image={image2}
          />
          <Card
            icon="💾"
            title="Secure Data Exchange"
            description="Share datasets with privacy and community feedback."
            image={image3}
          />
          <Card
            icon="🎖"
            title="Token Rewards & Reputation"
            description="Earn $NSP tokens and reputation for contributions."
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
              <p>Tokens + reputation</p>
            </div>
          </div>
        </div>
      </section>
      <section className="featured">
        <h2 className="featured-title">Featured Models</h2>
        <div className="featured-grid">
          <Card
            title="TextGenix"
            description="Generate human-like text with advanced NLP."
            image={image1}
          />
          <Card
            title="ImageCraft"
            description="Create stunning visuals with AI generation."
            image={image6}
          />
          <Card
            title="ChainBot"
            description="Chain AI models for custom workflows."
            image={image7}
          />
        </div>
      </section>
      <section className="get-involved">
        <div className="content-wrapper">
          <h2 className="section-title">Get Involved</h2>
          <p className="get-involved-description">
            Join a community of innovators shaping the future of AI. Whether you're a developer, data scientist, or enthusiast, contribute to NooSphere and earn $NSP tokens while building a reputation in a decentralized ecosystem.
          </p>
          <div className="get-involved-buttons">
            <Button onClick={() => navigate('/join')}>Join the Community</Button>
            <Button variant="secondary" onClick={() => navigate('/docs')}>
              Explore Documentation
            </Button>
          </div>
        </div>
      </section>
      {showChatbot && (
        <div className="chatbot-container">
          <div className="chatbot-window">
            <div className="chatbot-header">
              <p>Star AI Assistant</p>
            </div>
            <div className="chatbot-messages">
              <p>Hello! I'm Star, your guide to NooSphere. How can I help?</p>
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