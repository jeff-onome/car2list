
import React, { useState } from 'react';
import { useCars } from '../../context/CarContext';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';
import { Car } from '../../types';

const ManageListings: React.FC = () => {
  const { cars } = useCars();
  const { formatPrice } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected' | 'archived'>('approved');

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
        await dbService.updateCar(car.id, { 
          status: 'approved', 
          moderationReason: null as any, 
          archivedBy: null as any 
        });
        
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
        console.error("Approve error:", e);
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
        await dbService.updateCar(car.id, { 
          status: 'rejected', 
          moderationReason: reason || 'Policy Violation', 
          archivedBy: null as any 
        });
        
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
        console.error("Reject error:", e);
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  const handleArchive = async (car: Car) => {
    const confirm = await Swal.fire({
      title: 'Archive Masterpiece?',
      text: 'Listing will be hidden from public view and restricted from dealer restoration.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ARCHIVE',
      confirmButtonColor: '#71717a',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.updateCar(car.id, { status: 'archived', archivedBy: 'ADMIN' });
        Swal.fire('Archived', 'Listing moved to storage with administrative lock.', 'success');
      } catch (e) {
        console.error("Archive error:", e);
        Swal.fire('Error', 'Update failed.', 'error');
      }
    }
  };

  const handleRestore = async (car: Car) => {
    const confirm = await Swal.fire({
      title: 'Restore to Showroom?',
      text: `Reinstate the ${car.make} ${car.model} to the public catalog?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'RESTORE',
      confirmButtonColor: '#22c55e',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.updateCar(car.id, { 
          status: 'approved', 
          archivedBy: null as any,
          moderationReason: null as any
        });
        if (car.dealerId) {
          await dbService.createNotification(car.dealerId, {
            title: 'Inventory Restored',
            message: `The administration has restored your ${car.make} ${car.model} listing.`,
            type: 'success'
          });
        }
        Swal.fire('Restored', 'Asset is now live.', 'success');
      } catch (e) {
        console.error("Restore error:", e);
        Swal.fire('Error', 'Action failed.', 'error');
      }
    }
  };

  const handleDelete = async (car: Car) => {
    const confirm = await Swal.fire({
      title: 'PERMANENT REMOVAL',
      text: `Are you certain? This will completely purge the ${car.make} ${car.model} from the global database. This action cannot be reversed.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'DELETE PERMANENTLY',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a',
      color: '#fff'
    });

    if (confirm.isConfirmed) {
      try {
        await dbService.deleteCar(car.id);
        Swal.fire('Deleted', 'Asset purged from registry.', 'success');
      } catch (e) {
        console.error("Delete error:", e);
        Swal.fire('Error', 'Purge failed.', 'error');
      }
    }
  };

  const handleEditCar = (car: Car) => {
    const availableCategories = ['New', 'Pre-Owned', 'Rental', 'Limited Edition', 'Auction'];
    const currentCats = car.categories || [];

    Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">Edit Masterpiece</span>`,
      html: `
        <div style="text-align: left; padding: 1rem; font-family: Inter, sans-serif; color: #a1a1aa; max-height: 70vh; overflow-y: auto;" class="no-scrollbar">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Valuation (USD)</label>
                <input id="swal-price" type="number" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${car.price}">
             </div>
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Body Category</label>
                <select id="swal-type" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
                  <option value="Luxury" ${car.type === 'Luxury' ? 'selected' : ''}>Luxury</option>
                  <option value="Sports" ${car.type === 'Sports' ? 'selected' : ''}>Sports</option>
                  <option value="SUV" ${car.type === 'SUV' ? 'selected' : ''}>SUV</option>
                  <option value="Classic" ${car.type === 'Classic' ? 'selected' : ''}>Classic</option>
                </select>
             </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Power (HP)</label>
                <input id="swal-hp" type="number" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${car.hp || 0}">
             </div>
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Acceleration (0-100)</label>
                <input id="swal-acc" type="text" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${car.acceleration || ''}" placeholder="e.g. 3.2s">
             </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Fuel Type</label>
                <select id="swal-fuel" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
                  <option value="Petrol" ${car.fuel === 'Petrol' ? 'selected' : ''}>Petrol</option>
                  <option value="Electric" ${car.fuel === 'Electric' ? 'selected' : ''}>Electric</option>
                  <option value="Hybrid" ${car.fuel === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                </select>
             </div>
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Mileage (MI)</label>
                <input id="swal-mileage" type="number" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${car.mileage || 0}">
             </div>
          </div>

          <div>
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.75rem; letter-spacing: 0.1em;">Market Classifications</label>
            <div id="swal-cats-container" style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${availableCategories.map(cat => `
                <div class="swal-cat-chip ${currentCats.includes(cat) ? 'active' : ''}" data-cat="${cat}">
                  ${cat}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <style>
          .swal-cat-chip {
            padding: 6px 12px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.05);
            background: #18181b;
            color: #71717a;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s;
          }
          .swal-cat-chip.active {
            background: white;
            color: black;
            border-color: white;
          }
        </style>
      `,
      didOpen: () => {
        const chips = document.querySelectorAll('.swal-cat-chip');
        chips.forEach(chip => {
          chip.addEventListener('click', () => {
            chip.classList.toggle('active');
          });
        });
      },
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
        const selectedChips = document.querySelectorAll('.swal-cat-chip.active');
        const categories = Array.from(selectedChips).map(chip => (chip as HTMLElement).dataset.cat);
        return {
          price: (document.getElementById('swal-price') as HTMLInputElement).value,
          type: (document.getElementById('swal-type') as HTMLSelectElement).value,
          hp: (document.getElementById('swal-hp') as HTMLInputElement).value,
          acceleration: (document.getElementById('swal-acc') as HTMLInputElement).value,
          fuel: (document.getElementById('swal-fuel') as HTMLSelectElement).value,
          mileage: (document.getElementById('swal-mileage') as HTMLInputElement).value,
          categories
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dbService.updateCar(car.id, {
            price: Number(result.value.price),
            type: result.value.type as any,
            hp: Number(result.value.hp),
            acceleration: result.value.acceleration,
            fuel: result.value.fuel as any,
            mileage: Number(result.value.mileage),
            categories: result.value.categories
          });

          Swal.fire({
            title: 'Updated',
            text: `Listing has been synchronized with the new specifications.`,
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
    { id: 'pending', name: 'Queue', count: cars.filter(c => c.status === 'pending').length },
    { id: 'approved', name: 'Live', count: cars.filter(c => c.status === 'approved' || !c.status).length },
    { id: 'rejected', name: 'Rejected', count: cars.filter(c => c.status === 'rejected').length },
    { id: 'archived', name: 'Archived', count: cars.filter(c => c.status === 'archived').length }
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-white">Inventory Control</h1>
            <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest font-bold">Moderating specifications across the global fleet.</p>
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 md:px-8 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap flex items-center gap-2 md:gap-3 ${activeTab === tab.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
             >
               {tab.name}
               <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'}`}>
                 {tab.count}
               </span>
             </button>
           ))}
        </div>

        <div className="glass rounded-2xl md:rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-white/5 bg-white/5">
                  <th className="px-6 py-5">Masterpiece</th>
                  <th className="px-6 py-5">Source</th>
                  <th className="px-6 py-5">Classification</th>
                  <th className="px-6 py-5">Valuation</th>
                  <th className="px-6 py-5 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCars.length > 0 ? filteredCars.map(car => (
                  <tr key={car.id} className="text-sm hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={car.images[0]} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-white/10" alt="" />
                        <div>
                          <p className="font-bold text-white uppercase tracking-tight text-xs md:text-sm">{car.make} {car.model}</p>
                          <p className="text-[10px] text-zinc-500">{car.year} • {car.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-zinc-400 font-medium text-xs">{car.dealerName || 'Independent'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(car.categories || []).map(cat => (
                            <span key={cat} className="text-[7px] font-bold bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.5 rounded uppercase">{cat}</span>
                          ))}
                          {car.status === 'archived' && (
                             <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase border ${car.archivedBy === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                                {car.archivedBy === 'ADMIN' ? 'Admin Lock' : 'Dealer Hide'}
                             </span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white text-xs md:text-sm">{formatPrice(car.price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 md:gap-4 justify-end">
                        {activeTab === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(car)}
                              className="bg-green-500/10 text-green-500 px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] uppercase font-bold tracking-widest hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(car)}
                              className="bg-red-500/10 text-red-500 px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {(activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'archived') && (
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleEditCar(car)}
                              className="text-[9px] md:text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            {activeTab === 'archived' ? (
                              <button 
                                onClick={() => handleRestore(car)}
                                className="text-[9px] md:text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                              >
                                Restore
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleArchive(car)}
                                className="text-[9px] md:text-[10px] uppercase font-bold text-zinc-600 hover:text-white transition-colors"
                              >
                                Archive
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(car)}
                              className="text-[9px] md:text-[10px] uppercase font-bold text-red-500/40 hover:text-red-500 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                       <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">Showroom empty for this classification.</p>
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
