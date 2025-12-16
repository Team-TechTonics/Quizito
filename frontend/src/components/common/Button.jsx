import React from 'react';
import { ClockLoader } from 'react-spinners';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  ...props 
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant styles
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 focus:ring-amber-500 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    outline: 'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    light: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800'
  };
  
  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base'
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Loading spinner color based on variant
  const getSpinnerColor = () => {
    switch(variant) {
      case 'primary':
      case 'danger':
      case 'success':
      case 'warning':
      case 'dark':
        return '#ffffff';
      case 'secondary':
        return '#4f46e5';
      case 'ghost':
      case 'outline':
      case 'light':
        return '#4f46e5';
      default:
        return '#4f46e5';
    }
  };

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${widthStyles}
    ${className}
    ${loading ? 'cursor-wait' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Handle button content
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ClockLoader 
            size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            color={getSpinnerColor()}
            cssOverride={{ marginRight: '8px' }}
          />
          <span>Loading...</span>
        </>
      );
    }

    return (
      <>
        {startIcon && (
          <span className="mr-2 -ml-1">
            {React.cloneElement(startIcon, { className: 'w-4 h-4' })}
          </span>
        )}
        {children}
        {endIcon && (
          <span className="ml-2 -mr-1">
            {React.cloneElement(endIcon, { className: 'w-4 h-4' })}
          </span>
        )}
      </>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonStyles}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Export as default
export default Button;

// Also export individual button components for convenience
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;

// Button with icon components
export const IconButton = ({ icon, size = 'md', ...props }) => {
  const iconSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3'
  };
  
  return (
    <Button
      size={size}
      className={`${iconSizes[size]} !rounded-full`}
      startIcon={icon}
      {...props}
    />
  );
};

// Floating Action Button
export const FAB = ({ icon, position = 'bottom-right', ...props }) => {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };
  
  return (
    <div className={`${positions[position]} z-40`}>
      <Button
        variant="primary"
        size="lg"
        className="!rounded-full shadow-lg hover:shadow-xl"
        startIcon={icon}
        {...props}
      />
    </div>
  );
};

// Button Group component
export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`inline-flex rounded-lg shadow-sm ${className}`}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        return React.cloneElement(child, {
          className: `
            ${child.props.className || ''}
            ${!isFirst ? 'rounded-l-none -ml-px' : ''}
            ${!isLast ? 'rounded-r-none' : ''}
            focus:z-10
          `.trim()
        });
      })}
    </div>
  );
};

// Toggle Button component
export const ToggleButton = ({ 
  checked, 
  onChange, 
  onIcon, 
  offIcon, 
  onLabel, 
  offLabel,
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        ${checked 
          ? variants[variant].includes('bg-gradient') 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
            : 'bg-indigo-600'
          : 'bg-gray-200'
        }
        transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${props.className || ''}
      `}
      {...props}
    >
      <span className="sr-only">{checked ? onLabel || 'On' : offLabel || 'Off'}</span>
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
      <span className="absolute left-1 top-1">
        {offIcon && !checked && React.cloneElement(offIcon, { className: 'w-4 h-4' })}
      </span>
      <span className="absolute right-1 top-1">
        {onIcon && checked && React.cloneElement(onIcon, { className: 'w-4 h-4' })}
      </span>
    </button>
  );
};

// Example usage in comments
/*
// Basic button
<Button variant="primary" size="md">
  Click me
</Button>

// Button with icons
<Button 
  variant="secondary" 
  size="lg"
  startIcon={<PlusIcon />}
  endIcon={<ArrowRightIcon />}
>
  Create Quiz
</Button>

// Loading button
<Button variant="primary" loading={true}>
  Loading...
</Button>

// Icon button
<IconButton 
  icon={<TrashIcon />}
  variant="danger"
  size="sm"
  onClick={handleDelete}
/>

// Floating Action Button
<FAB 
  icon={<PlusIcon />}
  onClick={handleCreate}
  position="bottom-right"
/>

// Button group
<ButtonGroup>
  <Button variant="secondary">Left</Button>
  <Button variant="secondary">Middle</Button>
  <Button variant="secondary">Right</Button>
</ButtonGroup>

// Toggle button
<ToggleButton 
  checked={isActive}
  onChange={setIsActive}
  onIcon={<SunIcon />}
  offIcon={<MoonIcon />}
/>
*/