import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  fullScreen = false,
  message,
}) => {
  const content = (
    <>
      <div className={`loader loader-${size}`}>
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
        </svg>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{content}</div>;
  }

  return <div className="loader-container">{content}</div>;
};

export default Loader;
