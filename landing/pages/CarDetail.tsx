
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCars } from '../../context/CarContext';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import SEO from '../../components/SEO';
import LoadingScreen from '../../components/LoadingScreen';
import Swal from 'https://esm.sh/sweetalert2@11';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getCarById, favorites, isLoading: carsLoading } = useCars();
  const { addRecentlyViewed } = useUserData();
  const { formatPrice, config, isLoading: configLoading } = useSiteConfig();
  const navigate = useNavigate();
  
  const car = getCarById(id || '');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) addRecentlyViewed(id);
    window.scrollTo(0, 0);
  }, [id]);

  if (carsLoading || configLoading) return <LoadingScreen />;
  if (!car) return <div className="min-h-screen flex items-center justify-center text-white">Car not found.</div>;

  const isFav = favorites.includes(car.id);
  const images = car.images && car.images.length > 0 ? car.images : ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200'];
  const isRental = car.categories?.includes('Rental');

  const carSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${car.year} ${car.make} ${car.model}`,
    "image": images,
    "description": car.description,
    "brand": {
      "@type": "Brand",
      "name": car.make
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": car.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": car.categories.includes('New') ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Horsepower", "value": car.hp },
      { "@type": "PropertyValue", "name": "Acceleration", "value": car.acceleration },
      { "@type": "PropertyValue", "name": "Fuel Type", "value": car.fuel },
      { "@type": "PropertyValue", "name": "Mileage", "value": car.mileage }
    ]
  };

  const handlePaymentPortal = async (itemType: 'Purchase' | 'Rental', amount: number, desc: string, rentalId?: string) => {
    if (!user) {
      navigate(`/login?reason=payment&redirect=/car/${car.id}`);
      return;
    }

    const { value: paymentData } = await Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">Secure Payment Portal</span>`,
      html: `
        <div style="text-align: left; padding: 1rem; font-family: Inter, sans-serif; color: #a1a1aa;">
          <div style="background: #111; padding: 1.5rem; border-radius: 1.5rem; border: 1px solid #27272a; margin-bottom: 1.5rem;">
             <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 0.5rem;">Amount Due</p>
             <p style="font-size: 1.5rem; font-weight: bold; color: #fff; margin: 0;">${formatPrice(amount)}</p>
             <p style="font-size: 10px; color: #52525b; margin-top: 0.5rem;">${desc}</p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.75rem; letter-spacing: 0.1em;">Choose Channel</label>
            <select id="pay-method" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
              <option value="Bank Transfer">Bank Wire (Global)</option>
              <option value="Crypto">Cryptocurrency (BTC/ETH/USDT)</option>
              <option value="Card">Credit/Debit Card (Stripe)</option>
            </select>
          </div>

          <div id="payment-instructions" style="background: #09090b; padding: 1rem; border-radius: 1rem; border: 1px solid #18181b; margin-bottom: 1.5rem; font-size: 11px; line-height: 1.6;">
             <!-- Dynamic Instructions -->
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Reference ID / Transaction Hash</label>
            <input id="pay-ref" type="text" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" placeholder="Paste receipt or hash here">
          </div>
        </div>
      `,
      didOpen: () => {
        const methodSelect = document.getElementById('pay-method') as HTMLSelectElement;
        const infoDiv = document.getElementById('payment-instructions')!;
        
        const updateInfo = () => {
          if (methodSelect.value === 'Bank Transfer') {
            infoDiv.innerHTML = `
              <p style="color: #fff; font-weight: bold; margin-bottom: 5px;">Wire Details:</p>
              Bank: ${config.financials.bankName}<br>
              A/C: ${config.financials.accountName}<br>
              IBAN: ${config.financials.accountNumber}<br>
              SWIFT: ${config.financials.swiftCode}
            `;
          } else if (methodSelect.value === 'Crypto') {
            infoDiv.innerHTML = `
              <p style="color: #fff; font-weight: bold; margin-bottom: 5px;">Wallet Addresses:</p>
              BTC: ${config.financials.btcWallet}<br>
              ETH: ${config.financials.ethWallet}<br>
              USDT (TRC20): ${config.financials.usdtWallet}
            `;
          } else {
            infoDiv.innerHTML = `
              <p style="color: #fff; font-weight: bold; margin-bottom: 5px;">Credit Card Portal:</p>
              Secure processing via Stripe. Please enter your transaction reference after completing the checkout.
            `;
          }
        };

        methodSelect.onchange = updateInfo;
        updateInfo();
      },
      showCancelButton: true,
      confirmButtonText: 'SUBMIT PAYMENT',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'glass rounded-[2.5rem] border border-white/10 shadow-2xl',
        confirmButton: 'bg-white text-black px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest'
      },
      preConfirm: () => {
        const method = (document.getElementById('pay-method') as HTMLSelectElement).value;
        const ref = (document.getElementById('pay-ref') as HTMLInputElement).value;
        if (!ref) {
          Swal.showValidationMessage('Payment reference is required for verification.');
          return false;
        }
        return { method, ref };
      }
    });

    if (paymentData && user) {
      await dbService.submitPayment({
        userId: user.id,
        userName: user.name,
        amount,
        method: paymentData.method,
        referenceId: paymentData.ref,
        itemType,
        itemId: rentalId || car.id,
        itemDescription: desc
      });

      await dbService.notifyAllAdmins({
        title: 'New Payment Received',
        message: `A ${paymentData.method} payment of ${formatPrice(amount)} was submitted by ${user.name}.`,
        type: 'warning'
      });

      Swal.fire({
        title: 'Payment Logged',
        text: 'Our finance team is verifying your transaction. You will receive a confirmation alert shortly.',
        icon: 'success',
        background: '#111', color: '#fff', confirmButtonColor: '#fff'
      });
    }
  };

  const openBookingModal = async (type: 'Rental' | 'Test Drive') => {
    if (!user) {
      navigate(`/login?reason=payment&redirect=/car/${car.id}`);
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `<span style="text-transform: uppercase; font-size: 1.25rem;">${type} Reservation</span>`,
      html: `
        <div style="text-align: left; padding: 0.5rem; font-family: Inter, sans-serif; color: #a1a1aa;">
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Contact Email</label>
            <input id="swal-email" type="email" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="${user.email}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Start Date</label>
                <input id="swal-time" type="date" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;">
             </div>
             <div>
                <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Duration (${type === 'Rental' ? 'Days' : 'Hours'})</label>
                <input id="swal-duration" type="number" min="1" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" value="1">
             </div>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 9px; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; letter-spacing: 0.1em;">Location</label>
            <input id="swal-location" type="text" class="swal2-input" style="width: 100%; margin: 0; background: #18181b; border: 1px solid #27272a; color: white; border-radius: 1rem;" placeholder="Geneva International, Private Hangar...">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'INITIALIZE RESERVATION',
      background: '#0a0a0a', color: '#fff',
      customClass: { popup: 'glass rounded-[2rem] border border-white/10' },
      preConfirm: () => {
        const email = (document.getElementById('swal-email') as HTMLInputElement).value;
        const time = (document.getElementById('swal-time') as HTMLInputElement).value;
        const location = (document.getElementById('swal-location') as HTMLInputElement).value;
        const duration = (document.getElementById('swal-duration') as HTMLInputElement).value;
        if (!email || !time || !location || !duration) return Swal.showValidationMessage('Fill all fields.');
        return { email, time, location, duration };
      }
    });

    if (formValues) {
      if (type === 'Rental') {
        const totalPrice = car.price * Number(formValues.duration);
        const rentalId = await dbService.createRental({
          userId: user.id, userName: user.name, userEmail: formValues.email,
          carId: car.id, carName: `${car.make} ${car.model}`,
          dealerId: car.dealerId, dealerName: car.dealerName || 'AutoSphere',
          startDate: formValues.time, duration: Number(formValues.duration),
          location: formValues.location, totalPrice, securityOption: 'Standard'
        });

        // Notify Admin & Dealer
        await dbService.notifyAllAdmins({ title: 'New Rental Request', message: `${user.name} requested ${car.make} for ${formValues.duration} days.`, type: 'info' });
        if (car.dealerId) await dbService.createNotification(car.dealerId, { title: 'Rental Incoming', message: `Request for your ${car.make} ${car.model}.`, type: 'info' });

        // Go to payment
        handlePaymentPortal('Rental', totalPrice, `Rental of ${car.make} ${car.model} for ${formValues.duration} days.`, rentalId);
      } else {
        // Test Drive flow
        await dbService.createBooking({ ...formValues, userId: user.id, car: `${car.make} ${car.model}`, dealerId: car.dealerId });
        Swal.fire('Scheduled', 'Test drive requested.', 'success');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <SEO 
        title={`${car.year} ${car.make} ${car.model} for Sale/Rent`} 
        description={`${car.make} ${car.model} ${car.year}: ${car.hp} HP, ${car.acceleration} acceleration. Explore this high-performance luxury vehicle at AutoSphere.`} 
        ogImage={images[0]}
        ogType="product"
        schema={carSchema}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <section className="relative bg-zinc-900 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] flex flex-col" aria-label="Vehicle Imagery">
          <img src={images[activeImageIndex]} className="flex-grow object-cover" alt={`${car.make} ${car.model} Exterior View`} />
          {images.length > 1 && (
            <div className="p-4 bg-black/40 backdrop-blur-md overflow-x-auto no-scrollbar flex gap-3">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImageIndex(idx)} 
                  aria-label={`View Image ${idx + 1}`}
                  className={`w-20 aspect-video border-2 rounded transition-all ${activeImageIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </section>
        <article className="p-8 md:p-16 space-y-12">
          <header>
            <div className="flex gap-2 mb-4">
              {car.categories.map(c => <span key={c} className="bg-white/10 px-3 py-1 rounded-full text-[8px] uppercase font-bold">{c}</span>)}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">{car.make} {car.model}</h1>
            <p className="text-3xl font-light text-zinc-300 mt-4">{formatPrice(car.price)} {isRental && '/ day'}</p>
          </header>
          <section>
            <h2 className="sr-only">Vehicle Description</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">{car.description}</p>
          </section>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10" aria-label="Technical Specifications">
            <Spec label="Engine Power" val={`${car.hp} HP`} /><Spec label="0-100 km/h" val={car.acceleration} /><Spec label="Fuel Source" val={car.fuel} /><Spec label="Total Mileage" val={`${car.mileage} MI`} />
          </section>
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button onClick={() => isRental ? openBookingModal('Rental') : handlePaymentPortal('Purchase', car.price, `Full acquisition of ${car.make} ${car.model}`)} className="flex-grow bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 shadow-2xl transition-all">
              {isRental ? 'Initialize Rental' : 'Acquire Masterpiece'}
            </button>
            <button onClick={() => openBookingModal('Test Drive')} className="flex-grow border border-white/20 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all">Schedule Viewing</button>
          </div>
        </article>
      </div>
    </div>
  );
};

const Spec = ({ label, val }: any) => (
  <div>
    <h3 className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">{label}</h3>
    <p className="text-lg font-bold">{val}</p>
  </div>
);

export default CarDetail;
