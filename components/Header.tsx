import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="w-full p-4 flex justify-center items-center h-20">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider uppercase text-center" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                <span className="text-cyan-400 text-glow">Block Blast </span>
                <span className="text-orange-400 text-glow">X 3D</span>
            </h1>
        </header>
    );
}

export default Header;