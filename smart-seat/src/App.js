import { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import SignIn from './signin';
import SignUp from './signup';
import Form from './form';
import Home from './home';
import Seat from './seat';
import SeatRecords from './seat-records';
import Mine from './mine';
import LecClass from './lec-class';
import Canteen1 from './Canteen1';

// ==================================================================
// SOLUTION: The PrivateRoute component is moved OUTSIDE the App function.
// This prevents it from being recreated on every render, which was causing
// the page components to unmount and remount (appearing as a "refresh").
// ==================================================================
const PrivateRoute = ({ element, requireLecturer = false }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (requireLecturer && currentUser?.role !== 'lecturer') {
    return <Navigate to="/mine" replace />;
  }

  return element;
};


function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredTab, setHoveredTab] = useState('');
  const [seatMenuOpen, setSeatMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [seatSubItemHover, setSeatSubItemHover] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const seatRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // The PrivateRoute component definition has been moved outside.

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    if (isLoggedIn && currentUser) {
      setUserInfo(JSON.parse(currentUser));
    }
  }, []);

  useEffect(() => {
    let path = location.pathname;
    if (path === '/home') {
      setActiveTab('home');
    }
    else if (path.startsWith('/seat') || path === '/lec-class' || path === '/seat-records') {
      setActiveTab('seat');
    }
     else if (path === '/mine') {
      setActiveTab('mine');
    }
    setHoveredTab('');
    setSeatSubItemHover('');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (seatRef.current && !seatRef.current.contains(event.target)) {
        setSeatMenuOpen(false);
        setSeatSubItemHover('');
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

  const updateExpiredBookings = async (userId) => {
    try {
      await axios.post('/api/bookings/update-expired', { userId });
    } catch (err) {
      console.error('Failed to update expired bookings:', err);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      const syncUserInfo = async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (!currentUser || !currentUser.id) return;
          const response = await fetch('/api/users/me', {
            headers: { 'user-id': currentUser.id }
          });
          const userData = await response.json();
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUserInfo(userData);

          await updateExpiredBookings(userData.id);
        } catch (err) {
          console.error('Failed to sync user info:', err);
        }
      };
      syncUserInfo();
    }
  }, []);

  const fetchNotifications = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    try {
      const response = await axios.get('/api/bookings', {
        params: {
          userId: currentUser.id,
          status: 1
        }
      });
      const sortedNotifications = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.start_time}`);
        const dateB = new Date(`${b.date} ${b.start_time}`);
        return dateB - dateA;
      });
      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      fetchNotifications();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      setUserInfo(null);
      navigate('/signin', { replace: true });
    }
  };

  const handleEditProfile = () => {
    setProfileMenuOpen(false);
    setSidebarOpen(false);
    navigate('/mine?edit=true');
  };

  const goToMine = () => {
    setProfileMenuOpen(false);
    setSidebarOpen(false);
    navigate('/mine');
  };

  const handleSeatBooking = () => {
    setSeatMenuOpen(false);
    setActiveTab('seat');
    setSidebarOpen(false);
    navigate('/seat');
  };

  const getUnderlineWidth = (tab) => {
    if (activeTab === tab || hoveredTab === tab || (tab === 'seat' && seatMenuOpen)) {
      return '80px';
    }
    return '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const styles = {
    appContainer: {
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      position: 'relative'
    },
    navbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.5rem',
      height: '80px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999,
      margin: 0,
      boxSizing: 'border-box',
      borderBottom: '1px solid #f0f2f5'
    },
    navbarLeft: {
      display: 'flex',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem'
    },
    logoIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      backgroundColor: '#165DFF',
      color: '#ffffff',
      borderRadius: '6px',
      fontWeight: 700,
      fontSize: '1.1rem'
    },
    logoText: {
      color: '#1D2129',
      fontWeight: 700,
      fontSize: '1.25rem'
    },
    navLinks: {
      display: 'flex',
      gap: '4rem',
      margin: '0 auto'
    },
    navItem: {
      position: 'relative',
      color: '#4E5969',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      padding: '0.75rem 0',
      transition: 'color 0.2s ease',
      cursor: 'pointer'
    },
    activeNavItem: {
      color: '#165DFF',
      fontWeight: 'bold'
    },
    underlineIndicator: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      height: '3px',
      backgroundColor: '#165DFF',
      borderRadius: '2px',
      transition: 'width 0.3s ease'
    },
    seatContainer: {
      position: 'relative'
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      margin: '0 0 0 0',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      padding: '8px 0',
      minWidth: '180px',
      zIndex: 1000,
      overflow: 'hidden'
    },
    dropdownItem: {
      padding: '10px 16px',
      color: '#4E5969',
      textDecoration: 'none',
      display: 'block',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
      position: 'relative'
    },
    dropdownItemHover: {
      backgroundColor: '#F2F3F5',
      color: '#165DFF'
    },
    profileContainer: {
      position: 'relative',
      cursor: 'pointer'
    },
    profileImage: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#E5E6EB',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '16px',
      color: '#1D2129',
      fontWeight: 600,
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    profileImageHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
    },
    profileMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      margin: '0 0 0 0',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      padding: '8px 0',
      minWidth: '180px',
      zIndex: 1000
    },
    notificationContainer: {
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    notificationIcon: {
      width: '24px',
      height: '24px',
      transition: 'opacity 0.2s ease'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    notificationModal: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 1000,
      position: 'relative'
    },
    notificationModalContent: {
      padding: '24px'
    },
    notificationHeader: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#1D2129',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #E0E0E0'
    },
    notificationList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    notificationItem: {
      padding: '16px',
      borderBottom: '1px solid #F5F5F5',
      color: '#4E5969',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    noNotification: {
      padding: '32px',
      textAlign: 'center',
      color: '#86909C',
      fontSize: '14px'
    },
    profileMenuItem: {
      padding: '10px 16px',
      color: '#4E5969',
      textDecoration: 'none',
      display: 'block',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
      textAlign: 'right'
    },
    mobileBottomNav: {
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#ffffff',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
      zIndex: 9998,
      justifyContent: 'space-around',
      alignItems: 'center'
    },
    mobileNavItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4E5969',
      textDecoration: 'none',
      fontSize: '10px',
      width: '33.33%',
      height: '100%'
    },
    activeMobileNavItem: {
      color: '#165DFF',
      fontWeight: 'bold'
    },
    mobileNavIcon: {
      width: '25px',
      height: '25px',
      marginBottom: '2px'
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: '-280px',
      width: '280px',
      height: '100vh',
      backgroundColor: '#ffffff',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: 10000,
      transition: 'left 0.3s ease',
      paddingTop: '70px',
      boxSizing: 'border-box'
    },
    sidebarOpen: {
      left: 0
    },
    sidebarOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'none'
    },
    sidebarOverlayVisible: {
      display: 'block'
    },
    sidebarItem: {
      padding: '15px 25px',
      color: '#4E5969',
      textDecoration: 'none',
      display: 'block',
      fontSize: '16px',
      borderBottom: '1px solid #f0f2f5',
      transition: 'background-color 0.2s ease'
    },
    sidebarItemHover: {
      backgroundColor: '#F2F3F5',
      color: '#165DFF'
    },
    sidebarHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: '1px solid #f0f2f5'
    },
    closeSidebar: {
      fontSize: '20px',
      cursor: 'pointer',
      color: '#4E5969'
    },
    mobileMenuButton: {
      display: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#4E5969'
    },
    contentContainer: {
      minHeight: '100vh',
      paddingBottom: 0
    }
  };

  const isMobile = window.innerWidth < 768;
  
  return (
    <div style={styles.appContainer}>
      {!['/', '/signin', '/signup', '/form'].includes(location.pathname) && (
        <>
          <nav style={styles.navbar}>
            <div style={styles.navbarLeft}>
              <div style={styles.logo}>
                <div style={styles.logoIcon}>S</div>
                <span style={styles.logoText}>Smart Seat</span>
              </div>
            </div>
            
            <div style={{
              ...styles.mobileMenuButton,
              display: isMobile ? 'block' : 'none'
            }} onClick={() => setSidebarOpen(true)}>
              ☰
            </div>
            
            <div style={{
              ...styles.navLinks,
              display: isMobile ? 'none' : 'flex'
            }}>
              <NavLink 
                to="/home" 
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
                  setSeatSubItemHover('');
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
                    onMouseLeave={() => {
                      setSeatMenuOpen(false);
                      setSeatSubItemHover('');
                    }}
                  >
                    <div 
                      style={{ 
                        ...styles.dropdownItem,
                        ...(seatSubItemHover === 'booking' || location.pathname === '/seat' ? styles.dropdownItemHover : {})
                      }}
                      onClick={handleSeatBooking}
                      onMouseEnter={() => setSeatSubItemHover('booking')}
                      onMouseLeave={() => setSeatSubItemHover('')}
                    >
                      Book a Seat
                    </div>
                    <div
                      style={{ 
                        ...styles.dropdownItem,
                        ...(seatSubItemHover === 'records' || location.pathname === '/seat-records' ? styles.dropdownItemHover : {})
                      }}
                      onClick={() => {
                        setSeatMenuOpen(false);
                        setActiveTab('seat');
                        navigate('/seat-records');
                      }}
                      onMouseEnter={() => setSeatSubItemHover('records')}
                      onMouseLeave={() => setSeatSubItemHover('')}
                    >
                      Booking Records
                    </div>
                    {userInfo?.role === 'lecturer' && (
                      <div 
                        style={{ 
                          ...styles.dropdownItem,
                          ...(seatSubItemHover === 'tutorView' || location.pathname === '/lec-class' ? styles.dropdownItemHover : {})
                        }}
                        onClick={() => {
                          setSeatMenuOpen(false);
                          setActiveTab('seat');
                          navigate('/lec-class');
                        }}
                        onMouseEnter={() => setSeatSubItemHover('tutorView')}
                        onMouseLeave={() => setSeatSubItemHover('')}
                      >
                        Tutor View
                      </div>
                    )}
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
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              display: isMobile ? 'none' : 'flex'
            }}>
              <div 
                style={styles.notificationContainer}
                onClick={handleNotificationClick}
                onMouseEnter={() => setHoveredTab('notification')}
                onMouseLeave={() => setHoveredTab('')}
              >
                <img 
                  src="/notification.png" 
                  alt="Notifications" 
                  style={styles.notificationIcon}
                />
              </div>
              
              <div 
                ref={profileRef}
                style={styles.profileContainer}
                onMouseEnter={() => {
                  setProfileMenuOpen(true);
                }}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <div 
                  style={{ 
                    ...styles.profileImage,
                    ...(profileMenuOpen ? styles.profileImageHover : {})
                  }}
                  onClick={goToMine}
                >
                  {userInfo?.email?.charAt(0).toUpperCase() || localStorage.getItem('savedEmail')?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                {profileMenuOpen && (
                  <div 
                    style={styles.profileMenu}
                    onMouseLeave={() => setProfileMenuOpen(false)}
                  >
                    <div 
                      style={styles.profileMenuItem}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProfile();
                      }}
                    >
                      Edit Profile
                    </div>
                    <div 
                      style={styles.profileMenuItem}
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <div style={{
            ...styles.sidebar,
            ...(sidebarOpen ? styles.sidebarOpen : {})
          }}>
            <div style={styles.sidebarHeader}>
              <div style={styles.logoText}>Menu</div>
              <div style={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>×</div>
            </div>
            <div 
              style={styles.sidebarItem}
              onClick={() => {
                handleNotificationClick();
                setSidebarOpen(false);
              }}
            >
              Notifications
            </div>
            <div 
              style={styles.sidebarItem}
              onClick={handleSeatBooking}
            >
              Book a Seat
            </div>
            <div 
              style={styles.sidebarItem}
              onClick={() => {
                setSidebarOpen(false);
                navigate('/seat-records');
              }}
            >
              Booking Records
            </div>
            {userInfo?.role === 'lecturer' && (
              <div 
                style={styles.sidebarItem}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate('/lec-class');
                }}
              >
                Tutor View
              </div>
            )}
            <div 
              style={styles.sidebarItem}
              onClick={handleEditProfile}
            >
              Edit Profile
            </div>
            <div 
              style={styles.sidebarItem}
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>

          <div 
            style={{
              ...styles.sidebarOverlay,
              ...(sidebarOpen ? styles.sidebarOverlayVisible : {})
            }}
            onClick={() => setSidebarOpen(false)}
          ></div>

          <div style={{
            ...styles.mobileBottomNav,
            display: isMobile ? 'flex' : 'none'
          }}>
            <NavLink 
              to="/home" 
              style={({ isActive }) => ({ 
                ...styles.mobileNavItem, 
                ...(isActive ? styles.activeMobileNavItem : {}) 
              })}
              onClick={() => setActiveTab('home')}
            >
              <img style={styles.mobileNavIcon} src={'/home.png'}></img>
              <span>Home</span>
            </NavLink>
            <NavLink 
              to="/seat" 
              style={({ isActive }) => ({ 
                ...styles.mobileNavItem, 
                ...(isActive ? styles.activeMobileNavItem : {}) 
              })}
              onClick={() => setActiveTab('seat')}
            >
              <img style={styles.mobileNavIcon} src={'/seat.png'}></img>
              <span>Seat</span>
            </NavLink>
            <NavLink 
              to="/mine" 
              style={({ isActive }) => ({ 
                ...styles.mobileNavItem, 
                ...(isActive ? styles.activeMobileNavItem : {}) 
              })}
              onClick={() => setActiveTab('mine')}
            >
              <img style={styles.mobileNavIcon} src={'/user.png'}></img>
              <span>Mine</span>
            </NavLink>
          </div>
        </>
      )}
      
      <div style={{
        ...styles.contentContainer,
        paddingBottom: isMobile ? '60px' : 0
      }}>
        {notificationOpen && (
          <div style={styles.modalOverlay} onClick={() => setNotificationOpen(false)}>
            <div 
              style={styles.notificationModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.notificationModalContent}>
                <div style={styles.notificationHeader}>Booking Reminders</div>
                {notifications.length > 0 ? (
                  <ul style={styles.notificationList}>
                    {notifications.map(notification => (
                      <li key={notification.id} style={styles.notificationItem}>
                        Booking Start Reminder: Your booking is about to start. 
                        Room: {notification.room}, Seat: {notification.seat_number}, 
                        Date: {formatDate(notification.date)}, Time: {notification.start_time} - {notification.end_time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.noNotification}>No booking reminders available.</div>
                )}
              </div>
            </div>
          </div>
        )}
        
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/form" element={<PrivateRoute element={<Form />} />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/seat" element={<PrivateRoute element={<Seat />} />} />
        <Route path="/seat-records" element={<PrivateRoute element={<SeatRecords />} />} />
        <Route path="/mine" element={<PrivateRoute element={<Mine />} />} />
        <Route path="/lec-class" element={<PrivateRoute element={<LecClass />} requireLecturer={true} />} />
        <Route path="/canteen-1" element={<PrivateRoute element={<Canteen1 />} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      
      </div>
    </div>
  );
}

export default App;