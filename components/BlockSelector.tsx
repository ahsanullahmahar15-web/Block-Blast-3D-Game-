import React from 'react';
import { Block } from '../types';
import BlockDisplay from './BlockDisplay';

interface BlockSelectorProps {
  blocks: Block[];
  onBlockDragStart: (block: Block, e: React.MouseEvent | React.TouchEvent) => void;
  draggedBlockId: number | null;
  failedDropBlockId: number | null;
}

const BlockSelector: React.FC<BlockSelectorProps> = ({ blocks, onBlockDragStart, draggedBlockId, failedDropBlockId }) => {
  return (
    <div className="hologram-panel flex justify-center items-end gap-2 md:gap-4 p-4 rounded-xl shadow-lg mt-4">
      {blocks.map((block) => (
        <BlockDisplay
          key={block.id}
          block={block}
          isBeingDragged={draggedBlockId === block.id}
          justFailedDrop={failedDropBlockId === block.id}
          onDragStart={onBlockDragStart}
        />
      ))}
    </div>
  );
};

export default BlockSelector;