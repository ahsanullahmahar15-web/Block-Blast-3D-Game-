import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import Grid from './components/Grid';
import BlockSelector from './components/BlockSelector';
import GameOverModal from './components/GameOverModal';
import Header from './components/Header';
import PowerUpControls from './components/PowerUpControls';
import ThemeSelector from './components/ThemeSelector';
import SettingsModal from './components/SettingsModal';
import StartScreen from './components/StartScreen';
import SettingsButton from './components/SettingsButton';
import { useGameLogic } from './hooks/useGameLogic';
import { useSettings } from './hooks/useSettings';
import { AudioManager } from './utils/AudioManager';
import { THEME_KEY, THEMES } from './constants';
import { Theme, ThemeName, GameState, Block } from './types';

const ScoreDisplay: React.FC<{ label: string; score: number; className?: string }> = ({ label, score, className }) => (
    <div className={`hologram-ui p-3 rounded-lg text-center backdrop-blur-sm ${className}`}>
      <div className="hologram-corners-alt relative h-full w-full flex flex-col justify-center items-center">
        <div className="text-sm font-medium text-cyan-300/80 uppercase tracking-widest">{label}</div>
        <div className="text-3xl font-bold text-white tracking-tighter text-glow">{score.toLocaleString()}</div>
      </div>
    </div>
);

const PlayerProfile: React.FC = () => (
    <div className="neon-energy-box p-2 rounded-lg flex items-center gap-3 transition-all duration-200 hover:bg-cyan-400/20 cursor-pointer">
        <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-400 text-xl font-bold border-2 border-cyan-600 animate-avatar-glow">
            P
        </div>
        <div>
            <p className="font-bold text-white animate-text-glow-white">Player_1</p>
            <p className="text-sm text-yellow-400">
                <span className="animate-subtle-float">🪙</span> 1,250
            </p>
        </div>
    </div>
);

const DraggedBlock: React.FC<{ block: Block; forwardedRef: React.Ref<HTMLDivElement> }> = ({ block, forwardedRef }) => {
    const colorName = useMemo(() => {
        const match = block.color.match(/bg-([a-z]+)-/);
        return match ? match[1] : 'cyan';
    }, [block.color]);

    const { trailColor, trailColorFaded } = useMemo(() => {
       const colors: { [key: string]: { main: string, faded: string } } = {
           'cyan':   { main: '#06b6d4', faded: '#06b6d499' },
           'blue':   { main: '#2563eb', faded: '#2563eb99' },
           'orange': { main: '#f97316', faded: '#f9731699' },
           'yellow': { main: '#f59e0b', faded: '#f59e0b99' },
           'green':  { main: '#16a34a', faded: '#16a34a99' },
           'purple': { main: '#9333ea', faded: '#9333ea99' },
           'red':    { main: '#dc2626', faded: '#dc262699' },
           'default':{ main: '#ffffff', faded: '#ffffff99' },
       };
       const colorSet = colors[colorName] || colors['default'];
       return { trailColor: colorSet.main, trailColorFaded: colorSet.faded };
    }, [colorName]);
    
    return (
        <div 
            ref={forwardedRef}
            className="absolute z-50 pointer-events-none"
            style={{
                top: 0,
                left: 0,
                opacity: 0,
                willChange: 'transform',
            }}
        >
            <div className="flex flex-col gap-1 items-center justify-center p-2 dragged-block-trail" style={{ '--trail-color': trailColor, '--trail-color-faded': trailColorFaded } as React.CSSProperties}>
                {block.shape.map((row, r) => (
                    <div key={r} className="flex gap-1">
                        {row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`w-7 h-7 md:w-8 md:h-8 rounded-sm ${cell ? block.color : 'opacity-0'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [settings, saveSettings] = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [gameState, setGameState] = useState<GameState>('start');
    const [draggedBlockInfo, setDraggedBlockInfo] = useState<{ block: Block; offset: { x: number, y: number } } | null>(null);
    const [failedDropBlockId, setFailedDropBlockId] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const draggedBlockRef = useRef<HTMLDivElement>(null);

    const [themeName, setThemeName] = useState<ThemeName>(() => {
        const savedTheme = localStorage.getItem(THEME_KEY) as ThemeName;
        return THEMES[savedTheme] ? savedTheme : 'holographic';
    });
    
    const theme: Theme = THEMES[themeName];

    const audioManager = useMemo(() => new AudioManager(), []);

    useEffect(() => {
        audioManager.updateSettings(settings.sfxEnabled, settings.musicEnabled);
    }, [settings, audioManager]);

    const audioCallbacks = useMemo(() => ({
        onPlaceBlock: () => audioManager.playSound('place'),
        onClearLine: () => audioManager.playSound('clear'),
        onGameOver: () => audioManager.playSound('gameOver'),
    }), [audioManager]);

    const {
        grid,
        score,
        highScore,
        availableBlocks,
        isGameOver,
        resetGame,
        updateHint,
        placeBlock,
        flashBadPlacement,
        powerUpCounts,
        activePowerUp,
        activatePowerUp,
        useReshuffle,
        handleGridInteraction
    } = useGameLogic(theme, settings.difficulty, audioCallbacks);

    useEffect(() => {
        localStorage.setItem(THEME_KEY, themeName);
        document.body.className = `text-white ${theme.bgClass}`;
    }, [themeName, theme.bgClass]);

    const handleClearHint = useCallback(() => {
        updateHint(null, -1, -1);
    }, [updateHint]);

    const getGridPositionFromEvent = (clientX: number, clientY: number): { row: number; col: number } => {
        if (!gridRef.current) return { row: -1, col: -1 };
        const rect = gridRef.current.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            return { row: -1, col: -1 };
        }
        const cellWidth = rect.width / 10;
        const cellHeight = rect.height / 10;
        const col = Math.floor((clientX - rect.left) / cellWidth);
        const row = Math.floor((clientY - rect.top) / cellHeight);
        return { row, col };
    };

    const handleBlockDragStart = (block: Block, e: React.MouseEvent | React.TouchEvent) => {
        if (activePowerUp) return;
        const eventCoord = 'touches' in e ? e.touches[0] : e;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offset = {
            x: eventCoord.clientX - rect.left,
            y: eventCoord.clientY - rect.top,
        };
        setDraggedBlockInfo({ block, offset });

        if (draggedBlockRef.current) {
            draggedBlockRef.current.style.opacity = '1';
            draggedBlockRef.current.style.transform = `translate(${eventCoord.clientX - offset.x}px, ${eventCoord.clientY - offset.y}px) scale(1.1)`;
        }
        document.body.style.cursor = 'grabbing';
    };

    useEffect(() => {
        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            if (!draggedBlockInfo || !draggedBlockRef.current) return;
            e.preventDefault();
            const eventCoord = 'touches' in e ? e.touches[0] : e;
            
            draggedBlockRef.current.style.transform = `translate(${eventCoord.clientX - draggedBlockInfo.offset.x}px, ${eventCoord.clientY - draggedBlockInfo.offset.y}px) scale(1.1)`;

            const { row, col } = getGridPositionFromEvent(eventCoord.clientX, eventCoord.clientY);
            updateHint(draggedBlockInfo.block, row, col);
        };

        const handleDragEnd = (e: MouseEvent | TouchEvent) => {
            if (!draggedBlockInfo || !draggedBlockRef.current) return;
            draggedBlockRef.current.style.opacity = '0';
            
            const eventCoord = 'changedTouches' in e ? e.changedTouches[0] : e;
            const { row, col } = getGridPositionFromEvent(eventCoord.clientX, eventCoord.clientY);
            
            const wasPlaced = row !== -1 && col !== -1 ? placeBlock(draggedBlockInfo.block, row, col) : false;

            if (!wasPlaced) {
                setFailedDropBlockId(draggedBlockInfo.block.id);
                setTimeout(() => setFailedDropBlockId(null), 500);
                if (row !== -1 && col !== -1) {
                    flashBadPlacement(draggedBlockInfo.block, row, col);
                }
            }
            
            handleClearHint();
            setDraggedBlockInfo(null);
            document.body.style.cursor = 'default';
        };

        if (draggedBlockInfo) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };

    }, [draggedBlockInfo, placeBlock, handleClearHint, updateHint, flashBadPlacement]);


    const handleUpdateHintForPowerUp = (row: number, col: number) => {
        if (activePowerUp) {
            updateHint(null, row, col);
        }
    }
    
    const handleMainMenu = () => {
      resetGame();
      setGameState('start');
    }

    const handlePlayAgain = () => {
      resetGame();
    }
    
    const handlePlay = () => {
        resetGame();
        setGameState('playing');
    }

    useEffect(() => {
        if (!draggedBlockInfo) {
           document.body.style.cursor = (activePowerUp === 'boom' || activePowerUp === 'singleClear') ? 'crosshair' : 'default';
        }
        return () => {
            if(!draggedBlockInfo) document.body.style.cursor = 'default';
        }
    }, [activePowerUp, draggedBlockInfo]);


    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-2 sm:p-4 font-sans antialiased overflow-hidden relative">
            {draggedBlockInfo && <DraggedBlock block={draggedBlockInfo.block} forwardedRef={draggedBlockRef} />}
            {isGameOver && (
              <GameOverModal 
                score={score} 
                highScore={highScore}
                onMainMenu={handleMainMenu} 
                onPlayAgain={handlePlayAgain}
              />
            )}
            {isSettingsOpen && (
                <SettingsModal 
                    settings={settings}
                    onSave={saveSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
            
            <div className="absolute top-4 right-4 z-30 flex items-center gap-4">
                <PlayerProfile />
                <SettingsButton onClick={() => setIsSettingsOpen(true)} />
            </div>
            
            {gameState === 'start' ? (
                <StartScreen onPlay={handlePlay} />
            ) : (
                <>
                    <Header />
                    <main className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8 w-full max-w-6xl mx-auto flex-grow [perspective:1000px]">
                        <div ref={gridRef} className="w-full max-w-[400px] md:max-w-[450px] lg:max-w-[500px] [transform-style:preserve-3d] [transform:rotateX(20deg)]">
                            <div className="flex justify-between mb-4 gap-4">
                                <ScoreDisplay label="Score" score={score} className="w-1/2" />
                                <ScoreDisplay label="High Score" score={highScore} className="w-1/2" />
                            </div>
                            <Grid
                                grid={grid}
                                activePowerUp={activePowerUp}
                                theme={theme}
                                onGridInteraction={handleGridInteraction}
                                onUpdateHint={handleUpdateHintForPowerUp}
                                onClearHint={handleClearHint}
                            />
                        </div>
                        <div className="lg:w-48">
                            <PowerUpControls 
                                counts={powerUpCounts}
                                activePowerUp={activePowerUp}
                                onActivate={activatePowerUp}
                                onReshuffle={useReshuffle}
                            />
                        </div>
                    </main>

                    <div className="w-full flex flex-col items-center">
                        <BlockSelector
                            blocks={availableBlocks}
                            onBlockDragStart={handleBlockDragStart}
                            draggedBlockId={draggedBlockInfo?.block.id || null}
                            failedDropBlockId={failedDropBlockId}
                        />

                        <footer className="text-center text-slate-500 text-sm p-4 w-full max-w-2xl">
                            <ThemeSelector
                                themes={Object.values(THEMES)}
                                currentTheme={themeName}
                                onThemeChange={setThemeName}
                            />
                            <p className="mt-4">A cinematic 3D puzzle experience. Built with React and Tailwind CSS.</p>
                        </footer>
                    </div>
                </>
            )}
        </div>
    );
};

export default App;