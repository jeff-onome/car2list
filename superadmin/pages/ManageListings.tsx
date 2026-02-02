
import React from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';
import { Car } from '../../types';

const ManageListings: React.FC = () => {
  const { cars } = useCars();

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
          <div>
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Visibility Status</label>
            <select id="swal-status" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
              <option value="Active">Active Listing</option>
              <option value="Suspended">Suspended</option>
              <option value="Private">Private Archive</option>
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
          type: (document.getElementById('swal-type') as HTMLSelectElement).value,
          status: (document.getElementById('swal-status') as HTMLSelectElement).value
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dbService.updateCar(car.id, {
            price: Number(result.value.price),
            type: result.value.type as any,
            // Assuming we add a 'status' field or handle suspension
            isFeatured: result.value.status === 'Active'
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
          Swal.fire('Error', 'Failed to update database. Check security rules.', 'error');
        }
      }
    });
  };

  const handleFlagCar = (car: Car) => {
    Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem; color: #ef4444;">Flag Listing</span>`,
      text: `Identify the reason for flagging the ${car.make} ${car.model}:`,
      input: 'select',
      inputOptions: {
        'suspicious': 'Suspicious Pricing',
        'incorrect': 'Incorrect Metadata',
        'policy': 'Policy Violation',
        'duplicate': 'Duplicate Listing',
        'other': 'Other Irregularity'
      },
      inputPlaceholder: 'Select an infraction',
      showCancelButton: true,
      confirmButtonText: 'FLAG LISTING',
      cancelButtonText: 'DISMISS',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
        input: 'bg-zinc-900 text-white border-white/10 rounded-full',
        confirmButton: 'bg-red-600 text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-red-500',
        cancelButton: 'text-zinc-500 font-bold text-[10px] uppercase tracking-widest bg-transparent border border-white/10'
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          // In a real system, we'd add this to a 'reports' collection
          // For now, let's mark the car as flagged in its own node
          await dbService.updateCar(car.id, { 
            description: car.description + ` [FLAGGED: ${result.value}]`
          });

          Swal.fire({
            title: 'Flagged',
            text: `The listing has been marked for priority review. Reason: ${result.value}`,
            icon: 'warning',
            background: '#111',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        } catch (error) {
           Swal.fire('Error', 'Failed to flag listing.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Global Inventory</h1>
            <p className="text-zinc-500 mt-2">Overseeing all curated listings across the AutoSphere network.</p>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5">Masterpiece</th>
                  <th className="px-6 py-5">Dealer Source</th>
                  <th className="px-6 py-5">Acquisition Value</th>
                  <th className="px-6 py-5">Provision Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cars.length > 0 ? cars.map(car => (
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
                      <br/>
                      <span className="opacity-40">{car.createdAt ? new Date(car.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${car.isFeatured ? 'bg-white/5 text-white border-white/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                         {car.isFeatured ? 'Verified' : 'Suspended'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleEditCar(car)}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleFlagCar(car)}
                          className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 transition-colors"
                        >
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500 uppercase tracking-widest text-[10px]">No Inventory Records found.</td></tr>
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
