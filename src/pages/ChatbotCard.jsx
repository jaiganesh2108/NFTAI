import React from 'react';
import '../styles/components.css'; // Import your CSS

const ChatbotCard = ({ onClose }) => {
  return (
    <div className="chatbot-card">
      <div className="chatbot-card-header">
        <p className="chatbot-header-text">
          Hi there! 👋 Welcome to our chat.
        </p>
        <button className="chatbot-card-close" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="chatbot-card-body">
        {/* Chat messages can appear here */}
      </div>
      <div className="chatbot-card-footer">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default ChatbotCard;
