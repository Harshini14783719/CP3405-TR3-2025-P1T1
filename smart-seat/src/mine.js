import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Mine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    jcu_id: '',
    birthday: '',
    gender: '',
    avatar: '/user-avatar.png',
    major: '',
    reservedSeats: 0,
    checkInRate: '0%',
    recentAppointment: {},
    favoriteClassrooms: []
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    email: '',
    birthday: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    showPasswordForm: false
  });
  const initialModalCheck = useRef(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (initialModalCheck.current) {
      const params = new URLSearchParams(location.search);
      if (params.get('edit') === 'true') {
        setIsEditModalOpen(true);
      }
      initialModalCheck.current = false;
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate('/signin', { replace: true });
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser.id) {
        navigate('/signin', { replace: true });
        return;
      }
      try {
        const response = await axios.get('/api/users/me', {
          headers: { 'user-id': currentUser.id }
        });
        const user = response.data;
        setUserData(prev => ({
          ...prev,
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          jcu_id: user.jcu_id || '',
          birthday: formatDate(user.birthday),
          gender: user.gender || '',
          major: user.major || ''
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load personal information');
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    setEditData(prev => ({
      ...prev,
      email: userData.email || '',
      birthday: userData.birthday || ''
    }));
  }, [userData]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!userData.id) return;
      try {
        const response = await axios.get('/api/bookings', {
          params: { userId: userData.id }
        });
        const userBookings = response.data;

        const validBookings = userBookings.filter(booking => [0, 1].includes(booking.status));
        const reservedSeats = validBookings.length;

        const checkedInCount = userBookings.filter(booking => booking.status === 1).length;
        const totalCheckableCount = userBookings.filter(booking => [1, 3].includes(booking.status)).length;
        const checkInRate = totalCheckableCount > 0 
          ? `${Math.round((checkedInCount / totalCheckableCount) * 100)}%` 
          : '0%';

        const upcomingBookings = userBookings.filter(booking => booking.status === 0);
        let recentAppointment = {};
        if (upcomingBookings.length > 0) {
          upcomingBookings.sort((a, b) => {
            const dateTimeA = new Date(`${a.date} ${a.start_time}`);
            const dateTimeB = new Date(`${b.date} ${b.start_time}`);
            return dateTimeB - dateTimeA;
          });
          const latest = upcomingBookings[0];
          recentAppointment = {
            date: new Date(latest.date).toISOString().split('T')[0],
            time: latest.start_time,
            room: latest.room,
            seat: latest.seat_number.toString()
          };
        }

        const roomCount = {};
        userBookings.forEach(booking => {
          const room = booking.room;
          roomCount[room] = (roomCount[room] || 0) + 1;
        });
        const favoriteRooms = [];
        if (Object.keys(roomCount).length > 0) {
          const maxCount = Math.max(...Object.values(roomCount));
          for (const [room, count] of Object.entries(roomCount)) {
            if (count === maxCount) {
              favoriteRooms.push(room);
            }
          }
        }

        setUserData(prev => ({
          ...prev,
          reservedSeats,
          checkInRate,
          recentAppointment,
          favoriteClassrooms: favoriteRooms
        }));
      } catch (error) {
        console.error('Error fetching user bookings:', error);
        alert('Failed to load booking information');
      }
    };
    fetchUserBookings();
  }, [userData.id]);

  const genderDotStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    border: '2px solid #FFFFFF',
    backgroundColor: userData.gender === 'male' ? '#165DFF' : '#FF6B9E',
    zIndex: 2
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { email, birthday, oldPassword, newPassword, confirmNewPassword, showPasswordForm } = editData;
    if (showPasswordForm) {
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all password fields');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
      }
    }
    try {
      const requestBody = { email, birthday };
      if (showPasswordForm) {
        requestBody.oldPassword = oldPassword;
        requestBody.newPassword = newPassword;
      }
      const response = await axios.put(`/api/users/${userData.id}`, requestBody);
      setUserData(prev => ({
        ...prev,
        email: response.data.user.email,
        birthday: formatDate(response.data.user.birthday)
      }));
      setEditData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        showPasswordForm: false
      }));
      setIsEditModalOpen(false);
      navigate('/mine', { replace: true });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Update failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      margin: 0,
      padding: isMobile ? '1.5rem 1rem' : '2.5rem 3rem',
      boxSizing: 'border-box',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        gap: isMobile ? '1.5rem' : '2.5rem',
        width: '100%',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <div style={{
          width: isMobile ? '100%' : '30%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: isMobile ? '1.5rem' : '2rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.2rem' : '1.3rem',
              color: '#1D2129',
              margin: `0 0 ${isMobile ? '1.2rem' : '1.8rem'} 0`,
              fontWeight: 600
            }}>Personal Information</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: isMobile ? '1.2rem' : '1.8rem'
            }}>
              <div style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                borderRadius: '50%',
                overflow: 'visible',
                position: 'relative',
                marginBottom: '1rem'
              }}>
                <img 
                  src={userData.avatar} 
                  alt="User Avatar" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={genderDotStyle}></div>
              </div>
              <span style={{
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.name}</span>
              <span style={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                color: '#64748B',
                marginTop: '0.3rem'
              }}>{userData.major}</span>
            </div>
            <div style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#F1F5F9',
              marginBottom: '1.5rem'
            }}></div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.2rem',
              marginBottom: isMobile ? '1.2rem' : '1.8rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.9rem' : '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>Email</span>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.email}</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.9rem' : '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>ID</span>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.jcu_id}</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: isMobile ? '0.9rem' : '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>Birthday</span>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.birthday}</span>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#F1F5F9',
              marginBottom: '1.5rem'
            }}></div>
            <button 
              style={{
                width: '100%',
                backgroundColor: '#165DFF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 0',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'backgroundColor 0.2s ease'
              }}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
        <div style={{
          width: isMobile ? '100%' : '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1.2rem' : '1.8rem'
        }}>
          <div style={{
            display: 'flex',
            gap: isMobile ? '1rem' : '1.8rem',
            width: '100%',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <div style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              padding: isMobile ? '1.2rem' : '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                color: '#64748B',
                marginBottom: '0.5rem'
              }}>Number of Reserved Seats</span>
              <span style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.reservedSeats}</span>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              padding: isMobile ? '1.2rem' : '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                color: '#64748B',
                marginBottom: '0.5rem'
              }}>Check-in Rate</span>
              <span style={{
                fontSize: isMobile ? '1.8rem' : '2.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.checkInRate}</span>
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: isMobile ? '1.2rem' : '1.8rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.2rem'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: '#1D2129',
                margin: 0,
                fontWeight: 600
              }}>Most Recent Appointment</h3>
              <a href="/seat-records" style={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                color: '#165DFF',
                textDecoration: 'none',
                fontWeight: 500
              }}>view all &gt;</a>
            </div>
            <p style={{
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: '#475467',
              margin: 0,
              wordBreak: 'break-all'
            }}>
              {userData.recentAppointment.date 
                ? `${userData.recentAppointment.date} ${userData.recentAppointment.time} | Room ${userData.recentAppointment.room} | Seat ${userData.recentAppointment.seat}`
                : 'No upcoming appointments'}
            </p>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: isMobile ? '1.2rem' : '1.8rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.2rem'
            }}>
              <h3 style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: '#1D2129',
                margin: 0,
                fontWeight: 600
              }}>My Favorite Rooms</h3>
              <a href="/seat-records" style={{
                fontSize: isMobile ? '0.9rem' : '0.95rem',
                color: '#165DFF',
                textDecoration: 'none',
                fontWeight: 500
              }}>view all &gt;</a>
            </div>
            <div style={{
              display: 'flex',
              gap: isMobile ? '0.8rem' : '1.5rem',
              flexWrap: 'wrap'
            }}>
              {userData.favoriteClassrooms.length > 0 
                ? userData.favoriteClassrooms.map((room, index) => (
                    <span key={index} style={{
                      backgroundColor: '#F0F5FF',
                      color: '#165DFF',
                      borderRadius: '4px',
                      padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
                      fontSize: isMobile ? '0.9rem' : '0.95rem',
                      fontWeight: 500
                    }}>{room}</span>
                  ))
                : <span style={{
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: '#64748B'
                  }}>No favorite rooms yet</span>
              }
            </div>
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '1.5rem' : '2rem',
            width: isMobile ? '100%' : '500px',
            maxWidth: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <form onSubmit={handleUpdateProfile}>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.3rem',
                color: '#1D2129',
                margin: `0 0 ${isMobile ? '1.2rem' : '1.5rem'} 0`,
                fontWeight: 600
              }}>Edit Profile</h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1rem' : '1.2rem',
                marginBottom: isMobile ? '1.2rem' : '1.5rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: '#64748B',
                    marginBottom: '0.3rem'
                  }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    autoComplete="username"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    color: '#64748B',
                    marginBottom: '0.3rem'
                  }}>Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={editData.birthday}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditData(prev => ({ ...prev, showPasswordForm: !prev.showPasswordForm }))}
                  style={{
                    padding: '0.6rem 0',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#165DFF',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    textAlign: 'left'
                  }}
                >
                  {editData.showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                </button>
                {editData.showPasswordForm && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '1rem' : '1.2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                        color: '#64748B',
                        marginBottom: '0.3rem'
                      }}>Old Password</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={editData.oldPassword}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                        color: '#64748B',
                        marginBottom: '0.3rem'
                      }}>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={editData.newPassword}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: isMobile ? '0.9rem' : '0.95rem',
                        color: '#64748B',
                        marginBottom: '0.3rem'
                      }}>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={editData.confirmNewPassword}
                        onChange={handleInputChange}
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditData(prev => ({
                      ...prev,
                      oldPassword: '',
                      newPassword: '',
                      confirmNewPassword: '',
                      showPasswordForm: false
                    }));
                    navigate('/mine', { replace: true });
                  }}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: 'white',
                    color: '#64748B',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#165DFF',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mine;