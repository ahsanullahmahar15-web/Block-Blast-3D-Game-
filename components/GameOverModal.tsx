import React from 'react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, highScore, onPlayAgain, onMainMenu }) => {
  const isNewHighScore = score > 0 && score >= highScore;

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-40">
      <div className="bg-slate-900/80 border border-slate-700 p-8 rounded-lg shadow-2xl text-center animate-fade-in-down w-11/12 max-w-md">
        <h2 className="text-4xl font-bold text-red-500 mb-2 uppercase tracking-widest" style={{ textShadow: '0 0 10px #ef4444' }}>Game Over</h2>
        
        {isNewHighScore && (
            <p className="text-2xl font-bold text-yellow-400 my-4 animate-new-high-score">
                New High Score!
            </p>
        )}

        <p className={`text-xl text-slate-300 mb-2 ${isNewHighScore ? 'mt-0' : 'mt-4'}`}>Final Score:</p>
        <p className="text-6xl font-bold text-yellow-400 mb-8 text-glow">{score.toLocaleString()}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onPlayAgain}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all transform hover:scale-105 active:scale-100 shadow-[0_5px_20px_rgba(34,197,94,0.4)]"
            >
              Play Again
            </button>
            <button
              onClick={onMainMenu}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all transform hover:scale-105 active:scale-100"
            >
              Main Menu
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;