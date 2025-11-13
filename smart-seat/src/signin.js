import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, rememberMe } = formData;
    
    if (!email || !password) {
      alert('Please fill in the form completely!');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        if (rememberMe) localStorage.setItem('savedEmail', email);

        let userData = null;

        try {
          const userResponse = await fetch('/api/users/me', {
            headers: { 'user-id': data.user.id }
          });
          userData = await userResponse.json();
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to fetch full user info:', err);
          userData = data.user;
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // ⭐ ADDED: Admin must have ID starting with 19
        if (userData.role === "admin") {
          if (!userData.jcu_id || !userData.jcu_id.startsWith("19")) {
            alert("Admin login denied. Admin ID must start with '19'.");
            return;
          }
        }

        // ⭐ NO CHANGE BELOW — ORIGINAL REDIRECT LOGIC
        if (data.user.profileCompleted) {
          navigate('/home', { replace: true });
        } else {
          navigate(`/form?role=${data.user.role}`, { replace: true });
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Login failed: Network error');
    }
  };

  const getStyles = () => {
    const baseStyles = {
      signinContainer: {
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
      signinBg: {
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
      signinBgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: -1
      },
      signinForm: {
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
      rememberMe: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '36px',
        gap: '10px'
      },
      rememberCheckbox: {
        width: '20px',
        height: '20px',
        accentColor: '#2563EB',
        cursor: 'pointer',
        border: '1px solid #D1D5DB',
        borderRadius: '4px'
      },
      rememberLabel: {
        fontSize: '15px',
        color: '#4B5563',
        cursor: 'pointer',
        userSelect: 'none',
        letterSpacing: '-0.2px'
      },
      signinBtn: {
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
      },
      signupLink: {
        fontSize: '15px',
        color: '#4B5563',
        textAlign: 'center',
        letterSpacing: '-0.2px'
      },
      linkText: {
        color: '#2563EB',
        textDecoration: 'none',
        fontWeight: 600,
        marginLeft: '4px'
      }
    };

    if (window.innerWidth <= 1024 && window.innerWidth > 768) {
      return {
        ...baseStyles,
        signinContainer: {
          ...baseStyles.signinContainer,
          padding: '0 60px'
        },
        signinForm: {
          ...baseStyles.signinForm,
          maxWidth: '400px',
          padding: '48px 40px'
        },
        systemTitle: {
          ...baseStyles.systemTitle,
          fontSize: '26px'
        },
        pageTitle: {
          ...baseStyles.pageTitle,
          fontSize: '18px',
          marginBottom: '32px'
        }
      };
    }

    if (window.innerWidth <= 768) {
      return {
        ...baseStyles,
        signinContainer: {
          ...baseStyles.signinContainer,
          padding: '0 24px',
          justifyContent: 'center'
        },
        signinForm: {
          ...baseStyles.signinForm,
          maxWidth: '100%',
          padding: '40px 24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
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
          marginBottom: '24px'
        },
        formInput: {
          ...baseStyles.formInput,
          padding: '14px 16px',
          fontSize: '16px'
        },
        rememberMe: {
          ...baseStyles.rememberMe,
          marginBottom: '28px'
        },
        signinBtn: {
          ...baseStyles.signinBtn,
          padding: '14px',
          fontSize: '16px',
          marginBottom: '24px'
        },
        signupLink: {
          ...baseStyles.signupLink,
          fontSize: '14px'
        }
      };
    }

    return baseStyles;
  };

  const [styles, setStyles] = useState(getStyles());

  useEffect(() => {
    const handleResize = () => {
      setStyles(getStyles());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.signinContainer}>
      <div style={styles.signinBg}></div>
      <div style={styles.signinBgOverlay}></div>
      <form style={styles.signinForm} onSubmit={handleSubmit}>
        <h1 style={styles.systemTitle}>Smart Seats System</h1>
        <h2 style={styles.pageTitle}>Sign In</h2>
        
        <div style={styles.formGroup}>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
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
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.border = '1px solid #D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
            autoComplete="current-password"
          />
        </div>
        
        <div style={styles.rememberMe}>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            style={styles.rememberCheckbox}
          />
          <label htmlFor="rememberMe" style={styles.rememberLabel}>Remember me</label>
        </div>
        
        <button type="submit" style={styles.signinBtn}>
          Sign in
        </button>
        
        <div style={styles.signupLink}>
          Don't have an account? 
          <NavLink to="/signup" style={styles.linkText}>
            Sign up
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
