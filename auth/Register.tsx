
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/database';

const COUNTRY_DATA: Record<string, string[]> = {
  "USA": ["New York", "California", "Texas", "Florida"],
  "Switzerland": ["Geneva", "Zurich", "Vaud", "Bern"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi"],
  "Japan": ["Tokyo", "Osaka"],
  "United Kingdom": ["London", "Manchester"]
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    state: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmailError('');
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'country' ? { state: '' } : {}) 
    }));
  };

  const states = useMemo(() => {
    return formData.country ? COUNTRY_DATA[formData.country] || [] : [];
  }, [formData.country]);

  const countries = useMemo(() => {
    return Object.keys(COUNTRY_DATA).sort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setEmailError('');

    try {
      // Check for existing identity in the registry
      const users = await dbService.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (existingUser) {
        setEmailError('This email is already associated with an active membership.');
        setIsSubmitting(false);
        return;
      }
      
      // Determine Role (Mock logic: admin@/dealer@ prefixes for testing)
      let role: 'USER' | 'ADMIN' | 'DEALER' = 'USER';
      if (formData.email.toLowerCase().startsWith('admin')) role = 'ADMIN';
      if (formData.email.toLowerCase().startsWith('dealer')) role = 'DEALER';

      const userId = `u_${Date.now()}`;
      const userData = {
        id: userId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: role,
        isVerified: false,
        joinedAt: new Date().toISOString()
      };

      // Save to Firebase
      await dbService.saveUser(userId, userData);
      // Login locally
      login(role, userData);
      // Success redirection
      navigate('/register-success');
    } catch (error) {
      console.error("Registration sync failed:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full glass p-10 md:p-16 rounded-[3rem] border-white/5 shadow-2xl">
        <div className="text-center mb-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter gradient-text uppercase block mb-4">AutoSphere</Link>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Membership Application</h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">Join our exclusive global network of collectors.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegisterInput label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            <RegisterInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
          </div>

          <div className="relative">
            {emailError && (
              <p className="text-red-500 text-[9px] uppercase tracking-[0.2em] ml-4 mb-2 font-bold animate-pulse">
                {emailError}
              </p>
            )}
            <RegisterInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">Country</label>
              <div className="relative">
                <select 
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none text-zinc-300 transition-all hover:bg-zinc-800"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">State / Province</label>
              <div className="relative">
                <select 
                  name="state"
                  required
                  disabled={!formData.country}
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none disabled:opacity-30 text-zinc-300 transition-all hover:bg-zinc-800"
                >
                  <option value="">Select Region</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RegisterInput label="Password" type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            <RegisterInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full bg-white text-black py-5 rounded-full font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl active:scale-[0.98] ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? 'Synchronizing...' : 'Apply for Membership'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest">
            Already a member? <Link to="/login" className="text-white hover:underline transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const RegisterInput = ({ label, type = "text", ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-4">{label}</label>
    <input 
      type={type}
      className="w-full bg-zinc-900 border border-white/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-zinc-100 hover:bg-zinc-800"
      placeholder={`Your ${label.toLowerCase()}`}
      {...props}
    />
  </div>
);

export default Register;
