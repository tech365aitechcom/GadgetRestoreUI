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
        className={`w-full rounded-2xl p-5 flex items-start gap-4 mb-3 cursor-pointer border-2 transition-all ${
          isSelected 
            ? 'bg-white border-black shadow-md' 
            : 'bg-[#F9F9F9] border-transparent hover:bg-gray-100'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
          {addr.type === 'work' ? <Briefcase size={20} /> : <Home size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
             <h4 className="text-[15px] font-bold text-[#111]">{addr.label}</h4>
             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-black' : 'border-gray-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
             </div>
          </div>
          <p className="text-[13px] text-[#666] leading-relaxed pr-6">{addr.line1}, {addr.line2}</p>
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
        <div className="relative z-10 pt-[72px] pb-[100px] bg-[#EBEBEB] min-h-[100svh] mt-[-20px] rounded-t-[30px]">
          <div className="px-5 pt-6 pb-4">
            <h1 className="text-2xl font-black text-black tracking-tight uppercase leading-tight mb-1">
              Select Address
            </h1>
            <p className="text-[#666666] text-sm">
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
               <h3 className="text-sm font-bold text-[#1A1A1E]">Saved Addresses</h3>
               <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">{savedAddresses.length} LOCATIONS</span>
            </div>

            {savedAddresses.map(addr => (
              <AddressCard key={addr.id} addr={addr} />
            ))}

            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full h-[60px] rounded-2xl border-2 border-dashed border-[#CCC] flex items-center justify-center gap-2 text-[#666] font-bold text-[13px] uppercase tracking-wide hover:bg-black/5 mt-2 transition-colors"
            >
              <Plus size={18} /> Add New Address
            </button>
          </div>

          {isAddingNew && (
            <div className="px-5 mb-8 bg-white p-5 rounded-3xl border border-[#E0E0E0]">
              <h4 className="text-sm font-bold mb-4 uppercase">New Address Details</h4>
              <input type="text" placeholder="Flat / House No.*" className="w-full h-12 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 mb-3 text-sm focus:border-black outline-none" value={newAddress.flat} onChange={e=>setNewAddress({...newAddress, flat: e.target.value})} />
              <input type="text" placeholder="Street / Area*" className="w-full h-12 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 mb-3 text-sm focus:border-black outline-none" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})} />
              <div className="flex gap-3 mb-3">
                 <input type="text" placeholder="City*" className="w-1/2 h-12 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 text-sm focus:border-black outline-none" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})} />
                 <input type="text" placeholder="State*" className="w-1/2 h-12 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 text-sm focus:border-black outline-none" value={newAddress.state} onChange={e=>setNewAddress({...newAddress, state: e.target.value})} />
              </div>
              <input type="text" placeholder="Pincode*" className="w-1/2 h-12 bg-[#F5F5F5] border border-[#E0E0E0] rounded-xl px-4 text-sm focus:border-black outline-none" value={newAddress.pincode} onChange={e=>setNewAddress({...newAddress, pincode: e.target.value})} />
            </div>
          )}

          {/* Confirm Button Fixed Bottom */}
          <div className="fixed bottom-[70px] left-0 right-0 p-5 bg-gradient-to-t from-[#EBEBEB] via-[#EBEBEB] to-transparent z-40">
            <button
              onClick={handleConfirm}
              className="w-full h-[60px] bg-[#2C2C2E] text-white rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
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
      <div className="home-desktop hidden lg:block bg-white min-h-[calc(100vh-var(--topbar-height))]">
         <div className="flex h-[calc(100vh-var(--topbar-height))]">
            {/* Left side - MAP */}
            <div className="w-[55%] relative bg-[#333]">
               {/* Grayscale map background simulating the dark map design */}
               <img src="/images/dark-map-placeholder.png" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen filter grayscale" />
               
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative">
                    <div className="w-12 h-14 bg-black rounded-xl rounded-bl-none flex items-center justify-center shadow-2xl relative z-10 transform -translate-y-1/2">
                       <MapPin size={24} color="white" />
                    </div>
                    <div className="absolute top-8 left-6 bg-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                       <span className="text-xs font-black uppercase text-black">82nd Ave, Manhattan</span>
                    </div>
                 </div>
               </div>
               
               {/* Zoom Controls */}
               <div className="absolute bottom-10 left-10 flex flex-col bg-white rounded-lg shadow-xl overflow-hidden z-20">
                 <button className="w-12 h-12 flex items-center justify-center text-black hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer">
                   <Plus size={20} strokeWidth={2.5} />
                 </button>
                 <button className="w-12 h-12 flex items-center justify-center text-black hover:bg-gray-50 transition-colors cursor-pointer">
                   <Minus size={20} strokeWidth={2.5} />
                 </button>
               </div>
            </div>

            {/* Right side - FORM */}
            <div className="w-[45%] bg-[#FAFDFE] p-12 overflow-y-auto border-l border-gray-100">
               <h1 className="text-[42px] font-black text-black tracking-tight leading-none mb-3">
                 Select Service Address
               </h1>
               <p className="text-[15px] text-[#666] mb-12 max-w-[85%]">
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
                    className="w-full h-16 rounded-xl border-2 border-dashed border-[#E0E0E0] flex items-center justify-center gap-3 text-[#666] font-bold text-[14px] hover:bg-gray-50 transition-colors mt-2"
                  >
                    <Plus size={18} /> Add New Address
                  </button>
               </div>

               {isAddingNew && (
                  <div className="mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h4 className="text-[11px] font-bold text-[#888] uppercase tracking-[0.1em] mb-4">ENTER NEW ADDRESS</h4>
                     <input type="text" placeholder="Flat / House No.*" className="w-full h-14 bg-[#F8F8F8] border border-transparent rounded-xl px-5 mb-3 text-[14px] focus:bg-white focus:border-black outline-none transition-all" value={newAddress.flat} onChange={e=>setNewAddress({...newAddress, flat: e.target.value})} />
                     <input type="text" placeholder="Street / Area*" className="w-full h-14 bg-[#F8F8F8] border border-transparent rounded-xl px-5 mb-3 text-[14px] focus:bg-white focus:border-black outline-none transition-all" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})} />
                     <div className="flex gap-3 mb-3">
                        <input type="text" placeholder="City*" className="w-1/2 h-14 bg-[#F8F8F8] border border-transparent rounded-xl px-5 text-[14px] focus:bg-white focus:border-black outline-none transition-all" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})} />
                        <input type="text" placeholder="State*" className="w-1/2 h-14 bg-[#F8F8F8] border border-transparent rounded-xl px-5 text-[14px] focus:bg-white focus:border-black outline-none transition-all" value={newAddress.state} onChange={e=>setNewAddress({...newAddress, state: e.target.value})} />
                     </div>
                     <input type="text" placeholder="Pincode*" className="w-1/2 h-14 bg-[#F8F8F8] border border-transparent rounded-xl px-5 text-[14px] focus:bg-white focus:border-black outline-none transition-all" value={newAddress.pincode} onChange={e=>setNewAddress({...newAddress, pincode: e.target.value})} />
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
                     className="w-full h-24 bg-[#F5F5F5] border border-transparent rounded-2xl p-5 text-[14px] resize-none focus:bg-white focus:border-black outline-none transition-all"
                  />
               </div>

               <button
                  onClick={handleConfirm}
                  className="w-full h-[64px] bg-black hover:bg-[#1A1A1A] text-white rounded-[20px] text-[15px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl transition-colors"
               >
                  CONFIRM ADDRESS <ArrowLeft className="rotate-180" size={18} />
               </button>
            </div>
         </div>
      </div>
    </AppShell>
  );
}
