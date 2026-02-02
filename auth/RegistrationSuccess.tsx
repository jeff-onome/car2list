
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegistrationSuccess: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(5);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (timeLeft === 0) {
      handleRedirection();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRedirection = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    switch (user.role) {
      case 'ADMIN': navigate('/admin/dashboard'); break;
      case 'DEALER': navigate('/dealer/dashboard'); break;
      default: navigate('/user/profile'); break;
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full glass p-12 rounded-[3rem] border-white/10 text-center space-y-8 shadow-[0_0_100px_rgba(255,255,255,0.05)]">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center animate-pulse">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -inset-4 rounded-full border border-white/10 animate-ping opacity-20" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold uppercase tracking-tighter gradient-text">Membership Confirmed</h1>
          <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest">
            Welcome to the AutoSphere elite network, <span className="text-white">{user?.name}</span>. Your high-security portal is being initialized.
          </p>
        </div>

        <div className="pt-4 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Initializing Portal</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-white h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(1 - timeLeft / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-white mt-2">Redirecting in {timeLeft}s...</span>
          </div>

          <button 
            onClick={handleRedirection}
            className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-[10px]"
          >
            Enter Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
