export interface CellState {
  isFilled: boolean;
  color: string;
  hintState?: 'good' | 'bad';
  isClearing?: boolean;
  clearAnimationDelay?: number;
  isJustPlaced?: boolean;
  isExploding?: boolean;
  isDissolving?: boolean;
}

export type BlockShape = number[][];

export interface Block {
  id: number;
  shape: BlockShape;
  color: string;
  width: number;
  height: number;
}

export type GridState = CellState[][];

export type PowerUpType = 'boom' | 'reshuffle' | 'singleClear';

export type ThemeName = 'holographic' | 'wood' | 'futuristic';

export interface Theme {
  name: ThemeName;
  displayName: string;
  bgClass: string;
  gridClass: string;
  emptyCellClass: string;
  lineClearClass: string;
  colors: {
    [key: string]: string;
  };
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Settings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
}

export type GameState = 'start' | 'playing';