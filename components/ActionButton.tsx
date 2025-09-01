
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const baseStyles = 'font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400',
  };

  const sizeStyles = {
    md: 'py-2.5 px-6 text-base',
    sm: 'py-1.5 px-4 text-sm'
  };

  const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.className || ''}`;

  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
};
