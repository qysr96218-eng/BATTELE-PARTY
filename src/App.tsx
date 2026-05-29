/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Lobby from './components/Lobby';
import GameCanvas from './components/GameCanvas';
import { GameSettings, Platform } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'game'>('lobby');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    initialBotCount: 30,
    difficulty: 'medium',
  });
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('PS5');
  const [selectedSkinId, setSelectedSkinId] = useState('recruit');
  const [playerName, setPlayerName] = useState('اللاعب_المحترف');
  const [soundMuted, setSoundMuted] = useState(false);

  const handleStartGame = (settings: GameSettings, platform: Platform, skinId: string, name: string) => {
    setGameSettings(settings);
    setSelectedPlatform(platform);
    setSelectedSkinId(skinId);
    setPlayerName(name);
    setActiveScreen('game');
  };

  const handleExitGame = () => {
    setActiveScreen('lobby');
  };

  const handleToggleSound = () => {
    setSoundMuted(prev => !prev);
  };

  return (
    <div className="w-full min-h-screen bg-indigo-950 text-slate-100 selection:bg-yellow-400 selection:text-slate-950">
      {activeScreen === 'lobby' ? (
        <Lobby
          onStartGame={handleStartGame}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
        />
      ) : (
        <GameCanvas
          settings={gameSettings}
          selectedPlatform={selectedPlatform}
          selectedSkinId={selectedSkinId}
          playerName={playerName}
          onExitGame={handleExitGame}
        />
      )}
    </div>
  );
}

