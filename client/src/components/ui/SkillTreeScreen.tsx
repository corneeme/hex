import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';
import { Check, Lock } from 'lucide-react';

export function SkillTreeScreen() {
  const skillTree = useMonsterGame((state) => state.skillTree);
  const deathCurrency = useMonsterGame((state) => state.deathCurrency);
  const purchaseSkill = useMonsterGame((state) => state.purchaseSkill);
  const returnToMenu = useMonsterGame((state) => state.returnToMenu);
  const phase = useMonsterGame((state) => state.phase);
  const respawn = useMonsterGame((state) => state.respawn);
  
  const damageSkills = skillTree.filter(s => s.bonusType === 'damage');
  const healthSkills = skillTree.filter(s => s.bonusType === 'health');
  const speedSkills = skillTree.filter(s => s.bonusType === 'speed');
  const petSkills = skillTree.filter(s => s.bonusType === 'petSlots');
  
  const renderSkills = (skills: typeof skillTree, color: string) => (
    <div className="space-y-2">
      {skills.map((skill) => {
        const canPurchase = !skill.purchased && deathCurrency >= skill.cost;
        
        return (
          <div
            key={skill.id}
            className={`p-3 rounded-lg border-2 ${
              skill.purchased
                ? 'bg-gray-800 border-green-600'
                : canPurchase
                ? `bg-gray-900 border-${color}-600`
                : 'bg-gray-900 border-gray-700 opacity-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  {skill.name}
                  {skill.purchased && <Check className="w-4 h-4 text-green-500" />}
                  {!skill.purchased && !canPurchase && <Lock className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="text-sm text-gray-400">{skill.description}</div>
              </div>
              <div className={`text-sm font-bold ${skill.purchased ? 'text-green-500' : 'text-purple-400'}`}>
                {skill.purchased ? 'Owned' : `${skill.cost} pts`}
              </div>
            </div>
            {!skill.purchased && (
              <Button
                onClick={() => purchaseSkill(skill.id)}
                disabled={!canPurchase}
                size="sm"
                className={`w-full bg-${color}-600 hover:bg-${color}-700 disabled:opacity-50`}
              >
                Purchase
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-4xl bg-gray-900 border-purple-900 my-4">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-purple-400">Skill Tree</CardTitle>
          <CardDescription className="text-gray-400">
            Permanent upgrades • {deathCurrency} Death Currency Available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-3">⚔️ Damage</h3>
              {renderSkills(damageSkills, 'red')}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">❤️ Health</h3>
              {renderSkills(healthSkills, 'green')}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-3">⚡ Speed</h3>
              {renderSkills(speedSkills, 'blue')}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-3">🐾 Pets</h3>
              {renderSkills(petSkills, 'purple')}
            </div>
          </div>
          
          <div className="flex gap-3">
            {phase === 'dead' && (
              <Button
                onClick={respawn}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Respawn
              </Button>
            )}
            <Button
              onClick={returnToMenu}
              size="lg"
              variant="outline"
              className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              {phase === 'dead' ? 'Main Menu' : 'Back'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
