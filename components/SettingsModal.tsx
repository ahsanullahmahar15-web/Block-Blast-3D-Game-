import React, { useState, useEffect } from 'react';
import { Settings, Difficulty } from '../types';

interface SettingsModalProps {
  settings: Settings;
  onSave: (newSettings: Partial<Settings>) => void;
  onClose: () => void;
}

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex justify-between items-center w-full py-3">
    <span className="text-lg text-slate-300">{label}</span>
    <label className="toggle-switch">
      <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

const DifficultyButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-md font-semibold rounded-md transition-all duration-200 flex-1 transform active:scale-95
      ${
        isActive
          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }
    `}
  >
    {label}
  </button>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    onSave(currentSettings);
    setIsClosing(true);
  };
  
  useEffect(() => {
      if (isClosing) {
          const timer = setTimeout(() => onClose(), 400);
          return () => clearTimeout(timer);
      }
  }, [isClosing, onClose]);

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setCurrentSettings(prev => ({ ...prev, difficulty }));
  };
  
  const handleSfxChange = (enabled: boolean) => {
    setCurrentSettings(prev => ({ ...prev, sfxEnabled: enabled }));
  };

  const handleMusicChange = (enabled: boolean) => {
    setCurrentSettings(prev => ({ ...prev, musicEnabled: enabled }));
  };


  return (
    <>
      <div className={`settings-backdrop ${isClosing ? 'animate-fade-out-up' : 'animate-fade-in'}`} onClick={handleClose}></div>
      <div className={`settings-modal hologram-panel p-6 rounded-xl shadow-2xl ${isClosing ? 'animate-fade-out-up' : 'animate-fade-in-down'}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-cyan-400 text-glow">Settings</h2>
            <button onClick={handleClose} className="text-3xl text-slate-400 hover:text-white transition-colors">&times;</button>
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold text-slate-200 border-b-2 border-slate-700 pb-2 mb-2">Audio</h3>
                <ToggleSwitch label="Sound Effects" enabled={currentSettings.sfxEnabled} onChange={handleSfxChange} />
                <ToggleSwitch label="Music" enabled={currentSettings.musicEnabled} onChange={handleMusicChange} />
            </div>
             <div>
                <h3 className="text-xl font-semibold text-slate-200 border-b-2 border-slate-700 pb-2 mb-3">Difficulty</h3>
                <div className="flex justify-center gap-2">
                    <DifficultyButton label="Easy" isActive={currentSettings.difficulty === 'easy'} onClick={() => handleDifficultyChange('easy')} />
                    <DifficultyButton label="Medium" isActive={currentSettings.difficulty === 'medium'} onClick={() => handleDifficultyChange('medium')} />
                    <DifficultyButton label="Hard" isActive={currentSettings.difficulty === 'hard'} onClick={() => handleDifficultyChange('hard')} />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;