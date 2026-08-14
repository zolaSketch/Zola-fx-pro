"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SuitState } from "@/store/jarvis";

/**
 * Rotating wireframe hologram of the armour, assembled from primitives.
 * Pieces fly in from a scatter position as `progress` climbs, mimicking the
 * nano-particle assembly from the films.
 */

interface Piece {
  pos: [number, number, number];
  size: [number, number, number];
  from: [number, number, number];
  order: number;
  kind: "box" | "sphere" | "capsule";
}

const PIECES: Piece[] = [
  // head
  { pos: [0, 1.42, 0], size: [0.3, 0.34, 0.3], from: [0, 3.4, -1.4], order: 0.86, kind: "sphere" },
  // torso
  { pos: [0, 0.82, 0], size: [0.62, 0.66, 0.38], from: [0, 2.4, 1.6], order: 0.1, kind: "box" },
  { pos: [0, 0.3, 0], size: [0.5, 0.42, 0.32], from: [0, -1.4, 1.6], order: 0.24, kind: "box" },
  // shoulders
  { pos: [-0.5, 1.05, 0], size: [0.26, 0.26, 0.3], from: [-2.4, 1.8, 0], order: 0.34, kind: "sphere" },
  { pos: [0.5, 1.05, 0], size: [0.26, 0.26, 0.3], from: [2.4, 1.8, 0], order: 0.34, kind: "sphere" },
  // arms
  { pos: [-0.62, 0.62, 0], size: [0.17, 0.46, 0.19], from: [-2.8, 0.4, 0.6], order: 0.46, kind: "capsule" },
  { pos: [0.62, 0.62, 0], size: [0.17, 0.46, 0.19], from: [2.8, 0.4, 0.6], order: 0.46, kind: "capsule" },
  // gauntlets
  { pos: [-0.66, 0.16, 0], size: [0.16, 0.3, 0.18], from: [-3.2, -0.8, 0.8], order: 0.58, kind: "box" },
  { pos: [0.66, 0.16, 0], size: [0.16, 0.3, 0.18], from: [3.2, -0.8, 0.8], order: 0.58, kind: "box" },
  // hips
  { pos: [0, -0.06, 0], size: [0.44, 0.24, 0.3], from: [0, -2.2, -1.2], order: 0.18, kind: "box" },
  // legs
  { pos: [-0.22, -0.6, 0], size: [0.2, 0.56, 0.22], from: [-1.6, -2.8, 0], order: 0.66, kind: "capsule" },
  { pos: [0.22, -0.6, 0], size: [0.2, 0.56, 0.22], from: [1.6, -2.8, 0], order: 0.66, kind: "capsule" },
  // boots
  { pos: [-0.22, -1.12, 0.04], size: [0.22, 0.26, 0.3], from: [-1.8, -3.6, 1.0], order: 0.78, kind: "box" },
  { pos: [0.22, -1.12, 0.04], size: [0.22, 0.26, 0.3], from: [1.8, -3.6, 1.0], order: 0.78, kind: "box" },
];

function Piece({ piece, progress }: { piece: Piece; progress: number }) {
  const ref = useRef<THREE.Mesh>(null);

  // Per-piece eased arrival based on its slot in the assembly order.
  const local = THREE.MathUtils.clamp((progress / 100 - piece.order) / 0.24, 0, 1);
  const t = local * local * (3 - 2 * local); // smoothstep

  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    m.position.set(
      THREE.MathUtils.lerp(piece.from[0], piece.pos[0], t),
      THREE.MathUtils.lerp(piece.from[1], piece.pos[1], t),
      THREE.MathUtils.lerp(piece.from[2], piece.pos[2], t),
    );
    m.rotation.y = (1 - t) * Math.PI * 1.5;
    m.rotation.x = (1 - t) * Math.PI * 0.6;
    m.scale.setScalar(0.2 + t * 0.8);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = t * 0.85;
  });

  const geometry = useMemo(() => {
    const [w, h, d] = piece.size;
    if (piece.kind === "sphere") return new THREE.SphereGeometry(w, 10, 8);
    if (piece.kind === "capsule") return new THREE.CapsuleGeometry(w, h, 3, 8);
    return new THREE.BoxGeometry(w, h, d);
  }, [piece]);

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial wireframe transparent color="#6ddcff" opacity={0} />
    </mesh>
  );
}

function Rig({ progress, state }: { progress: number; state: SuitState }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.42;
    if (core.current) {
      const p = progress / 100;
      const s = 0.9 + Math.sin(Date.now() * 0.004) * 0.08;
      core.current.scale.setScalar(s * p);
      (core.current.material as THREE.MeshBasicMaterial).opacity = p * 0.95;
    }
  });

  return (
    <group ref={group}>
      {PIECES.map((p, i) => (
        <Piece key={i} piece={p} progress={progress} />
      ))}

      {/* arc reactor core */}
      <mesh ref={core} position={[0, 0.86, 0.2]}>
        <circleGeometry args={[0.11, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* base ring */}
      <mesh position={[0, -1.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.78, 48]} />
        <meshBasicMaterial
          color={state === "deployed" ? "#3ddc97" : "#33c7ff"}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -1.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.92, 48]} />
        <meshBasicMaterial color="#0aabf0" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function SuitHologram({
  progress,
  state,
  className,
}: {
  progress: number;
  state: SuitState;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.3, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <Rig progress={progress} state={state} />
      </Canvas>
    </div>
  );
}
