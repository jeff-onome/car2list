
import React from 'react';
import { useCars } from '../../context/CarContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import { Link } from 'react-router-dom';
import Swal from 'https://esm.sh/sweetalert2@11';
import { Car } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const AdminCarsList: React.FC = () => {
  const { cars, isLoading: carsLoading } = useCars();
  const { formatPrice, isLoading: configLoading } = useSiteConfig();

  if (carsLoading || configLoading) return <LoadingScreen />;

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
          .swal-cat-chip { padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); background: #18181b; color: #71717a; font-size: 9px; font-weight: bold; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
          .swal-cat-chip.active { background: white; color: black; border-color: white; }
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
      background: '#0a0a0a',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'COMMIT CHANGES',
      customClass: {
        popup: 'glass rounded-[2rem] border border-white/10 shadow-2xl',
        confirmButton: 'bg-white text-black px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest'
      },
      preConfirm: () => {
        const selectedChips = document.querySelectorAll('.swal-cat-chip.active');
        const categories = Array.from(selectedChips).map(chip => (chip as HTMLElement).dataset.cat);
        return {
          price: (document.getElementById('swal-price') as HTMLInputElement).value,
          type: (document.getElementById('swal-type') as HTMLSelectElement).value,
          categories
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dbService.updateCar(car.id, {
            price: Number(result.value.price),
            type: result.value.type as any,
            categories: result.value.categories
          });
          Swal.fire('Updated', 'Listing synchronized.', 'success');
        } catch (e) {
          Swal.fire('Error', 'Update failed.', 'error');
        }
      }
    });
  };

  const handleDelete = async (carId: string) => {
    const confirm = await Swal.fire({
      title: 'PERMANENT REMOVAL',
      text: 'Are you certain? This action cannot be reversed.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'DELETE PERMANENTLY',
      confirmButtonColor: '#ef4444',
      background: '#0a0a0a', color: '#fff'
    });
    if (confirm.isConfirmed) {
      await dbService.deleteCar(carId);
      Swal.fire('Purged', 'Asset removed from registry.', 'success');
    }
  };

  const toggleSuspension = async (car: Car) => {
    const nextState = !car.isSuspended;
    await dbService.updateCar(car.id, { isSuspended: nextState });
    Swal.fire({
      title: nextState ? 'Listing Suspended' : 'Listing Restored',
      text: nextState ? 'The vehicle is now hidden from public view.' : 'The vehicle is now visible in the showroom.',
      icon: 'info',
      background: '#0a0a0a', color: '#fff'
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
           <div>
              <h1 className="text-4xl font-bold uppercase tracking-tighter">Cars List</h1>
              <p className="text-zinc-600 uppercase text-[10px] font-bold tracking-[0.3em] mt-2">Master Inventory Management Terminal</p>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fleet Index: <span className="text-white">{cars.length} Units</span></span>
              <Link to="/admin/add-car" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all shadow-xl">Enroll Asset</Link>
           </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {cars.map(car => (
             <div key={car.id} className={`glass rounded-[1.5rem] overflow-hidden border transition-all group relative ${car.isSuspended ? 'border-red-500/20 opacity-70 grayscale' : 'border-white/5 hover:border-white/20'}`}>
                <div className="aspect-video relative overflow-hidden bg-zinc-900">
                   <img src={car.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={car.model} />
                   {car.isSuspended && (
                     <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[8px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-2xl">Suspended</span>
                     </div>
                   )}
                   <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase border shadow-xl ${
                        car.status === 'approved' ? 'bg-green-500 text-black border-green-400' :
                        car.status === 'pending' ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-800 text-white border-white/10'
                      }`}>
                         {car.status || 'Active'}
                      </span>
                   </div>
                </div>
                
                <div className="p-5 space-y-4">
                   <div className="flex justify-between items-start gap-4">
                      <div className="overflow-hidden">
                         <h4 className="text-xs font-bold uppercase text-white truncate tracking-tight">{car.make} {car.model}</h4>
                         <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-1">{car.year} • {car.type}</p>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-xs font-bold text-white">{formatPrice(car.price)}</p>
                         <span className="text-[7px] text-zinc-600 uppercase font-bold tracking-widest block mt-0.5">
                            {car.categories?.includes('Rental') ? 'Rental' : 'Sale'}
                         </span>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleEditCar(car)}
                        className="bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-white/5 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => toggleSuspension(car)}
                        className={`py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border transition-colors ${car.isSuspended ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'}`}
                      >
                        {car.isSuspended ? 'Restore' : 'Suspend'}
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="col-span-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-red-500/20 transition-all"
                      >
                        Delete Permanently
                      </button>
                   </div>
                   
                   <div className="pt-2 flex justify-between items-center text-[7px] text-zinc-700 uppercase font-bold">
                      <span>Ref: {car.id.slice(-8).toUpperCase()}</span>
                      <Link to={`/car/${car.id}`} className="hover:text-white transition-colors">View Showroom</Link>
                   </div>
                </div>
             </div>
           ))}
           {cars.length === 0 && (
             <div className="col-span-full py-32 text-center glass border-white/5 rounded-[3rem]">
                <p className="text-zinc-700 uppercase tracking-[0.4em] text-[10px] italic">Registry currently devoid of assets.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminCarsList;