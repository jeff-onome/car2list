
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'https://esm.sh/sweetalert2@11';
import { dbService } from '../../services/database';
import { User } from '../../types';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dbService.subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleManageUser = (user: User) => {
    Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">Managing Account</span>`,
      html: `
        <div style="text-align: left; padding: 1rem; color: #a1a1aa; font-family: Inter, sans-serif;">
          <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Identity:</strong> ${user.name}</p>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Change Role</label>
            <select id="swal-role" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
              <option value="USER" ${user.role === 'USER' ? 'selected' : ''}>Standard Member</option>
              <option value="DEALER" ${user.role === 'DEALER' ? 'selected' : ''}>Authorized Dealer</option>
              <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>System Admin</option>
            </select>
          </div>
          <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <button id="swal-verify-btn" class="swal2-confirm swal2-styled" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;">
              ${user.isVerified ? 'Revoke Verification' : 'Verify Account'}
            </button>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE CHANGES',
      cancelButtonText: 'CLOSE',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10',
        confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
        cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
      },
      preConfirm: () => {
        return {
          role: (document.getElementById('swal-role') as HTMLSelectElement).value,
          // Simple toggle logic can be handled here or inside then()
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dbService.updateUser(user.id, { 
            role: result.value.role as any
          });
          Swal.fire('Updated', 'User profile has been updated.', 'success');
        } catch (e) {
          Swal.fire('Error', 'Update failed.', 'error');
        }
      }
    });
  };

  const handleToggleVerification = async (user: User) => {
    try {
      await dbService.updateUser(user.id, { isVerified: !user.isVerified });
      Swal.fire('Success', `Identity ${user.isVerified ? 'Revoked' : 'Verified'}`, 'success');
    } catch (e) {
      Swal.fire('Error', 'Action failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Identity Registry</h1>
            <p className="text-zinc-500 mt-2">Secure management of the AutoSphere member base.</p>
          </div>
          <Link to="/admin/add-user" className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">
            Enroll New Identity
          </Link>
        </div>
        
        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5">Identity</th>
                  <th className="px-6 py-5">Role Profile</th>
                  <th className="px-6 py-5">Validation</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {!loading ? users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white tracking-tight">{u.name}</p>
                      <p className="text-xs text-zinc-500 lowercase font-mono">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-zinc-400">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${u.isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleManageUser(u)}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-all underline decoration-white/0 hover:decoration-white/100"
                        >
                          Manage
                        </button>
                        <button 
                          onClick={() => handleToggleVerification(u)}
                          className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white transition-all"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-12 text-center text-zinc-600 animate-pulse uppercase tracking-widest text-[10px]">Retrieving Registry Data...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
