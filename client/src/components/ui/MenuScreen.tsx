import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';

export function MenuScreen() {
  const startGame = useMonsterGame((state) => state.startGame);
  const openSkillTree = useMonsterGame((state) => state.openSkillTree);
  const setPlayerColor = useMonsterGame((state) => state.setPlayerColor);
  const playerColor = useMonsterGame((state) => state.player.color);
  const deathCurrency = useMonsterGame((state) => state.deathCurrency);
  
  const colors = ['#00ff88', '#ff0088', '#0088ff', '#ffaa00', '#aa00ff', '#00ffff'];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-white">Monster Hunter</CardTitle>
          <CardDescription className="text-gray-400">Survive endless waves of enemies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Choose Your Color</label>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setPlayerColor(color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    playerColor === color ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={startGame}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg"
            >
              Start Game
            </Button>
            
            <Button
              onClick={openSkillTree}
              size="lg"
              variant="outline"
              className="w-full border-purple-600 text-purple-400 hover:bg-purple-950"
            >
              Skill Tree ({deathCurrency} Points)
            </Button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm text-gray-300">
            <p><strong className="text-white">Controls:</strong></p>
            <p>• Click to move</p>
            <p>• Toggle auto-attack to fight automatically</p>
            <p>• Earn gold to buy upgrades and pets</p>
            <p>• Earn death currency to unlock permanent upgrades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
