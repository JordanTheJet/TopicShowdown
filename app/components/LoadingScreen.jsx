// components/LoadingScreen.jsx - Updated with real-time progress
import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ topic }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Searching for champions...');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const loadingMessages = [
    'Searching for champions...',
    'Finding the perfect match...',
    'Analyzing their strengths...',
    'Creating move sets...',
    'Determining battle stats...',
    'Setting the battlefield...',
    'The battle is cooking...',
    'Almost ready...',
    'Finalizing the details...',
  ];

  useEffect(() => {
    const totalDuration = 60000; // 60 seconds in milliseconds
    const interval = 50; // Update every 50ms for smooth animation
    
    const progressTimer = setInterval(() => {
      setElapsedTime(prev => {
        const newElapsed = prev + interval;
        // Calculate progress as a percentage of total duration
        const newProgress = Math.min(99, (newElapsed / totalDuration) * 100);
        setProgress(newProgress);
        return newElapsed;
      });
    }, interval);
    
    // Update message based on progress
    const messageTimer = setInterval(() => {
      const messageIndex = Math.min(
        Math.floor((progress / 100) * loadingMessages.length),
        loadingMessages.length - 1
      );
      setMessage(loadingMessages[messageIndex]);
    }, 4000); // Change message every 4 seconds
    
    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, []);

  // Calculate a pulsing animation effect
  const pulseAnimation = {
    opacity: 0.7 + Math.sin(elapsedTime / 300) * 0.3,
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-2">Creating Your Battle</h2>
        <p className="text-xl mb-8">Topic: <span className="text-primary font-semibold">{topic}</span></p>
        
        <div className="mb-8">
          <div className="mb-2" style={pulseAnimation}>
            <span className="text-2xl">{message}</span>
          </div>
          
          {/* Pokemon-style loading animation */}
          <div className="flex justify-center my-8">
            <div className="relative w-24 h-24">
              {/* Pokeball animation */}
              <div className="absolute w-full h-full rounded-full bg-white animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-full bg-primary"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-gray-800 z-10"></div>
              <div className="absolute w-full h-full border-4 border-gray-800 rounded-full"></div>
              <div className="absolute w-full h-full rounded-full animate-spin" style={{ animationDuration: '2s', border: '2px dotted rgba(255,255,255,0.3)' }}></div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden mb-2">
          <div 
            className="bg-primary h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-gray-400">Please wait while we generate your battle...</p>
        
        {/* Estimated time remaining */}
        <p className="text-sm text-gray-500 mt-4">
          Estimated time remaining: {Math.max(0, Math.ceil(60 - elapsedTime / 1000))} seconds
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;