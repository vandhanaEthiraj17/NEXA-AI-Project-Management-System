import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Activity, Mail, CheckCircle, X, User } from 'lucide-react';

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  
  // Signup State
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [authError, setAuthError] = useState('');

  // Google Flow
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleAccounts, setShowGoogleAccounts] = useState(false);
  const googleAccounts = [
    { name: 'Test User', email: 'testuser@gmail.com' },
    { name: 'Enterprise Work', email: 'work@enterprise.com' }
  ];

  const { login, user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
      navigate('/select-domain');
    }
  };

  const handleGoogleAccountSelect = async (email) => {
    setIsGoogleLoading(true);
    setShowGoogleAccounts(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setTimeout(() => {
          login(email);
          setIsGoogleLoading(false);
          navigate('/select-domain');
        }, 1000);
      }
    } catch (err) {
      setAuthError('Failed to connect to authentication server');
      setIsGoogleLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupPass !== signupConfirm) {
      alert('Passwords do not match');
      return;
    }

    setIsSendingOtp(true);
    setAuthError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail })
      });
      
      const data = await response.json();
      if (response.ok) {
        setDebugOtp(data.debug_otp || '');
        setShowOtp(true);
      } else if (data.debug_otp) {
        // Even if email failed, we have a debug OTP for the user to bypass
        setDebugOtp(data.debug_otp);
        setShowOtp(true);
        setAuthError(data.error || 'Email delivery failed, but you can bypass with the code below.');
      } else {
        setAuthError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setAuthError('Failed to communicate with mail server');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp: otp })
      });
      
      if (response.ok) {
        setVerificationSuccess(true);
        setTimeout(() => {
          setVerificationSuccess(false);
          setShowOtp(false);
          setShowSignup(false);
          setUsername(signupEmail);
        }, 2000);
      } else {
        setAuthError('Invalid verification code');
      }
    } catch (err) {
      setAuthError('Verification server unavailable');
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="card auth-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
          <img src="/nexa-logo.png" alt="NexaAI Logo" style={{ height: '64px' }} />
        </div>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Sign in to access the Decision Engine</p>

        {user ? (
          <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '0', animation: 'fadeIn 0.3s ease' }}>
            <CheckCircle size={20} color="#16a34a" style={{ marginBottom: '0.5rem', margin: '0 auto 0.5rem auto', display: 'block' }} />
            <p style={{ color: '#166534', fontWeight: 500, margin: 0 }}>Continue as {user.username}</p>
          </div>
        ) : (
          <>
            <button 
              type="button"
              className="google-btn"
              onClick={() => setShowGoogleAccounts(true)}
              disabled={isGoogleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: '#fff',
                border: '1px solid #e5e7eb',
                padding: '0.75rem',
                borderRadius: '6px',
                cursor: isGoogleLoading ? 'wait' : 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                color: '#374151',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                opacity: isGoogleLoading ? 0.7 : 1
              }}
              onMouseOver={(e) => !isGoogleLoading && (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.08)')}
              onMouseOut={(e) => !isGoogleLoading && (e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#9ca3af' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ padding: '0 1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            {authError && <p style={{ color: '#de350b', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{authError}</p>}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  placeholder="e.g. admin@enterprise.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
                Authenticate Insight Access
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          System v2.4 | Enterprise Authentication
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          <button 
            type="button"
            onClick={() => setShowSignup(true)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
            className="hover-underline"
          >
            New user? Sign Up
          </button>
        </div>
      </div>

      {/* Google Account Selector */}
      {showGoogleAccounts && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '1.5rem', borderRadius: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GoogleIcon />
                <span style={{ fontWeight: 600, color: '#3c4043' }}>Sign in with Google</span>
              </div>
              <X size={20} style={{ cursor: 'pointer', color: '#5f6368' }} onClick={() => setShowGoogleAccounts(false)} />
            </div>
            
            <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem', color: '#202124' }}>Choose an account</p>
            <p style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '1.5rem' }}>to continue to NexaAI</p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {googleAccounts.map((acc, i) => (
                <div 
                  key={acc.email}
                  onClick={() => handleGoogleAccountSelect(acc.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    borderBottom: i === 0 ? '1px solid #e8eaed' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368' }}>
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#3c4043' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#70757a' }}>{acc.email}</div>
                  </div>
                </div>
              ))}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  color: '#1a73e8',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </div>
                <span>Use another account</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignup && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="card signup-modal" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.4rem' }}>Create Account</h2>
            
            {verificationSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.3s ease' }}>
                <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                <h3 style={{ color: '#166534', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Account verified successfully</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Redirecting to login...</p>
              </div>
            ) : showOtp ? (
              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ textAlign: 'center', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <Mail size={24} color="#3b82f6" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
                    Verification code sent to<br/><strong>{signupEmail}</strong>
                  </p>
                </div>
                {authError && <p style={{ color: '#de350b', fontSize: '0.85rem', textAlign: 'center' }}>{authError}</p>}
                {debugOtp && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                    <p style={{ color: '#92400e', fontSize: '0.8rem', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                      DEVELOPER BYPASS: Use code <strong>{debugOtp}</strong>
                    </p>
                    <p style={{ color: '#b45309', fontSize: '0.7rem', margin: '0.25rem 0 0 0', textAlign: 'center' }}>
                      (Email failed to send. Check app.py SMTP settings)
                    </p>
                  </div>
                )}
                <div className="form-group">
                  <label>Enter Verification Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    placeholder="e.g. 123456"
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 600 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }} onClick={() => setShowOtp(false)}>
                    Back
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                    Verify
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    required 
                    placeholder="user@enterprise.com"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={signupPass} 
                    onChange={(e) => setSignupPass(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={signupConfirm} 
                    onChange={(e) => setSignupConfirm(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                </div>
                {authError && <p style={{ color: '#de350b', fontSize: '0.85rem', textAlign: 'center' }}>{authError}</p>}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }} onClick={() => setShowSignup(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSendingOtp} style={{ flex: 1, padding: '0.75rem', background: '#111827' }}>
                    {isSendingOtp ? 'Sending...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;

