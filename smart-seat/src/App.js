import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './home';
import Seat from './seat';
import Mine from './mine';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    setActiveTab(path);
  }, [location.pathname]);

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
            to="/" 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
            <span className="underline-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/seat" 
            className={`nav-item ${activeTab === 'seat' ? 'active' : ''}`}
          >
            Seat
            <span className="underline-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/mine" 
            className={`nav-item ${activeTab === 'mine' ? 'active' : ''}`}
          >
            Mine
            <span className="underline-indicator"></span>
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/seat" element={<Seat />} />
        <Route path="/mine" element={<Mine />} />
      </Routes>
    </div>
  );
}

export default App;