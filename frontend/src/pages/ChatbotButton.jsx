import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import '../styles/components.css';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hi! I’m Star, your NooSphere assistant. Ask me about NooSphere’s AI marketplace, $NSP tokens, or how to contribute!', sender: 'bot' },
  ]);
  const [lastTopic, setLastTopic] = useState(null); 
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };


  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();


    const responseMap = [
      {
        topic: 'noosphere',
        keywords: ['what is noosphere', 'about noosphere', 'noosphere is', 'tell me about noosphere','noodsphere'],
        patterns: [/noosphere.*(what|about|is)/i],
        response: 'NooSphere is a decentralized ecosystem for AI, enabling secure sharing, searching, and monetizing of AI models and datasets. It’s trustless, transparent, and rewards contributors with $NSP tokens for tasks like model training or data labeling.'
      },
      {
        topic: 'marketplace',
        keywords: ['decentralized marketplace', 'ai marketplace', 'market', 'publish models'],
        patterns: [/market(?!.*(stock|super)).*ai/i, /publish.*model/i],
        response: 'NooSphere’s Decentralized AI Marketplace allows you to publish, monetize, and control your AI models transparently. Set your terms, share your work, and earn $NSP tokens based on community value.'
      },
      {
        topic: 'Star',
        keywords: ['Star', 'smart chatbot', 'assistant', 'who are you'],
        patterns: [/zephyr.*(what|who)/i, /chatbot.*noosphere/i],
        response: 'I’m Star, NooSphere’s AI assistant. I help you navigate the platform, discover AI models, or upload your own. Ask me anything about NooSphere!'
      },
      {
        topic: 'data_exchange',
        keywords: ['secure data', 'data exchange', 'dataset', 'data sharing', 'privacy controls'],
        patterns: [/data.*(exchange|sharing|secure|privacy)/i, /dataset.*(share|upload)/i],
        response: 'NooSphere’s Secure Data Exchange lets you share datasets with privacy controls and clear licensing. Community feedback ensures quality, and you earn $NSP tokens for valuable data contributions.'
      },
      {
        topic: 'tokens',
        keywords: ['tokens', 'nsp tokens', 'rewards', 'reputation', 'earn tokens', 'nsp'],
        patterns: [/(\$nsp|token|reward|reputation).*(earn|what|how)/i],
        response: 'In NooSphere, you earn $NSP tokens and reputation scores for contributions like uploading AI models, sharing datasets, or providing compute. Contributions are verified on-chain for fairness.'
      },
      {
        topic: 'how_it_works',
        keywords: ['how it works', 'how noosphere works', 'process', 'steps'],
        patterns: [/noosphere.*(work|process|steps)/i],
        response: 'NooSphere operates in three steps: 1) Contribute AI models, datasets, or compute. 2) Get verified on-chain for transparency. 3) Earn $NSP tokens and build reputation.'
      },
      {
        topic: 'buy_sell',
        keywords: ['buy and sell', 'monetize', 'sell models', 'buy models', 'marketplace buy'],
        patterns: [/(buy|sell|monetize).*(model|dataset)/i],
        response: 'In NooSphere’s Decentralized AI Marketplace, you can buy or sell AI models and datasets. Upload your work, set terms, and earn $NSP tokens. Buyers browse with full transparency.'
      },
      {
        topic: 'ai_model',
        keywords: ['ai model', 'what is ai model', 'model definition', 'models in noosphere'],
        patterns: [/ai.*model.*(what|define|is)/i, /model.*noosphere/i],
        response: 'An AI model is a trained program for tasks like predictions or pattern recognition. In NooSphere, you can share, monetize, or use AI models, all verified transparently.'
      },
      {
        topic: 'contribute',
        keywords: ['contribute', 'how to contribute', 'participate', 'join noosphere'],
        patterns: [/contribut(e|ing|ion).*noosphere/i, /join.*platform/i],
        response: 'Contribute to NooSphere by uploading AI models, sharing datasets, labeling data, or offering compute power. Verified contributions earn $NSP tokens and reputation scores.'
      },
      {
        topic: 'trustless',
        keywords: ['trustless', 'permissionless', 'verifiable', 'transparency'],
        patterns: [/(trustless|permissionless|verif(y|iable)).*noosphere/i],
        response: 'NooSphere is trustless—no single entity controls it, with all actions verified on-chain. It’s permissionless, so anyone can contribute, and every step is transparent.'
      },
      {
        topic: 'ai_ownership',
        keywords: ['who owns ai', 'ai belongs', 'ai ownership', 'decentralized ai'],
        patterns: [/ai.*(own|belongs|control)/i],
        response: 'NooSphere believes AI belongs to everyone. Our decentralized platform ensures creators and contributors share benefits via $NSP tokens and transparent governance.'
      },
      {
        topic: 'benefits',
        keywords: ['benefits', 'why contribute', 'advantage noosphere'],
        patterns: [/why.*(contribute|join|use).*noosphere/i, /benefit.*noosphere/i],
        response: 'Contributing to NooSphere earns you $NSP tokens, reputation, and a stake in a decentralized AI ecosystem. You gain control over your models and data with transparent rewards.'
      },
      {
        topic: 'security',
        keywords: ['how secure', 'security', 'data safe', 'platform safe'],
        patterns: [/secure.*(noosphere|data|platform)/i, /safe.*(data|model)/i],
        response: 'NooSphere ensures security through privacy controls, on-chain verification, and transparent licensing. Your data and models are protected with community-driven trust.'
      },
      {
        topic: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        patterns: [/^(hi|hello|hey|Greetings)$/i],
        response: 'Hey! I’m Star, your guide to NooSphere. Ask about our AI marketplace, $NSP tokens, or contributing to get started!'
      }
    ];

    const followUpPatterns = [
      {
        keywords: ['more', 'tell me more', 'details', 'explain'],
        patterns: [/more.*(about|details|explain)/i],
        action: () => {
          if (lastTopic) {
            const prevResponse = responseMap.find(r => r.topic === lastTopic);
            return prevResponse ? `${prevResponse.response} Want specific details? Ask away!` : null;
          }
          return null;
        }
      },
      {
        keywords: ['how do i', 'how to', 'what next'],
        patterns: [/(how.*(do|i)|what.*next)/i],
        action: () => {
          if (lastTopic === 'contribute' || lastTopic === 'buy_sell' || lastTopic === 'tokens') {
            return 'Start by joining NooSphere’s platform to contribute models, datasets, or compute. Set up your profile, upload your work, and earn $NSP tokens after on-chain verification. Need specifics?'
          }
          if (lastTopic) {
            return `For ${lastTopic.replace('_', ' ')}, explore NooSphere’s platform to take the next step. Want details on how to proceed?`
          }
          return null;
        }
      }
    ];

    // Handle follow-up questions first
    for (const followUp of followUpPatterns) {
      if (
        followUp.keywords.some(k => lowerMessage.includes(k)) ||
        followUp.patterns.some(p => p.test(lowerMessage))
      ) {
        const followUpResponse = followUp.action();
        if (followUpResponse) {
          return followUpResponse;
        }
      }
    }
    for (const entry of responseMap) {
      if (
        entry.keywords.some(k => lowerMessage.includes(k)) ||
        entry.patterns.some(p => p.test(lowerMessage))
      ) {
        setLastTopic(entry.topic); 
        return entry.response;
      }
    }

    setLastTopic(null); 
    return 'Sorry, that’s unknown information. I’m focused on NooSphere—try asking about the AI marketplace, $NSP tokens, or how to contribute!';
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: 'user' }]);
      const userMessage = message;
      setMessage('');

      setTimeout(() => {
        const botResponse = generateResponse(userMessage);
        setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && message.trim()) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div className="chatbot-button" onClick={toggleChatbot}>
        <MessageCircle size={24} color="#ffffff" />
      </div>

      {isOpen && (
        <div className="chatbot-card">
          <div className="chatbot-header">
            <h3>Starfire - NooSphere Assistant</h3>
            <button className="close-btn" onClick={toggleChatbot}>
              <X size={20} color="#ffffff" />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}-message`}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#6b48ff' : '#3a3a5c',
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about NooSphere..."
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button className="send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;