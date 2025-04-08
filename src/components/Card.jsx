import React from 'react';
import Button from './Button';
import '../styles/components.css';

const Card = ({ title, description, image, onClick }) => {
  return (
    <div className="card">
      <img src={image || 'https://via.placeholder.com/300x150'} alt={title} className="card-image" />
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      <Button onClick={onClick}>Explore Model</Button>
    </div>
  );
};

export default Card;