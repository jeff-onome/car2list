
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

  const handleBulkSuspension = async (suspend: boolean) => {
    const action = suspend ? 'Suspend' : 'Restore';
    const confirm = await Swal.fire({
      title: `<span style="text-transform: uppercase;">${action} All Accounts?</span>`,
      text: `This will ${suspend ? 'block access for' : 'restore access to'} all registered identities in the registry.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `YES, ${action.toUpperCase()} ALL`,
      confirmButtonColor: suspend ? '#ef4444' : '#22c55e',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10',
        confirmButton: 'px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
        cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
      }
    });

    if (confirm.isConfirmed) {
      try {
        const promises = users.map(async (u) => {
          await dbService.updateUser(u.id, { isSuspended: suspend });
          await dbService.createNotification(u.id, {
            title: suspend ? 'Account Suspended' : 'Account Restored',
            message: suspend 
              ? 'Your account has been suspended for policy review.' 
              : 'Your account access has been fully restored.',
            type: suspend ? 'warning' : 'success'
          });
        });
        await Promise.all(promises);
        Swal.fire('Global Action Complete', `All accounts have been ${suspend ? 'suspended' : 'restored'}.`, 'success');
      } catch (e) {
        Swal.fire('Error', 'Bulk update failed.', 'error');
      }
    }
  };

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
            <button id="swal-suspend-btn" class="swal2-styled" style="background: ${user.isSuspended ? '#22c55e' : '#ef4444'}; color: #fff; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2rem; border: none; padding: 12px;">
              ${user.isSuspended ? 'Activate Account' : 'Suspend Account'}
            </button>
            <button id="swal-verify-btn" class="swal2-styled" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 2rem; padding: 12px; color: #fff;">
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
      didOpen: () => {
        const suspendBtn = document.getElementById('swal-suspend-btn');
        const verifyBtn = document.getElementById('swal-verify-btn');
        
        suspendBtn?.addEventListener('click', async () => {
          const nextState = !user.isSuspended;
          await dbService.updateUser(user.id, { isSuspended: nextState });
          await dbService.createNotification(user.id, {
            title: nextState ? 'Account Suspended' : 'Account Activated',
            message: nextState ? 'Your account has been restricted by an administrator.' : 'Your account access has been restored.',
            type: nextState ? 'warning' : 'success'
          });
          Swal.close();
          Swal.fire('Success', `Account ${nextState ? 'Suspended' : 'Activated'}`, 'success');
        });

        verifyBtn?.addEventListener('click', async () => {
          const nextState = !user.isVerified;
          await dbService.updateUser(user.id, { isVerified: nextState });
          await dbService.createNotification(user.id, {
            title: nextState ? 'Identity Verified' : 'Verification Revoked',
            message: nextState ? 'Your identity has been successfully validated.' : 'Your verification status has been revoked.',
            type: nextState ? 'success' : 'info'
          });
          Swal.close();
          Swal.fire('Success', `Verification ${nextState ? 'Granted' : 'Revoked'}`, 'success');
        });
      },
      preConfirm: () => {
        return {
          role: (document.getElementById('swal-role') as HTMLSelectElement).value,
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

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Identity Registry</h1>
            <p className="text-zinc-500 mt-2">Secure management of the AutoSphere member base.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleBulkSuspension(true)}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
            >
              Suspend All
            </button>
            <button 
              onClick={() => handleBulkSuspension(false)}
              className="bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
            >
              Restore All
            </button>
            <Link to="/admin/add-user" className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">
              Enroll New Identity
            </Link>
          </div>
        </div>
        
        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5">Identity</th>
                  <th className="px-6 py-5">Role Profile</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Validation</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {!loading ? users.map(u => (
                  <tr key={u.id} className={`hover:bg-white/5 transition-colors group ${u.isSuspended ? 'opacity-60 bg-red-500/[0.02]' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white tracking-tight">{u.name}</p>
                      <p className="text-xs text-zinc-500 lowercase font-mono">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-zinc-400">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isSuspended ? (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Suspended</span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${u.isVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-4 justify-end">
                        <button 
                          onClick={() => handleManageUser(u)}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-all underline decoration-white/0 hover:decoration-white/100"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-12 text-center text-zinc-600 animate-pulse uppercase tracking-widest text-[10px]">Retrieving Registry Data...</td></tr>
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
