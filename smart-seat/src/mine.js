import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Mine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    jcu_id: '',
    birthday: '',
    gender: '',
    avatar: '/user-avatar.png',
    major: '',
    reservedSeats: 17,
    checkInRate: '92%',
    recentAppointment: {
      dateTime: '2025-07-17 12:00',
      classroom: 'C4-13',
      seat: '37'
    },
    favoriteClassrooms: ['C3-04', 'C4-14', 'A2-11'],
    favoriteSeats: ['Table2-06']
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true') {
      setIsEditModalOpen(true);
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

  const handleUpdateProfile = async () => {
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
      padding: '2.5rem 3rem',
      boxSizing: 'border-box',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        width: '100%'
      }}>
        <div style={{
          width: '30%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: '2rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              color: '#1D2129',
              margin: '0 0 1.8rem 0',
              fontWeight: 600
            }}>Personal Information</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '1.8rem'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
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
                fontSize: '1.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.name}</span>
              <span style={{
                fontSize: '0.95rem',
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
              gap: '1.2rem',
              marginBottom: '1.8rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>Email</span>
                <span style={{
                  fontSize: '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.email}</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>ID</span>
                <span style={{
                  fontSize: '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.jcu_id}</span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>Birthday</span>
                <span style={{
                  fontSize: '1.1rem',
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
          width: '70%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.8rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1.8rem',
            width: '100%'
          }}>
            <div style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              padding: '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '0.95rem',
                color: '#64748B',
                marginBottom: '0.5rem'
              }}>Number of Reserved Seats</span>
              <span style={{
                fontSize: '2.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.reservedSeats}</span>
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
              padding: '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '0.95rem',
                color: '#64748B',
                marginBottom: '0.5rem'
              }}>Check-in Rate</span>
              <span style={{
                fontSize: '2.2rem',
                color: '#1D2129',
                fontWeight: 600
              }}>{userData.checkInRate}</span>
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: '1.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                color: '#1D2129',
                margin: '0 0 0.6rem 0',
                fontWeight: 600
              }}>Most Recent Appointment</h3>
              <p style={{
                fontSize: '1rem',
                color: '#475467',
                margin: 0
              }}>
                {userData.recentAppointment.dateTime} | Classroom {userData.recentAppointment.classroom} | Seat {userData.recentAppointment.seat}
              </p>
            </div>
            <a href="/appointment-records" style={{
              fontSize: '0.95rem',
              color: '#165DFF',
              textDecoration: 'none',
              fontWeight: 500
            }}>view all &gt;</a>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            padding: '1.8rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.2rem'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                color: '#1D2129',
                margin: 0,
                fontWeight: 600
              }}>My Favorite Classrooms</h3>
              <a href="/favorite-classrooms" style={{
                fontSize: '0.95rem',
                color: '#165DFF',
                textDecoration: 'none',
                fontWeight: 500
              }}>view all &gt;</a>
            </div>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {userData.favoriteClassrooms.map((classroom, index) => (
                <span key={index} style={{
                  backgroundColor: '#F0F5FF',
                  color: '#165DFF',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}>{classroom}</span>
              ))}
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              color: '#1D2129',
              margin: '0 0 1.5rem 0',
              fontWeight: 600
            }}>Edit Profile</h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.95rem',
                  color: '#64748B',
                  marginBottom: '0.3rem'
                }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
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
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.95rem',
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
                  fontSize: '0.95rem',
                  textAlign: 'left'
                }}
              >
                {editData.showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              {editData.showPasswordForm && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      color: '#64748B',
                      marginBottom: '0.3rem'
                    }}>Old Password</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={editData.oldPassword}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      color: '#64748B',
                      marginBottom: '0.3rem'
                    }}>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={editData.newPassword}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      color: '#64748B',
                      marginBottom: '0.3rem'
                    }}>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={editData.confirmNewPassword}
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
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditData(prev => ({
                    ...prev,
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    showPasswordForm: false
                  }));
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
                onClick={handleUpdateProfile}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Mine;