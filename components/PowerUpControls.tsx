import React from 'react';
import { PowerUpType } from '../types';

interface PowerUpControlsProps {
    counts: {
        boom: number;
        reshuffle: number;
        singleClear: number;
    };
    activePowerUp: PowerUpType | null;
    onActivate: (type: PowerUpType) => void;
    onReshuffle: () => void;
}

const PowerUpButton: React.FC<{
    label: string;
    icon: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, count, isActive, onClick }) => {
    const hasPowerUp = count > 0;
    return (
        <button
            onClick={onClick}
            disabled={!hasPowerUp}
            className={`hologram-panel w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3
                ${!hasPowerUp ? 'opacity-40 cursor-not-allowed' : 'hover:bg-cyan-400/20 active:scale-95'}
                ${isActive ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/30 bg-cyan-400/20' : ''}
            `}
        >
            <span className="text-3xl">{icon}</span>
            <div className="flex-grow">
                <p className="font-bold text-white">{label}</p>
                <p className="text-sm text-slate-300">x {count}</p>
            </div>
        </button>
    );
};


const PowerUpControls: React.FC<PowerUpControlsProps> = ({ counts, activePowerUp, onActivate, onReshuffle }) => {
    return (
        <div className="hologram-panel flex lg:flex-col justify-center items-center gap-3 p-3 rounded-xl shadow-lg mt-4 lg:mt-0">
            <PowerUpButton
                label="Boom"
                icon="💣"
                count={counts.boom}
                isActive={activePowerUp === 'boom'}
                onClick={() => onActivate('boom')}
            />
            <PowerUpButton
                label="Single Clear"
                icon="✨"
                count={counts.singleClear}
                isActive={activePowerUp === 'singleClear'}
                onClick={() => onActivate('singleClear')}
            />
            <PowerUpButton
                label="Reshuffle"
                icon="🔄"
                count={counts.reshuffle}
                isActive={false} // Reshuffle is an instant action
                onClick={onReshuffle}
            />
        </div>
    );
};

export default PowerUpControls;