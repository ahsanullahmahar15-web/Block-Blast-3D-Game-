import React from 'react';
import { Block } from '../types';

interface BlockDisplayProps {
  block: Block;
  isBeingDragged: boolean;
  justFailedDrop: boolean;
  onDragStart: (block: Block, e: React.MouseEvent | React.TouchEvent) => void;
}

const BlockDisplay: React.FC<BlockDisplayProps> = ({ block, isBeingDragged, justFailedDrop, onDragStart }) => {
  const cell_size = 'min-w-6 min-h-6 md:min-w-7 md:min-h-7';

  return (
    <div
      className={`p-2 cursor-grab rounded-lg transition-all duration-200 animate-reshuffle-in
        ${isBeingDragged ? 'opacity-30' : 'bg-slate-800/50 hover:bg-slate-700/70 transform hover:scale-105'}
        ${justFailedDrop ? 'animate-shake' : ''}`
      }
      onMouseDown={(e) => onDragStart(block, e)}
      onTouchStart={(e) => onDragStart(block, e)}
    >
      <div className="flex flex-col gap-1 items-center justify-center">
        {block.shape.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`${cell_size} rounded-sm ${cell ? block.color : 'opacity-0'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockDisplay;