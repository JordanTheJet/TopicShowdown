// components/VictoryScreen.jsx
import React, { useState, useEffect } from 'react';

const VictoryScreen = ({ winner, battleData, onPlayAgain }) => {
  const [topic, setTopic] = useState('');
  const [animation, setAnimation] = useState(true);
  
  // Get the winner and loser characters
  const winnerCharacter = battleData[winner];
  const loserKey = winner === 'Character 1' ? 'Character 2' : 'Character 1';
  const loserCharacter = battleData[loserKey];

  useEffect(() => {
    // After 2 seconds, stop the animation
    const timer = setTimeout(() => {
      setAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onPlayAgain(topic);
    } else {
      onPlayAgain();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top part - Winner display */}
      <div className="flex-grow flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
        <div className="text-center z-10">
          <h1 className="text-5xl font-bold text-primary mb-6">
            {winnerCharacter.Name} wins!
          </h1>
          <p className="text-2xl mb-8">
            {loserCharacter.Name} has been defeated!
          </p>
        </div>
        
        {/* Winner character display */}
        <div className="absolute z-0">
          <img 
            src="/api/placeholder/300/400" 
            alt={winnerCharacter.Name}
            className="h-80 object-contain"
          />
        </div>
        
        {/* Loser character sliding down animation */}
        <div 
          className={`absolute transition-all duration-2000 ease-in-out ${
            animation ? 'top-full' : 'top-24'
          }`}
          style={{ 
            right: '20%',
            transform: animation ? 'rotate(90deg)' : 'none',
            opacity: animation ? 0.3 : 0
          }}
        >
          <img 
            src="/api/placeholder/300/400" 
            alt={loserCharacter.Name}
            className="h-80 object-contain"
          />
        </div>
      </div>
      
      {/* Bottom part - Play Again */}
      <div className="h-1/4 bg-gray-800 p-4 flex items-center justify-center">
        <div className="bg-gray-700 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Play Again?</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="newTopic" className="font-semibold">Enter your topic here!</label>
              <input
                id="newTopic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., historical figures, cartoon characters"
                className="p-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-primary focus:outline-none"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-primary hover:bg-red-700 transition-colors text-white font-bold py-2 px-4 rounded-lg"
            >
              Let's Battle!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;