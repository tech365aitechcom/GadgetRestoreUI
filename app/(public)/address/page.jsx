'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Home, Briefcase, Plus, Minus, MapPin } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import { useBooking } from '@/context/BookingContext';

export default function AddressPage() {
  const router = useRouter();
  const { setAddress, address: savedBookingAddress } = useBooking();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  // Load addresses from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gr_saved_addresses');
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse stored addresses', e);
    }
  }, []);
  
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    flat: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home'
  });

  const handleConfirm = () => {
    if (isAddingNew) {
      if (!newAddress.flat || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        alert('Please fill all required fields');
        return;
      }
      
      const addrObj = {
        id: Date.now().toString(),
        label: newAddress.label || 'Home',
        line1: `${newAddress.flat}, ${newAddress.street}`,
        line2: `${newAddress.city}, ${newAddress.state} ${newAddress.pincode}`,
        city: newAddress.city,
        pincode: newAddress.pincode,
        type: newAddress.label.toLowerCase() === 'work' ? 'work' : 'home',
        notes: deliveryNotes
      };
      
      const updatedList = [addrObj, ...savedAddresses];
      setSavedAddresses(updatedList);
      localStorage.setItem('gr_saved_addresses', JSON.stringify(updatedList));
      
      setAddress(addrObj);
      router.push('/checkout/summary'); // Route to Order Summary next
    } else {
      const selected = savedAddresses.find(a => a.id === selectedAddressId);
      if (selected) {
        setAddress({ ...selected, notes: deliveryNotes });
        router.push('/checkout/summary'); // Route to Order Summary
      }
    }
  };

  const AddressCard = ({ addr }) => {
    const isSelected = selectedAddressId === addr.id && !isAddingNew;
    return (
      <div 
        onClick={() => {
          setSelectedAddressId(addr.id);
          setIsAddingNew(false);
        }}
        className={`w-full rounded-2xl p-5 flex items-start gap-4 mb-3 cursor-pointer border transition-all ${
          isSelected 
            ? 'bg-[#141414] border-white shadow-md' 
            : 'bg-[#0A0A0A] border-[#222] hover:bg-[#1A1A1E]'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white text-black' : 'bg-[#222] text-[#888]'}`}>
          {addr.type === 'work' ? <Briefcase size={20} /> : <Home size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-[15px] font-bold text-white">{addr.label}</h4>
             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white' : 'border-[#333]'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
             </div>
          </div>
          <p className="text-[13px] text-[#888] leading-relaxed pr-6">{addr.line1}, {addr.line2}</p>
        </div>
      </div>
    );
  };

  return (
    <AppShell className="address-page-shell">
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile lg:hidden min-h-[100svh] relative overflow-hidden bg-[#222222]">
        
        {/* Mobile Top Bar */}
        <div className="top-bar flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-[#222222]">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 flex justify-center">
            <img
              src="/gadget-restore-logo.svg"
              alt="Gadget Restore"
              className="h-6 object-contain"
            />
          </div>

          <button
            className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-[72px] pb-[180px] bg-[#0A0A0A] min-h-[100svh] mt-[-20px] rounded-t-[30px]">
          <div className="px-5 pt-6 pb-4">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-tight mb-1">
              Select Address
            </h1>
            <p className="text-[#888888] text-sm">
              Choose a convenient address for your repair.
            </p>
          </div>

          {/* Map Preview */}
          <div className="px-5 mb-8">
             <div className="w-full h-[180px] bg-black rounded-3xl overflow-hidden relative shadow-lg">
                <img src="/images/dark-map-placeholder.png" alt="Map" className="w-full h-full object-cover opacity-60" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#222'; }} />
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                   <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
                      <MapPin size={16} color="black" />
                      <span className="text-xs font-bold text-black uppercase tracking-wide">PRECISION VALLEY, CA</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Addresses */}
          <div className="px-5 mb-8">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-[#E0E0E0]">Saved Addresses</h3>
               <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">{savedAddresses.length} LOCATIONS</span>
            </div>

            {savedAddresses.map(addr => (
              <AddressCard key={addr.id} addr={addr} />
            ))}

            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full h-[60px] rounded-2xl border border-dashed border-[#333] flex items-center justify-center gap-2 text-[#888] font-bold text-[13px] uppercase tracking-wide hover:bg-[#111] mt-2 transition-colors"
            >
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {isAddingNew && (
            <div className="px-5 mb-8 bg-[#111] p-5 rounded-3xl border border-[#222]">
              <h4 className="text-sm font-bold mb-4 uppercase text-white">New Address Details</h4>
              <input type="text" placeholder="Flat / House No.*" className="w-full h-12 bg-[#1A1A1E] border border-[#333] rounded-xl px-4 mb-3 text-sm text-white focus:border-[#555] outline-none" value={newAddress.flat} onChange={e=>setNewAddress({...newAddress, flat: e.target.value})} />
              <input type="text" placeholder="Street / Area*" className="w-full h-12 bg-[#1A1A1E] border border-[#333] rounded-xl px-4 mb-3 text-sm text-white focus:border-[#555] outline-none" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})} />
              <div className="flex gap-3 mb-3">
                 <input type="text" placeholder="City*" className="w-1/2 h-12 bg-[#1A1A1E] border border-[#333] rounded-xl px-4 text-sm text-white focus:border-[#555] outline-none" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})} />
                 <input type="text" placeholder="State*" className="w-1/2 h-12 bg-[#1A1A1E] border border-[#333] rounded-xl px-4 text-sm text-white focus:border-[#555] outline-none" value={newAddress.state} onChange={e=>setNewAddress({...newAddress, state: e.target.value})} />
              </div>
              <input type="text" placeholder="Pincode*" className="w-1/2 h-12 bg-[#1A1A1E] border border-[#333] rounded-xl px-4 text-sm text-white focus:border-[#555] outline-none" value={newAddress.pincode} onChange={e=>setNewAddress({...newAddress, pincode: e.target.value})} />
            </div>
          )}

          {/* Confirm Button Fixed Bottom */}
          <div className="fixed bottom-[70px] left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-40 pointer-events-none">
            <button
              onClick={handleConfirm}
              className="w-full h-[60px] bg-white text-black rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform pointer-events-auto"
            >
              Confirm Address <ArrowLeft className="rotate-180" size={16} />
            </button>
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]">
           <BottomNav />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop hidden lg:block bg-[#050505] min-h-[calc(100vh-var(--topbar-height))]">
         <div className="flex h-[calc(100vh-var(--topbar-height))]">
            {/* Left side - MAP */}
            <div className="w-[55%] relative bg-[#0D0D0F]">
               {/* Grayscale map background simulating the dark map design */}
               <img src="/images/dark-map-placeholder.png" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen filter grayscale" />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative">
                    <div className="w-12 h-14 bg-[#6c7bff] rounded-xl rounded-bl-none flex items-center justify-center shadow-2xl relative z-10 transform -translate-y-1/2">
                       <MapPin size={24} color="white" />
                    </div>
                    <div className="absolute top-8 left-6 bg-[#1A1A1E] px-4 py-2 rounded-lg shadow-xl whitespace-nowrap border border-[#333]">
                       <span className="text-xs font-black uppercase text-white">82nd Ave, Manhattan</span>
                    </div>
                 </div>
               </div>
               
               {/* Zoom Controls */}
               <div className="absolute bottom-10 left-10 flex flex-col bg-[#1A1A1E] rounded-lg shadow-xl overflow-hidden z-20 border border-[#333]">
                 <button className="w-12 h-12 flex items-center justify-center text-white hover:bg-[#2A2A2E] border-b border-[#333] transition-colors cursor-pointer">
                   <Plus size={20} strokeWidth={2.5} />
                 </button>
                 <button className="w-12 h-12 flex items-center justify-center text-white hover:bg-[#2A2A2E] transition-colors cursor-pointer">
                   <Minus size={20} strokeWidth={2.5} />
                 </button>
               </div>
            </div>

            {/* Right side - FORM */}
            <div className="w-[45%] bg-[#0A0A0A] p-12 overflow-y-auto border-l border-[#222]">
               <h1 className="text-[42px] font-black text-white tracking-tight leading-none mb-3">
                 Select Service Address
               </h1>
               <p className="text-[15px] text-[#888] mb-12 max-w-[85%]">
                 Choose a saved location or set a new one for your technical service appointment.
               </p>

               <div className="mb-10">
                  <h3 className="text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4">
                    SAVED ADDRESSES
                  </h3>
                  
                  {savedAddresses.map(addr => (
                    <AddressCard key={addr.id} addr={addr} />
                  ))}

                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="w-full h-16 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center gap-3 text-[#888] font-bold text-[14px] hover:bg-[#111] transition-colors mt-2"
                  >
                    <Plus size={18} /> Add New Address
                  </button>
               </div>

               {isAddingNew && (
                  <div className="mb-10 bg-[#111] p-6 rounded-2xl border border-[#222] shadow-sm">
                     <h4 className="text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4">ENTER NEW ADDRESS</h4>
                     <input type="text" placeholder="Flat / House No.*" className="w-full h-14 bg-[#1A1A1E] border border-transparent rounded-xl px-5 mb-3 text-[14px] text-white focus:bg-[#222] focus:border-[#444] outline-none transition-all" value={newAddress.flat} onChange={e=>setNewAddress({...newAddress, flat: e.target.value})} />
                     <input type="text" placeholder="Street / Area*" className="w-full h-14 bg-[#1A1A1E] border border-transparent rounded-xl px-5 mb-3 text-[14px] text-white focus:bg-[#222] focus:border-[#444] outline-none transition-all" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})} />
                     <div className="flex gap-3 mb-3">
                        <input type="text" placeholder="City*" className="w-1/2 h-14 bg-[#1A1A1E] border border-transparent rounded-xl px-5 text-[14px] text-white focus:bg-[#222] focus:border-[#444] outline-none transition-all" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})} />
                        <input type="text" placeholder="State*" className="w-1/2 h-14 bg-[#1A1A1E] border border-transparent rounded-xl px-5 text-[14px] text-white focus:bg-[#222] focus:border-[#444] outline-none transition-all" value={newAddress.state} onChange={e=>setNewAddress({...newAddress, state: e.target.value})} />
                     </div>
                     <input type="text" placeholder="Pincode*" className="w-1/2 h-14 bg-[#1A1A1E] border border-transparent rounded-xl px-5 text-[14px] text-white focus:bg-[#222] focus:border-[#444] outline-none transition-all" value={newAddress.pincode} onChange={e=>setNewAddress({...newAddress, pincode: e.target.value})} />
                  </div>
               )}

               <div className="mb-10">
                  <h3 className="text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4">
                    DELIVERY NOTES (OPTIONAL)
                  </h3>
                  <textarea 
                     value={deliveryNotes}
                     onChange={(e) => setDeliveryNotes(e.target.value)}
                     placeholder="Access codes, gate instructions..."
                     className="w-full h-24 bg-[#111] border border-[#222] rounded-2xl p-5 text-[14px] text-white resize-none focus:bg-[#1A1A1E] focus:border-[#444] outline-none transition-all"
                  />
               </div>

               <button
                  onClick={handleConfirm}
                  className="w-full h-[64px] bg-white hover:bg-gray-200 text-black rounded-[20px] text-[15px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl transition-colors"
               >
                  CONFIRM ADDRESS <ArrowLeft className="rotate-180" size={18} />
               </button>
            </div>
         </div>
      </div>
    </AppShell>
  );
}
