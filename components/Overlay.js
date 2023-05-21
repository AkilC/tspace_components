import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './Overlay.css';
import logo from '../assets/TWorlds-Logo.png'


const Overlay = ({ onClose }) => {
  const [activePage, setActivePage] = useState('Worlds');

  const pages = {
    Worlds: { bgColor: '#e6f7ff8c' },
    Projects: { bgColor: '#ffe6e68c' },
    Market: { bgColor: '#e6ffe68c' },
    Vault: { bgColor: '#fff2e68c' },
  };

  return (
    <div className="overlay">
      <nav className="overlay-nav">
      <img src={logo} alt="Your Logo" className="logo" />
        {Object.keys(pages).map((page) => (
          <button
            key={page}
            className={`nav-btn ${activePage === page ? 'active' : ''}`}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
        <button className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </nav>
      <div
        className="overlay-content"
        style={{ backgroundColor: pages[activePage].bgColor }}
      />
    </div>
  );
};

export default Overlay;
