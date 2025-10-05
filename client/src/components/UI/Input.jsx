import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-youtube-red transition-colors duration-200',
    'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
    error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          error
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 