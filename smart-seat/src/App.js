import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <span className="logo-icon">SS</span>
            <span className="logo-text">Smart Seat</span>
          </div>
        </div>
        
        <div className="nav-links">
          <NavLink 
            to="/home" 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
            <span className="underline-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/seat" 
            className={`nav-item ${activeTab === 'seat' ? 'active' : ''}`}
            onClick={() => setActiveTab('seat')}
          >
            Seat
            <span className="underline-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/mine" 
            className={`nav-item ${activeTab === 'mine' ? 'active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            Mine
            <span className="underline-indicator"></span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default App;
