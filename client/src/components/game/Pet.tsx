import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Pet as PetType } from '@/lib/stores/useMonsterGame';

interface PetProps {
  pet: PetType;
}

export function Pet({ pet }: PetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = pet.position.x;
      meshRef.current.position.z = pet.position.z;
      meshRef.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#4444ff" />
    </mesh>
  );
}
