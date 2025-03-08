import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', isDark = false }) => {
  return (
    <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;