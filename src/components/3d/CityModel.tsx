import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store';

const BUILDING_COLORS = ['#1C385E', '#152A49', '#0F1E37'];
const BUILDING_RATIOS = [0.3, 0.4, 0.3];

function pickBuildingColor(): string {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < BUILDING_COLORS.length; i++) {
    acc += BUILDING_RATIOS[i];
    if (r < acc) return BUILDING_COLORS[i];
  }
  return BUILDING_COLORS[0];
}

function CityModel() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { stations } = useAppStore();

  const buildingData = useMemo(() => {
    const data: { x: number; z: number; w: number; d: number; h: number; color: string }[] = [];
    const occupied: { x: number; z: number; r: number }[] = [];

    for (const s of stations) {
      occupied.push({ x: s.position[0], z: s.position[2], r: 6 });
    }

    let attempts = 0;
    while (data.length < 120 && attempts < 2000) {
      attempts++;
      const x = (Math.random() - 0.5) * 120;
      const z = (Math.random() - 0.5) * 120;

      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

      let conflict = false;
      for (const o of occupied) {
        const dx = x - o.x;
        const dz = z - o.z;
        if (dx * dx + dz * dz < o.r * o.r) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      const w = 2 + Math.random() * 4;
      const d = 2 + Math.random() * 4;
      const distFromCenter = Math.sqrt(x * x + z * z);
      const centerBoost = Math.max(0, (60 - distFromCenter) / 60) * 20;
      const h = 4 + Math.random() * 10 + centerBoost;
      const color = pickBuildingColor();

      data.push({ x, z, w, d, h, color });
      occupied.push({ x, z, r: Math.max(w, d) * 0.8 });
    }
    return data;
  }, [stations]);

  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    buildingData.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      color.set(b.color);
      meshRef.current!.setColorAt(i, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildingData]);

  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0F1E37';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) {
      const pos = (i / 16) * size;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(32, 32);
    return tex;
  }, []);

  const roadLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const offset = i * 20;
      points.push(new THREE.Vector3(-80, 0.02, offset));
      points.push(new THREE.Vector3(80, 0.02, offset));
      points.push(new THREE.Vector3(offset, 0.02, -80));
      points.push(new THREE.Vector3(offset, 0.02, 80));
    }
    return points;
  }, []);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(roadLines);
    return geo;
  }, [roadLines]);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial
          color="#0F1E37"
          roughness={0.9}
          metalness={0.1}
          map={gridTexture}
        />
      </mesh>

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, buildingData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          roughness={0.7}
          metalness={0.2}
          emissiveIntensity={0.08}
        />
      </instancedMesh>

      <group position={[0, 0, 0]}>
        <mesh position={[0, 22.5, 0]} castShadow>
          <cylinderGeometry args={[2, 3, 45, 16]} />
          <meshStandardMaterial
            color="#1a2942"
            emissive="#00D4FF"
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <pointLight color="#00D4FF" intensity={1} distance={40} position={[0, 30, 0]} />
      </group>

      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#00D4FF" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

export default CityModel;
