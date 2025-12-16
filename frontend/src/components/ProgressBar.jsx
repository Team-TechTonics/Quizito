
import React from 'react';

const ProgressBar = ({ progress = 0, label = '' }) => {
  return (
    <div className="progress-bar-container">
      {label && <div className="progress-bar-label">{label}</div>}
      <div className="progress-bar-background">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="progress-bar-text">{progress}%</div>
    </div>
  );
};

export default ProgressBar;
