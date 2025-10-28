import React from 'react';

const TabButton = ({ label, isActive, onClick }) => {
    return (
        <button
            className={`pb-2 px-4 text-center font-semibold transition duration-200 
                ${isActive 
                    ? 'border-b-2 border-blue-500 text-blue-500' 
                    : 'text-subtle-text hover:text-white'
                }`
            }
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export default TabButton;