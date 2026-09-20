// Emani Art Craft - Official Brand Identity & Logo Component

import React from 'react';

interface EmaniLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
  showEmblemOnly?: boolean;
  layout?: 'horizontal' | 'vertical';
  variant?: 'gold' | 'charcoal' | 'white';
}

export const EmaniLogo: React.FC<EmaniLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showEmblemOnly = false,
  layout = 'horizontal',
  variant = 'gold',
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-7 h-7',
      title: 'text-xs sm:text-sm font-bold',
      sub: 'text-[9px] sm:text-[10px]',
      gap: 'gap-2',
    },
    md: {
      emblem: 'w-9 h-9 sm:w-10 sm:h-10',
      title: 'text-sm sm:text-base font-bold',
      sub: 'text-[10px] sm:text-[11px]',
      gap: 'gap-2.5',
    },
    lg: {
      emblem: 'w-14 h-14',
      title: 'text-lg sm:text-xl font-bold',
      sub: 'text-xs',
      gap: 'gap-3',
    },
    xl: {
      emblem: 'w-20 h-20',
      title: 'text-2xl font-bold',
      sub: 'text-sm',
      gap: 'gap-3.5',
    },
    full: {
      emblem: 'w-28 h-28',
      title: 'text-3xl font-extrabold',
      sub: 'text-base',
      gap: 'gap-4',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (showEmblemOnly) {
    return (
      <img
        src="/emani-logo.svg"
        alt="Emani Art Craft"
        className={`${currentSize.emblem} object-contain select-none shrink-0 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${currentSize.gap} ${className}`}>
        <img
          src="/emani-logo.svg"
          alt="Emani Art Craft"
          className={`${currentSize.emblem} object-contain shrink-0 drop-shadow-xs`}
          referrerPolicy="no-referrer"
        />
        {showText && (
          <div className="flex flex-col leading-tight">
            <span
              className={`tracking-wide font-['Cairo',_sans-serif] ${
                variant === 'white' ? 'text-white' : 'text-[#252525]'
              } ${currentSize.title}`}
            >
              إيماني آرت كرافت
            </span>
            <span
              className={`font-semibold tracking-wider font-['Outfit',_sans-serif] text-[#B8862B] ${currentSize.sub}`}
            >
              Emani Art Craft
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center select-none ${currentSize.gap} ${className}`}>
      {/* Official Gold Calligraphy Logo Mark */}
      <img
        src="/emani-logo.svg"
        alt="Emani Art Craft"
        className={`${currentSize.emblem} object-contain shrink-0 drop-shadow-xs`}
        referrerPolicy="no-referrer"
      />

      {showText && (
        <div className="flex flex-col leading-tight text-start">
          <span
            className={`tracking-wide font-['Cairo',_sans-serif] ${
              variant === 'white' ? 'text-white' : 'text-[#252525]'
            } ${currentSize.title}`}
          >
            إيماني آرت كرافت
          </span>
          <span
            className={`font-semibold tracking-wider font-['Outfit',_sans-serif] text-[#B8862B] ${currentSize.sub}`}
          >
            Emani Art Craft
          </span>
        </div>
      )}
    </div>
  );
};
