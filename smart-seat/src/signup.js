import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identity: 'student',
    email: '',
    password: '',
    confirmPassword: '',
    jcu_id: '',                  // ⭐ ADDED
    agreePolicy: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { identity, email, password, confirmPassword, jcu_id, agreePolicy } = formData;

    // ⭐ FRONTEND VALIDATION
    if (!identity) return alert('Please select identity!');
    if (!email || !password) return alert('Please complete all fields!');
    if (password !== confirmPassword) return alert('Passwords do not match!');
    if (!agreePolicy) return alert('Please agree to the Privacy Policy!');

    // ⭐ Admin rule: ID must start with "19"
    if (identity === "admin" && !jcu_id.startsWith("19")) {
      return alert('Admin accounts MUST use ID starting with "19"');
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        // ⭐ SEND jcu_id TO BACKEND
        body: JSON.stringify({ 
          email, 
          password, 
          role: identity,
          jcu_id               // ⭐ ADDED
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('role', identity);

        if (identity === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (identity === 'lecturer') {
          navigate('/tutor?mode=readonly', { replace: true });
        } else {
          navigate(`/form?role=${identity}`, { replace: true });
        }

      } else {
        alert(data.message);
      }

    } catch (err) {
      alert('Registration failed: Network error');
    }
  };

  // ======================
  // STYLES (unchanged)
  // ======================

  const styles = {/* ... KEEP YOUR EXISTING STYLE CODE ... */};

  return (
    <div style={styles.signupContainer}>
      <div style={styles.signupBg}></div>
      <div style={styles.signupBgOverlay}></div>

      <form style={styles.signupForm} onSubmit={handleSubmit}>
        <h1 style={styles.systemTitle}>Smart Seats System</h1>
        <h2 style={styles.pageTitle}>Sign Up</h2>

        {/* Identity Selection */}
        <div style={styles.identitySelection}>
          <p style={styles.selectionLabel}>Select Identity</p>
          <div style={styles.identityOptions}>

            {/* STUDENT */}
            <label 
              style={formData.identity === 'student' 
                ? { ...styles.identityLabel, ...styles.identityLabelChecked } 
                : styles.identityLabel}
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

            {/* LECTURER */}
            <label 
              style={formData.identity === 'lecturer' 
                ? { ...styles.identityLabel, ...styles.identityLabelChecked } 
                : styles.identityLabel}
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

            {/* ADMIN */}
            <label 
              style={formData.identity === 'admin' 
                ? { ...styles.identityLabel, ...styles.identityLabelChecked } 
                : styles.identityLabel}
            >
              <input
                type="radio"
                name="identity"
                value="admin"
                checked={formData.identity === 'admin'}
                onChange={handleChange}
                style={styles.identityRadio}
              />
              Admin
            </label>
          </div>
        </div>

        {/* ⭐ NEW INPUT — JCU ID */}
        <div style={styles.formGroup}>
          <input
            type="text"
            name="jcu_id"
            value={formData.jcu_id}
            onChange={handleChange}
            placeholder="Enter your JCU ID (Admin must start with 19)"
            required
            style={styles.formInput}
          />
        </div>

        {/* EMAIL */}
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
          />
        </div>

        {/* PASSWORD */}
        <div style={styles.formGroup}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            style={styles.formInput}
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div style={styles.formGroup}>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            style={styles.formInput}
          />
        </div>

        {/* POLICY */}
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
