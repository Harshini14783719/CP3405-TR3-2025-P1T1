import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './home';
import Seat from './seat';
import Mine from './mine';
import SignIn from './signin';
import SignUp from './signup';
import PrivateRoute from './privateRoute';
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const path = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    if (['home', 'seat', 'mine'].includes(path)) {
      setActiveTab(path);
    }
  }, [location.pathname]);
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAuthPage = ['/signin', '/signup'].includes(location.pathname);
    if (!isLoggedIn && !isAuthPage) {
      navigate('/signin', { replace: true });
    }
  }, [location.pathname, navigate]);
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('savedEmail');
    navigate('/signin', { replace: true });
  };
  const styles = {
    appContainer: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Arial', sans-serif"
    },
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      margin: 0
    },
    navbarLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#4285F4',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '16px',
      fontWeight: 700,
      marginRight: '8px'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#333'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    navItem: {
      color: '#666',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: 500,
      position: 'relative',
      padding: '8px 0'
    },
    activeNavItem: {
      color: '#4285F4'
    },
    underlineIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 0,
      height: '2px',
      backgroundColor: '#4285F4',
      transition: 'width 0.3s'
    },
    logoutBtn: {
      marginLeft: '20px',
      padding: '8px 16px',
      backgroundColor: '#ea4335',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    }
  };
  return (
    <div style={styles.appContainer}>
      {['/', '/seat', '/mine'].includes(location.pathname) && (
        <nav style={styles.navbar}>
          <div style={styles.navbarLeft}>
            <div style={styles.logo}>
              <span style={{ 'font-size': '1.8rem'}}>🪑</span>
              <span style={styles.logoText}>Smart Seat</span>
            </div>
          </div>
          <div style={styles.navLinks}>
            <NavLink 
              to="/" 
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}
            >
              Home
              <span style={styles.underlineIndicator} onMouseOver={(e) => e.target.style.width = '100%'} onMouseOut={(e) => e.target.style.width = e.target.parentElement.classList.contains('active') ? '100%' : 0}></span>
            </NavLink>
            <NavLink 
              to="/seat" 
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}
            >
              Seat
              <span style={styles.underlineIndicator} onMouseOver={(e) => e.target.style.width = '100%'} onMouseOut={(e) => e.target.style.width = e.target.parentElement.classList.contains('active') ? '100%' : 0}></span>
            </NavLink>
            <NavLink 
              to="/mine" 
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}
            >
              Mine
              <span style={styles.underlineIndicator} onMouseOver={(e) => e.target.style.width = '100%'} onMouseOut={(e) => e.target.style.width = e.target.parentElement.classList.contains('active') ? '100%' : 0}></span>
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutBtn} onMouseOver={(e) => e.target.style.backgroundColor = '#d33526'} onMouseOut={(e) => e.target.style.backgroundColor = '#ea4335'}>
              Logout
            </button>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/seat" 
          element={
            <PrivateRoute>
              <Seat />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/mine" 
          element={
            <PrivateRoute>
              <Mine />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}
export default App;