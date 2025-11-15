import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export interface Vector2 {
  x: number;
  z: number;
}

export type EnemyType = 'circle' | 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  position: Vector2;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  reward: number;
  special?: {
    teleportCooldown?: number;
    lastTeleport?: number;
    splitOnDeath?: boolean;
    healAmount?: number;
    lastHeal?: number;
  };
}

export interface Pet {
  id: string;
  position: Vector2;
  damage: number;
  attackSpeed: number;
  targetEnemyId: string | null;
}

export interface Projectile {
  id: string;
  position: Vector2;
  direction: Vector2;
  speed: number;
  damage: number;
}

export interface Player {
  position: Vector2;
  targetPosition: Vector2 | null;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  color: string;
  attackSpeed: number;
  targetEnemyId: string | null;
  hasProjectiles: boolean;
  projectileCount: number;
  hasShield: boolean;
  shieldHealth: number;
  maxShieldHealth: number;
}

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  bonusType: 'damage' | 'health' | 'speed' | 'petSlots';
  bonusValue: number;
}

interface GameState {
  phase: 'menu' | 'playing' | 'dead' | 'skillTree';
  player: Player;
  enemies: Enemy[];
  pets: Pet[];
  projectiles: Projectile[];
  gold: number;
  deathCurrency: number;
  wave: number;
  enemiesKilled: number;
  autoAttackEnabled: boolean;
  maxPets: number;
  
  upgradeCosts: {
    damage: number;
    speed: number;
    health: number;
    pet: number;
    projectiles: number;
    shield: number;
  };
  
  skillTree: SkillTreeNode[];
  permanentBonuses: {
    damage: number;
    health: number;
    speed: number;
    petSlots: number;
  };
  
  nextEnemyId: number;
  nextPetId: number;
  nextProjectileId: number;
  lastWaveTime: number;
  lastProjectileTime: number;
  
  startGame: () => void;
  setPlayerColor: (color: string) => void;
  setPlayerTargetPosition: (position: Vector2) => void;
  toggleAutoAttack: () => void;
  updatePlayer: (deltaTime: number) => void;
  updateEnemies: (deltaTime: number) => void;
  updatePets: (deltaTime: number) => void;
  updateProjectiles: (deltaTime: number) => void;
  spawnEnemy: () => void;
  spawnProjectile: () => void;
  damageEnemy: (enemyId: string, damage: number) => void;
  damagePlayer: (damage: number) => void;
  buyUpgrade: (type: 'damage' | 'speed' | 'health' | 'pet' | 'projectiles' | 'shield') => void;
  purchaseSkill: (skillId: string) => void;
  respawn: () => void;
  returnToMenu: () => void;
  openSkillTree: () => void;
  reset: () => void;
}

const GRID_SIZE = 50;

const createInitialSkillTree = (): SkillTreeNode[] => [
  { id: 'dmg1', name: 'Power I', description: '+20% Damage', cost: 5, purchased: false, bonusType: 'damage', bonusValue: 0.2 },
  { id: 'dmg2', name: 'Power II', description: '+30% Damage', cost: 10, purchased: false, bonusType: 'damage', bonusValue: 0.3 },
  { id: 'dmg3', name: 'Power III', description: '+50% Damage', cost: 20, purchased: false, bonusType: 'damage', bonusValue: 0.5 },
  { id: 'dmg4', name: 'Power IV', description: '+75% Damage', cost: 40, purchased: false, bonusType: 'damage', bonusValue: 0.75 },
  { id: 'dmg5', name: 'Power V', description: '+100% Damage', cost: 75, purchased: false, bonusType: 'damage', bonusValue: 1 },
  
  { id: 'hp1', name: 'Vitality I', description: '+50 Max Health', cost: 5, purchased: false, bonusType: 'health', bonusValue: 50 },
  { id: 'hp2', name: 'Vitality II', description: '+100 Max Health', cost: 10, purchased: false, bonusType: 'health', bonusValue: 100 },
  { id: 'hp3', name: 'Vitality III', description: '+200 Max Health', cost: 20, purchased: false, bonusType: 'health', bonusValue: 200 },
  { id: 'hp4', name: 'Vitality IV', description: '+350 Max Health', cost: 40, purchased: false, bonusType: 'health', bonusValue: 350 },
  { id: 'hp5', name: 'Vitality V', description: '+500 Max Health', cost: 75, purchased: false, bonusType: 'health', bonusValue: 500 },
  
  { id: 'spd1', name: 'Swiftness I', description: '+20% Speed', cost: 5, purchased: false, bonusType: 'speed', bonusValue: 0.2 },
  { id: 'spd2', name: 'Swiftness II', description: '+30% Speed', cost: 10, purchased: false, bonusType: 'speed', bonusValue: 0.3 },
  { id: 'spd3', name: 'Swiftness III', description: '+50% Speed', cost: 20, purchased: false, bonusType: 'speed', bonusValue: 0.5 },
  { id: 'spd4', name: 'Swiftness IV', description: '+75% Speed', cost: 40, purchased: false, bonusType: 'speed', bonusValue: 0.75 },
  
  { id: 'pet1', name: 'Pet Mastery I', description: '+1 Pet Slot', cost: 15, purchased: false, bonusType: 'petSlots', bonusValue: 1 },
  { id: 'pet2', name: 'Pet Mastery II', description: '+2 Pet Slots', cost: 30, purchased: false, bonusType: 'petSlots', bonusValue: 2 },
  { id: 'pet3', name: 'Pet Mastery III', description: '+3 Pet Slots', cost: 60, purchased: false, bonusType: 'petSlots', bonusValue: 3 },
  { id: 'pet4', name: 'Pet Mastery IV', description: '+5 Pet Slots', cost: 100, purchased: false, bonusType: 'petSlots', bonusValue: 5 },
];

const loadProgress = () => {
  const saved = getLocalStorage('monsterGameProgress');
  if (saved) {
    return {
      deathCurrency: saved.deathCurrency || 0,
      skillTree: saved.skillTree || createInitialSkillTree(),
      permanentBonuses: saved.permanentBonuses || { damage: 0, health: 0, speed: 0, petSlots: 0 }
    };
  }
  return {
    deathCurrency: 0,
    skillTree: createInitialSkillTree(),
    permanentBonuses: { damage: 0, health: 0, speed: 0, petSlots: 0 }
  };
};

const saveProgress = (state: GameState) => {
  setLocalStorage('monsterGameProgress', {
    deathCurrency: state.deathCurrency,
    skillTree: state.skillTree,
    permanentBonuses: state.permanentBonuses
  });
};

export const useMonsterGame = create<GameState>()(
  subscribeWithSelector((set, get) => {
    const progress = loadProgress();
    
    return {
      phase: 'menu',
      player: {
        position: { x: 0, z: 0 },
        targetPosition: null,
        health: 100 + progress.permanentBonuses.health,
        maxHealth: 100 + progress.permanentBonuses.health,
        damage: 10 * (1 + progress.permanentBonuses.damage),
        speed: 5 * (1 + progress.permanentBonuses.speed),
        color: '#00ff88',
        attackSpeed: 1,
        targetEnemyId: null,
        hasProjectiles: false,
        projectileCount: 0,
        hasShield: false,
        shieldHealth: 0,
        maxShieldHealth: 0,
      },
      enemies: [],
      pets: [],
      projectiles: [],
      gold: 0,
      deathCurrency: progress.deathCurrency,
      wave: 1,
      enemiesKilled: 0,
      autoAttackEnabled: false,
      maxPets: 1 + progress.permanentBonuses.petSlots,
      
      upgradeCosts: {
        damage: 50,
        speed: 50,
        health: 50,
        pet: 100,
        projectiles: 150,
        shield: 200,
      },
      
      skillTree: progress.skillTree,
      permanentBonuses: progress.permanentBonuses,
      
      nextEnemyId: 1,
      nextPetId: 1,
      nextProjectileId: 1,
      lastWaveTime: 0,
      lastProjectileTime: 0,
      
      startGame: () => {
        const state = get();
        set({
          phase: 'playing',
          player: {
            position: { x: 0, z: 0 },
            targetPosition: null,
            health: 100 + state.permanentBonuses.health,
            maxHealth: 100 + state.permanentBonuses.health,
            damage: 10 * (1 + state.permanentBonuses.damage),
            speed: 5 * (1 + state.permanentBonuses.speed),
            color: state.player.color,
            attackSpeed: 1,
            targetEnemyId: null,
            hasProjectiles: false,
            projectileCount: 0,
            hasShield: false,
            shieldHealth: 0,
            maxShieldHealth: 0,
          },
          enemies: [],
          pets: [],
          projectiles: [],
          gold: 0,
          wave: 1,
          enemiesKilled: 0,
          autoAttackEnabled: false,
          upgradeCosts: {
            damage: 50,
            speed: 50,
            health: 50,
            pet: 100,
            projectiles: 150,
            shield: 200,
          },
          nextEnemyId: 1,
          nextPetId: 1,
          nextProjectileId: 1,
          lastWaveTime: Date.now(),
          lastProjectileTime: 0,
        });
      },
      
      setPlayerColor: (color: string) => {
        set((state) => ({
          player: { ...state.player, color }
        }));
      },
      
      setPlayerTargetPosition: (position: Vector2) => {
        set((state) => ({
          player: { ...state.player, targetPosition: position }
        }));
      },
      
      toggleAutoAttack: () => {
        set((state) => ({
          autoAttackEnabled: !state.autoAttackEnabled
        }));
      },
      
      updatePlayer: (deltaTime: number) => {
        const state = get();
        const player = state.player;
        
        if (player.targetPosition) {
          const dx = player.targetPosition.x - player.position.x;
          const dz = player.targetPosition.z - player.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance > 0.1) {
            const moveDistance = player.speed * deltaTime;
            if (moveDistance >= distance) {
              set({
                player: {
                  ...player,
                  position: player.targetPosition,
                  targetPosition: null
                }
              });
            } else {
              const ratio = moveDistance / distance;
              set({
                player: {
                  ...player,
                  position: {
                    x: player.position.x + dx * ratio,
                    z: player.position.z + dz * ratio,
                  }
                }
              });
            }
          } else {
            set({
              player: { ...player, targetPosition: null }
            });
          }
        }
        
        if (state.autoAttackEnabled && state.enemies.length > 0) {
          let nearestEnemyId: string | null = null;
          let nearestDistance = Infinity;
          
          state.enemies.forEach(enemy => {
            const dx = enemy.position.x - player.position.x;
            const dz = enemy.position.z - player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestEnemyId = enemy.id;
            }
          });
          
          if (nearestEnemyId && nearestDistance < 15) {
            if (state.player.targetEnemyId !== nearestEnemyId) {
              set({
                player: { ...state.player, targetEnemyId: nearestEnemyId }
              });
            }
            
            get().damageEnemy(nearestEnemyId, player.damage * deltaTime);
          }
        }
      },
      
      updateEnemies: (deltaTime: number) => {
        const state = get();
        const player = state.player;
        const currentTime = Date.now() / 1000;
        
        const updatedEnemies = state.enemies.map(enemy => {
          let updatedEnemy = { ...enemy };
          
          if (enemy.type === 'triangle' && enemy.special?.teleportCooldown) {
            const lastTeleport = enemy.special.lastTeleport || 0;
            if (currentTime - lastTeleport > enemy.special.teleportCooldown) {
              const angle = Math.random() * Math.PI * 2;
              const teleportDistance = 5;
              updatedEnemy = {
                ...updatedEnemy,
                position: {
                  x: player.position.x + Math.cos(angle) * teleportDistance,
                  z: player.position.z + Math.sin(angle) * teleportDistance,
                },
                special: { ...enemy.special, lastTeleport: currentTime }
              };
            }
          }
          
          if (enemy.type === 'boss' && enemy.special?.healAmount) {
            const lastHeal = enemy.special.lastHeal || 0;
            if (currentTime - lastHeal > 3 && enemy.health < enemy.maxHealth) {
              updatedEnemy = {
                ...updatedEnemy,
                health: Math.min(enemy.health + enemy.special.healAmount, enemy.maxHealth),
                special: { ...enemy.special, lastHeal: currentTime }
              };
            }
          }
          
          const dx = player.position.x - updatedEnemy.position.x;
          const dz = player.position.z - updatedEnemy.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance > 1) {
            const moveDistance = updatedEnemy.speed * deltaTime;
            const ratio = Math.min(moveDistance / distance, 1);
            return {
              ...updatedEnemy,
              position: {
                x: updatedEnemy.position.x + dx * ratio,
                z: updatedEnemy.position.z + dz * ratio,
              }
            };
          } else {
            get().damagePlayer(updatedEnemy.damage * deltaTime);
            return updatedEnemy;
          }
        });
        
        set({ enemies: updatedEnemies });
      },
      
      updatePets: (deltaTime: number) => {
        const state = get();
        const player = state.player;
        const pets = state.pets;
        
        const updatedPets = pets.map((pet, index) => {
          const angle = (index / pets.length) * Math.PI * 2;
          const orbitRadius = 2;
          const targetX = player.position.x + Math.cos(angle) * orbitRadius;
          const targetZ = player.position.z + Math.sin(angle) * orbitRadius;
          
          const dx = targetX - pet.position.x;
          const dz = targetZ - pet.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          let newPosition = pet.position;
          if (distance > 0.1) {
            const moveSpeed = player.speed * 1.2;
            const moveDistance = moveSpeed * deltaTime;
            const ratio = Math.min(moveDistance / distance, 1);
            newPosition = {
              x: pet.position.x + dx * ratio,
              z: pet.position.z + dz * ratio,
            };
          }
          
          if (state.enemies.length > 0) {
            let nearestEnemyId: string | null = null;
            let nearestDistance = Infinity;
            
            state.enemies.forEach(enemy => {
              const dx = enemy.position.x - newPosition.x;
              const dz = enemy.position.z - newPosition.z;
              const distance = Math.sqrt(dx * dx + dz * dz);
              
              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemyId = enemy.id;
              }
            });
            
            if (nearestEnemyId && nearestDistance < 12) {
              get().damageEnemy(nearestEnemyId, pet.damage * deltaTime);
              return {
                ...pet,
                position: newPosition,
                targetEnemyId: nearestEnemyId
              };
            }
          }
          
          return {
            ...pet,
            position: newPosition,
            targetEnemyId: null
          };
        });
        
        set({ pets: updatedPets });
      },
      
      spawnEnemy: () => {
        const state = get();
        const angle = Math.random() * Math.PI * 2;
        const spawnDistance = 25;
        
        const waveMultiplier = 1 + (state.wave - 1) * 0.15;
        const isSpecialWave = state.wave % 10 === 0;
        
        let enemyType: EnemyType = 'circle';
        let stats = {
          health: 30,
          speed: 2,
          damage: 5,
          reward: 10,
          special: undefined as Enemy['special']
        };
        
        if (isSpecialWave) {
          enemyType = 'boss';
          stats = {
            health: 200,
            speed: 1.5,
            damage: 15,
            reward: 100,
            special: { healAmount: 5, lastHeal: 0 }
          };
        } else if (state.wave >= 20) {
          const roll = Math.random();
          if (roll < 0.2) {
            enemyType = 'hexagon';
            stats = { health: 60, speed: 1, damage: 10, reward: 25, special: { splitOnDeath: true } };
          } else if (roll < 0.4) {
            enemyType = 'pentagon';
            stats = { health: 80, speed: 1.2, damage: 8, reward: 20, special: undefined };
          } else if (roll < 0.6) {
            enemyType = 'square';
            stats = { health: 100, speed: 0.8, damage: 12, reward: 30, special: undefined };
          } else if (roll < 0.8) {
            enemyType = 'triangle';
            stats = { health: 15, speed: 4, damage: 3, reward: 8, special: { teleportCooldown: 5, lastTeleport: 0 } };
          } else {
            enemyType = 'circle';
            stats = { health: 30, speed: 2, damage: 5, reward: 10, special: undefined };
          }
        } else if (state.wave >= 10) {
          const roll = Math.random();
          if (roll < 0.3) {
            enemyType = 'triangle';
            stats = { health: 15, speed: 4, damage: 3, reward: 8, special: { teleportCooldown: 5, lastTeleport: 0 } };
          } else if (roll < 0.6) {
            enemyType = 'square';
            stats = { health: 100, speed: 0.8, damage: 12, reward: 30, special: undefined };
          } else {
            enemyType = 'circle';
            stats = { health: 30, speed: 2, damage: 5, reward: 10, special: undefined };
          }
        } else if (state.wave >= 5) {
          enemyType = Math.random() < 0.3 ? 'triangle' : 'circle';
          if (enemyType === 'triangle') {
            stats = { health: 15, speed: 4, damage: 3, reward: 8, special: { teleportCooldown: 5, lastTeleport: 0 } };
          }
        }
        
        const enemy: Enemy = {
          id: `enemy-${state.nextEnemyId}`,
          type: enemyType,
          position: {
            x: Math.cos(angle) * spawnDistance,
            z: Math.sin(angle) * spawnDistance,
          },
          health: stats.health * waveMultiplier,
          maxHealth: stats.health * waveMultiplier,
          speed: stats.speed * Math.min(waveMultiplier * 0.5 + 0.5, 2),
          damage: stats.damage * waveMultiplier,
          reward: Math.floor(stats.reward * waveMultiplier),
          special: stats.special
        };
        
        set({
          enemies: [...state.enemies, enemy],
          nextEnemyId: state.nextEnemyId + 1,
        });
      },
      
      damageEnemy: (enemyId: string, damage: number) => {
        const state = get();
        const enemies = state.enemies.map(enemy => {
          if (enemy.id === enemyId) {
            const newHealth = enemy.health - damage;
            return { ...enemy, health: newHealth };
          }
          return enemy;
        });
        
        const deadEnemies = enemies.filter(e => e.health <= 0);
        const aliveEnemies = enemies.filter(e => e.health > 0);
        
        if (deadEnemies.length > 0) {
          const goldGained = deadEnemies.reduce((sum, e) => sum + e.reward, 0);
          set({
            enemies: aliveEnemies,
            gold: state.gold + goldGained,
            enemiesKilled: state.enemiesKilled + deadEnemies.length,
          });
        } else {
          set({ enemies });
        }
      },
      
      damagePlayer: (damage: number) => {
        const state = get();
        let remainingDamage = damage;
        let newPlayer = { ...state.player };
        
        if (newPlayer.hasShield && newPlayer.shieldHealth > 0) {
          if (newPlayer.shieldHealth >= remainingDamage) {
            newPlayer.shieldHealth -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newPlayer.shieldHealth;
            newPlayer.shieldHealth = 0;
          }
        }
        
        newPlayer.health -= remainingDamage;
        
        if (newPlayer.health <= 0) {
          const earnedCurrency = Math.floor(state.wave / 2);
          set({
            player: { ...newPlayer, health: 0 },
            phase: 'dead',
            deathCurrency: state.deathCurrency + earnedCurrency,
          });
          saveProgress({...state, deathCurrency: state.deathCurrency + earnedCurrency});
        } else {
          set({
            player: newPlayer
          });
        }
      },
      
      buyUpgrade: (type: 'damage' | 'speed' | 'health' | 'pet' | 'projectiles' | 'shield') => {
        const state = get();
        
        if (type === 'pet') {
          if (state.gold >= state.upgradeCosts.pet && state.pets.length < state.maxPets) {
            const newPet: Pet = {
              id: `pet-${state.nextPetId}`,
              position: { ...state.player.position },
              damage: 5,
              attackSpeed: 1,
              targetEnemyId: null,
            };
            
            set({
              pets: [...state.pets, newPet],
              gold: state.gold - state.upgradeCosts.pet,
              upgradeCosts: {
                ...state.upgradeCosts,
                pet: Math.floor(state.upgradeCosts.pet * 1.5),
              },
              nextPetId: state.nextPetId + 1,
            });
          }
        } else if (type === 'projectiles') {
          if (state.gold >= state.upgradeCosts.projectiles) {
            set({
              player: { ...state.player, hasProjectiles: true, projectileCount: state.player.projectileCount + 1 },
              gold: state.gold - state.upgradeCosts.projectiles,
              upgradeCosts: {
                ...state.upgradeCosts,
                projectiles: Math.floor(state.upgradeCosts.projectiles * 1.8),
              },
            });
          }
        } else if (type === 'shield') {
          if (state.gold >= state.upgradeCosts.shield) {
            set({
              player: { 
                ...state.player, 
                hasShield: true, 
                shieldHealth: 100,
                maxShieldHealth: 100
              },
              gold: state.gold - state.upgradeCosts.shield,
              upgradeCosts: {
                ...state.upgradeCosts,
                shield: Math.floor(state.upgradeCosts.shield * 2),
              },
            });
          }
        } else {
          const cost = state.upgradeCosts[type];
          if (state.gold >= cost) {
            let newPlayer = { ...state.player };
            let newCosts = { ...state.upgradeCosts };
            
            if (type === 'damage') {
              newPlayer.damage *= 1.2;
              newCosts.damage = Math.floor(cost * 1.5);
            } else if (type === 'speed') {
              newPlayer.speed *= 1.2;
              newCosts.speed = Math.floor(cost * 1.5);
            } else if (type === 'health') {
              const healthIncrease = 50;
              newPlayer.maxHealth += healthIncrease;
              newPlayer.health += healthIncrease;
              newCosts.health = Math.floor(cost * 1.5);
            }
            
            set({
              player: newPlayer,
              gold: state.gold - cost,
              upgradeCosts: newCosts,
            });
          }
        }
      },
      
      purchaseSkill: (skillId: string) => {
        const state = get();
        const skill = state.skillTree.find(s => s.id === skillId);
        
        if (skill && !skill.purchased && state.deathCurrency >= skill.cost) {
          const updatedSkillTree = state.skillTree.map(s => 
            s.id === skillId ? { ...s, purchased: true } : s
          );
          
          const newBonuses = { ...state.permanentBonuses };
          if (skill.bonusType === 'damage') {
            newBonuses.damage += skill.bonusValue;
          } else if (skill.bonusType === 'health') {
            newBonuses.health += skill.bonusValue;
          } else if (skill.bonusType === 'speed') {
            newBonuses.speed += skill.bonusValue;
          } else if (skill.bonusType === 'petSlots') {
            newBonuses.petSlots += skill.bonusValue;
          }
          
          set({
            skillTree: updatedSkillTree,
            permanentBonuses: newBonuses,
            deathCurrency: state.deathCurrency - skill.cost,
            maxPets: 1 + newBonuses.petSlots,
          });
          
          saveProgress({
            ...state,
            skillTree: updatedSkillTree,
            permanentBonuses: newBonuses,
            deathCurrency: state.deathCurrency - skill.cost,
          });
        }
      },
      
      respawn: () => {
        get().startGame();
      },
      
      returnToMenu: () => {
        set({ phase: 'menu' });
      },
      
      openSkillTree: () => {
        set({ phase: 'skillTree' });
      },
      
      updateProjectiles: (deltaTime: number) => {
        const state = get();
        const updatedProjectiles = state.projectiles.filter(proj => {
          const newX = proj.position.x + proj.direction.x * proj.speed * deltaTime;
          const newZ = proj.position.z + proj.direction.z * proj.speed * deltaTime;
          
          const distance = Math.sqrt(newX * newX + newZ * newZ);
          if (distance > 50) return false;
          
          for (const enemy of state.enemies) {
            const dx = enemy.position.x - newX;
            const dz = enemy.position.z - newZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 1) {
              get().damageEnemy(enemy.id, proj.damage);
              return false;
            }
          }
          
          return true;
        }).map(proj => ({
          ...proj,
          position: {
            x: proj.position.x + proj.direction.x * proj.speed * deltaTime,
            z: proj.position.z + proj.direction.z * proj.speed * deltaTime,
          }
        }));
        
        set({ projectiles: updatedProjectiles });
      },
      
      spawnProjectile: () => {
        const state = get();
        if (!state.player.hasProjectiles || state.enemies.length === 0) return;
        
        const nearestEnemy = state.enemies.reduce((nearest, enemy) => {
          const dx = enemy.position.x - state.player.position.x;
          const dz = enemy.position.z - state.player.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (!nearest) return { enemy, dist };
          return dist < nearest.dist ? { enemy, dist } : nearest;
        }, null as { enemy: Enemy, dist: number } | null);
        
        if (nearestEnemy) {
          const dx = nearestEnemy.enemy.position.x - state.player.position.x;
          const dz = nearestEnemy.enemy.position.z - state.player.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          const projectile: Projectile = {
            id: `proj-${state.nextProjectileId}`,
            position: { ...state.player.position },
            direction: { x: dx / dist, z: dz / dist },
            speed: 20,
            damage: state.player.damage * 0.5,
          };
          
          set({
            projectiles: [...state.projectiles, projectile],
            nextProjectileId: state.nextProjectileId + 1,
          });
        }
      },
      
      reset: () => {
        set({
          phase: 'menu',
          enemies: [],
          pets: [],
          projectiles: [],
          gold: 0,
          wave: 1,
          enemiesKilled: 0,
        });
      },
    };
  })
);
