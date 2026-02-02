
import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const Contact: React.FC = () => {
  const { config } = useSiteConfig();
  const { contactPage } = config;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.5em] text-zinc-500 block mb-4">Get in Touch</span>
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Connect with Excellence</h1>
          </div>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            {contactPage.description}
          </p>
          
          <div className="space-y-6 pt-8">
            <ContactInfo label="Global Headquarters" value={contactPage.address} />
            <ContactInfo label="Inquiries" value={contactPage.email} />
            <ContactInfo label="Phone" value={contactPage.phone} />
          </div>
        </div>

        <div className="glass p-8 md:p-12 rounded-3xl">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Full Name" placeholder="John Doe" />
              <InputGroup label="Email Address" placeholder="john@example.com" />
            </div>
            <InputGroup label="Interested In" placeholder="e.g. Aston Martin DBS" />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2">Message</label>
              <textarea 
                className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[150px]"
                placeholder="How can we assist you?"
              />
            </div>
            <button className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all mt-4">
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string; placeholder: string }> = ({ label, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2">{label}</label>
    <input 
      type="text"
      className="bg-zinc-900 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
      placeholder={placeholder}
    />
  </div>
);

const ContactInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <p className="text-lg font-medium">{value}</p>
  </div>
);

export default Contact;
