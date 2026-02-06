import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isPaymentMode = searchParams.get('reason') === 'payment';
  const redirectPath = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    
    try {
      // Real-time fetch of all user records from the registry
      const users = await dbService.getUsers();
      
      // Strict case-insensitive lookup for the identity
      const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      // VALIDATION: Strict verification of email existence AND password matching
      if (!foundUser || foundUser.password !== password) {
        Swal.fire({
          title: 'Authentication Failed',
          text: 'The email or security key provided does not match our records.',
          icon: 'error',
          background: '#0a0a0a',
          color: '#fff',
          confirmButtonColor: '#fff',
          confirmButtonText: 'RETRY'
        });
        setIsLoggingIn(false);
        return;
      }

      // CHECK: Verification of account standing
      if (foundUser.isSuspended) {
        Swal.fire({
          title: 'Account Restricted',
          text: 'This identity has been temporarily suspended from the AutoSphere ecosystem.',
          icon: 'warning',
          background: '#0a0a0a',
          color: '#fff'
        });
        setIsLoggingIn(false);
        return;
      }

      // SUCCESS: Initialize authenticated session
      login(foundUser.role, foundUser);
      
      // Redirection logic based on context or role
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        let target = '/user/overview';
        if (foundUser.role === 'ADMIN') target = '/admin/dashboard';
        if (foundUser.role === 'DEALER') target = '/dealer/dashboard';
        navigate(target);
      }
    } catch (error) {
      console.error("Login Synchronization Error:", error);
      Swal.fire({
        title: 'Connection Interrupted',
        text: 'The security vault is currently unreachable. Please verify your connection.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full space-y-8">
        <div className={`glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl transition-all duration-500 ${isPaymentMode ? 'ring-2 ring-white/10 bg-white/[0.02]' : ''}`}>
          <div className="text-center mb-10">
            <Link to="/" className="text-2xl font-bold tracking-tighter gradient-text uppercase block mb-4">AutoSphere</Link>
            
            {isPaymentMode ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 </div>
                 <h1 className="text-2xl font-bold uppercase tracking-tighter text-white">Security Check</h1>
                 <p className="text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-bold">Identity Verification Required for Transaction</p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold uppercase tracking-tighter">Access Vault</h1>
                <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Sign in to your private collector portal.</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Email Identity</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                placeholder="portal@autosphere.com" 
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">Security Key</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                placeholder="••••••••" 
                disabled={isLoggingIn}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className={`w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all mt-4 flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? 'Verifying Identity...' : (isPaymentMode ? 'Verify & Continue' : 'Enter Portal')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
              {isPaymentMode ? 'New Client?' : 'Not registered?'} <Link to="/register" className="text-white font-bold hover:underline">Apply for Membership</Link>
            </p>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest leading-relaxed">
            Encrypted End-to-End. Your access telemetry is protected by the Sphere Standard security protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;