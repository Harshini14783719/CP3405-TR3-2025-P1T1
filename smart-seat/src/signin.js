import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password, rememberMe } = formData;
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      navigate('/', { replace: true });
    } else {
      alert('Please fill in the form completely!');
    }
  };
  const styles = {
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
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
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
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
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