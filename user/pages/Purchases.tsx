
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/database';
import { useSiteConfig } from '../../context/SiteConfigContext';
import Swal from 'https://esm.sh/sweetalert2@11';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice, config } = useSiteConfig();
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = dbService.subscribeToPurchases(user.id, (data) => {
        setPurchaseHistory(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const viewCertificate = (p: any) => {
    const certHtml = `
      <div id="acquisition-certificate" style="background: #0a0a0a; color: #fff; font-family: 'Playfair Display', serif; padding: 40px; border: 4px double #d4af37; border-radius: 4px; text-align: center; position: relative; overflow: hidden; min-height: 600px; display: flex; flex-direction: column; justify-content: center;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; z-index: 0;">
           <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
        
        <div style="position: relative; z-index: 1;">
          <h1 style="color: #d4af37; text-transform: uppercase; letter-spacing: 0.3em; font-size: 1.5rem; margin-bottom: 20px;">Certificate of Acquisition</h1>
          <div style="width: 100px; height: 1px; background: #d4af37; margin: 0 auto 40px auto;"></div>
          
          <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.7rem; color: #71717a; margin-bottom: 10px;">This instrument hereby certifies that</p>
          <h2 style="font-size: 2rem; margin-bottom: 30px; font-weight: normal; color: #fff;">${user?.name}</h2>
          
          <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.7rem; color: #71717a; margin-bottom: 10px;">is the recognized legal custodian of</p>
          <h3 style="font-size: 1.8rem; color: #fff; margin-bottom: 40px; text-transform: uppercase;">${p.itemDescription}</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; max-width: 400px; margin: 0 auto 40px auto; border-top: 1px solid #18181b; padding-top: 30px;">
             <div>
                <p style="font-size: 0.6rem; text-transform: uppercase; color: #52525b; letter-spacing: 0.1em; margin-bottom: 5px;">Registry Valuation</p>
                <p style="font-size: 1.1rem; color: #fff; font-weight: bold;">${formatPrice(p.amount)}</p>
             </div>
             <div>
                <p style="font-size: 0.6rem; text-transform: uppercase; color: #52525b; letter-spacing: 0.1em; margin-bottom: 5px;">Transaction Reference</p>
                <p style="font-size: 0.8rem; color: #fff; font-family: monospace;">${p.id.slice(-12).toUpperCase()}</p>
             </div>
             <div>
                <p style="font-size: 0.6rem; text-transform: uppercase; color: #52525b; letter-spacing: 0.1em; margin-bottom: 5px;">Acquisition Date</p>
                <p style="font-size: 0.9rem; color: #fff;">${new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
             </div>
             <div>
                <p style="font-size: 0.6rem; text-transform: uppercase; color: #52525b; letter-spacing: 0.1em; margin-bottom: 5px;">Status</p>
                <p style="font-size: 0.9rem; color: #22c55e;">AUTHENTICATED</p>
             </div>
          </div>
          
          <div style="margin-top: 40px;">
             <p style="font-size: 0.6rem; color: #3f3f46; max-width: 500px; margin: 0 auto; line-height: 1.6; font-style: italic;">
                Issued by the AutoSphere Curation Group. This document is a digital representation of the master entry in the AutoSphere global distributed ledger. Authorized for private display and provenance verification.
             </p>
             <div style="margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 40px;">
                <div style="text-align: center;">
                   <div style="width: 80px; height: 1px; background: #3f3f46; margin-bottom: 5px;"></div>
                   <p style="font-size: 0.5rem; text-transform: uppercase; color: #3f3f46;">Chief Curator</p>
                </div>
                <div style="width: 50px; height: 50px; border: 1px solid #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
                   <span style="color: #d4af37; font-size: 0.6rem; font-weight: bold;">AS</span>
                </div>
                <div style="text-align: center;">
                   <div style="width: 80px; height: 1px; background: #3f3f46; margin-bottom: 5px;"></div>
                   <p style="font-size: 0.5rem; text-transform: uppercase; color: #3f3f46;">Registry Officer</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      width: '800px',
      html: certHtml,
      showConfirmButton: true,
      confirmButtonText: 'DOWNLOAD / PRINT CERTIFICATE',
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        popup: 'rounded-[1rem] border border-white/5',
        confirmButton: 'bg-white text-black px-12 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest'
      },
      preConfirm: () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Certificate - ${p.itemDescription}</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <style>body { margin: 0; background: #fff; }</style>
              </head>
              <body>
                ${certHtml.replace('#0a0a0a', '#ffffff').replace('#fff', '#000').replace('#d4af37', '#b8860b')}
                <script>window.onload = () => { window.print(); window.close(); }</script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Purchase Registry</h1>
        
        {loading ? (
          <div className="text-center py-20 text-zinc-600 uppercase tracking-widest text-[10px] animate-pulse">Syncing transactions...</div>
        ) : (
          <div className="space-y-6">
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map(p => (
                <div key={p.id} className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg group-hover:border-white/30 transition-all">
                      <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight">{p.itemDescription}</h3>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Ref: {p.id.slice(0,12).toUpperCase()} • {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Valuation</p>
                      <p className="text-xl font-bold text-white">{formatPrice(p.amount || 0)}</p>
                    </div>
                    {p.status === 'Verified' ? (
                      <button 
                        onClick={() => viewCertificate(p)}
                        className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl"
                      >
                        Inspect Certificate
                      </button>
                    ) : (
                      <div className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 cursor-not-allowed">
                        Awaiting Verification
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-20 rounded-[3rem] text-center border-white/5">
                <svg className="w-16 h-16 text-zinc-800 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p className="text-zinc-600 uppercase tracking-widest text-[10px] italic">No acquisitions found in this identity's history.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
