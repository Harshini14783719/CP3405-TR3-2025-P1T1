import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Form = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    jcu_id: '',
    gender: '',
    major: '',
    birthday: ''
  });
  const [role, setRole] = useState('student');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userRole = searchParams.get('role');
    const savedEmail = localStorage.getItem('savedEmail');
    
    if (!userRole || !savedEmail) {
      navigate('/signin', { replace: true });
      return;
    }
    
    setRole(userRole);
  }, [location.search, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, jcu_id, gender, birthday, major } = formData;
    
    if (!name || !jcu_id || !gender || !birthday) {
      alert('Please fill in all required fields!');
      return;
    }
    
    if (!/^\d{6}$/.test(jcu_id)) {
      alert('JCU ID must be 6 digits!');
      return;
    }
    
    if (role === 'student' && !major) {
      alert('Please enter your major!');
      return;
    }

    try {
      const email = localStorage.getItem('savedEmail');
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          jcu_id,
          gender,
          birthday,
          ...(role === 'student' && { major }),
          role
        })
      });
      
      const data = await response.json();
      if (data.success) {
        try {
          const userResponse = await fetch('/api/users/me', {
            headers: { 'user-id': data.user.id }
          });
          const userData = await userResponse.json();
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to fetch full user info:', err);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/', { replace: true });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to save profile: Network error');
    }
  };

  const getStyles = () => {
    const baseStyles = {
      formContainer: {
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 120px',
        margin: 0,
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden'
      },
      formBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -2
      },
      formBgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: -1
      },
      profileForm: {
        backgroundColor: '#FFFFFF',
        padding: '56px 48px',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.18)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'left',
        borderTop: '5px solid #2563EB'
      },
      systemTitle: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#111827',
        margin: 0,
        marginBottom: '12px',
        letterSpacing: '-0.6px'
      },
      pageTitle: {
        fontSize: '19px',
        fontWeight: 600,
        color: '#4B5563',
        margin: 0,
        marginBottom: '40px',
        letterSpacing: '-0.3px'
      },
      formGroup: {
        marginBottom: '28px',
        width: '100%'
      },
      formLabel: {
        display: 'block',
        fontSize: '15px',
        color: '#4B5563',
        marginBottom: '8px',
        fontWeight: 600
      },
      formInput: {
        width: '100%',
        padding: '15px 18px',
        border: '1px solid #D1D5DB',
        borderRadius: '10px',
        fontSize: '17px',
        color: '#111827',
        boxSizing: 'border-box',
        outline: 'none'
      },
      formInputFocus: {
        borderColor: '#2563EB',
        boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.15)'
      },
      genderOptions: {
        display: 'flex',
        gap: '16px',
        width: '100%'
      },
      genderLabel: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 0',
        border: '1px solid #D1D5DB',
        borderRadius: '10px',
        fontSize: '17px',
        color: '#4B5563',
        cursor: 'pointer',
        position: 'relative'
      },
      genderLabelChecked: {
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        color: '#2563EB'
      },
      genderRadio: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer'
      },
      submitBtn: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '10px',
        fontSize: '17px',
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '-0.2px',
        marginBottom: '32px'
      }
    };

    // Tablet styles
    if (window.innerWidth < 1024 && window.innerWidth >= 768) {
      return {
        ...baseStyles,
        formContainer: {
          ...baseStyles.formContainer,
          padding: '0 60px'
        },
        profileForm: {
          ...baseStyles.profileForm,
          padding: '48px 36px',
          maxWidth: '400px'
        },
        systemTitle: {
          ...baseStyles.systemTitle,
          fontSize: '26px'
        },
        pageTitle: {
          ...baseStyles.pageTitle,
          fontSize: '18px',
          marginBottom: '32px'
        },
        formGroup: {
          ...baseStyles.formGroup,
          marginBottom: '24px'
        }
      };
    }

    // Mobile styles
    if (window.innerWidth < 768) {
      return {
        ...baseStyles,
        formContainer: {
          ...baseStyles.formContainer,
          padding: '0 20px',
          justifyContent: 'center',
          paddingTop: '40px',
          paddingBottom: '40px'
        },
        profileForm: {
          ...baseStyles.profileForm,
          padding: '36px 24px',
          maxWidth: '100%',
          width: '100%'
        },
        systemTitle: {
          ...baseStyles.systemTitle,
          fontSize: '24px'
        },
        pageTitle: {
          ...baseStyles.pageTitle,
          fontSize: '17px',
          marginBottom: '28px'
        },
        formGroup: {
          ...baseStyles.formGroup,
          marginBottom: '20px'
        },
        formInput: {
          ...baseStyles.formInput,
          padding: '14px 16px',
          fontSize: '16px'
        },
        genderOptions: {
          ...baseStyles.genderOptions,
          gap: '12px'
        },
        genderLabel: {
          ...baseStyles.genderLabel,
          padding: '12px 0',
          fontSize: '16px'
        },
        submitBtn: {
          ...baseStyles.submitBtn,
          padding: '14px',
          fontSize: '16px',
          marginBottom: '24px'
        }
      };
    }

    return baseStyles;
  };

  const styles = getStyles();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on resize
      setFormData(prev => ({ ...prev }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.formContainer}>
      <div style={styles.formBg}></div>
      <div style={styles.formBgOverlay}></div>
      <form style={styles.profileForm} onSubmit={handleSubmit}>
        <h1 style={styles.systemTitle}>Smart Seats System</h1>
        <h2 style={styles.pageTitle}>Complete Your Profile</h2>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.border = '1px solid #D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>JCU ID (6 digits)</label>
          <input
            type="text"
            name="jcu_id"
            value={formData.jcu_id}
            onChange={handleChange}
            placeholder="Enter your 6-digit JCU ID"
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.border = '1px solid #D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
            maxLength="6"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Gender</label>
          <div style={styles.genderOptions}>
            <label 
              style={formData.gender === 'male' ? { ...styles.genderLabel, ...styles.genderLabelChecked } : styles.genderLabel}
            >
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
                style={styles.genderRadio}
              />
              Male
            </label>
            <label 
              style={formData.gender === 'female' ? { ...styles.genderLabel, ...styles.genderLabelChecked } : styles.genderLabel}
            >
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
                style={styles.genderRadio}
              />
              Female
            </label>
          </div>
        </div>
        
        {role === 'student' && (
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Major</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="Enter your major"
              required
              style={styles.formInput}
              onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
              onBlur={(e) => {
                e.target.style.border = '1px solid #D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.border = '1px solid #D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <button type="submit" style={styles.submitBtn}>
          Complete Registration
        </button>
      </form>
    </div>
  );
};

export default Form;