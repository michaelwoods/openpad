import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, useGLTF } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

interface ModelProps {
  stlBase64: string;
}

function Model({ stlBase64 }: ModelProps) {
  const geometry = useMemo(() => {
    if (!stlBase64) return null;
    const decoded = atob(stlBase64);
    const loader = new STLLoader();
    return loader.parse(decoded);
  }, [stlBase64]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#61dafb" />
    </mesh>
  );
}

interface ViewerProps {
  stl: string | null;
}

export default function Viewer({ stl }: ViewerProps) {
  return (
    <Canvas style={{ height: '100%', width: '100%' }} camera={{ position: [2, 2, 2], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        <Center>
          {stl && <Model stlBase64={stl} />}
        </Center>
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
