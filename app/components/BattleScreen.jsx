// components/BattleScreen.jsx
import React, { useState, useEffect } from 'react';

const BattleScreen = ({ battleData, character1HP, character2HP, onMoveSelect }) => {
  const [narrative, setNarrative] = useState('');
  const [activeCharacter, setActiveCharacter] = useState(1); // 1 for player, 2 for opponent
  const [isAnimating, setIsAnimating] = useState(false);
  
  const character1 = battleData['Character 1'];
  const character2 = battleData['Character 2'];
  const backgroundDesc = battleData['Background'];
  
  // Placeholder background image - in a real app you'd use the actual background
  const backgroundStyle = {
    backgroundImage: `url('/api/placeholder/800/600')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  
  // Handle move selection
  const handleMoveClick = async (moveKey) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const move = character1.Moves[`Move_${moveKey}`];
    
    // Set narrative based on move
    setNarrative(`${character1.Name} used ${move.Move_name}! ${move.Description}`);
    
    // Perform the move
    await onMoveSelect(1, moveKey);
    
    // Wait for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
      
      // AI opponent's turn (if player character is still alive)
      if (character2HP > 0) {
        setTimeout(() => {
          performOpponentMove();
        }, 1000);
      }
    }, 1500);
  };
  
  // Simulate opponent's move
  const performOpponentMove = async () => {
    setIsAnimating(true);
    
    // Randomly select a move
    const moveKeys = ['1', '2', '3', '4'];
    const randomMoveKey = moveKeys[Math.floor(Math.random() * moveKeys.length)];
    const move = character2.Moves[`Move_${randomMoveKey}`];
    
    // Set narrative based on move
    setNarrative(`${character2.Name} used ${move.Move_name}! ${move.Description}`);
    
    // Perform the move
    await onMoveSelect(2, randomMoveKey);
    
    // Wait for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };
  
  // Calculate positions based on active character for animation
  const character1Position = isAnimating && activeCharacter === 1 
    ? 'translate-x-4' 
    : 'translate-x-0';
    
  const character2Position = isAnimating && activeCharacter === 2 
    ? '-translate-x-4' 
    : 'translate-x-0';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top 3/4 - Battle Scene */}
      <div className="flex-grow relative" style={backgroundStyle}>
        {/* Battle stats and HP bars */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          {/* Character 1 (Player) Stats */}
          <div className="bg-gray-800 bg-opacity-80 p-2 rounded">
            <div className="font-bold">{character1.Name}</div>
            <div className="w-32 bg-gray-700 h-3 rounded-full mt-1">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${character1HP}%` }}
              />
            </div>
          </div>
          
          {/* Character 2 (Opponent) Stats */}
          <div className="bg-gray-800 bg-opacity-80 p-2 rounded text-right">
            <div className="font-bold">{character2.Name}</div>
            <div className="w-32 bg-gray-700 h-3 rounded-full mt-1">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${character2HP}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Character sprites */}
        <div className="absolute bottom-10 left-10">
          <div className={`transition-transform duration-300 ${character1Position}`}>
            <img 
              src="/api/placeholder/150/200" 
              alt={character1.Name}
              className="h-40 object-contain"
            />
          </div>
        </div>
        
        <div className="absolute top-24 right-10">
          <div className={`transition-transform duration-300 ${character2Position}`}>
            <img 
              src="/api/placeholder/150/200" 
              alt={character2.Name}
              className="h-40 object-contain"
            />
          </div>
        </div>
        
        {/* Narrative text */}
        {narrative && (
          <div className="absolute bottom-24 left-0 right-0 mx-auto text-center">
            <div className="bg-gray-900 bg-opacity-80 p-3 rounded-lg inline-block max-w-lg">
              {narrative}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom 1/4 - Move Controls */}
      <div className="h-1/4 bg-gray-800 p-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Move buttons */}
          {['1', '2', '3', '4'].map((moveKey) => {
            const move = character1.Moves[`Move_${moveKey}`];
            return (
              <button
                key={moveKey}
                onClick={() => handleMoveClick(moveKey)}
                disabled={isAnimating}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-3 flex flex-col items-start transition-colors"
              >
                <span className="font-bold text-lg">{move.Move_name}</span>
                <div className="flex justify-between w-full mt-1">
                  <span className="text-sm text-gray-300">{move.Description}</span>
                  <span className="text-yellow-400 font-bold">DMG: {move.Damage}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;