
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
      Swal.fire({ title: 'Mismatch', text: 'New passwords do not match.', icon: 'error', background: '#0a0a0a', color: '#fff' });
      return;
    }

    setLoading(true);
    try {
      const users = await dbService.getUsers();
      const dbUser = users.find(u => u.id === user.id);

      if (!dbUser || dbUser.password !== formData.currentPassword) {
        Swal.fire({ title: 'Invalid Access', text: 'Current password is incorrect.', icon: 'error', background: '#0a0a0a', color: '#fff' });
        setLoading(false);
        return;
      }

      await dbService.updateUser(user.id, { password: formData.newPassword });
      
      await dbService.createNotification(user.id, {
        title: 'Security Sync Complete',
        message: 'Your portal access key has been successfully modified.',
        type: 'success'
      });

      Swal.fire({ title: 'Vault Updated', icon: 'success', background: '#0a0a0a', color: '#fff' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Swal.fire({ title: 'System Error', icon: 'error', background: '#0a0a0a', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Security Vault</h1>
          <p className="text-zinc-500 uppercase text-[10px] tracking-[0.2em] font-bold mt-2">Manage Authentication Identity</p>
        </header>

        <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] border-white/5 space-y-8 shadow-2xl">
          <SecurityField label="Current Password" type="password" value={formData.currentPassword} onChange={(v:any) => setFormData({...formData, currentPassword: v})} required />
          <div className="border-t border-white/5 pt-6 space-y-6">
            <SecurityField label="New Access Key" type="password" value={formData.newPassword} onChange={(v:any) => setFormData({...formData, newPassword: v})} required />
            <SecurityField label="Confirm New Access Key" type="password" value={formData.confirmPassword} onChange={(v:any) => setFormData({...formData, confirmPassword: v})} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Synchronizing...' : 'Rotate Security Key'}
          </button>
        </form>
      </div>
    </div>
  );
};

const SecurityField = ({ label, type, value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4 font-bold">{label}</label>
    <input type={type} className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm text-white transition-all hover:bg-zinc-800" value={value} onChange={e => onChange(e.target.value)} {...props} />
  </div>
);

export default Security;
