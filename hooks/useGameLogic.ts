import { useState, useEffect, useCallback } from 'react';
import { GridState, CellState, Block, PowerUpType, Theme, Difficulty } from '../types';
import { GRID_SIZE, BLOCKS_DEFINITIONS, HIGH_SCORE_KEY_PREFIX, SCORING, INITIAL_POWERUP_COUNTS, DIFFICULTY_TIMINGS } from '../constants';

const createEmptyGrid = (theme: Theme): GridState =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      isFilled: false,
      color: theme.emptyCellClass,
      hintState: undefined,
      isClearing: false,
      clearAnimationDelay: 0,
      isJustPlaced: false,
    }))
  );

const createEmptyCell = (theme: Theme): CellState => ({
  isFilled: false,
  color: theme.emptyCellClass,
  hintState: undefined,
  isClearing: false,
  clearAnimationDelay: 0,
  isJustPlaced: false,
  isExploding: false,
  isDissolving: false,
});

interface AudioCallbacks {
    onPlaceBlock: () => void;
    onClearLine: () => void;
    onGameOver: () => void;
}

const deepCopyGrid = (grid: GridState): GridState => grid.map(row => row.map(cell => ({ ...cell })));

export const useGameLogic = (theme: Theme, difficulty: Difficulty, callbacks: AudioCallbacks) => {
  const [grid, setGrid] = useState<GridState>(() => createEmptyGrid(theme));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [powerUpCounts, setPowerUpCounts] = useState(INITIAL_POWERUP_COUNTS);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

  const timings = DIFFICULTY_TIMINGS[difficulty];
  const highScoreKey = `${HIGH_SCORE_KEY_PREFIX}${difficulty}`;

  useEffect(() => {
    const savedHighScore = parseInt(localStorage.getItem(highScoreKey) || '0', 10);
    setHighScore(savedHighScore);
  }, [highScoreKey]);

  const generateNewBlocks = useCallback(() => {
    const blockPool = [...BLOCKS_DEFINITIONS.simple];
    if (difficulty === 'medium') {
      blockPool.push(...BLOCKS_DEFINITIONS.medium);
    } else if (difficulty === 'hard') {
      blockPool.push(...BLOCKS_DEFINITIONS.medium, ...BLOCKS_DEFINITIONS.complex);
    }
    
    const newBlocks: Block[] = [];
    for (let i = 0; i < 3; i++) {
      const blockDef = blockPool[Math.floor(Math.random() * blockPool.length)];
      newBlocks.push({
        ...blockDef,
        id: Date.now() + i,
        color: theme.colors[blockDef.colorKey] || '',
      });
    }
    setAvailableBlocks(newBlocks);
    return newBlocks;
  }, [theme, difficulty]);

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid(theme));
    setScore(0);
    setIsGameOver(false);
    generateNewBlocks();
    setActivePowerUp(null);
    setPowerUpCounts(INITIAL_POWERUP_COUNTS);
  }, [generateNewBlocks, theme]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  useEffect(() => {
    if (isGameOver) {
        callbacks.onGameOver();
    }
  }, [isGameOver, callbacks]);

  const canPlaceBlock = useCallback((
    block: Block,
    startRow: number,
    startCol: number,
    currentGrid: GridState
  ): boolean => {
    for (let r = 0; r < block.height; r++) {
      for (let c = 0; c < block.width; c++) {
        if (block.shape[r][c]) {
          const gridRow = startRow + r;
          const gridCol = startCol + c;
          if (
            gridRow < 0 || gridRow >= GRID_SIZE ||
            gridCol < 0 || gridCol >= GRID_SIZE ||
            currentGrid[gridRow]?.[gridCol]?.isFilled
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const checkForClears = useCallback((currentGrid: GridState): { clearedRows: number[], clearedCols: number[] } => {
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (currentGrid[r].every(cell => cell.isFilled)) {
        rowsToClear.push(r);
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      if (currentGrid.every(row => row[c].isFilled)) {
        colsToClear.push(c);
      }
    }
    
    return { clearedRows: rowsToClear, clearedCols: colsToClear };
  }, []);
  
  const isMovePossible = useCallback((blocks: Block[], currentGrid: GridState): boolean => {
    if (blocks.length === 0) return false;
    for (const block of blocks) {
      for (let r = 0; r <= GRID_SIZE - block.height; r++) {
        for (let c = 0; c <= GRID_SIZE - block.width; c++) {
          if (canPlaceBlock(block, r, c, currentGrid)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [canPlaceBlock]);
  
  const checkGameState = useCallback((currentGrid: GridState, currentBlocks: Block[]) => {
      let nextBlocks = currentBlocks;
      if (currentBlocks.length === 0) {
          nextBlocks = generateNewBlocks();
      } else {
          setAvailableBlocks(currentBlocks);
      }

      if (!isMovePossible(nextBlocks, currentGrid)) {
          setIsGameOver(true);
      }
  }, [isMovePossible, generateNewBlocks]);

  const placeBlock = useCallback((blockToPlace: Block, startRow: number, startCol: number): boolean => {
    if (isInteractionLocked || !canPlaceBlock(blockToPlace, startRow, startCol, grid)) {
      return false;
    }
    callbacks.onPlaceBlock();
    let newGrid = deepCopyGrid(grid);
    let blocksPlaced = 0;

    for (let r = 0; r < blockToPlace.height; r++) {
      for (let c = 0; c < blockToPlace.width; c++) {
        if (blockToPlace.shape[r][c]) {
          newGrid[startRow + r][startCol + c] = {
            isFilled: true,
            color: blockToPlace.color,
            hintState: undefined,
            isJustPlaced: true,
          };
          blocksPlaced++;
        }
      }
    }
    
    setGrid(newGrid);

    setTimeout(() => {
      setGrid(prevGrid =>
        prevGrid.map(row =>
          row.map(cell => (cell.isJustPlaced ? { ...cell, isJustPlaced: false } : cell))
        )
      );
    }, timings.placePop);

    const remainingBlocks = availableBlocks.filter(b => b.id !== blockToPlace.id);
    const { clearedRows, clearedCols } = checkForClears(newGrid);
    const clearedLines = clearedRows.length + clearedCols.length;
    
    let points = blocksPlaced * SCORING.PER_BLOCK;
    if (clearedLines > 0) {
      callbacks.onClearLine();
      points += SCORING.LINE_CLEAR_BASE * clearedLines * clearedLines;
      points += SCORING.COMBO_BONUS * (clearedLines - 1);

      setIsInteractionLocked(true);
      let clearingGrid = deepCopyGrid(newGrid);
      let maxDelay = 0;
      const stagger = 30; // ms

      clearedRows.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) {
          clearingGrid[r][c].isClearing = true;
          // Animate from center outwards
          const delay = Math.floor(Math.abs(c - (GRID_SIZE / 2 - 0.5))) * stagger;
          clearingGrid[r][c].clearAnimationDelay = delay;
          if (delay > maxDelay) maxDelay = delay;
        }
      });
      clearedCols.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) {
          // Check if it's already being cleared as part of a row to avoid resetting the delay
          if (!clearingGrid[r][c].isClearing) {
            clearingGrid[r][c].isClearing = true;
            // Animate from center outwards
            const delay = Math.floor(Math.abs(r - (GRID_SIZE / 2 - 0.5))) * stagger;
            clearingGrid[r][c].clearAnimationDelay = delay;
            if (delay > maxDelay) maxDelay = delay;
          }
        }
      });
      setGrid(clearingGrid);

      setTimeout(() => {
        let gridAfterClear = deepCopyGrid(clearingGrid);
        clearedRows.forEach(r => {
            for(let c = 0; c < GRID_SIZE; c++) gridAfterClear[r][c] = createEmptyCell(theme);
        });
        clearedCols.forEach(c => {
            for(let r = 0; r < GRID_SIZE; r++) gridAfterClear[r][c] = createEmptyCell(theme);
        });

        setGrid(gridAfterClear);
        checkGameState(gridAfterClear, remainingBlocks);
        setIsInteractionLocked(false);
      }, maxDelay + timings.lineClear); 
    } else {
        checkGameState(newGrid, remainingBlocks);
    }
    
    const newScore = score + points;
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(highScoreKey, newScore.toString());
    }
    return true;
  }, [grid, score, highScore, availableBlocks, canPlaceBlock, checkForClears, isInteractionLocked, checkGameState, theme, callbacks, highScoreKey, difficulty]);

  const updateHint = useCallback((block: Block | null, row: number, col: number) => {
    let newGrid = grid.map(r => r.map(c => ({...c, hintState: undefined})));
    
    if (block && row >= 0 && col >= 0) {
      const isValid = canPlaceBlock(block, row, col, newGrid);
      for (let r_offset = 0; r_offset < block.height; r_offset++) {
        for (let c_offset = 0; c_offset < block.width; c_offset++) {
          if (block.shape[r_offset][c_offset]) {
            const gridRow = row + r_offset;
            const gridCol = col + c_offset;
            if (gridRow < GRID_SIZE && gridCol < GRID_SIZE) {
               newGrid[gridRow][gridCol].hintState = isValid ? 'good' : 'bad';
            }
          }
        }
      }
    } else if (activePowerUp === 'boom') {
       for (let r = -1; r <= 1; r++) {
         for (let c = -1; c <= 1; c++) {
           if (grid[row+r]?.[col+c]) {
             newGrid[row+r][col+c].hintState = 'good';
           }
         }
       }
    } else if (activePowerUp === 'singleClear' && grid[row]?.[col]?.isFilled) {
      newGrid[row][col].hintState = 'good';
    }
    setGrid(newGrid);
  }, [grid, canPlaceBlock, activePowerUp]);

  const activatePowerUp = useCallback((type: PowerUpType) => {
      if (powerUpCounts[type] > 0) {
        setActivePowerUp(prev => (prev === type ? null : type));
      }
  }, [powerUpCounts]);

  const useReshuffle = useCallback(() => {
    if (powerUpCounts.reshuffle > 0 && !isInteractionLocked) {
      setPowerUpCounts(prev => ({...prev, reshuffle: prev.reshuffle - 1}));
      const newBlocks = generateNewBlocks();
      if (!isMovePossible(newBlocks, grid)) {
        setIsGameOver(true);
      }
    }
  }, [powerUpCounts, isInteractionLocked, generateNewBlocks, isMovePossible, grid]);

  const useBoom = useCallback((row: number, col: number) => {
    if (powerUpCounts.boom <= 0) return;
    
    setPowerUpCounts(prev => ({...prev, boom: prev.boom - 1}));
    setActivePowerUp(null);
    setIsInteractionLocked(true);

    let tempGrid = deepCopyGrid(grid);
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (tempGrid[row+r]?.[col+c]) {
                tempGrid[row+r][col+c].isExploding = true;
            }
        }
    }
    setGrid(tempGrid);

    setTimeout(() => {
        let afterExplosionGrid = deepCopyGrid(tempGrid);
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (afterExplosionGrid[row+r]?.[col+c]) {
                    afterExplosionGrid[row+r][col+c] = createEmptyCell(theme);
                }
            }
        }
        setGrid(afterExplosionGrid);
        setIsInteractionLocked(false);
        if (!isMovePossible(availableBlocks, afterExplosionGrid)) {
            setIsGameOver(true);
        }
    }, timings.boom);

  }, [powerUpCounts, grid, availableBlocks, isMovePossible, theme, difficulty]);

  const useSingleClear = useCallback((row: number, col: number) => {
    if (powerUpCounts.singleClear <= 0 || !grid[row]?.[col]?.isFilled) return;

    setPowerUpCounts(prev => ({...prev, singleClear: prev.singleClear - 1}));
    setActivePowerUp(null);
    setIsInteractionLocked(true);

    let tempGrid = deepCopyGrid(grid);
    tempGrid[row][col].isDissolving = true;
    setGrid(tempGrid);

    setTimeout(() => {
        let afterPopGrid = deepCopyGrid(tempGrid);
        afterPopGrid[row][col] = createEmptyCell(theme);
        setGrid(afterPopGrid);
        setIsInteractionLocked(false);
        if (!isMovePossible(availableBlocks, afterPopGrid)) {
            setIsGameOver(true);
        }
    }, timings.singleClear);
  }, [powerUpCounts, grid, availableBlocks, isMovePossible, theme, difficulty]);

  const handleGridInteraction = useCallback((row: number, col: number) => {
    if (isInteractionLocked || activePowerUp === null) return;
    
    switch (activePowerUp) {
        case 'boom':
            useBoom(row, col);
            break;
        case 'singleClear':
            useSingleClear(row, col);
            break;
    }
  }, [isInteractionLocked, activePowerUp, useBoom, useSingleClear]);
  
  const flashBadPlacement = useCallback((block: Block, row: number, col: number) => {
    const newGrid = deepCopyGrid(grid);
    for (let r_offset = 0; r_offset < block.height; r_offset++) {
      for (let c_offset = 0; c_offset < block.width; c_offset++) {
        if (block.shape[r_offset][c_offset]) {
          const gridRow = row + r_offset;
          const gridCol = col + c_offset;
          if (newGrid[gridRow]?.[gridCol]) {
             newGrid[gridRow][gridCol].hintState = 'bad';
          }
        }
      }
    }
    setGrid(newGrid);
    setTimeout(() => {
        setGrid(g => g.map(r => r.map(c => c.hintState === 'bad' ? {...c, hintState: undefined} : c)));
    }, 200);
  }, [grid]);

  return { 
    grid, score, highScore, availableBlocks, isGameOver, 
    placeBlock, resetGame, updateHint, flashBadPlacement,
    powerUpCounts, activePowerUp, activatePowerUp, useReshuffle,
    handleGridInteraction
  };
};
