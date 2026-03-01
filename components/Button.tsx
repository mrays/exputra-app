import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:from-blue-700 hover:to-blue-800 active:scale-95',
      secondary:
        'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 border border-gray-300 hover:from-gray-200 hover:to-gray-300 active:scale-95',
      danger:
        'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:from-red-700 hover:to-red-800 active:scale-95',
      success:
        'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:from-green-700 hover:to-green-800 active:scale-95',
      ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className || ''}`}
        {...props}
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!isLoading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
