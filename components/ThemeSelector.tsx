import React from 'react';
import { Theme, ThemeName } from '../types';

interface ThemeSelectorProps {
  themes: Theme[];
  currentTheme: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, currentTheme, onThemeChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => onThemeChange(theme.name)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 transform active:scale-95
            ${
              currentTheme === theme.name
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          {theme.displayName}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;