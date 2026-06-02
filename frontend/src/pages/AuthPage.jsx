import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Activity, Mail, CheckCircle, X, User, Lock, Sparkles, Terminal, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      const result = await login(username, password);
      if (result.success) {
        if (result.role === 'client') {
          navigate('/app/client-portal');
        } else {
          navigate('/select-domain');
        }
      } else {
        setAuthError(result.message || 'Invalid credentials');
      }
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
    <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep cyber-grid relative overflow-hidden select-none px-4">
      {/* Abstract Glowing Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cyan/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-2xl w-full max-w-[420px] p-8 border border-white/5 shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Futuristic Card Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-4">
            <Activity size={28} className="text-white" />
          </div>
          <h2 className="font-mono text-xl font-bold tracking-wider text-glow text-white">NEXA.AI</h2>
          <p className="text-slate-400 text-xs mt-1">Decision Intelligence Operator Login</p>
        </div>

        {user ? (
          <div className="text-center bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl">
            <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-200 font-medium text-xs">Access Granted. Operating session active.</p>
            <button 
              onClick={() => user.role === 'client' ? navigate('/app/client-portal') : navigate('/select-domain')} 
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors"
            >
              Continue as {user.username}
            </button>
          </div>
        ) : (
          <>
            {/* Google Authentication Button */}
            <button 
              type="button"
              onClick={() => setShowGoogleAccounts(true)}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 disabled:opacity-70 text-slate-800 font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 border border-slate-200 hover:shadow-lg"
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Decrypting Credentials...' : 'Continue with Google'}
            </button>

            <div className="flex items-center my-5 text-[10px] text-slate-600 uppercase tracking-widest font-mono">
              <div className="flex-1 h-[1px] bg-white/5"></div>
              <span className="px-3">or credentials</span>
              <div className="flex-1 h-[1px] bg-white/5"></div>
            </div>

            {authError && (
              <div className="bg-rose-950/20 border border-rose-900/30 text-rose-200 p-2.5 rounded-lg text-center text-xs mb-4">
                {authError}
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Operator Terminal ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User size={14} />
                  </span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    placeholder="e.g. admin@enterprise.com"
                    className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Security Access Pass</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock size={14} />
                  </span>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                    className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <Terminal size={14} />
                Authenticate Intelligence Access
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">System v3.0 | Secure Node</div>
          <button 
            type="button"
            onClick={() => setShowSignup(true)} 
            className="text-neon-cyan hover:text-neon-cyan/80 text-xs font-semibold bg-transparent border-none cursor-pointer outline-none transition-colors hover:underline"
          >
            Create New Platform Operator Account
          </button>
        </div>
      </motion.div>

      {/* Google Mock Selector Drawer */}
      <AnimatePresence>
        {showGoogleAccounts && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1200]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[360px] p-6 border border-white/10 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <GoogleIcon />
                  <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Mock Google Auth</span>
                </div>
                <button onClick={() => setShowGoogleAccounts(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-sm font-semibold text-white mb-0.5">Select active mock account</p>
              <p className="text-slate-500 text-[11px] mb-4">to sync permissions with NexaAI</p>

              <div className="space-y-1.5">
                {googleAccounts.map((acc, i) => (
                  <div 
                    key={acc.email}
                    onClick={() => handleGoogleAccountSelect(acc.email)}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-slate-400">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{acc.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Up / Verification Drawer */}
      <AnimatePresence>
        {showSignup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[400px] p-8 border border-white/10 shadow-2xl relative"
            >
              <h2 className="text-center font-semibold text-lg text-white mb-5 flex items-center justify-center gap-2">
                <Shield size={18} className="text-neon-cyan" />
                Operator Provisioning
              </h2>
              
              {verificationSuccess ? (
                <div className="text-center py-6">
                  <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-emerald-200 font-semibold text-sm mb-1">Authorization Code Confirmed</h3>
                  <p className="text-slate-400 text-xs">Syncing keys. Redirecting to terminal...</p>
                </div>
              ) : showOtp ? (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="bg-neon-cyan/5 border border-neon-cyan/20 p-3.5 rounded-xl text-center">
                    <Mail size={20} className="text-neon-cyan mx-auto mb-2" />
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Verification code dispatched to<br/><strong className="text-white">{signupEmail}</strong>
                    </p>
                  </div>
                  
                  {authError && <p className="text-rose-400 text-center text-xs">{authError}</p>}
                  
                  {debugOtp && (
                    <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-xl">
                      <p className="text-amber-200 text-xs font-semibold text-center">
                        DEVELOPER BYPASS CODE: <strong className="text-white font-mono">{debugOtp}</strong>
                      </p>
                      <p className="text-slate-500 text-[10px] text-center mt-1">
                        (Email SMTP is mocked/bypassed locally)
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center">Verification Code</label>
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                      required 
                      placeholder="XXXXXX"
                      className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl py-3 text-center text-lg font-mono font-bold tracking-[8px] text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="button" className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors" onClick={() => setShowOtp(false)}>
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-neon-cyan hover:bg-neon-cyan/85 text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                      Verify Code
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Account Email</label>
                    <input 
                      type="email" 
                      value={signupEmail} 
                      onChange={(e) => setSignupEmail(e.target.value)} 
                      required 
                      placeholder="user@enterprise.com"
                      className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Security Access Pass</label>
                    <input 
                      type="password" 
                      value={signupPass} 
                      onChange={(e) => setSignupPass(e.target.value)} 
                      required 
                      placeholder="••••••••"
                      className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Confirm Access Pass</label>
                    <input 
                      type="password" 
                      value={signupConfirm} 
                      onChange={(e) => setSignupConfirm(e.target.value)} 
                      required 
                      placeholder="••••••••"
                      className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  {authError && <p className="text-rose-400 text-center text-xs">{authError}</p>}

                  <div className="flex gap-3 pt-2">
                    <button type="button" className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors" onClick={() => setShowSignup(false)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSendingOtp} className="flex-1 bg-neon-cyan hover:bg-neon-cyan/85 text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-50 transition-colors">
                      {isSendingOtp ? 'Registering...' : 'Provision Account'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
