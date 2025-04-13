import React from 'react';

const Button = ({ variant = 'primary', children, onClick, ...props }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'disconnect':
        return 'btn-disconnect';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button 
      className={`btn ${getVariantClass()}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;