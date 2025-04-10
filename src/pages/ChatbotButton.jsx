// ChatbotButton.jsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import '../styles/components.css';

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I assist you today?', sender: 'bot' },
  ]);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: 'user' }]);
      setMessage('');

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Thanks for your message! How else can I help?', sender: 'bot' },
        ]);
      }, 500);
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
            <h3>Chat Assistant</h3>
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
                  alignSelf:
                    msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background:
                    msg.sender === 'user' ? '#6b48ff' : '#3a3a5c',
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
              placeholder="Type your message..."
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