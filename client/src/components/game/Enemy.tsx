import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Enemy as EnemyType } from '@/lib/stores/useMonsterGame';

interface EnemyProps {
  enemy: EnemyType;
}

export function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  
  const healthPercent = enemy.health / enemy.maxHealth;
  
  const geometry = useMemo(() => {
    switch (enemy.type) {
      case 'triangle':
        return <coneGeometry args={[0.5, 0.6, 3]} />;
      case 'square':
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case 'pentagon':
        return <cylinderGeometry args={[0.6, 0.6, 0.4, 5]} />;
      case 'hexagon':
        return <cylinderGeometry args={[0.6, 0.6, 0.4, 6]} />;
      case 'boss':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'circle':
      default:
        return <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />;
    }
  }, [enemy.type]);
  
  const color = useMemo(() => {
    switch (enemy.type) {
      case 'triangle':
        return '#ff4444';
      case 'square':
        return '#aa0000';
      case 'pentagon':
        return '#ff6600';
      case 'hexagon':
        return '#cc00cc';
      case 'boss':
        return '#8800ff';
      case 'circle':
      default:
        return '#ff0000';
    }
  }, [enemy.type]);
  
  const scale = useMemo(() => enemy.type === 'boss' ? 1.5 : 1, [enemy.type]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = enemy.position.x;
      meshRef.current.position.z = enemy.position.z;
      
      if (enemy.type === 'boss') {
        meshRef.current.rotation.y = state.clock.elapsedTime;
        meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      } else {
        meshRef.current.position.y = 0.3;
      }
    }
    
    if (healthBarRef.current) {
      healthBarRef.current.scale.x = Math.max(0, healthPercent);
    }
  });
  
  const yPos = enemy.type === 'boss' ? 2 : 1.2;
  
  return (
    <group>
      <mesh ref={meshRef} scale={scale} castShadow>
        {geometry}
        <meshStandardMaterial 
          color={color}
          emissive={enemy.type === 'boss' ? '#440088' : '#000000'}
          emissiveIntensity={enemy.type === 'boss' ? 0.3 : 0}
        />
      </mesh>
      
      <mesh position={[enemy.position.x, yPos, enemy.position.z]}>
        <boxGeometry args={[1, 0.1, 0.05]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      <mesh ref={healthBarRef} position={[enemy.position.x, yPos, enemy.position.z]}>
        <boxGeometry args={[1, 0.1, 0.05]} />
        <meshBasicMaterial color={enemy.type === 'boss' ? '#ff00ff' : '#00ff00'} />
      </mesh>
    </group>
  );
}
