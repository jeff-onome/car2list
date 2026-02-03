import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Member Card Header */}
        <div className="glass p-10 md:p-16 rounded-[3rem] border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-12 items-center md:items-start shadow-[0_0_100px_rgba(255,255,255,0.02)]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          </div>
          
          <div className="w-40 h-40 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-5xl font-bold uppercase overflow-hidden shadow-2xl relative z-10 shrink-0">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user?.name.charAt(0)}
          </div>
          
          <div className="text-center md:text-left space-y-4 relative z-10 flex-grow">
            <div>
               <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter">{user?.name}</h1>
               <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-bold mt-2">Member Tier: <span className="text-white">Global Elite</span></p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Member ID: {user?.id.slice(-8).toUpperCase()}
              </div>
              <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Account: {user?.role}
              </div>
              <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                Status: {user?.isVerified ? 'VERIFIED' : 'PENDING'}
              </div>
            </div>

            <div className="flex gap-4 pt-8 justify-center md:justify-start">
              <button className="bg-white text-black px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">Edit Identity</button>
              <Link to="/user/security" className="border border-white/10 px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center">Manage Security</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Relocated Identity Details */}
          <ProfileSection title="Core Identity Assets">
            <InfoItem label="Primary Access Point (Email)" value={user?.email || 'N/A'} />
            <InfoItem label="Geographical Domicile" value="Geneva, Switzerland" />
            <InfoItem label="Registration Timestamp" value={user?.joinedAt ? new Date(user.joinedAt).toLocaleString() : 'January 2024'} />
            <div className="pt-4">
               <label className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 block font-bold">Preferences</label>
               <div className="flex gap-4">
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-white/5 px-3 py-1 rounded border border-white/5">Dark Mode Active</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-white/5 px-3 py-1 rounded border border-white/5">USD Currency</span>
               </div>
            </div>
          </ProfileSection>
          
          {/* Relocated Verification Section */}
          <ProfileSection title="Compliance & Governance">
            <div className={`p-8 glass rounded-[2rem] border ${user?.isVerified ? 'border-green-500/20' : 'border-amber-500/20'} space-y-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${user?.isVerified ? 'bg-green-500 shadow-green-500/50' : 'bg-amber-500 shadow-amber-500/50 animate-pulse'}`} />
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Identity Clearance
                  </span>
                </div>
                {user?.isVerified ? (
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                    Identity verification allows for bidding on private auctions and high-limit capital financing.
                 </p>
                 <div className="pt-4">
                    {user?.isVerified ? (
                       <button className="w-full bg-white/5 border border-white/10 py-3 rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-white/10 transition-all">Re-validate Documents</button>
                    ) : (
                       <Link to="/user/verify" className="block w-full text-center bg-white text-black py-3 rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-all">Complete KYC Now</Link>
                    )}
                 </div>
              </div>
            </div>
            
            <div className="glass p-8 rounded-[2rem] border-white/5 space-y-4">
               <h4 className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Active Permissions</h4>
               <ul className="space-y-2">
                  <li className="flex items-center justify-between text-[9px] uppercase tracking-widest">
                     <span className="text-zinc-400">Direct Inquiries</span>
                     <span className="text-green-500">Enabled</span>
                  </li>
                  <li className="flex items-center justify-between text-[9px] uppercase tracking-widest">
                     <span className="text-zinc-400">Test Drive Scheduling</span>
                     <span className="text-green-500">Enabled</span>
                  </li>
                  <li className="flex items-center justify-between text-[9px] uppercase tracking-widest">
                     <span className="text-zinc-400">Private Auction Access</span>
                     <span className={user?.isVerified ? 'text-green-500' : 'text-zinc-600'}>{user?.isVerified ? 'Enabled' : 'Restricted'}</span>
                  </li>
               </ul>
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-white/5 pb-4 text-zinc-500">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
    <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 font-bold">{label}</p>
    <p className="text-base font-bold tracking-tight text-white">{value}</p>
  </div>
);

export default UserProfile;
