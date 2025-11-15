import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Projectile as ProjectileType } from '@/lib/stores/useMonsterGame';

interface ProjectileProps {
  projectile: ProjectileType;
}

export function Projectile({ projectile }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = projectile.position.x;
      meshRef.current.position.z = projectile.position.z;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
    </mesh>
  );
}
