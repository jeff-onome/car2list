
import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { dbService } from '../../services/database';
import Swal from 'https://esm.sh/sweetalert2@11';

const Contact: React.FC = () => {
  const { config } = useSiteConfig();
  const { contactPage } = config;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        title: 'Form Incomplete',
        text: 'Please provide at least your identity, email, and inquiry payload.',
        icon: 'warning',
        background: '#0a0a0a',
        color: '#fff'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.submitContactMessage(formData);
      
      // Notify admins of new inquiry
      await dbService.notifyAllAdmins({
        title: 'New Client Inquiry',
        message: `${formData.name} submitted a new inquiry regarding: ${formData.interest || 'General'}.`,
        type: 'info'
      });

      Swal.fire({
        title: 'Transmission Success',
        text: 'Your inquiry has been successfully queued for our concierge team. Expect a response shortly.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#fff'
      });

      setFormData({ name: '', email: '', interest: '', message: '' });
    } catch (error) {
      Swal.fire({
        title: 'Transmission Failed',
        text: 'Synchronization error occurred. Please attempt manual contact via phone or email.',
        icon: 'error',
        background: '#0a0a0a',
        color: '#fff'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="Full Name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="John Doe" 
                required 
              />
              <InputGroup 
                label="Email Address" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="john@example.com" 
                type="email" 
                required 
              />
            </div>
            <InputGroup 
              label="Interested In" 
              name="interest" 
              value={formData.interest} 
              onChange={handleInputChange} 
              placeholder="e.g. Aston Martin DBS" 
            />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[150px] transition-all hover:bg-zinc-800"
                placeholder="How can we assist you?"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all mt-4 shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Transmitting...' : 'Send Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, placeholder, name, value, onChange, type = "text", required = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-2">{label}</label>
    <input 
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      className="bg-zinc-900 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all hover:bg-zinc-800"
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
