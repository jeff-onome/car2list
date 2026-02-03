
import React, { useState } from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { Car } from '../../types';

const ManageListings: React.FC = () => {
  const { cars } = useCars();
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('approved');

  const filteredCars = cars.filter(c => c.status === activeTab || (!c.status && activeTab === 'approved'));

  const handleApprove = async (car: Car) => {
    const confirm = await Swal.fire({
      title: 'Approve Listing?',
      text: `This ${car.make} ${car.model} will become visible to all users immediately.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'APPROVE',
      confirmButtonColor: '#22c55e',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.updateCar(car.id, { status: 'approved', moderationReason: '' });
        
        // Notify Dealer
        if (car.dealerId) {
          await dbService.createNotification(car.dealerId, {
            title: 'Listing Approved',
            message: `Your ${car.make} ${car.model} is now live in the global showroom.`,
            type: 'success'
          });
        }

        Swal.fire('Success', 'Listing has been published.', 'success');
      } catch (e) {
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  const handleReject = async (car: Car) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Listing?',
      text: 'Provide feedback to the dealer about why this listing was rejected.',
      input: 'textarea',
      inputPlaceholder: 'Reason for rejection (e.g., poor image quality, incorrect price)...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'REJECT',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        input: 'bg-zinc-900 text-white border-white/10 rounded-2xl'
      }
    });

    if (isConfirmed) {
      try {
        await dbService.updateCar(car.id, { status: 'rejected', moderationReason: reason || 'Policy Violation' });
        
        // Notify Dealer
        if (car.dealerId) {
          await dbService.createNotification(car.dealerId, {
            title: 'Listing Rejected',
            message: `The listing for ${car.make} ${car.model} was rejected: ${reason || 'Policy Violation'}`,
            type: 'warning'
          });
        }

        Swal.fire('Rejected', 'The dealer has been notified.', 'info');
      } catch (e) {
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  const handleEditCar = (car: Car) => {
    Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">Edit Masterpiece</span>`,
      html: `
        <div style="text-align: left; padding: 1rem; font-family: Inter, sans-serif;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Valuation (USD)</label>
            <input id="swal-price" type="number" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${car.price}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Category</label>
            <select id="swal-type" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
              <option value="Luxury" ${car.type === 'Luxury' ? 'selected' : ''}>Luxury</option>
              <option value="Sports" ${car.type === 'Sports' ? 'selected' : ''}>Sports</option>
              <option value="SUV" ${car.type === 'SUV' ? 'selected' : ''}>SUV</option>
              <option value="Classic" ${car.type === 'Classic' ? 'selected' : ''}>Classic</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      background: '#0a0a0a',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'COMMIT CHANGES',
      cancelButtonText: 'CANCEL',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
        confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest',
        cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
      },
      preConfirm: () => {
        return {
          price: (document.getElementById('swal-price') as HTMLInputElement).value,
          type: (document.getElementById('swal-type') as HTMLSelectElement).value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dbService.updateCar(car.id, {
            price: Number(result.value.price),
            type: result.value.type as any
          });

          Swal.fire({
            title: 'Updated',
            text: `Listing for the ${car.make} ${car.model} has been synchronized.`,
            icon: 'success',
            background: '#111',
            color: '#fff',
            confirmButtonColor: '#fff'
          });
        } catch (error) {
          Swal.fire('Error', 'Failed to update database.', 'error');
        }
      }
    });
  };

  const tabs = [
    { id: 'pending', name: 'Moderation Queue', count: cars.filter(c => c.status === 'pending').length },
    { id: 'approved', name: 'Live Listings', count: cars.filter(c => c.status === 'approved' || !c.status).length },
    { id: 'rejected', name: 'Rejected Archive', count: cars.filter(c => c.status === 'rejected').length }
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Inventory Control</h1>
            <p className="text-zinc-500 mt-2">Moderating submissions from our network of authorized dealers.</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
             >
               {tab.name}
               <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'}`}>
                 {tab.count}
               </span>
             </button>
           ))}
        </div>

        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5">Masterpiece</th>
                  <th className="px-6 py-5">Dealer Source</th>
                  <th className="px-6 py-5">Valuation</th>
                  <th className="px-6 py-5">Submission Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCars.length > 0 ? filteredCars.map(car => (
                  <tr key={car.id} className="text-sm hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={car.images[0]} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                        <div>
                          <p className="font-bold text-white uppercase tracking-tight">{car.make} {car.model}</p>
                          <p className="text-[10px] text-zinc-500">{car.year} • {car.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-zinc-400 font-medium">{car.dealerName || 'Independent Seller'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white">${car.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-4 justify-end">
                        {activeTab === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(car)}
                              className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-green-500 hover:text-white transition-all"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(car)}
                              className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {(activeTab === 'approved' || activeTab === 'rejected') && (
                          <button 
                            onClick={() => handleEditCar(car)}
                            className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                        )}

                        {activeTab === 'rejected' && (
                           <button 
                            onClick={() => handleApprove(car)}
                            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white transition-colors"
                          >
                            Re-Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <svg className="w-12 h-12 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No items found in this category.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageListings;
