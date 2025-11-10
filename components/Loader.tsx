import React from 'react';

const Loader: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-200/50 rounded-lg">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 font-medium">{text}</p>
        </div>
    );
};

export default Loader;