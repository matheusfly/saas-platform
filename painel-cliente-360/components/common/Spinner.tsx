
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6 border-b-2',
        md: 'h-12 w-12 border-b-4',
        lg: 'h-16 w-16 border-b-4',
    };
    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-success`}></div>
    );
};

export default Spinner;
