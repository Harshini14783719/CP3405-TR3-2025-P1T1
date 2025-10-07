import React from 'react';

const Mine = () => {
  const userData = {
    name: 'John Doe',
    id: '123456',
    birthday: '2025-01-01',
    gender: 'male',
    avatar: '/user-avatar.png',
    major: 'Information Technology',
    reservedSeats: 17,
    checkInRate: '92%',
    recentAppointment: {
      dateTime: '2025-07-17 12:00',
      classroom: 'C4-13',
      seat: '37'
    },
    favoriteClassrooms: ['C3-04', 'C4-14', 'A2-11'],
    favoriteSeats: ['Table2-06']
  };

  const genderDotStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    border: '2px solid #FFFFFF',
    backgroundColor: userData.gender === 'male' ? '#165DFF' : '#FF6B9E',
    Zindex: 2
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
                }}>ID</span>
                <span style={{
                  fontSize: '1.1rem',
                  color: '#1D2129',
                  fontWeight: 500
                }}>{userData.id}</span>
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

            <button style={{
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
            }}>Edit Profile</button>
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
              }}>My Favorite Seats</h3>
              <a href="/favorite-seats" style={{
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
              {userData.favoriteSeats.map((seat, index) => (
                <span key={index} style={{
                  backgroundColor: '#F0F5FF',
                  color: '#165DFF',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}>{seat}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mine;