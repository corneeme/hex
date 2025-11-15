import { Button } from './button';
import { Card } from './card';
import { Progress } from './progress';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';
import { Shield, Zap, Heart, User } from 'lucide-react';

export function GameHUD() {
  const player = useMonsterGame((state) => state.player);
  const gold = useMonsterGame((state) => state.gold);
  const wave = useMonsterGame((state) => state.wave);
  const enemiesKilled = useMonsterGame((state) => state.enemiesKilled);
  const autoAttackEnabled = useMonsterGame((state) => state.autoAttackEnabled);
  const toggleAutoAttack = useMonsterGame((state) => state.toggleAutoAttack);
  const buyUpgrade = useMonsterGame((state) => state.buyUpgrade);
  const upgradeCosts = useMonsterGame((state) => state.upgradeCosts);
  const pets = useMonsterGame((state) => state.pets);
  const maxPets = useMonsterGame((state) => state.maxPets);
  
  const healthPercent = (player.health / player.maxHealth) * 100;
  const isSpecialWave = wave % 10 === 0;
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="p-4 space-y-4 pointer-events-auto">
        <Card className="bg-black/70 border-gray-700 backdrop-blur-sm">
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${isSpecialWave ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  Wave {wave} {isSpecialWave && '⚠️'}
                </div>
                <div className="text-sm text-gray-400">Kills: {enemiesKilled}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-500">💰 {gold}</div>
                <div className="text-xs text-gray-400">Gold</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Health</span>
                <span className="text-white">{Math.floor(player.health)}/{Math.floor(player.maxHealth)}</span>
              </div>
              <Progress value={healthPercent} className="h-3" />
            </div>
            
            <Button
              onClick={toggleAutoAttack}
              className={`w-full ${
                autoAttackEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {autoAttackEnabled ? '🗡️ Auto-Attack: ON' : '⚔️ Auto-Attack: OFF'}
            </Button>
          </div>
        </Card>
        
        <Card className="bg-black/70 border-gray-700 backdrop-blur-sm">
          <div className="p-4">
            <div className="text-lg font-bold text-white mb-3">Upgrades</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => buyUpgrade('damage')}
                disabled={gold < upgradeCosts.damage}
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-950 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 mr-1" />
                Damage
                <div className="text-xs ml-1">({upgradeCosts.damage}g)</div>
              </Button>
              
              <Button
                onClick={() => buyUpgrade('speed')}
                disabled={gold < upgradeCosts.speed}
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-950 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 mr-1" />
                Speed
                <div className="text-xs ml-1">({upgradeCosts.speed}g)</div>
              </Button>
              
              <Button
                onClick={() => buyUpgrade('health')}
                disabled={gold < upgradeCosts.health}
                size="sm"
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-950 disabled:opacity-50"
              >
                <Heart className="w-4 h-4 mr-1" />
                Health
                <div className="text-xs ml-1">({upgradeCosts.health}g)</div>
              </Button>
              
              <Button
                onClick={() => buyUpgrade('pet')}
                disabled={gold < upgradeCosts.pet || pets.length >= maxPets}
                size="sm"
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-950 disabled:opacity-50"
              >
                <User className="w-4 h-4 mr-1" />
                Pet ({pets.length}/{maxPets})
                <div className="text-xs ml-1">({upgradeCosts.pet}g)</div>
              </Button>
              
              <Button
                onClick={() => buyUpgrade('projectiles')}
                disabled={gold < upgradeCosts.projectiles}
                size="sm"
                variant="outline"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-950 disabled:opacity-50"
              >
                🎯 Projectiles
                <div className="text-xs ml-1">({upgradeCosts.projectiles}g)</div>
              </Button>
              
              <Button
                onClick={() => buyUpgrade('shield')}
                disabled={gold < upgradeCosts.shield || player.hasShield}
                size="sm"
                variant="outline"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-950 disabled:opacity-50"
              >
                <Shield className="w-4 h-4 mr-1" />
                Shield
                <div className="text-xs ml-1">({upgradeCosts.shield}g)</div>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
