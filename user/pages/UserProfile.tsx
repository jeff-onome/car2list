
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
          <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-4xl font-bold uppercase overflow-hidden shadow-2xl">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user?.name.charAt(0)}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold uppercase tracking-tighter">{user?.name}</h1>
            <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">{user?.role} ACCOUNT • MEMBER SINCE {user?.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024'}</p>
            <div className="flex gap-4 mt-6">
              <button className="bg-white text-black px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">Edit Identity</button>
              <button className="border border-white/10 px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Security</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileSection title="Identity Details">
            <InfoItem label="System Email" value={user?.email || 'N/A'} />
            <InfoItem label="Role Authority" value={user?.role || 'N/A'} />
            <InfoItem label="Registration ID" value={user?.id || 'N/A'} />
          </ProfileSection>
          
          <ProfileSection title="Verification Governance">
            <div className={`flex items-center justify-between p-6 glass rounded-2xl border ${user?.isVerified ? 'border-green-500/20' : 'border-amber-500/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shadow-lg ${user?.isVerified ? 'bg-green-500 shadow-green-500/50' : 'bg-amber-500 shadow-amber-500/50 animate-pulse'}`} />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {user?.isVerified ? 'Identity Validated' : 'Validation Pending'}
                </span>
              </div>
              {user?.isVerified ? (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-tighter mt-4 leading-relaxed italic">
              Verified members receive priority scheduling and access to private auctions.
            </p>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
    <h3 className="text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 text-zinc-500">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <p className="text-sm font-bold tracking-tight">{value}</p>
  </div>
);

export default UserProfile;
