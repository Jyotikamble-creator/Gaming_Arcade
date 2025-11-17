import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ icon, title, description, path }) => {
  const content = (
    <div className="bg-card-bg p-6 rounded-lg shadow-xl hover:shadow-2xl transition duration-300 ease-in-out border border-transparent hover:border-primary-blue cursor-pointer">
      {/* Icon (Placeholder: replace with actual icons or SVGs) */}
      <div className="text-4xl font-bold text-primary-blue mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-light-text mb-2">
        {title}
      </h3>
      
      <p className="text-subtle-text">
        {description}
      </p>
    </div>
  );

  return path ? <Link to={path}>{content}</Link> : content;
};

export default Card;