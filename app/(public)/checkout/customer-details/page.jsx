'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, CheckCircle2, Lock, ShieldCheck, User, Mail, Phone, KeySquare, ChevronRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import { useBooking } from '@/context/BookingContext';
import Cookies from 'js-cookie';
import { TOKEN_COOKIE } from '@/lib/constants';

const InputField = ({ label, icon: Icon, name, type = 'text', placeholder, required, readOnly, maxLength, value, onChange, error, hint, showPasswordToggle, onTogglePassword }) => (
  <div className="mb-5 relative">
    <label className="block text-[10px] font-bold text-[#888] tracking-[0.1em] mb-2 uppercase">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
        className={`w-full h-14 bg-[#141414] border ${error ? 'border-red-500' : 'border-[#333]'} rounded-xl pl-12 pr-4 text-[14px] text-white focus:bg-[#1A1A1A] focus:border-white outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {showPasswordToggle && value && (
        <button 
          type="button" 
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888] uppercase tracking-wider hover:text-white"
        >
          {type === 'text' ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
    {hint && !error && <p className="text-[#666] text-[11px] mt-1.5 leading-snug">{hint}</p>}
  </div>
);

export default function CustomerDetailsPage() {
  const router = useRouter();
  const { canProceedToBook } = useBooking();

  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    mobile: '',
    fullName: '',
    email: '',
    altContact: '',
    devicePassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize data
  useEffect(() => {
    if (!canProceedToBook) {
      router.replace('/home');
      return;
    }

    const token = Cookies.get(TOKEN_COOKIE);
    if (!token) {
      // Not authenticated
      router.replace('/login');
      return;
    }

    // Attempt to load from localStorage (Mock returning user)
    const storedMobile = typeof window !== 'undefined' ? localStorage.getItem('gr_authenticated_phone') || sessionStorage.getItem('gr_login_phone') : '';
    let savedProfile = null;
    try {
      savedProfile = JSON.parse(localStorage.getItem('gr_customer_profile'));
    } catch (e) {}

    setFormData(prev => ({
      ...prev,
      mobile: storedMobile || savedProfile?.mobile || '+1 (555) 000-0000', // Prioritize authenticated phone
      fullName: savedProfile?.fullName || '',
      email: savedProfile?.email || '',
      altContact: savedProfile?.altContact || ''
    }));
  }, [canProceedToBook, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length > 100) newErrors.fullName = 'Name too long (max 100 chars)';
    
    if (!formData.email.trim()) newErrors.email = 'Email ID is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    
    if (formData.altContact && !/^\d{10}$/.test(formData.altContact.replace(/\D/g, ''))) {
      newErrors.altContact = 'Alternate contact must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Save profile locally for MVP "returning user" pre-fill
      localStorage.setItem('gr_customer_profile', JSON.stringify({
        mobile: formData.mobile,
        fullName: formData.fullName,
        email: formData.email,
        altContact: formData.altContact
      }));

      // MOCK: Generate Order ID
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const seq = Math.floor(100 + Math.random() * 900);
      const orderId = `ORD-${dateStr}-${seq}`;
      
      // Store success state
      sessionStorage.setItem('gr_last_order', JSON.stringify({
        orderId,
        email: formData.email
      }));

      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));
      
      // Redirect to success
      router.push('/checkout/success');
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
  return (
    <AppShell>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile lg:hidden min-h-[100svh] relative bg-[#0A0A0A] text-white pb-[140px]">
        {/* Mobile Top Bar */}
        <div className="top-bar flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-[#1A1A1A] border border-[#333]">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 flex justify-center">
            <span className="text-sm font-black uppercase tracking-widest text-white">Checkout</span>
          </div>
          <button className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-[#1A1A1A] border border-[#333]">
            <Bell size={16} />
          </button>
        </div>

        <div className="relative z-10 pt-[80px] px-5">
          <h1 className="text-[28px] font-black tracking-tight leading-tight mb-2">
            Almost Done!
          </h1>
          <p className="text-[#888] text-[13px] mb-8">
            Please confirm your contact details to finalize the booking.
          </p>

          <form onSubmit={handleSubmit}>
            <InputField 
              label="Mobile Number" 
              icon={Phone} 
              name="mobile" 
              value={formData.mobile} 
              readOnly 
            />
            
            <InputField 
              label="Full Name" 
              icon={User} 
              name="fullName" 
              placeholder="Enter your full name" 
              value={formData.fullName} 
              onChange={handleChange} 
              error={errors.fullName} 
              required 
              maxLength={100}
            />

            <InputField 
              label="Email Address" 
              icon={Mail} 
              name="email" 
              type="email"
              placeholder="you@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              error={errors.email} 
              required 
            />

            <InputField 
              label="Alternate Contact (Optional)" 
              icon={Phone} 
              name="altContact" 
              placeholder="10-digit number" 
              value={formData.altContact} 
              onChange={handleChange} 
              error={errors.altContact} 
            />

            <div className="h-[1px] w-full bg-[#222] my-8"></div>

            <h2 className="text-[16px] font-black tracking-tight mb-4 flex items-center gap-2">
              <Lock size={18} className="text-accent" /> Security Details
            </h2>

            <InputField 
              label="Device Password (Optional)" 
              icon={KeySquare} 
              name="devicePassword" 
              type={showPassword ? 'text' : 'password'}
              placeholder="PIN, Password, or Pattern details" 
              value={formData.devicePassword} 
              onChange={handleChange} 
              maxLength={20}
              hint="Required for diagnosis. Your password is encrypted and only accessible to the repair engineer. Write-only — not readable after submission."
              showPasswordToggle={true}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

          </form>
        </div>

        <div className="fixed bottom-[70px] left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-40">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.fullName || !formData.email}
            className="w-full h-[60px] bg-white hover:bg-gray-200 text-black rounded-[20px] text-[15px] font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Place Order'} <ChevronRight size={18} />
          </button>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]">
           <BottomNav />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop hidden lg:block bg-[#0A0A0A] min-h-[calc(100vh-var(--topbar-height))] text-white">
        <div className="flex h-[calc(100vh-var(--topbar-height))]">
        {/* Left Side: Summary Panel */}
        <div className="w-1/2 flex flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/dark-microchip-bg.png')] bg-cover mix-blend-screen pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-md text-center">
             <div className="w-20 h-20 bg-black border border-[#333] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
               <ShieldCheck size={40} className="text-accent" />
             </div>
             <h1 className="text-[36px] font-black tracking-tight leading-none mb-4">
               Secure Checkout
             </h1>
             <p className="text-[#888] text-[15px] leading-relaxed mb-10">
               Please confirm your details to finalize the booking. Your device password is encrypted end-to-end and is only visible to your assigned engineer.
             </p>
             
             <div className="bg-black/50 border border-[#222] rounded-2xl p-6 text-left">
               <div className="flex items-center gap-3 mb-4">
                 <CheckCircle2 size={18} className="text-green-500" />
                 <span className="text-sm font-bold text-white">Genuine Quality Parts</span>
               </div>
               <div className="flex items-center gap-3 mb-4">
                 <CheckCircle2 size={18} className="text-green-500" />
                 <span className="text-sm font-bold text-white">Certified Technicians</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 size={18} className="text-green-500" />
                 <span className="text-sm font-bold text-white">Data Privacy Guarantee</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-1/2 p-12 overflow-y-auto flex flex-col justify-center border-l border-[#222]/30">
           <div className="w-full max-w-lg mx-auto">
             <h2 className="text-[22px] font-black uppercase tracking-wider mb-8 flex items-center gap-3">
               Customer Details
             </h2>

             <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField label="Mobile Number" icon={Phone} name="mobile" value={formData.mobile} readOnly />
                  </div>
                  
                  <div className="col-span-2">
                    <InputField label="Full Name" icon={User} name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} error={errors.fullName} required maxLength={100} />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <InputField label="Email Address" icon={Mail} name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} required />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <InputField label="Alternate Contact (Optional)" icon={Phone} name="altContact" placeholder="10-digit number" value={formData.altContact} onChange={handleChange} error={errors.altContact} />
                  </div>
                </div>

                <div className="h-[1px] w-full bg-[#222] my-8"></div>

                <h2 className="text-[22px] font-black uppercase tracking-wider mb-8 flex items-center gap-3">
                  <Lock size={24} className="text-[#888]" /> Device Security
                </h2>

                <InputField 
                  label="Device Password (Optional)" 
                  icon={KeySquare} 
                  name="devicePassword" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="PIN, Password, or Pattern details" 
                  value={formData.devicePassword} 
                  onChange={handleChange} 
                  maxLength={20}
                  hint="Required for diagnosis. Your password is encrypted and only accessible to the repair engineer. Write-only — not readable after submission."
                  showPasswordToggle={true}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.fullName || !formData.email}
                    className="w-full h-[64px] bg-white hover:bg-gray-200 text-black rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Submit Order'} <ChevronRight size={20} />
                  </button>
                </div>
             </form>
           </div>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
