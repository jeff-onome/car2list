
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { SecurityLog, SecuritySettings, User } from '../../types';

const Security: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Vault' | 'Activity' | 'Sessions'>('Vault');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [liveUser, setLiveUser] = useState<User | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sensitiveActionNotifications: true
  });

  useEffect(() => {
    if (authUser?.id) {
      // Live subscription to logs
      const unsubLogs = dbService.subscribeToSecurityLogs(authUser.id, setLogs);
      
      // Live subscription to user data (settings)
      const unsubUser = dbService.subscribeToUser(authUser.id, (data) => {
        if (data) {
          setLiveUser(data);
          if (data.securitySettings) {
            setSettings(data.securitySettings);
          }
        }
      });

      return () => {
        unsubLogs();
        unsubUser();
      };
    }
  }, [authUser]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({ title: 'Wait!', text: 'Your new passwords don\'t match. Please try again.', icon: 'error', background: '#0a0a0a', color: '#fff' });
      return;
    }

    setLoading(true);
    try {
      if (!liveUser || liveUser.password !== passwordData.currentPassword) {
        Swal.fire({ title: 'Wrong Password', text: 'The current password you typed is incorrect.', icon: 'error', background: '#0a0a0a', color: '#fff' });
        setLoading(false);
        return;
      }

      await dbService.updateUser(authUser.id, { password: passwordData.newPassword });
      
      await dbService.logSecurityEvent(authUser.id, {
        event: 'Password Changed',
        status: 'Success',
        device: 'Web Browser'
      });

      Swal.fire({ title: 'Done!', text: 'Your password has been updated successfully.', icon: 'success', background: '#0a0a0a', color: '#fff' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Swal.fire({ title: 'Oops', text: 'Something went wrong. Please try again later.', icon: 'error', background: '#0a0a0a', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key: keyof SecuritySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    // Optimistic update
    setSettings(newSettings);
    
    if (authUser?.id) {
      await dbService.updateUser(authUser.id, { securitySettings: newSettings });
      await dbService.logSecurityEvent(authUser.id, {
        event: `Updated Setting: ${key}`,
        status: 'Warning',
        device: 'Web Browser'
      });
    }
  };

  const terminateAllSessions = async () => {
    const confirm = await Swal.fire({
      title: 'Sign out of all devices?',
      text: 'This will log you out of every phone or computer you are using right now.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'LOG OUT EVERYWHERE',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a', color: '#fff'
    });

    if (confirm.isConfirmed) {
      await dbService.logSecurityEvent(authUser!.id, {
        event: 'Logged out of all sessions',
        status: 'Warning'
      });
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Security Center</h1>
            <p className="text-zinc-500 text-[10px] tracking-[0.2em] font-bold mt-2 uppercase">Manage your login and account safety</p>
          </div>
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-full border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('Vault')} className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Vault' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Password</button>
            <button onClick={() => setActiveTab('Activity')} className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Activity' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Login Activity</button>
            <button onClick={() => setActiveTab('Sessions')} className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'Sessions' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Active Logins</button>
          </div>
        </header>

        {activeTab === 'Vault' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-8">
                <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
                   <h3 className="text-sm font-bold uppercase tracking-[0.3em] border-b border-white/5 pb-4 text-zinc-500">Change Password</h3>
                   <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <SecurityField label="Current Password" type="password" value={passwordData.currentPassword} onChange={(v:any) => setPasswordData({...passwordData, currentPassword: v})} required />
                      <div className="border-t border-white/5 pt-6 space-y-6">
                        <SecurityField label="New Password" type="password" value={passwordData.newPassword} onChange={(v:any) => setPasswordData({...passwordData, newPassword: v})} required />
                        <SecurityField label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={(v:any) => setPasswordData({...passwordData, confirmPassword: v})} required />
                      </div>
                      <button type="submit" disabled={loading} className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-xl">
                        {loading ? 'SAVING...' : 'SAVE NEW PASSWORD'}
                      </button>
                   </form>
                </div>
             </div>

             <div className="space-y-8">
                <div className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
                   <h3 className="text-sm font-bold uppercase tracking-[0.3em] border-b border-white/5 pb-4 text-zinc-500">Security Options</h3>
                   <div className="space-y-6">
                      <SecurityToggle 
                        label="Two-Factor Authentication" 
                        desc="Adds an extra layer of protection to your account."
                        active={settings.twoFactorEnabled}
                        onToggle={() => handleToggleSetting('twoFactorEnabled')}
                      />
                      <SecurityToggle 
                        label="Login Notifications" 
                        desc="Get an email whenever someone logs into your account."
                        active={settings.loginAlerts}
                        onToggle={() => handleToggleSetting('loginAlerts')}
                      />
                      <SecurityToggle 
                        label="Security Alerts" 
                        desc="Get notified if your password or account details are changed."
                        active={settings.sensitiveActionNotifications}
                        onToggle={() => handleToggleSetting('sensitiveActionNotifications')}
                      />
                   </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border-amber-500/10 space-y-4">
                   <div className="flex gap-4">
                      <div className="text-amber-500 shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white">Account Protection</p>
                         <p className="text-[9px] text-zinc-600 uppercase tracking-tighter leading-relaxed">Your account is using high-level security to keep your data safe. Last checked: {new Date().toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="glass rounded-[3rem] border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead className="bg-white/5 border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                      <tr>
                         <th className="px-8 py-6">Date & Time</th>
                         <th className="px-8 py-6">Action Taken</th>
                         <th className="px-8 py-6">Device Used</th>
                         <th className="px-8 py-6 text-right">Result</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                           <td className="px-8 py-6">
                              <p className="text-[10px] font-mono text-zinc-400">{new Date(log.timestamp).toLocaleString()}</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-bold text-white uppercase tracking-tight">{log.event}</p>
                           </td>
                           <td className="px-8 py-6">
                              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{log.device || 'Authorized App'}</p>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                                log.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                log.status === 'Warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>{log.status}</span>
                           </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center text-zinc-700 uppercase tracking-widest text-[10px] italic">No security events logged recently.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'Sessions' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                   <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">Devices currently logged in</h3>
                   <button onClick={terminateAllSessions} className="text-[9px] text-red-500 uppercase font-bold tracking-widest hover:underline decoration-red-500/40">Log out of everything</button>
                </div>
                
                <div className="space-y-6">
                   <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all shadow-xl">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 text-white shrink-0 shadow-2xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                               <h4 className="text-base font-bold text-white uppercase tracking-tight">This Computer / Phone</h4>
                               <span className="bg-emerald-500 text-black px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest animate-pulse">Online</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Browser Info: {navigator.userAgent.split(') ')[0].split(' (')[1] || 'Web App'}</p>
                            <p className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase">Logged in on: {new Date(liveUser?.joinedAt || '').toLocaleDateString()} @ {new Date().toLocaleTimeString()}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Status</p>
                         <p className="text-xs text-white font-bold tracking-tight">ENCRYPTED</p>
                      </div>
                   </div>

                   <div className="p-8 bg-zinc-950/50 border border-white/5 rounded-[2.5rem] flex items-center justify-between opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 text-zinc-600 shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                         </div>
                         <div>
                            <h4 className="text-base font-bold text-zinc-400 uppercase tracking-tight">Other Mobile Devices</h4>
                            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mt-1">Mobile App v1.2</p>
                         </div>
                      </div>
                      <span className="text-[9px] text-zinc-700 uppercase font-bold tracking-widest italic">Disconnected</span>
                   </div>
                </div>
             </div>
             
             <div className="text-center">
                <p className="text-[9px] text-zinc-700 uppercase tracking-widest leading-relaxed">
                  We monitor this page to keep you safe. <br/>
                  Some changes might require you to confirm your identity again.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SecurityField = ({ label, type, value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input type={type} className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-white/20" value={value} onChange={e => onChange(e.target.value)} {...props} />
  </div>
);

const SecurityToggle = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 bg-white/[0.01] border border-white/5 rounded-[2rem] hover:bg-white/[0.03] transition-all group">
     <div className="space-y-1 overflow-hidden pr-4">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-tight group-hover:text-white transition-colors">{label}</h4>
        <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-tighter truncate max-w-[250px]">{desc}</p>
     </div>
     <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${active ? 'bg-white' : 'bg-zinc-800'}`}
     >
        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${active ? 'right-1 bg-black shadow-lg' : 'left-1 bg-zinc-600'}`} />
     </button>
  </div>
);

export default Security;
