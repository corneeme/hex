import { useMemo } from 'react';
import * as THREE from 'three';

export function GridPlane() {
  const gridHelper = useMemo(() => {
    return new THREE.GridHelper(100, 50, '#555555', '#333333');
  }, []);
  
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <primitive object={gridHelper} position={[0, 0.01, 0]} />
    </>
  );
}
