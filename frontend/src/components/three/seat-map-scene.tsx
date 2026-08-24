"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Lightformer, Environment, PerspectiveCamera, RoundedBox } from "@react-three/drei";
import { memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Group, Object3D } from "three";
import { MathUtils, Raycaster, Vector2 } from "three";

import { seatStatusOf } from "@/lib/seat-status";
import type { MapSeat, SeatStatus } from "@/lib/seat-status";

export type { MapSeat, SeatStatus };
export { seatStatusOf };

const GRID_UNIT = 1.6;

const STATUS_COLORS: Record<SeatStatus, string> = {
  selected: "#2563EB",
  available: "#10B981",
  held: "#F59E0B",
  occupied: "#F43F5E",
  locked: "#94A3B8",
};

const STATUS_EMISSIVE: Record<SeatStatus, number> = {
  selected: 0.55,
  available: 0.18,
  held: 0.35,
  occupied: 0.3,
  locked: 0.05,
};

const pos = (col: number, row: number): [number, number, number] => [
  col * GRID_UNIT,
  0,
  row * GRID_UNIT,
];

const CENTER: [number, number, number] = [7 * GRID_UNIT, 0, 4.25 * GRID_UNIT];

function Room() {
  return (
    <group>
      {/* floor */}
      <RoundedBox args={[15.4 * GRID_UNIT, 0.3, 9.8 * GRID_UNIT]} radius={0.2} position={[7 * GRID_UNIT, -0.15, 4.4 * GRID_UNIT]} receiveShadow>
        <meshStandardMaterial color="#EEF2FF" roughness={0.85} metalness={0.02} />
      </RoundedBox>

      {/* west wall (behind section A) */}
      <RoundedBox args={[0.4, 5, 9.6 * GRID_UNIT]} radius={0.06} position={[-0.4, 2.5, 4.25 * GRID_UNIT]} receiveShadow>
        <meshStandardMaterial color="#E0E7FF" roughness={0.9} />
      </RoundedBox>
      {/* north wall */}
      <RoundedBox args={[15.2 * GRID_UNIT, 5, 0.4]} radius={0.06} position={[7 * GRID_UNIT, 2.5, -0.6]} receiveShadow>
        <meshStandardMaterial color="#DBEAFE" roughness={0.9} />
      </RoundedBox>
      {/* east wall (behind sections C/D) */}
      <RoundedBox args={[0.4, 5, 9.6 * GRID_UNIT]} radius={0.06} position={[15.2 * GRID_UNIT, 2.5, 4.25 * GRID_UNIT]} receiveShadow>
        <meshStandardMaterial color="#E0E7FF" roughness={0.9} />
      </RoundedBox>
      {/* south wall */}
      <RoundedBox args={[15.2 * GRID_UNIT, 5, 0.4]} radius={0.06} position={[7 * GRID_UNIT, 2.5, 9.6 * GRID_UNIT]} receiveShadow>
        <meshStandardMaterial color="#DBEAFE" roughness={0.9} />
      </RoundedBox>

      {/* door 1 — west wall, near section A */}
      <RoundedBox args={[0.22, 2.2, 2.2]} radius={0.04} position={[-0.34, 1.1, 1.1]} >
        <meshStandardMaterial color="#A7F3D0" emissive="#10B981" emissiveIntensity={0.5} />
      </RoundedBox>
      <Html position={[-0.9, 2.7, 1.1]} center zIndexRange={[10, 0]}>
        <div className="whitespace-nowrap rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
          Door 1 · Entrance
        </div>
      </Html>

      {/* door 2 — south-east corner (girls zone entry) */}
      <RoundedBox args={[0.22, 2.2, 2.2]} radius={0.04} position={[13.6 * GRID_UNIT, 1.1, 9.55]} >
        <meshStandardMaterial color="#FBCFE8" emissive="#EC4899" emissiveIntensity={0.5} />
      </RoundedBox>
      <Html position={[13.6 * GRID_UNIT, 2.7, 9.75]} center zIndexRange={[10, 0]}>
        <div className="whitespace-nowrap rounded-full bg-pink-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
          Door 2 · Girls zone
        </div>
      </Html>

      {/* divider wall between the facing columns of section B */}
      <RoundedBox args={[0.22, 1.6, 4.6 * GRID_UNIT]} radius={0.05} position={[6.5 * GRID_UNIT, 0.8, 2 * GRID_UNIT]}>
        <meshStandardMaterial color="#F1F5F9" roughness={0.85} />
      </RoundedBox>

      {/* girls-only zone highlight (seats 21–31) */}
      <mesh position={[11.5 * GRID_UNIT, 0.02, 6.3 * GRID_UNIT]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.5 * GRID_UNIT, 3.6 * GRID_UNIT]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

const ZoneLabel = memo(function ZoneLabel({
  code,
  position,
  color,
}: {
  code: string;
  position: [number, number, number];
  color: string;
}) {
  return (
    <Html position={position} center zIndexRange={[20, 0]}>
      <div
        className="flex h-9 min-w-9 items-center justify-center rounded-xl border-2 border-white/70 px-2 font-mono text-sm font-extrabold shadow-md"
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {code}
      </div>
    </Html>
  );
});

function SeatCushion({ status, isGirlsOnly }: { status: SeatStatus; isGirlsOnly: boolean }) {
  const color = STATUS_COLORS[status];
  const emissive = STATUS_EMISSIVE[status];
  return (
    <>
      <RoundedBox args={[0.9, 0.38, 0.9]} radius={0.1} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={status === "selected" || status === "held" ? color : "#000000"}
          emissiveIntensity={emissive}
          roughness={0.4}
          metalness={0.05}
        />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.55, 0.14]} position={[0, 0.38, -0.42]} radius={0.07} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={status === "selected" || status === "held" ? color : "#000000"}
          emissiveIntensity={emissive}
          roughness={0.4}
          metalness={0.05}
        />
      </RoundedBox>
      {isGirlsOnly && (
        <>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.6, 32]} />
            <meshBasicMaterial color="#EC4899" transparent opacity={0.5} toneMapped={false} />
          </mesh>
          <mesh position={[0.38, 0.72, -0.4]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#EC4899" toneMapped={false} />
          </mesh>
        </>
      )}
    </>
  );
}

function SeatMesh({
  seat,
  selected,
  register,
}: {
  seat: MapSeat;
  selected: boolean;
  register: (id: number, obj: Object3D | null) => void;
}) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const status: SeatStatus = selected ? "selected" : seat.status;

  useEffect(() => {
    register(seat.id, groupRef.current);
    return () => register(seat.id, null);
  }, [seat.id, register]);

  return (
    <group
      ref={groupRef}
      position={pos(seat.gridCol, seat.gridRow)}
      scale={hovered && status === "available" ? 1.08 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <SeatCushion status={status} isGirlsOnly={seat.isGirlsOnly} />
      {selected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.62, 0.72, 40]} />
          <meshBasicMaterial color="#2563EB" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      )}
      <Html position={[0, 1.05, 0]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <span
          className={
            "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow transition-colors " +
            (selected
              ? "bg-blue-600 text-white"
              : status === "available"
                ? "bg-emerald-600/80 text-white"
                : status === "held"
                  ? "bg-amber-500/90 text-white"
                  : status === "locked"
                    ? "bg-slate-400/90 text-white"
                    : "bg-rose-500/90 text-white")
          }
        >
          {seat.number}
        </span>
      </Html>
    </group>
  );
}

function CameraRig({
  seatMapRef,
  onPick,
}: {
  seatMapRef: RefObject<Map<number, Object3D>>;
  onPick: (id: number) => void;
}) {
  const { gl, camera } = useThree();
  const state = useRef({
    yaw: Math.PI / 4,
    pitch: 1.0,
    radius: 26,
    dragging: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    downSeat: null as number | null,
  });
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useMemo(() => new Vector2(), []);

  const pickSeat = useCallback(
    (clientX: number, clientY: number): number | null => {
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const meshes = seatMapRef.current;
      if (!meshes || meshes.size === 0) return null;
      const targets = Array.from(meshes.values());
      const hits = raycaster.intersectObjects(targets, true);
      if (hits.length === 0) return null;
      let obj: Object3D | null = hits[0].object;
      while (obj && !meshes.has(obj.userData.seatId)) obj = obj.parent;
      return obj ? (obj.userData.seatId as number) : null;
    },
    [camera, gl, pointer, raycaster, seatMapRef]
  );

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;

    const onPointerDown = (e: PointerEvent) => {
      s.dragging = true;
      s.moved = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.downSeat = pickSeat(e.clientX, e.clientY);
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging) {
        el.style.cursor = pickSeat(e.clientX, e.clientY) != null ? "pointer" : "grab";
        return;
      }
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.moved += Math.abs(dx) + Math.abs(dy);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.yaw -= dx * 0.005;
      s.pitch = MathUtils.clamp(s.pitch + dy * 0.005, 0.2, 1.35);
      el.style.cursor = "grabbing";
    };

    const onPointerUp = (e: PointerEvent) => {
      s.dragging = false;
      el.style.cursor = "grab";
      if (s.moved < 6) {
        const id = pickSeat(e.clientX, e.clientY);
        if (id != null && s.downSeat === id) onPick(id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.radius = MathUtils.clamp(s.radius + e.deltaY * 0.02, 14, 46);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.style.cursor = "grab";
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl, onPick, pickSeat]);

  useFrame(() => {
    const s = state.current;
    camera.position.set(
      CENTER[0] + s.radius * Math.sin(s.yaw) * Math.cos(s.pitch),
      CENTER[1] + s.radius * Math.sin(s.pitch),
      CENTER[2] + s.radius * Math.cos(s.yaw) * Math.cos(s.pitch)
    );
    camera.lookAt(CENTER[0], CENTER[1], CENTER[2]);
  });

  return null;
}

function SeatLayer({
  seats,
  selectedId,
  onPick,
}: {
  seats: MapSeat[];
  selectedId: number | null;
  onPick: (id: number) => void;
}) {
  const seatMapRef = useRef<Map<number, Object3D>>(new Map());
  const register = useCallback((id: number, obj: Object3D | null) => {
    if (obj) {
      obj.userData.seatId = id;
      seatMapRef.current.set(id, obj);
    } else {
      seatMapRef.current.delete(id);
    }
  }, []);

  const seatNodes = useMemo(
    () =>
      seats.map((seat) => (
        <SeatMesh
          key={seat.id}
          seat={seat}
          selected={selectedId === seat.id}
          register={register}
        />
      )),
    [seats, selectedId, register]
  );

  return (
    <group>
      <Room />
      <ZoneLabel code="A" position={[0.4 * GRID_UNIT, 2.6, -0.5]} color="#0EA5E9" />
      <ZoneLabel code="B" position={[6.5 * GRID_UNIT, 2.6, -0.5]} color="#6366F1" />
      <ZoneLabel code="C" position={[13.6 * GRID_UNIT, 2.6, -0.5]} color="#10B981" />
      <ZoneLabel code="D" position={[13.6 * GRID_UNIT, 2.6, 8.6]} color="#7C3AED" />
      <Html position={[11.5 * GRID_UNIT, 2.9, 6.3 * GRID_UNIT]} center zIndexRange={[25, 0]}>
        <div className="whitespace-nowrap rounded-full border border-pink-300 bg-pink-500/15 px-3 py-1 text-[10px] font-bold tracking-wide text-pink-600 backdrop-blur-sm">
          ♀ Girls-only zone · Seats 21–31
        </div>
      </Html>
      {seatNodes}
      <CameraRig seatMapRef={seatMapRef} onPick={onPick} />
    </group>
  );
}

export function SeatMapCanvas({
  seats,
  selectedId,
  onPick,
}: {
  seats: MapSeat[];
  selectedId: number | null;
  onPick: (id: number) => void;
}) {
  return (
    <div className="h-[420px] w-full touch-none select-none sm:h-[520px]" aria-label="Interactive 3D seat map">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera makeDefault fov={40} position={[24, 18, 26]} near={0.5} far={120} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[14, 22, 8]} intensity={1.4} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0, 8, 0]} intensity={0.6} color="#3b82f6" distance={40} decay={2} />
        <Suspense fallback={null}>
          <SeatLayer seats={seats} selectedId={selectedId} onPick={onPick} />
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={1.2} position={[14, 12, 14]} scale={[16, 8, 1]} />
            <Lightformer form="rect" intensity={0.5} position={[-8, 6, 6]} rotation-y={Math.PI / 2} scale={[12, 5, 1]} color="#60A5FA" />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
