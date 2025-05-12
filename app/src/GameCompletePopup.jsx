// src/GameCompletePopup.jsx
import React, { useEffect } from 'react';

export function GameCompletePopup({ score, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // auto-close after 3 seconds
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center animate-bounce">
        <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Game Complete!</h2>
        <p className="text-lg">Your final score: <span className="font-bold">{score}</span></p>
      </div>
    </div>
  );
}
