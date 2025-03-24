// components/StartScreen.jsx
import React, { useState } from 'react';

const StartScreen = ({ onSubmit }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-6">Battle Generator</h1>
        <h2 className="text-2xl mb-12">Create epic battles on any topic!</h2>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="topic" className="text-xl font-semibold">Enter your topic here!</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., rappers in 2025, anime heroes, video game bosses"
                className="p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary focus:outline-none"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-primary hover:bg-red-700 transition-colors text-white font-bold py-3 px-6 rounded-lg text-xl"
            >
              Let's Battle!
            </button>
          </form>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>Choose any topic and we'll create a battle between two characters!</p>
            <p className="mt-2">The more specific your topic, the more interesting the battle.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;