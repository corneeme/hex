import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMonsterGame } from '@/lib/stores/useMonsterGame';

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const player = useMonsterGame((state) => state.player);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = player.position.x;
      meshRef.current.position.z = player.position.z;
      
      if (player.targetPosition) {
        const dx = player.targetPosition.x - player.position.x;
        const dz = player.targetPosition.z - player.position.z;
        const angle = Math.atan2(dx, dz);
        meshRef.current.rotation.y = angle;
      }
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.5, 6]} />
      <meshStandardMaterial color={player.color} />
    </mesh>
  );
}
