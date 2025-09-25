import { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Html } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import toast from 'react-hot-toast';

// Fallback component that shows a toast only if loading is slow
function SlowLoadFallback() {
  useEffect(() => {
    const timer = setTimeout(() => {
      toast('Rendering is taking a while...');
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  return <Html center>Loading Preview...</Html>;
}

// Model component now uses useLoader for async parsing
function Model({ url }: { url: string }) {
  const geom = useLoader(STLLoader, url);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color="#61dafb" />
    </mesh>
  );
}

interface ViewerProps {
  stl: string | null;
}

export default function Viewer({ stl }: ViewerProps) {
  // Create a data URL from the base64 STL string
  const stlDataUrl = stl ? `data:application/octet-stream;base64,${stl}` : null;

  return (
    <Canvas style={{ height: '100%', width: '100%' }} camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Suspense fallback={<SlowLoadFallback />}>
        <Center>
          {stlDataUrl && <Model url={stlDataUrl} />}
        </Center>
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
