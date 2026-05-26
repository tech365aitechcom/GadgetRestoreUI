'use client';

import { useState, useEffect } from 'react';
import MobileHeader from '@/components/layout/MobileHeader';
import StepIndicator from '@/components/layout/StepIndicator';
import { useAuth } from '@/context/AuthContext';
import notificationService from '@/services/notification.service';

export default function PublicLayout({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res?.data?.count ?? res?.count ?? 0);
      } catch (err) {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      {/* Mobile header and step indicator - only visible on mobile */}
      <div className="home-mobile" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <MobileHeader unreadCount={unreadCount} />
        <StepIndicator />
      </div>

      {children}
    </>
  );
}
