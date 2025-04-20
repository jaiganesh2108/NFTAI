import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import '../styles/components.css';
import assistantImage from '../assets/images/assistant1.png';

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
        keywords: ['what is noosphere', 'about noosphere', 'noosphere is', 'tell me about noosphere', 'noodsphere'],
        patterns: [/noosphere.*(what|about|is)/i],
        response: 'NooSphere is a decentralized ecosystem for AI, enabling secure sharing, searching, and monetizing of AI models and datasets. It’s trustless, transparent, and rewards contributors with $NSP tokens for tasks like model training or data labeling.',
      },
      {
        topic: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        patterns: [/^(hi|hello|hey|Greetings)$/i],
        response: 'Hey! I’m Star, your guide to NooSphere. Ask about our AI marketplace, $NSP tokens, or contributing to get started!',
      },
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
        },
      },
    ];

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
          <div className="chatbot-content">
            <div className="model-container">
              {/* Add 3D cubes */}
              <div className="cube">
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
                <div className="cube-face"></div>
              </div>
              <div className="cube"></div>
              {/* Add particles */}
              <div className="particle"></div>
              <div className="particle"></div>
              <img
                src={assistantImage}
                alt="Starfire Assistant"
                className="assistant-image"
                style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            <div className="chat-area">
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender}-message`}
                    style={{
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
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotButton;