'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Copy, PackageCheck } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useBooking } from '@/context/BookingContext';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { reset } = useBooking();
  const [orderData, setOrderData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get the order ID that was just created
    try {
      const stored = sessionStorage.getItem('gr_last_order');
      if (stored) {
        setOrderData(JSON.parse(stored));
      } else {
        router.replace('/home');
      }
    } catch (e) {
      router.replace('/home');
    }

    // Reset the booking context now that order is placed
    reset();
  }, [router, reset]);

  if (!orderData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="min-h-[100svh] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <PackageCheck size={48} className="text-green-500" />
          </div>

          <h1 className="text-[42px] font-black tracking-tight leading-none mb-4">
            Order Placed!
          </h1>
          <p className="text-[#888] text-[15px] leading-relaxed mb-10 max-w-[80%] mx-auto">
            Your service request has been received. We've sent a confirmation to <span className="text-white font-bold">{orderData.email}</span> and via WhatsApp.
          </p>

          <div className="w-full bg-[#111] border border-[#222] rounded-3xl p-8 mb-10">
            <p className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-2">Order Tracking ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-[28px] font-black text-white tracking-wider">{orderData.orderId}</span>
              <button 
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl bg-[#222] hover:bg-[#333] flex items-center justify-center transition-colors text-[#888] hover:text-white"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={() => router.push('/home')}
            className="w-full h-[64px] bg-white hover:bg-gray-200 text-black rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider"
          >
            Back to Home <ChevronRight size={20} />
          </button>

        </div>
      </div>
    </AppShell>
  );
}
