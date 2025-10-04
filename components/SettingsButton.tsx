import React from 'react';

interface SettingsButtonProps {
    onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-cyan-400/20 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all duration-200 transform active:scale-90"
            aria-label="Open settings"
        >
            <span className="text-2xl">⚙️</span>
        </button>
    );
};

export default SettingsButton;