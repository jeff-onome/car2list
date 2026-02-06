import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'https://esm.sh/sweetalert2@11';
import { dbService } from '../../services/database';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    isVerified: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const userId = `u_${Date.now()}`;
    const userData = {
      ...formData,
      id: userId,
      joinedAt: new Date().toISOString(),
    };

    try {
      await dbService.saveUser(userId, userData as any);
      Swal.fire({
        title: 'User Created',
        text: `Account for ${formData.name} has been successfully initialized.`,
        icon: 'success',
        confirmButtonColor: '#000',
        background: '#111',
        color: '#fff'
      }).then(() => navigate('/admin/users'));
    } catch (err) {
      Swal.fire({
        title: 'Enrollment Error',
        text: 'The registry failed to synchronize. Please try again.',
        icon: 'error',
        background: '#111',
        color: '#fff'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold uppercase tracking-tighter">System Enrollment</h1>
          <p className="text-zinc-500">Manually provision new accounts for the AutoSphere ecosystem.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] space-y-8 border-white/5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Full Identity</label>
              <input 
                type="text"
                required
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                placeholder="Name or Business Title"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Email Address</label>
              <input 
                type="email"
                required
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                placeholder="contact@identity.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Access Level</label>
              <select 
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white appearance-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="USER">Standard Member</option>
                <option value="DEALER">Authorized Dealer</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Temporary Password</label>
              <input 
                type="password"
                required
                className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 text-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Synchronizing...' : 'Initialize Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;