import React from 'react';
import { GridState, PowerUpType, Theme } from '../types';
import ShatterEffect from './ShatterEffect';

interface GridProps {
  grid: GridState;
  activePowerUp: PowerUpType | null;
  theme: Theme;
  onGridInteraction: (row: number, col: number) => void;
  onUpdateHint: (row: number, col: number) => void;
  onClearHint: () => void;
}

const Grid: React.FC<GridProps> = ({ grid, activePowerUp, theme, onGridInteraction, onUpdateHint, onClearHint }) => {
  const getCursorStyle = () => {
    if (activePowerUp === 'boom' || activePowerUp === 'singleClear') {
      return 'cursor-crosshair';
    }
    // When dragging, cursor is handled by body style
    return 'cursor-default';
  };

  const getCellClass = (cell: GridState[0][0]) => {
    if (cell.isClearing) {
      // The ShatterEffect for holographic is rendered on top, while the cell below animates.
      // Combining the block's color with the animation class provides the base for the effect.
      return `${cell.color} ${theme.lineClearClass}`;
    }
    if (cell.isJustPlaced) return 'animate-block-place-pop';
    if (cell.isExploding) return 'animate-bomb-explosion';
    if (cell.isDissolving) return 'animate-holographic-dissolve';
    
    if (cell.isFilled) return cell.color;
    
    if (cell.hintState === 'good') return theme.colors.HINT;
    if (cell.hintState === 'bad') return 'cell-hint-bad';

    return theme.emptyCellClass;
  }

  return (
    <div 
      className={`grid grid-cols-10 gap-1 p-2 rounded-lg shadow-2xl aspect-square transition-colors duration-500 ${theme.gridClass} ${getCursorStyle()}`}
      onMouseLeave={onClearHint}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-full h-full aspect-square rounded-sm transition-all duration-200 relative
              ${getCellClass(cell)}
            `}
            style={cell.isClearing ? { animationDelay: `${cell.clearAnimationDelay || 0}ms` } : undefined}
            onClick={() => onGridInteraction(r, c)}
            onMouseEnter={() => onUpdateHint(r, c)}
          >
            {cell.isClearing && theme.name === 'holographic' && <ShatterEffect />}
          </div>
        ))
      )}
    </div>
  );
};

export default Grid;
