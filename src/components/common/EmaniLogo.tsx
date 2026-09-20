// Emani Art Craft - Brand Header & Identity Component
// Clean typography without graphic logo mark

import React from 'react';

interface EmaniLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
  showDetails?: boolean;
  variant?: 'gold' | 'charcoal' | 'white';
}

export const EmaniLogo: React.FC<EmaniLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'gold',
}) => {
  if (!showText) return null;

  const sizeMap = {
    sm: { title: 'text-sm font-bold', sub: 'text-[10px]' },
    md: { title: 'text-base font-bold', sub: 'text-[11px]' },
    lg: { title: 'text-xl font-bold', sub: 'text-xs' },
    xl: { title: 'text-2xl font-bold', sub: 'text-sm' },
    full: { title: 'text-3xl font-extrabold', sub: 'text-base' },
  };

  const { title, sub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col leading-tight select-none ${className}`}>
      <span
        className={`tracking-wide font-['Cairo',_sans-serif] ${
          variant === 'white' ? 'text-white' : 'text-[#252525]'
        } ${title}`}
      >
        إيماني آرت كرافت
      </span>
      <span
        className={`font-semibold tracking-wider font-['Outfit',_sans-serif] text-[#B8862B] ${sub}`}
      >
        Emani Art Craft
      </span>
    </div>
  );
};
