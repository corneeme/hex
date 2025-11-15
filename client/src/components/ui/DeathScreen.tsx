import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';

export function DeathScreen() {
  const wave = useMonsterGame((state) => state.wave);
  const enemiesKilled = useMonsterGame((state) => state.enemiesKilled);
  const deathCurrency = useMonsterGame((state) => state.deathCurrency);
  const respawn = useMonsterGame((state) => state.respawn);
  const openSkillTree = useMonsterGame((state) => state.openSkillTree);
  const returnToMenu = useMonsterGame((state) => state.returnToMenu);
  
  const earnedCurrency = Math.floor(wave / 2);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <Card className="w-full max-w-md mx-4 bg-gray-900 border-red-900">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-red-500">You Died</CardTitle>
          <CardDescription className="text-gray-400">But your journey continues...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-white">
              <span>Wave Reached:</span>
              <span className="font-bold">{wave}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Enemies Killed:</span>
              <span className="font-bold">{enemiesKilled}</span>
            </div>
            <div className="h-px bg-gray-700 my-2" />
            <div className="flex justify-between text-purple-400">
              <span>Death Currency Earned:</span>
              <span className="font-bold">+{earnedCurrency}</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Total Death Currency:</span>
              <span className="font-bold">{deathCurrency}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={respawn}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg"
            >
              Respawn
            </Button>
            
            <Button
              onClick={openSkillTree}
              size="lg"
              variant="outline"
              className="w-full border-purple-600 text-purple-400 hover:bg-purple-950"
            >
              Upgrade Skills ({deathCurrency} Points)
            </Button>
            
            <Button
              onClick={returnToMenu}
              size="lg"
              variant="outline"
              className="w-full border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Main Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
