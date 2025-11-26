import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-white text-black hover:bg-white/90",
        secondary: "bg-gray-500/40 text-white hover:bg-gray-500/60",
        danger: "bg-netflix-red text-white hover:bg-red-700",
        outline: "border border-gray-400 text-gray-300 hover:border-white hover:text-white"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
