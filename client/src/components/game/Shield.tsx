import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShieldProps {
  playerPosition: { x: number; z: number };
  shieldHealth: number;
  maxShieldHealth: number;
}

export function Shield({ playerPosition, shieldHealth, maxShieldHealth }: ShieldProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const opacity = (shieldHealth / maxShieldHealth) * 0.4 + 0.1;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = playerPosition.x;
      meshRef.current.position.z = playerPosition.z;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshStandardMaterial 
        color="#0088ff"
        emissive="#0088ff"
        emissiveIntensity={0.3}
        transparent
        opacity={opacity}
        wireframe
      />
    </mesh>
  );
}
