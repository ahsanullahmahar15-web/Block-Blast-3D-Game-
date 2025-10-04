import React, { useMemo } from 'react';

const ShatterEffect: React.FC = () => {
    const fragments = useMemo(() => {
        const frags = [];
        const gridSize = 3; // 3x3 fragments per cell
        const colors = ['#8b5cf6', '#38bdf8', '#ec4899', '#ffffff'];

        for (let i = 0; i < gridSize * gridSize; i++) {
            const x = Math.random() * 150 - 75; // random x from -75 to 75
            const y = Math.random() * 150 - 75; // random y from -75 to 75
            const rot = Math.random() * 720 - 360;
            const scale = Math.random() * 0.4 + 0.1;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            frags.push({
                id: i,
                style: {
                    top: `${Math.floor(i / gridSize) * (100 / gridSize)}%`,
                    left: `${(i % gridSize) * (100 / gridSize)}%`,
                    width: `${100 / gridSize}%`,
                    height: `${100 / gridSize}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}, 0 0 12px #ffffff`,
                    '--transform-end': `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
                } as React.CSSProperties,
            });
        }
        return frags;
    }, []);

    return (
        <>
            {fragments.map(frag => (
                <div key={frag.id} className="fragment" style={frag.style} />
            ))}
        </>
    );
};

export default ShatterEffect;