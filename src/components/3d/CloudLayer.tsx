import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store';

interface CloudData {
  baseX: number;
  baseZ: number;
  y: number;
  spheres: { ox: number; oz: number; scale: number }[];
}

function CloudLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { forecast, forecastTimeIndex } = useAppStore();

  const slot = forecast?.slots[forecastTimeIndex];
  const cloudCover = slot?.cloudCover ?? 50;
  const windDir = slot?.windDirection ?? 0;

  const opacity = useMemo(() => {
    return 0.3 + (cloudCover / 100) * 0.4;
  }, [cloudCover]);

  const { clouds, totalInstances } = useMemo(() => {
    const result: CloudData[] = [];
    let total = 0;
    for (let i = 0; i < 15; i++) {
      const baseX = (Math.random() - 0.5) * 160;
      const baseZ = (Math.random() - 0.5) * 160;
      const y = 25 + Math.random() * 15;
      const sphereCount = 3 + Math.floor(Math.random() * 3);
      const spheres: { ox: number; oz: number; scale: number }[] = [];
      for (let j = 0; j < sphereCount; j++) {
        spheres.push({
          ox: (Math.random() - 0.5) * 6,
          oz: (Math.random() - 0.5) * 6,
          scale: 0.7 + Math.random() * 0.8,
        });
      }
      result.push({ baseX, baseZ, y, spheres });
      total += sphereCount;
    }
    return { clouds: result, totalInstances: total };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const windRad = (windDir * Math.PI) / 180;
    const speed = 0.01 + (cloudCover / 100) * 0.02;
    const dx = Math.sin(windRad) * speed * 60 * delta;
    const dz = Math.cos(windRad) * speed * 60 * delta;

    let idx = 0;
    clouds.forEach((cloud) => {
      cloud.baseX += dx;
      cloud.baseZ += dz;
      if (cloud.baseX > 90) cloud.baseX -= 180;
      if (cloud.baseX < -90) cloud.baseX += 180;
      if (cloud.baseZ > 90) cloud.baseZ -= 180;
      if (cloud.baseZ < -90) cloud.baseZ += 180;

      cloud.spheres.forEach((s) => {
        dummy.position.set(cloud.baseX + s.ox, cloud.y, cloud.baseZ + s.oz);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(idx, dummy.matrix);
        idx++;
      });
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalInstances]}>
      <sphereGeometry args={[3, 12, 12]} />
      <meshStandardMaterial
        color="#FFFFFF"
        transparent
        opacity={opacity}
        roughness={1}
        metalness={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default CloudLayer;
