
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
          <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-4xl font-bold uppercase">
            {user?.name.charAt(0)}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold uppercase tracking-tighter">{user?.name}</h1>
            <p className="text-zinc-500 uppercase tracking-widest text-xs">{user?.role} • Member since 2024</p>
            <div className="flex gap-4 mt-4">
              <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Edit Profile</button>
              <button className="border border-white/10 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5">Settings</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileSection title="Personal Information">
            <InfoItem label="Email" value={user?.email || ''} />
            <InfoItem label="Phone" value="+1 (555) 000-0000" />
            <InfoItem label="Location" value="New York, USA" />
          </ProfileSection>
          
          <ProfileSection title="Verification Status">
            <div className="flex items-center justify-between p-4 glass rounded-2xl border border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-xs uppercase tracking-widest font-bold">Identity Verified</span>
              </div>
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass p-8 rounded-3xl space-y-6">
    <h3 className="text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default UserProfile;
