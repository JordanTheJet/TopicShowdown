// app/page.jsx - Main entry point with API integration
'use client';

import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import LoadingScreen from './components/LoadingScreen';
import BattleScreen from './components/BattleScreen';
import VictoryScreen from './components/VictoryScreen';
import { generateBattle, generateMoveNarrative } from './api/battleApi';

export default function Home() {
  const [gameState, setGameState] = useState('start'); // start, loading, battle, victory
  const [topic, setTopic] = useState('');
  const [battleData, setBattleData] = useState(null);
  const [battleId, setBattleId] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [winner, setWinner] = useState(null);
  const [character1HP, setCharacter1HP] = useState(100);
  const [character2HP, setCharacter2HP] = useState(100);

  // Function to handle topic submission
  const handleSubmit = async (enteredTopic) => {
    setTopic(enteredTopic);
    setGameState('loading');
    
    try {
      // Start battle generation
      const response = await generateBattle(enteredTopic);
      setBattleId(response.battle_id);
      
      // Start polling for battle status
      const interval = setInterval(checkBattleStatus, 2000);
      setPollingInterval(interval);
    } catch (error) {
      console.error('Error starting battle generation:', error);
      setGameState('start');
    }
  };
  
  // Function to check battle status
  const checkBattleStatus = async () => {
    if (!battleId) return;
    
    try {
      const response = await fetch(`/api/battle-status/${battleId}`);
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
    
    // Generate narrative for the move
    try {
      const narrativeData = await generateMoveNarrative({
        attacker: battleData[attacker].Name,
        defender: battleData[defender].Name,
        move: move.Move_name,
        moveDescription: move.Description
      });
      
      // The narrative would be used in the BattleScreen component
    } catch (error) {
      console.error('Error generating narrative:', error);
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
}