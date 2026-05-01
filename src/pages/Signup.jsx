import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Sign up successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center', color: '#2c2c2c' }}>✨ Get Started</h1>
        <p style={{ textAlign: 'center', color: '#9b8b8b', marginBottom: '28px', fontSize: '14px' }}>Create your account to start taking notes</p>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p style={styles.text}>
          Already have an account? <a href="/login" style={styles.link}>Login</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #C9A2E0 0%, #FFB3D9 100%)',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: '50px 40px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(201, 162, 224, 0.2)',
    width: '100%',
    maxWidth: '420px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    marginBottom: '18px',
    border: '2px solid #F0D9F5',
    borderRadius: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#FFFBFD',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'linear-gradient(135deg, #C9A2E0 0%, #FFB3D9 100%)',
    color: '#6B4C7A',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(201, 162, 224, 0.3)',
    transition: 'all 0.3s ease',
  },
  error: {
    backgroundColor: '#FFE0E9',
    color: '#C9436B',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '14px',
    borderLeft: '4px solid #FFB3D9',
  },
  success: {
    backgroundColor: '#D9F5D9',
    color: '#4A8A4A',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '14px',
    borderLeft: '4px solid #A8D9A8',
  },
  text: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#8B7BA8',
    fontSize: '14px',
  },
  link: {
    color: '#C9A2E0',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease',
  },
};
