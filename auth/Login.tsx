
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // 1. Fetch user registry
      const users = await dbService.getUsers();
      
      // 2. Locate the identity
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        Swal.fire({
          title: '<span style="text-transform: uppercase; font-size: 1.25rem;">Access Denied</span>',
          text: 'No active membership was found for this identity in the AutoSphere registry.',
          icon: 'error',
          confirmButtonText: 'APPLY FOR MEMBERSHIP',
          showCancelButton: true,
          cancelButtonText: 'RETRY',
          background: '#0a0a0a',
          color: '#fff',
          customClass: {
            popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
            confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
            cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/register');
          }
        });
        setIsLoggingIn(false);
        return;
      }

      // 3. Check for suspension
      if (foundUser.isSuspended) {
        Swal.fire({
          title: '<span style="text-transform: uppercase; font-size: 1.25rem; color: #ef4444;">Account Restricted</span>',
          text: 'This identity has been suspended by system administration for policy review. Please contact support.',
          icon: 'warning',
          confirmButtonText: 'CONTACT CONCIERGE',
          background: '#0a0a0a',
          color: '#fff',
          customClass: {
            popup: 'glass rounded-[2rem] border border-red-500/20 shadow-2xl',
            confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
          }
        }).then(() => {
          navigate('/contact');
        });
        setIsLoggingIn(false);
        return;
      }

      // 4. Authenticate session
      login(foundUser.role, foundUser);
      
      // 5. Determine destination
      let target = '/user/profile';
      if (foundUser.role === 'ADMIN') target = '/admin/dashboard';
      if (foundUser.role === 'DEALER') target = '/dealer/dashboard';

      navigate(target);
    } catch (error) {
      console.error("Authentication Sync Error:", error);
      Swal.fire({
        title: 'Connection Error',
        text: 'The vault is temporarily unreachable. Please check your connection.',
        icon: 'warning',
        background: '#111',
        color: '#fff'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full space-y-8">
        <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <Link to="/" className="text-2xl font-bold tracking-tighter gradient-text uppercase block mb-4">AutoSphere</Link>
            <h1 className="text-3xl font-bold uppercase tracking-tighter">Access Vault</h1>
            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">Sign in to your private portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white"
                placeholder="portal@autosphere.com"
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4 mr-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Password</label>
              </div>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white"
                placeholder="••••••••"
                disabled={isLoggingIn}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className={`w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all mt-4 flex items-center justify-center gap-2 ${isLoggingIn ? 'opacity-50' : ''}`}
            >
              {isLoggingIn && <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isLoggingIn ? 'Verifying Identity...' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-widest">
              New here? <Link to="/register" className="text-white hover:underline">Apply for Membership</Link>
            </p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/5 bg-white/5 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-2">Member Support</h3>
          <p className="text-[9px] text-zinc-600 uppercase text-center leading-relaxed italic">
            Entry requires a pre-existing record in our global registry. If you have just applied, please wait for synchronization.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
