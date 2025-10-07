import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './home';
import Seat from './seat';
import Mine from './mine';
import SignIn from './signin';
import SignUp from './signup';
import PrivateRoute from './privateRoute';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredTab, setHoveredTab] = useState('');
  const [seatMenuOpen, setSeatMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const seatRef = useRef(null);
  const profileRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (seatRef.current && !seatRef.current.contains(event.target)) {
        setSeatMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('savedEmail');
    navigate('/signin', { replace: true });
  };

  const handleEditProfile = () => {
    setProfileMenuOpen(false);
    navigate('/mine');
  };

  const handleSeatBooking = () => {
    setSeatMenuOpen(false);
    navigate('/seat');
  };

  const getUnderlineWidth = (tab) => {
    if (activeTab === tab || hoveredTab === tab || (tab === 'seat' && seatMenuOpen)) {
      return '120%';
    }
    return '0';
  };

  const styles = {
    appContainer: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    },
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 40px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      height: '80px',
      margin: 0,
      borderBottom: '1px solid #e0e0e0'
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
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#165DFF',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '18px',
      fontWeight: 700,
      marginRight: '12px'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#1D2129'
    },
    navLinks: {
      display: 'flex',
      alignItems: 'center',
      gap: '70px',
      margin: '0 auto'
    },
    navItem: {
      color: '#4E5969',
      textDecoration: 'none',
      fontSize: '18px',
      fontWeight: 600,
      position: 'relative',
      padding: '12px 0',
      cursor: 'pointer',
      transition: 'color 0.2s ease'
    },
    activeNavItem: {
      color: '#165DFF'
    },
    underlineIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      height: '3px',
      backgroundColor: '#165DFF',
      borderRadius: '2px',
      transition: 'width 0.3s ease',

    },
    seatContainer: {
      position: 'relative'
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '0px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      padding: '8px 0',
      minWidth: '180px',
      zIndex: 1000
    },
    dropdownItem: {
      padding: '10px 16px',
      color: '#4E5969',
      textDecoration: 'none',
      display: 'block',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer'
    },
    dropdownItemHover: {
      backgroundColor: '#F2F3F5'
    },
    profileContainer: {
      position: 'relative',
      cursor: 'pointer'
    },
    profileImage: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      backgroundColor: '#E5E6EB',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '16px',
      color: '#1D2129',
      fontWeight: 600,
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    profileMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '0px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      padding: '8px 0',
      minWidth: '180px',
      zIndex: 1000
    }
  };

  return (
    <div style={styles.appContainer}>
      {!['/signin', '/signup'].includes(location.pathname) && (
        <nav style={styles.navbar}>
          <div style={styles.navbarLeft}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>S</div>
              <span style={styles.logoText}>Smart Seat</span>
            </div>
          </div>
          
          <div style={styles.navLinks}>
            <NavLink 
              to="/" 
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}
              onMouseEnter={() => setHoveredTab('home')}
              onMouseLeave={() => setHoveredTab('')}
              onClick={() => setActiveTab('home')}
            >
              Home
              <span 
                style={{ 
                  ...styles.underlineIndicator,
                  width: getUnderlineWidth('home')
                }}
              ></span>
            </NavLink>
            
            <div 
              ref={seatRef}
              style={styles.seatContainer}
              onMouseEnter={() => {
                setSeatMenuOpen(true);
                setHoveredTab('seat');
              }}
                onMouseLeave={() => {
                setSeatMenuOpen(false);
                setHoveredTab('');
              }}
                        >
              <div 
                style={{ ...styles.navItem, ...(activeTab === 'seat' ? styles.activeNavItem : {}) }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('seat');
                  navigate('/seat');
                }}
              >
                Seat
                <span 
                  style={{ 
                    ...styles.underlineIndicator,
                    width: getUnderlineWidth('seat')
                  }}
                ></span>
              </div>
              
              {seatMenuOpen && (
                <div 
                  style={styles.dropdownMenu}
                  onMouseLeave={() => setSeatMenuOpen(false)}
                >
                  <div 
                    style={styles.dropdownItem}
                    onClick={handleSeatBooking}
                  >
                    Book a Seat
                  </div>
                  <div 
                    style={styles.dropdownItem}
                    onClick={() => {
                      setSeatMenuOpen(false);
                      navigate('/seat/records');
                    }}
                  >
                    Booking Records
                  </div>
                </div>
              )}
            </div>
            
            <NavLink 
              to="/mine" 
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.activeNavItem : {}) })}
              onMouseEnter={() => setHoveredTab('mine')}
              onMouseLeave={() => setHoveredTab('')}
              onClick={() => setActiveTab('mine')}
            >
              Mine
              <span 
                style={{ 
                  ...styles.underlineIndicator,
                  width: getUnderlineWidth('mine')
                }}
              ></span>
            </NavLink>
          </div>
          
          <div 
            ref={profileRef}
            style={styles.profileContainer}
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <div style={styles.profileImage}>
              {localStorage.getItem('savedEmail')?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {profileMenuOpen && (
              <div 
                style={styles.profileMenu}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <div 
                  style={styles.dropdownItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProfile();
                  }}
                >
                  Edit Profile
                </div>
                <div 
                  style={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            )}
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
          path="/seat/records" 
          element={
            <PrivateRoute>
              <div>Booking Records</div>
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