'use client';

import { MessageCircle, Phone, Mail } from 'lucide-react';

/**
 * SupportCard - Reusable component for customer support access
 * Can be used in profile page, order detail page, or any other location
 *
 * Props:
 *   variant - 'compact' | 'full' (default: 'full')
 *   theme - 'light' | 'dark' (default: 'dark')
 *   whatsappNumber - WhatsApp phone number (default: '+15550000000')
 *   phoneNumber - Support phone number (default: '+15550000000')
 *   email - Support email (default: 'support@gadgetrestore.com')
 *   title - Optional custom title
 *   description - Optional custom description
 */
export default function SupportCard({
  variant = 'full',
  theme = 'dark',
  whatsappNumber = '+15550000000',
  phoneNumber = '+15550000000',
  email = 'support@gadgetrestore.com',
  title,
  description,
  className = '',
}) {
  const handleContactSupport = (method) => {
    switch (method) {
      case 'whatsapp':
        // Remove + and spaces for WhatsApp URL
        const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanWhatsApp}`, '_blank');
        break;
      case 'phone':
        window.location.href = `tel:${phoneNumber}`;
        break;
      case 'email':
        window.location.href = `mailto:${email}`;
        break;
      default:
        break;
    }
  };

  // Theme styles
  const bgColor = theme === 'dark' ? 'bg-[#111111]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2a2a2a]' : 'border-[#E5E5EA]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const subTextColor = theme === 'dark' ? 'text-white/60' : 'text-[#6B6B6B]';
  const buttonBg = theme === 'dark' ? 'bg-white/5' : 'bg-[#F5F5F7]';
  const buttonBorder = theme === 'dark' ? 'border-white/10' : 'border-[#E5E5EA]';
  const buttonHover = theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5';
  const iconBg = theme === 'dark' ? 'bg-white/5' : 'bg-white';
  const iconColor = theme === 'dark' ? 'text-white/80' : 'text-[#6B6B6B]';

  if (variant === 'compact') {
    return (
      <div
        className={`${bgColor} ${borderColor} border rounded-xl p-4 ${className}`}
      >
        <div className={`text-[13px] font-bold ${textColor} mb-3`}>
          {title || 'Need Help?'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleContactSupport('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 ${buttonBg} ${buttonBorder} border rounded-lg ${buttonHover} active:scale-[0.98] transition-all`}
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle size={16} className={iconColor} />
            <span className={`text-[12px] font-semibold ${textColor}`}>
              Chat
            </span>
          </button>
          <button
            onClick={() => handleContactSupport('phone')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 ${buttonBg} ${buttonBorder} border rounded-lg ${buttonHover} active:scale-[0.98] transition-all`}
            aria-label="Call support"
          >
            <Phone size={16} className={iconColor} />
            <span className={`text-[12px] font-semibold ${textColor}`}>
              Call
            </span>
          </button>
          <button
            onClick={() => handleContactSupport('email')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 ${buttonBg} ${buttonBorder} border rounded-lg ${buttonHover} active:scale-[0.98] transition-all`}
            aria-label="Email support"
          >
            <Mail size={16} className={iconColor} />
            <span className={`text-[12px] font-semibold ${textColor}`}>
              Email
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-xl p-6 ${className}`}
    >
      <h3 className={`text-[16px] font-extrabold ${textColor} mb-2`}>
        {title || 'System Support'}
      </h3>
      <p className={`text-[13px] ${subTextColor} mb-5`}>
        {description ||
          'Need technical assistance with a repair or your account?'}
      </p>

      <div className="space-y-2">
        <button
          onClick={() => handleContactSupport('whatsapp')}
          className={`w-full flex items-center gap-3 p-4 ${buttonBg} ${buttonBorder} border rounded-xl ${buttonHover} active:scale-[0.99] transition-all`}
          aria-label="Contact via WhatsApp"
        >
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
          >
            <MessageCircle size={20} className={iconColor} />
          </div>
          <div className="flex-1 text-left">
            <div className={`text-[13px] font-semibold ${textColor}`}>
              Live Assistant
            </div>
            <div className={`text-[11px] ${subTextColor}`}>
              Chat on WhatsApp
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={theme === 'dark' ? 'text-white/40' : 'text-black/40'}
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() => handleContactSupport('phone')}
          className={`w-full flex items-center gap-3 p-4 ${buttonBg} ${buttonBorder} border rounded-xl ${buttonHover} active:scale-[0.99] transition-all`}
          aria-label="Call support"
        >
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
          >
            <Phone size={20} className={iconColor} />
          </div>
          <div className="flex-1 text-left">
            <div className={`text-[13px] font-semibold ${textColor}`}>
              Phone Support
            </div>
            <div className={`text-[11px] ${subTextColor}`}>
              {phoneNumber}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={theme === 'dark' ? 'text-white/40' : 'text-black/40'}
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() => handleContactSupport('email')}
          className={`w-full flex items-center gap-3 p-4 ${buttonBg} ${buttonBorder} border rounded-xl ${buttonHover} active:scale-[0.99] transition-all`}
          aria-label="Email support"
        >
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
          >
            <Mail size={20} className={iconColor} />
          </div>
          <div className="flex-1 text-left">
            <div className={`text-[13px] font-semibold ${textColor}`}>
              Email Support
            </div>
            <div className={`text-[11px] ${subTextColor}`}>
              {email}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={theme === 'dark' ? 'text-white/40' : 'text-black/40'}
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
