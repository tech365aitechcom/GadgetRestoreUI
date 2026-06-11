'use client';

import { useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { ArrowRight } from 'lucide-react';

export default function RepairLandingClient({ brandObj, modelObj = null, step = 'select-model' }) {
  const router = useRouter();
  const { reset, setCategory, setBrand, setModel } = useBooking();

  const handleBookNow = () => {
    reset(); // Clear context state
    
    // Update context state directly
    setCategory({ _id: "65f8c8577adcd9e5c544d671", name: "Mobile" });
    setBrand(brandObj);
    if (modelObj) {
      setModel(modelObj);
    }
    
    // Redirect to the appropriate booking step
    if (step === 'select-symptoms' && modelObj) {
      router.push('/select-symptoms');
    } else {
      router.push('/select-model');
    }
  };

  return (
    <button
      onClick={handleBookNow}
      className="bg-[var(--color-accent)] text-white font-black uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-lg shadow-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
    >
      Book {modelObj ? modelObj.name : brandObj.name} Repair <ArrowRight size={16} />
    </button>
  );
}
