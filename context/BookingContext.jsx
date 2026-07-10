'use client';

import { createContext, useContext, useReducer, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// ── State shape ─────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  category:    null,  // { _id, name } — selected from homepage quick service grid
  brand:       null,  
  model:       null,  
  symptoms:    [],    // [{ id, name, repairType }]
  partTier:    null, 
  serviceMode: 'lab', // always 'lab' in Phase 1
  remarks:     '',
  pricing:     null,  
  address:     null,  
  slot:        null,  
};

const STORAGE_KEY = 'gr_booking_state';

// ── Reducer ─────────────────────────────────────────────────────────────────
function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORY':
      // Changing category resets brand & everything downstream
      return { ...INITIAL_STATE, category: action.payload };
    case 'SET_BRAND':
      // Changing brand resets model & everything downstream, keeps category
      return { ...INITIAL_STATE, category: state.category, brand: action.payload };
    case 'SET_BOOKING_START':
      // Atomically initialises brand + category in one dispatch (used by products page)
      // Avoids the race where SET_CATEGORY wipes a brand set by a prior SET_BRAND dispatch.
      return { ...INITIAL_STATE, brand: action.payload.brand, category: action.payload.category };
    case 'SET_MODEL':
      return { ...state, model: action.payload, symptoms: [], partTier: null, pricing: null };
    case 'SET_SYMPTOMS':
      return { ...state, symptoms: action.payload, partTier: null, pricing: null };
    case 'SET_PART_TIER':
      return { ...state, partTier: action.payload, pricing: null };
    case 'SET_SERVICE_MODE':
      return { ...state, serviceMode: action.payload };
    case 'SET_REMARKS':
      return { ...state, remarks: action.payload };
    case 'SET_PRICING':
      return { ...state, pricing: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_SLOT':
      return { ...state, slot: action.payload };
    case 'RESTORE':
      return { ...INITIAL_STATE, ...action.payload };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const BookingContext = createContext(null);

BookingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, INITIAL_STATE);
  const [isRestored, setIsRestored] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'RESTORE', payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to restore booking state from localStorage', error);
    }
    setIsRestored(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save booking state to localStorage', error);
    }
  }, [state]);

  const actions = useMemo(() => ({
    setCategory:    (category)    => dispatch({ type: 'SET_CATEGORY',    payload: category }),
    setBrand:       (brand)       => dispatch({ type: 'SET_BRAND',       payload: brand }),
    setModel:       (model)       => dispatch({ type: 'SET_MODEL',       payload: model }),
    setSymptoms:    (symptoms)    => dispatch({ type: 'SET_SYMPTOMS',    payload: symptoms }),
    setPartTier:    (tier)        => dispatch({ type: 'SET_PART_TIER',   payload: tier }),
    setServiceMode: (mode)        => dispatch({ type: 'SET_SERVICE_MODE',payload: mode }),
    setRemarks:     (remarks)     => dispatch({ type: 'SET_REMARKS',     payload: remarks }),
    setPricing:     (pricing)     => dispatch({ type: 'SET_PRICING',     payload: pricing }),
    setAddress:     (address)     => dispatch({ type: 'SET_ADDRESS',     payload: address }),
    setSlot:        (slot)        => dispatch({ type: 'SET_SLOT',        payload: slot }),
    reset:          ()            => dispatch({ type: 'RESET' }),
    // Atomically set brand + category (safe for products-page → select-model flow)
    startBooking:   ({ brand, category }) => dispatch({ type: 'SET_BOOKING_START', payload: { brand, category } }),
  }), [dispatch]);

  const contextValue = useMemo(() => {
    // Computed: can customer proceed to login?
    const canProceedToBook =
      state.brand &&
      state.model &&
      state.symptoms.length > 0 &&
      state.partTier &&
      state.serviceMode;

    return {
      ...state,
      ...actions,
      canProceedToBook,
      isRestored
    };
  }, [state, actions, isRestored]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}
