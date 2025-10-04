import React, { useMemo, useState, useEffect } from 'react';

interface StartScreenProps {
    onPlay: () => void;
}

const DemoBlock: React.FC<{ shape: number[][]; color: string; cellSize: number; }> = ({ shape, color, cellSize }) => (
    <div className="flex flex-col gap-px">
        {shape.map((row, r) => (
            <div key={r} className="flex gap-px">
                {row.map((cell, c) => (
                    <div
                        key={`${r}-${c}`}
                        style={{ width: cellSize, height: cellSize }}
                        className={`rounded-sm ${cell ? color : ''}`}
                    />
                ))}
            </div>
        ))}
    </div>
);

const StartScreen: React.FC<StartScreenProps> = ({ onPlay }) => {
    const backgroundElements = useMemo(() => {
        const elements = [];
        const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];
        for (let i = 0; i < 15; i++) {
            const size = Math.random() * 40 + 15;
            const style: React.CSSProperties & { '--rotation-end': string } = {
                width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 20}s`, animationDelay: `${Math.random() * -40}s`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                boxShadow: `0 0 15px ${colors[Math.floor(Math.random() * colors.length)]}aa`,
                '--rotation-end': `${Math.random() > 0.5 ? '' : '-'}${Math.random() * 360}deg`,
            };
            elements.push(<div key={`block-${i}`} className="floating-block" style={style} />);
        }
        for (let i = 0; i < 40; i++) {
            const size = Math.random() * 2 + 1;
            const style: React.CSSProperties = {
                width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 10}s, ${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * -25}s`,
            };
            elements.push(<div key={`particle-${i}`} className="particle" style={style} />);
        }
        return elements;
    }, []);

    const [demoState, setDemoState] = useState<'success' | 'fail'>('success');
    useEffect(() => {
        const interval = setInterval(() => {
            setDemoState(prev => prev === 'success' ? 'fail' : 'success');
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const demoBlockShape = [[1, 1], [1, 0]];
    const successTargetCells = [{ r: 3, c: 2 }, { r: 3, c: 3 }, { r: 4, c: 2 }];
    const failTargetCells = [{ r: 5, c: 5 }, { r: 5, c: 6 }, { r: 6, c: 5 }];

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0">{backgroundElements}</div>
            <div className="absolute inset-0 bg-black/50 start-screen-overlay" style={{ backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, #020617 80%)' }}></div>
            
            <main className="relative z-10 flex flex-col items-center text-center p-4 h-full justify-center">
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-wider uppercase mb-8" style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.7)' }}>
                    <span className="text-cyan-400" style={{ textShadow: '0 0 15px #22d3ee' }}>Block </span>
                    <span className="text-purple-500" style={{ textShadow: '0 0 15px #a855f7' }}>Blast </span>
                    <span className="text-orange-400" style={{ textShadow: '0 0 15px #fb923c' }}>3D</span>
                </h1>
                <button
                    onClick={onPlay}
                    className="bg-sky-500 text-white font-bold py-4 px-12 rounded-lg text-3xl transition-transform transform hover:scale-105 active:scale-100 start-button-glow border-2 border-sky-300"
                >
                    PLAY
                </button>
            </main>

            <footer className="absolute bottom-0 z-10 w-full p-4 flex flex-col items-center h-48 pointer-events-none">
                 <div className="relative w-full max-w-xs h-full">
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 grid grid-cols-10 gap-px p-1 hologram-panel rounded">
                        {Array.from({ length: 100 }).map((_, i) => {
                            const r = Math.floor(i / 10);
                            const c = i % 10;
                            const isSuccessTarget = successTargetCells.some(cell => cell.r === r && cell.c === c);
                            const isFailTarget = failTargetCells.some(cell => cell.r === r && cell.c === c);
                            const shouldGlowSuccess = demoState === 'success' && isSuccessTarget;
                            const shouldGlowFail = demoState === 'fail' && isFailTarget;
                            const glowColor = demoState === 'success' ? '#38bdf8' : '#ef4444';
                            return (
                                <div key={i} className="w-full aspect-square bg-black/30 rounded-px" >
                                    {(shouldGlowSuccess || shouldGlowFail) && (
                                        <div 
                                            key={demoState} 
                                            className="w-full h-full animate-demo-cell-glow"
                                            style={{ '--glow-color': glowColor } as React.CSSProperties}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end justify-center gap-2 p-2 hologram-panel rounded-lg">
                        <div className="opacity-50"><DemoBlock shape={[[1,1]]} color="bg-blue-600" cellSize={10} /></div>
                        <div className={`${demoState === 'success' ? 'opacity-100' : 'opacity-0'}`}>
                           <div key={`demo-${demoState}`} className={demoState === 'success' ? 'animate-demo-move-block-success' : 'animate-demo-move-block-fail'}>
                               <DemoBlock shape={demoBlockShape} color="bg-cyan-500" cellSize={10}/>
                           </div>
                        </div>
                         <div className="opacity-50"><DemoBlock shape={[[1,1,1]]} color="bg-orange-500" cellSize={10} /></div>
                    </div>
                 </div>
            </footer>
        </div>
    );
};

export default StartScreen;