
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';

const Security: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        title: 'Mismatch',
        text: 'New passwords do not match.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff'
      });
      return;
    }

    setLoading(true);

    try {
      // Fetch full user data including password for verification
      const users = await dbService.getUsers();
      const dbUser = users.find(u => u.id === user.id);

      if (!dbUser || dbUser.password !== formData.currentPassword) {
        Swal.fire({
          title: 'Incorrect Credentials',
          text: 'The current password provided is invalid.',
          icon: 'error',
          background: '#0a0a0a',
          color: '#fff',
          confirmButtonColor: '#fff'
        });
        setLoading(false);
        return;
      }

      // Update password
      await dbService.updateUser(user.id, { password: formData.newPassword });
      
      await dbService.createNotification(user.id, {
        title: 'Security Update',
        message: 'Your portal password was successfully updated.',
        type: 'success'
      });

      Swal.fire({
        title: 'Vault Updated',
        text: 'Your security credentials have been successfully modified.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff'
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'System Error',
        text: 'Failed to synchronize with the security vault.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Security & Access</h1>
          <p className="text-zinc-500 uppercase text-[10px] tracking-[0.2em] font-bold mt-2">Manage your authentication credentials</p>
        </header>

        <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl">
          <div className="space-y-6">
            <SecurityField 
              label="Current Password" 
              type="password" 
              value={formData.currentPassword} 
              onChange={(v) => setFormData({...formData, currentPassword: v})} 
              required
            />
            
            <div className="border-t border-white/5 pt-6 space-y-6">
              <SecurityField 
                label="New Access Key" 
                type="password" 
                value={formData.newPassword} 
                onChange={(v) => setFormData({...formData, newPassword: v})} 
                required
              />
              <SecurityField 
                label="Confirm New Access Key" 
                type="password" 
                value={formData.confirmPassword} 
                onChange={(v) => setFormData({...formData, confirmPassword: v})} 
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl text-xs flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {loading ? 'Synchronizing...' : 'Update Credentials'}
            </button>
          </div>
        </form>

        <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-white/5">
          <div className="flex items-start gap-4">
            <div className="text-zinc-500 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2">Security Note</h4>
              <p className="text-[9px] text-zinc-500 uppercase tracking-tighter leading-relaxed">
                Password changes are logged and will result in a notification across all active sessions. 
                AutoSphere utilizes end-to-end synchronization for identity management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityField = ({ label, type, value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input 
      type={type}
      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white transition-all hover:bg-zinc-800"
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    />
  </div>
);

export default Security;
