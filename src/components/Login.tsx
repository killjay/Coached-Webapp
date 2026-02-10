import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSignupMode, setIsSignupMode] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:36',message:'handleSubmit called',data:{isSignupMode:isSignupMode,email:formData.email},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
    // #endregion

    try {
      if (isSignupMode) {
        // Signup mode
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        await signup(formData.email, formData.password);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:54',message:'Signup successful - navigating to plan selection',data:{},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
        // #endregion
        // Redirect to plan selection for new users
        navigate('/select-plan');
      } else {
        // Login mode
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:58',message:'Calling login',data:{email:formData.email},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
        // #endregion
        await login(formData.email, formData.password);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:60',message:'Login successful - navigating to dashboard',data:{},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
        // #endregion
        // Redirect to dashboard for existing users (route protection will handle plan check)
        navigate('/dashboard');
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Login.tsx:63',message:'Login/Signup error',data:{error:err?.message||String(err)},timestamp:Date.now(),hypothesisId:'H6',runId:'fix2'})}).catch(()=>{});
      // #endregion
      // Handle Firebase errors
      const errorMessage = err.message || 'An error occurred';
      if (errorMessage.includes('email-already-in-use')) {
        setError('Email is already registered');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Invalid email address');
      } else if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Invalid email or password');
      } else if (errorMessage.includes('user-not-found')) {
        setError('No account found with this email');
      } else if (errorMessage.includes('weak-password')) {
        setError('Password is too weak');
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      await signInWithGoogle();
      // After Google sign-in, redirect to dashboard
      // The route protection will check if user has a plan and redirect accordingly
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-image">
          <img src="/fitness-image.png" alt="Fitness motivation" />
        </div>
        
        <div className="login-form-section">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="logo-text">Coached</h1>
          </div>
          <h2 className="login-title">
            {isSignupMode ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="login-subtitle">
            {isSignupMode
              ? 'Join us to start your fitness journey'
              : 'Sign in to continue to your account'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {!isSignupMode && (
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-text">Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {isSignupMode ? 'Creating account...' : 'Signing in...'}
              </>
            ) : isSignupMode ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="signup-text">
            {isSignupMode ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={toggleMode} className="signup-link">
              {isSignupMode ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        <div className="divider">
          <span className="divider-text">Or continue with</span>
        </div>

        <div className="social-login">
          <button
            className="social-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
