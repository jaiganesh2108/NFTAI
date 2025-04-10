import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatbotButton = ({ onClick }) => {
    return (
        <div className="chatbot-button"
        onClick={onClick}>
            <MessageCircle size={24} />
        </div>
    )
}
export default ChatbotButton;
