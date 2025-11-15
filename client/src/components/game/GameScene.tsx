import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Pet } from './Pet';
import { Projectile } from './Projectile';
import { Shield } from './Shield';
import { GridPlane } from './GridPlane';

export function GameScene() {
  const { camera, gl } = useThree();
  const player = useMonsterGame((state) => state.player);
  const enemies = useMonsterGame((state) => state.enemies);
  const pets = useMonsterGame((state) => state.pets);
  const projectiles = useMonsterGame((state) => state.projectiles);
  const wave = useMonsterGame((state) => state.wave);
  const phase = useMonsterGame((state) => state.phase);
  const setPlayerTargetPosition = useMonsterGame((state) => state.setPlayerTargetPosition);
  const updatePlayer = useMonsterGame((state) => state.updatePlayer);
  const updateEnemies = useMonsterGame((state) => state.updateEnemies);
  const updatePets = useMonsterGame((state) => state.updatePets);
  const updateProjectiles = useMonsterGame((state) => state.updateProjectiles);
  const spawnEnemy = useMonsterGame((state) => state.spawnEnemy);
  const spawnProjectile = useMonsterGame((state) => state.spawnProjectile);
  
  const lastSpawnTime = useRef(0);
  const lastWaveCheck = useRef(0);
  const lastProjectileTime = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (phase !== 'playing') return;
      
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.current.setFromCamera(mouse.current, camera);
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(plane, target);
      
      if (target) {
        const maxDistance = 45;
        const distance = Math.sqrt(target.x * target.x + target.z * target.z);
        if (distance <= maxDistance) {
          setPlayerTargetPosition({ x: target.x, z: target.z });
        }
      }
    };
    
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, phase, setPlayerTargetPosition]);
  
  useFrame((state, delta) => {
    if (phase !== 'playing') return;
    
    updatePlayer(delta);
    updateEnemies(delta);
    updatePets(delta);
    updateProjectiles(delta);
    
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 20;
    camera.position.y = 15;
    camera.lookAt(player.position.x, 0, player.position.z);
    
    const currentTime = state.clock.elapsedTime;
    const spawnInterval = Math.max(0.5, 2 - wave * 0.05);
    
    if (currentTime - lastSpawnTime.current > spawnInterval) {
      const enemiesThisSpawn = wave % 10 === 0 ? 3 : 1;
      for (let i = 0; i < enemiesThisSpawn; i++) {
        spawnEnemy();
      }
      lastSpawnTime.current = currentTime;
    }
    
    if (player.hasProjectiles && currentTime - lastProjectileTime.current > 0.5) {
      spawnProjectile();
      lastProjectileTime.current = currentTime;
    }
    
    if (currentTime - lastWaveCheck.current > 10) {
      useMonsterGame.setState((state) => ({ wave: state.wave + 1 }));
      lastWaveCheck.current = currentTime;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      <GridPlane />
      <Player />
      
      {player.hasShield && player.shieldHealth > 0 && (
        <Shield 
          playerPosition={player.position} 
          shieldHealth={player.shieldHealth}
          maxShieldHealth={player.maxShieldHealth}
        />
      )}
      
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      
      {pets.map((pet) => (
        <Pet key={pet.id} pet={pet} />
      ))}
      
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}
    </>
  );
}
