// index.jsx - Main entry point
import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import BattleScreen from './components/BattleScreen';
import VictoryScreen from './components/VictoryScreen';

const GameApp = () => {
  const [gameState, setGameState] = useState('start'); // start, loading, battle, victory
  const [topic, setTopic] = useState('');
  const [battleData, setBattleData] = useState(null);
  const [battleId, setBattleId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [winner, setWinner] = useState(null);
  const [character1HP, setCharacter1HP] = useState(100);
  const [character2HP, setCharacter2HP] = useState(100);
  const [narrative, setNarrative] = useState('');

  // Function to handle topic submission
  const handleSubmit = async (enteredTopic) => {
    setTopic(enteredTopic);
    setGameState('loading');
    
    try {
      // Make actual API call to backend
      const response = await fetch('/api/generate-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: enteredTopic })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Start polling for battle status
      if (data.battle_id) {
        setBattleId(data.battle_id);
        const interval = setInterval(checkBattleStatus, 2000); // Check every 2 seconds
        setPollingInterval(interval);
      } else {
        throw new Error('No battle ID received');
      }
    } catch (error) {
      console.error('Error generating battle:', error);
      setGameState('start'); // Go back to start on error
    }
  };
  
  // Function to check battle status
  const checkBattleStatus = async () => {
    if (!battleId) return;
    
    try {
      const response = await fetch(`/api/battle-status/${battleId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'completed') {
        // Battle generation completed
        clearInterval(pollingInterval);
        setPollingInterval(null);
        
        setBattleData(data.data);
        setCharacter1HP(100); // Reset HP values
        setCharacter2HP(100);
        setGameState('battle');
      } else if (data.status === 'failed') {
        // Battle generation failed
        clearInterval(pollingInterval);
        setPollingInterval(null);
        console.error('Battle generation failed:', data.error);
        setGameState('start');
      }
      // If still processing, continue polling
    } catch (error) {
      console.error('Error checking battle status:', error);
    }
  };

  // Clean up polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Function to handle move selection
  const handleMoveSelect = async (character, moveKey) => {
    if (!battleData) return;
    
    const attacker = character === 1 ? 'Character 1' : 'Character 2';
    const defender = character === 1 ? 'Character 2' : 'Character 1';
    const move = battleData[attacker]['Moves'][`Move_${moveKey}`];
    
    // Call API to generate narrative
    try {
      const response = await fetch('/api/generate-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attacker: battleData[attacker].Name,
          defender: battleData[defender].Name,
          move: move.Move_name,
          moveDescription: move.Description
        })
      });
      
      if (response.ok) {
        const narrativeData = await response.json();
        setNarrative(narrativeData.narrative);
      } else {
        // Fallback narrative if API call fails
        setNarrative(`${battleData[attacker].Name} used ${move.Move_name}!`);
      }
    } catch (error) {
      console.error('Error generating narrative:', error);
      setNarrative(`${battleData[attacker].Name} used ${move.Move_name}!`);
    }
    
    // Calculate damage as a percentage of total HP
    const maxHP = character === 1 ? 100 : 100;
    const damagePercent = (move.Damage / 150) * 30; // Scale damage (max 30% of health per attack)
    
    // Update HP
    if (character === 1) {
      const newHP = Math.max(0, character2HP - damagePercent);
      setCharacter2HP(newHP);
      if (newHP <= 0) {
        setTimeout(() => {
          setWinner('Character 1');
          setGameState('victory');
        }, 1000);
      }
    } else {
      const newHP = Math.max(0, character1HP - damagePercent);
      setCharacter1HP(newHP);
      if (newHP <= 0) {
        setTimeout(() => {
          setWinner('Character 2');
          setGameState('victory');
        }, 1000);
      }
    }
  };

  // Function to restart the game
  const handlePlayAgain = (newTopic) => {
    setGameState('start');
    setTopic('');
    setBattleData(null);
    setBattleId(null);
    setWinner(null);
    
    if (newTopic) {
      // If a new topic was provided, start a new battle
      handleSubmit(newTopic);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden">
      {gameState === 'start' && (
        <StartScreen onSubmit={handleSubmit} />
      )}
      
      {gameState === 'loading' && (
        <LoadingScreen topic={topic} />
      )}
      
      {gameState === 'battle' && battleData && (
        <BattleScreen 
          battleData={battleData}
          character1HP={character1HP}
          character2HP={character2HP}
          onMoveSelect={handleMoveSelect}
          narrative={narrative}
        />
      )}
      
      {gameState === 'victory' && (
        <VictoryScreen 
          winner={winner}
          battleData={battleData}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default GameApp;