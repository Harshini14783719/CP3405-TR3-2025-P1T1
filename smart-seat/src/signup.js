import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identity: 'student',
    email: '',
    password: '',
    confirmPassword: '',
    agreePolicy: false
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'radio' ? value : value)
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const { identity, email, password, confirmPassword, agreePolicy } = formData;
    if (!identity) {
      alert('Please select your identity (Student/Lecturer)!');
      return;
    }
    if (!email || !password || !confirmPassword) {
      alert('Please fill in the complete form!');
      return;
    }
    if (password !== confirmPassword) {
      alert('The two passwords do not match!');
      return;
    }
    if (!agreePolicy) {
      alert('Please agree to the Privacy Policy!');
      return;
    }
    localStorage.setItem('userIdentity', identity);
    alert('Registration successful! Please log in');
    navigate('/signin', { replace: true });
  };
  const styles = {
    signupContainer: {
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
    signupBg: {
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
    signupBgOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(17, 24, 39, 0.45)',
      backdropFilter: 'blur(6px)',
      zIndex: -1
    },
    signupForm: {
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
    identitySelection: {
      marginBottom: '40px',
      width: '100%'
    },
    selectionLabel: {
      fontSize: '15px',
      color: '#4B5563',
      fontWeight: 600,
      marginBottom: '16px',
      display: 'block',
      textTransform: 'uppercase',
      letterSpacing: '0.6px'
    },
    identityOptions: {
      display: 'flex',
      gap: '16px',
      width: '100%'
    },
    identityLabel: {
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
    identityLabelChecked: {
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      color: '#2563EB'
    },
    identityRadio: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0,
      cursor: 'pointer'
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
    policyAgree: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '36px',
      gap: '10px',
      fontSize: '15px',
      color: '#4B5563',
      lineHeight: '1.6'
    },
    policyCheckbox: {
      width: '20px',
      height: '20px',
      accentColor: '#2563EB',
      cursor: 'pointer',
      border: '1px solid #D1D5DB',
      borderRadius: '4px',
      marginTop: '1px'
    },
    policyLabel: {
      cursor: 'pointer',
      userSelect: 'none',
      letterSpacing: '-0.2px'
    },
    signupBtn: {
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
    signinLink: {
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
    <div style={styles.signupContainer}>
      <div style={styles.signupBg}></div>
      <div style={styles.signupBgOverlay}></div>
      <form style={styles.signupForm} onSubmit={handleSubmit}>
        <h1 style={styles.systemTitle}>Smart Seats System</h1>
        <h2 style={styles.pageTitle}>Sign Up</h2>
        
        <div style={styles.identitySelection}>
          <p style={styles.selectionLabel}>Select Identity</p>
          <div style={styles.identityOptions}>
            <label 
              style={formData.identity === 'student' ? { ...styles.identityLabel, ...styles.identityLabelChecked } : styles.identityLabel}
            >
              <input
                type="radio"
                name="identity"
                value="student"
                checked={formData.identity === 'student'}
                onChange={handleChange}
                style={styles.identityRadio}
              />
              Student
            </label>
            <label 
              style={formData.identity === 'lecturer' ? { ...styles.identityLabel, ...styles.identityLabelChecked } : styles.identityLabel}
            >
              <input
                type="radio"
                name="identity"
                value="lecturer"
                checked={formData.identity === 'lecturer'}
                onChange={handleChange}
                style={styles.identityRadio}
              />
              Lecturer
            </label>
          </div>
        </div>
        
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
        
        <div style={styles.formGroup}>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            style={styles.formInput}
            onFocus={(e) => Object.assign(e.target.style, styles.formInputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div style={styles.policyAgree}>
          <input
            type="checkbox"
            id="agreePolicy"
            name="agreePolicy"
            checked={formData.agreePolicy}
            onChange={handleChange}
            style={styles.policyCheckbox}
          />
          <label htmlFor="agreePolicy" style={styles.policyLabel}>
            I agree to the Privacy Policy
          </label>
        </div>
        
        <button type="submit" style={styles.signupBtn}>
          Sign up
        </button>
        
        <div style={styles.signinLink}>
          Already have an account? 
          <NavLink to="/signin" style={styles.linkText}>
            Sign in
          </NavLink>
        </div>
      </form>
    </div>
  );
};
export default SignUp;