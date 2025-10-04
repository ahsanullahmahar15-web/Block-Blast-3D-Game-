import { Block, Theme, Settings } from './types';

export const GRID_SIZE = 10;
export const HIGH_SCORE_KEY_PREFIX = 'blockBlastHighScore_';
export const THEME_KEY = 'blockBlastTheme';
export const SETTINGS_KEY = 'blockBlastSettings';

export const DEFAULT_SETTINGS: Settings = {
  sfxEnabled: true,
  musicEnabled: true,
  difficulty: 'medium',
};

const THEMES_DATA: Theme[] = [
  {
    name: 'holographic',
    displayName: 'Holographic Arena',
    bgClass: 'bg-theme-holographic',
    gridClass: 'bg-black/30 border border-slate-700',
    emptyCellClass: 'bg-black/20 shadow-[inset_0px_1px_4px_rgba(0,0,0,0.6)]',
    lineClearClass: 'line-clear-explosive',
    colors: {
      HINT: 'bg-white/20',
      CYAN: 'bg-cyan-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      BLUE: 'bg-blue-600 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      ORANGE: 'bg-orange-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      YELLOW: 'bg-yellow-400 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      GREEN: 'bg-green-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      PURPLE: 'bg-purple-600 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      RED: 'bg-red-500 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
    },
  },
  {
    name: 'wood',
    displayName: 'Natural Wooden Board',
    bgClass: 'bg-theme-wood',
    gridClass: 'bg-amber-800/50 border-2 border-amber-900 shadow-[0_0_20px_rgba(0,0,0,0.5)]',
    emptyCellClass: 'bg-amber-900/60 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.6)]',
    lineClearClass: 'line-clear-wood',
    colors: {
      HINT: 'bg-yellow-200/20',
      CYAN: 'bg-stone-400 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      BLUE: 'bg-stone-500 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      ORANGE: 'bg-orange-800 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      YELLOW: 'bg-yellow-700 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      GREEN: 'bg-lime-800 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      PURPLE: 'bg-rose-900 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
      RED: 'bg-red-800 shadow-[inset_0px_2px_2px_#a16207,0px_1px_1px_#57534e]',
    },
  },
  {
    name: 'futuristic',
    displayName: 'Futuristic Grid',
    bgClass: 'bg-theme-futuristic',
    gridClass: 'bg-emerald-950/50 border border-emerald-500/50',
    emptyCellClass: 'bg-emerald-500/10 shadow-[inset_0px_1px_2px_rgba(0,0,0,0.8)]',
    lineClearClass: 'line-clear-futuristic',
    colors: {
      HINT: 'bg-emerald-400/30',
      CYAN: 'bg-cyan-400 border border-cyan-200/50 shadow-[0_0_5px_#22d3ee]',
      BLUE: 'bg-sky-500 border border-sky-200/50 shadow-[0_0_5px_#0ea5e9]',
      ORANGE: 'bg-orange-400 border border-orange-200/50 shadow-[0_0_5px_#fb923c]',
      YELLOW: 'bg-yellow-300 border border-yellow-100/50 shadow-[0_0_5px_#fde047]',
      GREEN: 'bg-green-400 border border-green-200/50 shadow-[0_0_5px_#4ade80]',
      PURPLE: 'bg-fuchsia-500 border border-fuchsia-200/50 shadow-[0_0_5px_#d946ef]',
      RED: 'bg-red-500 border border-red-200/50 shadow-[0_0_5px_#ef4444]',
    },
  },
];

export const THEMES = THEMES_DATA.reduce((acc, theme) => {
    acc[theme.name] = theme;
    return acc;
}, {} as Record<string, Theme>);


type BlockDefinition = Omit<Block, 'id' | 'color'> & {colorKey: keyof Theme['colors']};

export const BLOCKS_DEFINITIONS: {
  simple: BlockDefinition[],
  medium: BlockDefinition[],
  complex: BlockDefinition[]
} = {
  simple: [
    { shape: [[1]], colorKey: 'CYAN', width: 1, height: 1 },
    { shape: [[1, 1]], colorKey: 'BLUE', width: 2, height: 1 },
    { shape: [[1], [1]], colorKey: 'BLUE', width: 1, height: 2 },
    { shape: [[1, 1], [1, 1]], colorKey: 'RED', width: 2, height: 2 },
  ],
  medium: [
    { shape: [[1, 1, 1]], colorKey: 'ORANGE', width: 3, height: 1 },
    { shape: [[1], [1], [1]], colorKey: 'ORANGE', width: 1, height: 3 },
    { shape: [[1, 0], [1, 1]], colorKey: 'CYAN', width: 2, height: 2 }, // smaller L
    { shape: [[1, 1], [0, 1]], colorKey: 'CYAN', width: 2, height: 2 }, // smaller L
    { shape: [[0, 1, 0], [1, 1, 1]], colorKey: 'BLUE', width: 3, height: 2 }, // T-shape
    { shape: [[1, 0], [1, 1], [1, 0]], colorKey: 'BLUE', width: 2, height: 3 }, // T-shape
  ],
  complex: [
    { shape: [[1, 1, 1, 1]], colorKey: 'YELLOW', width: 4, height: 1 },
    { shape: [[1, 1, 1, 1, 1]], colorKey: 'GREEN', width: 5, height: 1 },
    { shape: [[1], [1], [1], [1]], colorKey: 'YELLOW', width: 1, height: 4 },
    { shape: [[1], [1], [1], [1], [1]], colorKey: 'GREEN', width: 1, height: 5 },
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], colorKey: 'PURPLE', width: 3, height: 3 },
    { shape: [[1, 0], [1, 0], [1, 1]], colorKey: 'CYAN', width: 2, height: 3 },
    { shape: [[1, 1, 1], [1, 0, 0]], colorKey: 'CYAN', width: 3, height: 2 },
  ]
};

export const SCORING = {
  PER_BLOCK: 1,
  LINE_CLEAR_BASE: 100,
  COMBO_BONUS: 50,
};

export const INITIAL_POWERUP_COUNTS = {
  boom: 2,
  reshuffle: 2,
  singleClear: 3,
};

export const DIFFICULTY_TIMINGS = {
  easy: {
    lineClear: 600,
    boom: 500,
    singleClear: 450,
    placePop: 250,
  },
  medium: {
    lineClear: 500,
    boom: 400,
    singleClear: 350,
    placePop: 200,
  },
  hard: {
    lineClear: 350,
    boom: 300,
    singleClear: 250,
    placePop: 150,
  },
};
