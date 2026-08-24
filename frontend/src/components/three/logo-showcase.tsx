"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { MathUtils, SRGBColorSpace, type Group, type PointLight } from "three";

const LOGO_ASPECT = 1948 / 1666;
const CARD_W = 1.95;
const CARD_H = CARD_W / LOGO_ASPECT;
const CARD_D = 0.26;
const CARD_R = 0.12;

function LogoEmblem({ reduced, hovered }: { reduced: boolean; hovered: boolean }) {
  const texture = useTexture("/logo.webp");
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const group = useRef<Group>(null);
  const orbLight = useRef<PointLight>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (orbLight.current) {
      orbLight.current.position.set(Math.cos(t * 0.7) * 3.2, 1.1, Math.sin(t * 0.7) * 3.2);
    }
    if (reduced || !group.current) return;
    const k = Math.min(1, delta * 4.5);
    const targetX = -state.pointer.y * 0.22 + (hovered ? -0.16 : 0);
    const targetY = state.pointer.x * 0.32 + (hovered ? 0.26 : 0);
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, targetX, k);
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, targetY, k);
  });

  return (
    <Float speed={1.7} rotationIntensity={reduced ? 0 : 0.1} floatIntensity={0.5} floatingRange={[-0.14, 0.16]}>
      <group ref={group}>
        {/* beveled extruded body */}
        <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={CARD_R} smoothness={6} position={[0, 0, -0.03]}>
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.18} />
        </RoundedBox>

        {/* engraved inner rim */}
        <RoundedBox
          args={[CARD_W - 0.09, CARD_H - 0.09, CARD_D]}
          radius={Math.max(CARD_R - 0.02, 0.05)}
          smoothness={4}
          position={[0, 0, -0.012]}
        >
          <meshStandardMaterial color="#fbfdff" roughness={0.45} metalness={0.1} />
        </RoundedBox>

        {/* logo face */}
        <mesh position={[0, 0, CARD_D / 2 + 0.012]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial map={texture} roughness={0.5} metalness={0.06} />
        </mesh>

        {/* orbiting reflection light */}
        <pointLight ref={orbLight} intensity={0.9} color="#bfdbfe" distance={12} decay={2} />
      </group>
    </Float>
  );
}

function Pedestal() {
  return (
    <group position={[0, -CARD_H / 2 - 0.62, 0]}>
      <mesh>
        <cylinderGeometry args={[1.55, 1.8, 0.14, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.22} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.56, 1.64, 64]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Showcase({ reduced, hovered }: { reduced: boolean; hovered: boolean }) {
  return (
    <Suspense fallback={null}>
      <LogoEmblem reduced={reduced} hovered={hovered} />
      <Pedestal />
      <ContactShadows
        position={[0, -CARD_H / 2 - 0.76, 0]}
        opacity={0.35}
        scale={9}
        blur={2.6}
        far={1.6}
        resolution={256}
      />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={1.1} position={[0, 2.2, 3.2]} scale={[5, 3, 1]} />
        <Lightformer
          form="rect"
          intensity={0.4}
          position={[-4, 1, 0]}
          rotation-y={Math.PI / 2}
          scale={[4, 2, 1]}
          color="#bfdbfe"
        />
        <Lightformer
          form="rect"
          intensity={0.4}
          position={[4, 1, 1]}
          rotation-y={-Math.PI / 2}
          scale={[4, 2, 1]}
          color="#a5f3fc"
        />
      </Environment>
    </Suspense>
  );
}

export function LogoShowcase({ reduced = false }: { reduced?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-full w-full select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="img"
      aria-label="Phahendra Babu Library logo as a 3D emblem"
    >
      <div
        aria-hidden
        className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 opacity-80 blur-3xl"
      />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 30, position: [0, -0.1, 4.9], near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.7} color="#ffffff" />
        <pointLight position={[-4, 2, -2]} intensity={0.8} color="#3b82f6" distance={12} decay={2} />
        <pointLight position={[4, -1, 3]} intensity={0.5} color="#7dd3fc" distance={10} decay={2} />
        <Showcase reduced={reduced} hovered={hovered} />
      </Canvas>
    </div>
  );
}
