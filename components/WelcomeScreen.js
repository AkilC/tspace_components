import React, { useState } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onEnter }) => {
    const [fadeOut, setFadeOut] = useState(false);

    const handleClick = () => {
      setFadeOut(true);
      // Give some time for the fade-out animation to finish before calling onEnter
      setTimeout(() => {
        onEnter();
      }, 500);
    };
  
    return (
      <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
        <h1>Welcome to Triber Worlds</h1>
        <button onClick={handleClick}>Enter</button>
      </div>
    );
};

export default WelcomeScreen;
