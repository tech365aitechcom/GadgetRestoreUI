'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronRight, Edit2, Smartphone, Calendar, MapPin, Truck, Shield, AlertCircle } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import BottomNav from '@/components/ui/BottomNav';
import { useBooking } from '@/context/BookingContext';
import catalogueService from '@/services/catalogue.service';

function collectRepairTypeIds(symptoms) {
  const ids = new Set();
  (symptoms || []).forEach((s) => {
    (s.repairTypes || []).forEach((rt) => {
      const id = typeof rt === 'object' ? rt._id : rt;
      if (id) ids.add(id);
    });
  });
  return [...ids];
}

const SummarySection = ({ title, onEdit, children }) => (
  <div className="bg-[#141414] rounded-[24px] border border-[#222] p-5 mb-4 relative overflow-hidden group">
    <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
      <h3 className="text-xs font-black text-[#888] uppercase tracking-[0.1em]">{title}</h3>
      {onEdit && (
        <button 
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors"
        >
          <Edit2 size={12} /> Edit
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
);

export default function OrderSummaryPage() {
  const router = useRouter();
  const {
    brand, model, symptoms, partTier, serviceMode, remarks, setRemarks, address, slot
  } = useBooking();

  const [pricingResults, setPricingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local edit state for remarks
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [localRemarks, setLocalRemarks] = useState(remarks || '');

  /* Guard */
  useEffect(() => {
    if (!brand || !model || !symptoms?.length || !partTier || !address || !slot) {
      router.replace('/home');
    }
  }, [brand, model, symptoms, partTier, address, slot, router]);

  /* Fetch pricing breakdown */
  useEffect(() => {
    if (!brand || !model || !symptoms?.length || !partTier) return;
    
    const repairTypeIds = collectRepairTypeIds(symptoms);
    if (!repairTypeIds.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    catalogueService.checkPricingAvailability({
      brandId: brand._id,
      modelId: model._id,
      repairTypeIds,
      partTier: partTier.tier
    })
    .then((result) => setPricingResults(result))
    .catch((err) => {
      console.error(err);
      setError('Failed to load pricing for summary.');
    })
    .finally(() => setIsLoading(false));
  }, [brand, model, symptoms, partTier]);

  if (!brand || !model || !symptoms?.length || !partTier || !address || !slot) return null;

  // Compute Itemized Pricing per Symptom
  const hasPricingData = pricingResults && pricingResults.results && pricingResults.results.length > 0;
  let grandTotal = 0;
  let hasVariableSymptom = false;

  const itemizedSymptoms = symptoms.map(symp => {
    let sympParts = 0;
    let sympLabour = 0;
    let sympIsVariable = false;

    if (hasPricingData) {
      const rTypes = symp.repairTypes || [];
      rTypes.forEach(rtId => {
        const id = typeof rtId === 'object' ? rtId._id : rtId;
        const res = pricingResults.results.find(r => r.repairTypeId === id);
        if (!res || !res.available || !res.pricing) {
          sympIsVariable = true;
        } else {
          sympParts += (res.pricing.partsCost || 0);
          sympLabour += (res.pricing.labourCost || 0);
        }
      });
    } else {
      sympIsVariable = true;
    }

    if (sympParts + sympLabour === 0) sympIsVariable = true;
    if (sympIsVariable) hasVariableSymptom = true;
    else grandTotal += (sympParts + sympLabour);

    return {
      ...symp,
      isVariable: sympIsVariable,
      partsCost: sympParts,
      labourCost: sympLabour,
      total: sympParts + sympLabour
    };
  });

  const handleSaveRemarks = () => {
    setRemarks(localRemarks);
    setIsEditingRemarks(false);
  };

  const handlePlaceOrder = async () => {
    // Phase 1 implementation proceeds to 4.2 logic / backend creation later
    router.push('/checkout/customer-details'); // Mock route for 4.2
  };

  return (
    <AppShell>
      {/* ════════════════════════════════════════════════════════════════
          MOBILE VIEW (<1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-mobile lg:hidden min-h-[100svh] relative bg-[#0A0A0A] text-white pb-[160px]">
        {/* Mobile Top Bar */}
        <div className="top-bar flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-[#1A1A1A] border border-[#333]">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 flex justify-center">
            <img src="/gadget-restore-logo.svg" alt="Gadget Restore" className="h-6 object-contain filter brightness-0 invert" />
          </div>
          <button className="w-9 h-9 rounded-full text-white flex items-center justify-center bg-[#1A1A1A] border border-[#333]">
            <Bell size={16} />
          </button>
        </div>

        <div className="relative z-10 pt-[72px] px-4">
          <h1 className="text-[28px] font-black text-white tracking-tight uppercase leading-tight mb-6">
            Order Summary
          </h1>

          <div className="flex flex-col gap-4">
            
            <SummarySection title="Device & Symptoms" onEdit={() => router.push('/select-symptoms')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-16 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
                  <Smartphone size={28} color="var(--color-accent)" strokeWidth={1} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">{brand.name} {model.name}</h2>
                  <div className="text-xs font-bold text-[#888]">{symptoms.length} selected issues</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((s, i) => (
                  <span key={i} className="text-[11px] font-bold text-white bg-[#222] px-3 py-1.5 rounded-full">{s.name}</span>
                ))}
              </div>
            </SummarySection>

            <SummarySection title="Repair Mode & Quality" onEdit={() => router.push('/select-tier')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-[#666] uppercase tracking-wider mb-1">Service</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5"><Truck size={14}/> {serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#666] uppercase tracking-wider mb-1">Part Tier</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5"><Shield size={14}/> {partTier.tier} Quality</div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Schedule" onEdit={() => router.push('/schedule')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center">
                  <Calendar size={18} color="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div className="text-xs font-bold text-accent">{slot.timeSlot}</div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Address" onEdit={() => router.push('/address')}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} color="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-0.5">{address.label}</div>
                  <div className="text-[13px] text-[#888] leading-tight">{address.line1}, {address.line2}</div>
                </div>
              </div>
            </SummarySection>

            <SummarySection title="Remarks" onEdit={() => setIsEditingRemarks(true)}>
              {isEditingRemarks ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    value={localRemarks} 
                    onChange={e => setLocalRemarks(e.target.value)} 
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl p-3 text-sm text-white resize-none h-24 focus:border-white outline-none"
                    placeholder="Add delivery instructions or device notes..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsEditingRemarks(false)} className="px-4 py-2 text-xs font-bold text-[#888]">Cancel</button>
                    <button onClick={handleSaveRemarks} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg">Save</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#A0A0A0]">{remarks || 'No special remarks added.'}</div>
              )}
            </SummarySection>

            {/* Pricing Summary */}
            <div className="bg-[#111] rounded-[24px] p-6 border border-[#222] mt-4 mb-10">
              <h3 className="text-[18px] font-black text-white mb-4">Total Estimate</h3>
              
              <div className="flex flex-col gap-4 border-b border-[#222] pb-6 mb-6">
                {itemizedSymptoms.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="pr-4">
                      <div className="text-sm font-bold text-white mb-1">{item.name}</div>
                      <div className="text-[10px] text-[#666] uppercase">{partTier.tier} Quality</div>
                    </div>
                    <div className="text-sm font-black text-white whitespace-nowrap">
                      {item.isVariable ? 'Ask Admin' : `₹${item.total.toLocaleString('en-IN')}`}
                    </div>
                  </div>
                ))}
              </div>

              {hasVariableSymptom && (
                <div className="flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-4 rounded-xl mb-6">
                   <AlertCircle size={16} color="var(--color-warning)" className="mt-0.5" />
                   <div className="text-xs text-[#E0E0E0] leading-snug">
                     <span className="text-warning font-bold block mb-1">Post-diagnosis estimate required</span>
                     Final cost confirmed after diagnosis for some items.
                   </div>
                </div>
              )}

              <div className="flex justify-between items-end">
                <span className="text-[15px] font-bold text-[#888]">Grand Total</span>
                <span className="text-[28px] font-black text-white leading-none tracking-tight">
                  {hasVariableSymptom && grandTotal === 0 ? 'Ask Admin' : (
                    <>
                      {hasVariableSymptom && <span className="block text-[10px] font-bold text-[#888] mb-1 text-right">Starting from</span>}
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </>
                  )}
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="fixed bottom-[70px] left-0 right-0 p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-40">
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting || isLoading}
            className="w-full h-[60px] bg-white text-black rounded-[20px] text-[15px] font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'Calculating...' : isSubmitting ? 'Processing...' : 'Proceed to Details'} <ChevronRight size={18} />
          </button>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]">
           <BottomNav />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP VIEW (≥1024px)
          ════════════════════════════════════════════════════════════════ */}
      <div className="home-desktop hidden lg:block bg-[#0A0A0A] min-h-[100svh] text-white">
        <div className="max-w-[1200px] mx-auto pt-[60px] pb-[100px] px-8">
          
          <div className="mb-10">
            <h1 className="text-[44px] font-black tracking-tight leading-none mb-3">
              Order Summary
            </h1>
            <p className="text-[16px] text-[#888]">
              Please review your repair details before confirming.
            </p>
          </div>

          <div className="flex gap-10">
            {/* Left Column - Details */}
            <div className="w-[60%] flex flex-col gap-6">
              <SummarySection title="Device & Symptoms" onEdit={() => router.push('/select-symptoms')}>
                <div className="flex items-center gap-6 mb-5">
                  <div className="w-20 h-24 bg-black rounded-[16px] flex items-center justify-center border border-[#222]">
                    <Smartphone size={36} color="var(--color-accent)" strokeWidth={1} />
                  </div>
                  <div>
                    <h2 className="text-[28px] font-extrabold text-white mb-1">{brand.name} {model.name}</h2>
                    <div className="text-sm font-bold text-[#666] uppercase tracking-wider">{symptoms.length} Issues Selected</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s, i) => (
                    <span key={i} className="text-xs font-bold text-white bg-[#222] px-4 py-2 rounded-full">{s.name}</span>
                  ))}
                </div>
              </SummarySection>

              <div className="grid grid-cols-2 gap-6">
                <SummarySection title="Schedule" onEdit={() => router.push('/schedule')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-[#222]">
                      <Calendar size={20} color="white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                      <div className="text-sm font-bold text-accent">{slot.timeSlot}</div>
                    </div>
                  </div>
                </SummarySection>

                <SummarySection title="Repair Details" onEdit={() => router.push('/select-tier')}>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#666] uppercase">Mode</span>
                      <span className="text-sm font-bold text-white">{serviceMode === 'lab' ? 'Pick & Drop' : 'Doorstep'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#666] uppercase">Part Tier</span>
                      <span className="text-sm font-bold text-white">{partTier.tier} Quality</span>
                    </div>
                  </div>
                </SummarySection>
              </div>

              <SummarySection title="Pickup & Delivery Address" onEdit={() => router.push('/address')}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 border border-[#222]">
                    <MapPin size={20} color="white" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white mb-1">{address.label}</div>
                    <div className="text-sm text-[#888] leading-relaxed">{address.line1}<br/>{address.line2}</div>
                  </div>
                </div>
              </SummarySection>

              <SummarySection title="Remarks" onEdit={() => setIsEditingRemarks(true)}>
                {isEditingRemarks ? (
                  <div className="flex flex-col gap-3">
                    <textarea 
                      value={localRemarks} 
                      onChange={e => setLocalRemarks(e.target.value)} 
                      className="w-full bg-black border border-[#333] rounded-xl p-4 text-sm text-white resize-none h-24 focus:border-white outline-none"
                      placeholder="Add delivery instructions or device notes..."
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsEditingRemarks(false)} className="px-5 py-2.5 text-xs font-bold text-[#888] hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleSaveRemarks} className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-colors">Save Remarks</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#A0A0A0] bg-black p-4 rounded-xl border border-[#222]">{remarks || 'No special remarks added. Click Edit to add instructions.'}</div>
                )}
              </SummarySection>
            </div>

            {/* Right Column - Pricing */}
            <div className="w-[40%]">
              <div className="bg-[#111] rounded-[32px] p-8 border border-[#222] sticky top-[100px] shadow-2xl">
                <h3 className="text-[24px] font-black text-white mb-8">Technical Quote</h3>
                
                <div className="flex flex-col gap-5 border-b border-[#333] pb-8 mb-8">
                  {itemizedSymptoms.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="pr-6">
                        <div className="text-base font-bold text-white mb-1">{item.name}</div>
                        <div className="text-[11px] font-bold tracking-wider text-[#666] uppercase">{partTier.tier} Quality</div>
                      </div>
                      <div className="text-lg font-black text-white whitespace-nowrap">
                        {item.isVariable ? 'Ask Admin' : `₹${item.total.toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  ))}
                </div>

                {hasVariableSymptom && (
                  <div className="flex items-start gap-3 bg-[rgba(245,158,11,0.1)] p-5 rounded-2xl mb-8 border border-[rgba(245,158,11,0.2)]">
                     <AlertCircle size={20} color="var(--color-warning)" className="flex-shrink-0" />
                     <div className="text-sm text-[#E0E0E0] leading-snug">
                       <strong className="text-warning font-bold block mb-1">Post-diagnosis estimate required</strong>
                       Final cost will be confirmed after physical inspection of the device.
                     </div>
                  </div>
                )}

                <div className="flex justify-between items-end mb-10">
                  <span className="text-sm font-bold text-[#888] uppercase tracking-wider">Grand Total</span>
                  <span className="text-[42px] font-black text-white leading-none tracking-tight">
                    {hasVariableSymptom && grandTotal === 0 ? 'Ask Admin' : (
                      <>
                        {hasVariableSymptom && <span className="block text-[12px] font-bold text-[#888] mb-2 text-right">Starting from</span>}
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </>
                    )}
                  </span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || isLoading}
                  className="w-full h-[64px] bg-white hover:bg-gray-200 text-black rounded-[20px] text-[16px] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  {isLoading ? 'Calculating...' : isSubmitting ? 'Processing...' : 'Proceed to Details'} <ChevronRight size={20} />
                </button>
                
                <p className="text-[11px] text-[#666] text-center mt-6 font-medium">
                  By proceeding, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
