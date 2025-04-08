import React from 'react';
import '../styles/components.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;