import { Suspense, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Html } from '@react-three/drei';
import { STLLoader, AMFLoader, ThreeMFLoader } from 'three-stdlib';
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
function Model({ url, format, color }: { url: string, format: string, color?: string }) {
  let loader;
  switch (format) {
    case 'amf':
      loader = AMFLoader;
      break;
    case '3mf':
      loader = ThreeMFLoader;
      break;
    default:
      loader = STLLoader;
      break;
  }
  const geom = useLoader(loader, url);

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={color || 'orange'} vertexColors={!color} />
    </mesh>
  );
}

interface ViewerProps {
  stl: string | null;
  format: string;
  color?: string;
}

export default function Viewer({ stl, format, color }: ViewerProps) {
  // Create a data URL from the base64 STL string
  const dataUrl = stl ? `data:application/octet-stream;base64,${stl}` : null;

  return (
    <Canvas style={{ height: '100%', width: '100%' }} camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <Suspense fallback={<SlowLoadFallback />}>
        <Center>
          {dataUrl && <Model url={dataUrl} format={format} color={color} />}
        </Center>
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
