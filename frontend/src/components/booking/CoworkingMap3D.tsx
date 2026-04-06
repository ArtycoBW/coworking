"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { toast } from "sonner";
import { RATES } from "@/lib/pricing";
import type { Space } from "@/types";

useGLTF.preload("/models/workplace.glb");

const RW = 24, RD = 20, RH = 3.8;
const WALL  = { color: "#2a3347" as const, roughness: 0.65, metalness: 0.05 };
const FLOOR = { color: "#161b27" as const, roughness: 0.85, metalness: 0.0 };
const FC = "#3a4560";
const ACCENT = "#4f8ef7";

function WindowPane({ position, rotation = [0, 0, 0] as [number, number, number], w = 3.0, h = 1.7 }: {
  position: [number, number, number]; rotation?: [number, number, number]; w?: number; h?: number;
}) {
  const t = 0.1;
  const pieces: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0,  h / 2 + t / 2, 0], size: [w + t * 2, t, 0.2] },
    { pos: [0, -h / 2 - t / 2, 0], size: [w + t * 2, t, 0.2] },
    { pos: [-w / 2 - t / 2, 0, 0], size: [t, h, 0.2] },
    { pos: [ w / 2 + t / 2, 0, 0], size: [t, h, 0.2] },
    { pos: [0, 0, 0], size: [t * 0.5, h, 0.15] },
    { pos: [0, 0, 0], size: [w, t * 0.5, 0.15] },
  ];
  return (
    <group position={position} rotation={rotation}>
      {pieces.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <boxGeometry args={p.size} />
          <meshStandardMaterial color={FC} roughness={0.3} metalness={0.05} />
        </mesh>
      ))}
      <mesh>
        <planeGeometry args={[w - 0.02, h - 0.02]} />
        <meshStandardMaterial color="#3a5580" emissive="#2a4070" emissiveIntensity={0.4}
          transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DoorFrame({ position, rotation = [0, 0, 0] as [number, number, number] }: {
  position: [number, number, number]; rotation?: [number, number, number];
}) {
  const dW = 1.1, dH = 2.3, t = 0.1;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, dH / 2 + t / 2, 0]}><boxGeometry args={[dW + t * 2, t, 0.2]} /><meshStandardMaterial color={FC} roughness={0.3} /></mesh>
      <mesh position={[-dW / 2 - t / 2, 0, 0]}><boxGeometry args={[t, dH + t, 0.2]} /><meshStandardMaterial color={FC} roughness={0.3} /></mesh>
      <mesh position={[ dW / 2 + t / 2, 0, 0]}><boxGeometry args={[t, dH + t, 0.2]} /><meshStandardMaterial color={FC} roughness={0.3} /></mesh>
      <group position={[-dW / 2, 0, 0]}>
        <mesh position={[dW / 2 * Math.cos(0.3), 0, dW / 2 * Math.sin(0.3)]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[dW * 0.95, dH * 0.95, 0.06]} />
          <meshStandardMaterial color="#1e2840" roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[0.28, -0.08, 0.16]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshStandardMaterial color="#6070a0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function GlassPartition({ x1, x2, z, h = RH - 0.4, doorGapX1, doorGapX2 }: {
  x1: number; x2: number; z: number; h?: number;
  doorGapX1?: number; doorGapX2?: number;
}) {
  const panels: { cx: number; w: number }[] = [];
  if (doorGapX1 !== undefined && doorGapX2 !== undefined) {
    if (x1 < doorGapX1) panels.push({ cx: (x1 + doorGapX1) / 2, w: doorGapX1 - x1 });
    if (doorGapX2 < x2) panels.push({ cx: (doorGapX2 + x2) / 2, w: x2 - doorGapX2 });
  } else {
    panels.push({ cx: (x1 + x2) / 2, w: x2 - x1 });
  }
  return (
    <group>
      {panels.map(({ cx, w }, i) => (
        <group key={i} position={[cx, h / 2, z]}>
          <mesh renderOrder={1}>
            <boxGeometry args={[w, h, 0.05]} />
            <meshStandardMaterial color="#4a6090" roughness={0.15} metalness={0.1} transparent opacity={0.12}
              side={THREE.DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </mesh>
          <mesh position={[0,  h / 2 - 0.04, 0.04]}><boxGeometry args={[w, 0.05, 0.04]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[0, -h / 2 + 0.04, 0.04]}><boxGeometry args={[w, 0.05, 0.04]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[-w / 2 + 0.04, 0, 0.04]}><boxGeometry args={[0.05, h, 0.04]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[ w / 2 - 0.04, 0, 0.04]}><boxGeometry args={[0.05, h, 0.04]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
        </group>
      ))}
      <mesh position={[(x1 + x2) / 2, 0.04, z]}>
        <boxGeometry args={[x2 - x1, 0.06, 0.07]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}

function GlassPartitionZ({ x, z1, z2, h = RH - 0.4, doorGapZ1, doorGapZ2 }: {
  x: number; z1: number; z2: number; h?: number;
  doorGapZ1?: number; doorGapZ2?: number;
}) {
  const panels: { cz: number; d: number }[] = [];
  if (doorGapZ1 !== undefined && doorGapZ2 !== undefined) {
    if (z1 < doorGapZ1) panels.push({ cz: (z1 + doorGapZ1) / 2, d: doorGapZ1 - z1 });
    if (doorGapZ2 < z2) panels.push({ cz: (doorGapZ2 + z2) / 2, d: z2 - doorGapZ2 });
  } else {
    panels.push({ cz: (z1 + z2) / 2, d: z2 - z1 });
  }
  return (
    <group>
      {panels.map(({ cz, d }, i) => (
        <group key={i} position={[x, h / 2, cz]}>
          <mesh renderOrder={1}>
            <boxGeometry args={[0.05, h, d]} />
            <meshStandardMaterial color="#4a6090" roughness={0.15} metalness={0.1} transparent opacity={0.12}
              side={THREE.DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </mesh>
          <mesh position={[0.04, h / 2 - 0.04, 0]}><boxGeometry args={[0.04, 0.05, d]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[0.04, -h / 2 + 0.04, 0]}><boxGeometry args={[0.04, 0.05, d]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[0.04, 0, -d / 2 + 0.04]}><boxGeometry args={[0.04, h, 0.05]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
          <mesh position={[0.04, 0,  d / 2 - 0.04]}><boxGeometry args={[0.04, h, 0.05]} /><meshStandardMaterial color={FC} roughness={0.4} /></mesh>
        </group>
      ))}
      <mesh position={[x, 0.04, (z1 + z2) / 2]}>
        <boxGeometry args={[0.07, 0.06, z2 - z1]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}

function ConferenceChair({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[0.52, 0.06, 0.52]} />
        <meshStandardMaterial color="#1e2840" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.76, -0.24]}>
        <boxGeometry args={[0.5, 0.55, 0.05]} />
        <meshStandardMaterial color="#1e2840" roughness={0.6} />
      </mesh>
      {([[-0.2, -0.2], [-0.2, 0.2], [0.2, -0.2], [0.2, 0.2]] as [number, number][]).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color="#4a5880" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function ConferenceTableGeometry({ cx, cz }: { cx: number; cz: number }) {
  const tW = 1.3, tL = 4.6, tH = 0.74, tT = 0.06;
  const chairs: { x: number; z: number; ry: number }[] = [
    { x: cx - tW / 2 - 0.55, z: cz - 1.4, ry:  Math.PI / 2 },
    { x: cx - tW / 2 - 0.55, z: cz,       ry:  Math.PI / 2 },
    { x: cx - tW / 2 - 0.55, z: cz + 1.4, ry:  Math.PI / 2 },
    { x: cx + tW / 2 + 0.55, z: cz - 1.4, ry: -Math.PI / 2 },
    { x: cx + tW / 2 + 0.55, z: cz,       ry: -Math.PI / 2 },
    { x: cx + tW / 2 + 0.55, z: cz + 1.4, ry: -Math.PI / 2 },
  ];
  return (
    <group>
      <mesh position={[cx, tH, cz]}>
        <boxGeometry args={[tW, tT, tL]} />
        <meshStandardMaterial color="#1e2535" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[cx, tH + tT / 2 + 0.001, cz]}>
        <planeGeometry args={[tW - 0.1, tL - 0.1]} />
        <meshStandardMaterial color="#2a3555" emissive="#1a2545" emissiveIntensity={0.15}
          transparent opacity={0.4} roughness={0.15} metalness={0.7} />
      </mesh>
      {([[-tW/2+0.08, tL/2-0.12], [-tW/2+0.08, -(tL/2-0.12)], [tW/2-0.08, tL/2-0.12], [tW/2-0.08, -(tL/2-0.12)]] as [number, number][]).map(([lx, lz], i) => (
        <mesh key={i} position={[cx + lx, tH / 2, cz + lz]}>
          <boxGeometry args={[0.06, tH, 0.06]} />
          <meshStandardMaterial color="#3a4870" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {chairs.map((c, i) => <ConferenceChair key={i} position={[c.x, 0, c.z]} rotY={c.ry} />)}
    </group>
  );
}

function Room() {
  const hw = RW / 2, hd = RD / 2;
  const PX_L = -hw + 5.5;
  const PX_R =  hw - 5.5;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[RW, RD]} />
        <meshStandardMaterial {...FLOOR} />
      </mesh>

      <mesh position={[0, RH / 2, -hd]}><boxGeometry args={[RW, RH, 0.2]} /><meshStandardMaterial {...WALL} /></mesh>
      <mesh position={[-hw, RH / 2, 0]}><boxGeometry args={[0.2, RH, RD]} /><meshStandardMaterial {...WALL} /></mesh>
      <mesh position={[hw, RH / 2, 0]}><boxGeometry args={[0.2, RH, RD]} /><meshStandardMaterial {...WALL} /></mesh>

      <WindowPane position={[-6.5, 2.0, -hd + 0.11]} w={3.0} h={1.7} />
      <WindowPane position={[  0,  2.0, -hd + 0.11]} w={3.0} h={1.7} />
      <WindowPane position={[ 6.5, 2.0, -hd + 0.11]} w={3.0} h={1.7} />

      <WindowPane position={[-hw + 0.11, 2.0, -5.5]} rotation={[0,  Math.PI / 2, 0]} w={2.8} h={1.6} />
      <WindowPane position={[ hw - 0.11, 2.0, -5.5]} rotation={[0, -Math.PI / 2, 0]} w={2.8} h={1.6} />
      <WindowPane position={[-hw + 0.11, 2.0, 3.0]} rotation={[0,  Math.PI / 2, 0]} w={2.6} h={1.6} />
      <WindowPane position={[ hw - 0.11, 2.0, 3.0]} rotation={[0, -Math.PI / 2, 0]} w={2.6} h={1.6} />

      <DoorFrame position={[hw - 0.1, 1.15, 7.5]} rotation={[0, -Math.PI / 2, 0]} />

      <mesh position={[0, 0.04, -hd + 0.14]}><boxGeometry args={[RW - 0.4, 0.05, 0.04]} /><meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.5} /></mesh>
      <mesh position={[-hw + 0.14, 0.04, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[RD - 0.4, 0.05, 0.04]} /><meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.5} /></mesh>
      <mesh position={[ hw - 0.14, 0.04, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[RD - 0.4, 0.05, 0.04]} /><meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.5} /></mesh>

      <GlassPartitionZ x={PX_L} z1={-hd + 0.1} z2={2.0} doorGapZ1={0.4} doorGapZ2={1.8} />
      <GlassPartition x1={-hw + 0.1} x2={PX_L} z={2.0} h={RH - 0.4} doorGapX1={PX_L - 2.2} doorGapX2={PX_L - 0.1} />

      <GlassPartitionZ x={PX_R} z1={-hd + 0.1} z2={2.0} doorGapZ1={0.4} doorGapZ2={1.8} />
      <GlassPartition x1={PX_R} x2={hw - 0.1} z={2.0} h={RH - 0.4} doorGapX1={PX_R + 0.1} doorGapX2={PX_R + 2.2} />

      <ConferenceTableGeometry cx={-(hw - 2.8)} cz={-3.5} />
      <ConferenceTableGeometry cx={ hw - 2.8}  cz={-3.5} />
    </group>
  );
}

interface SeatProps {
  space: Space;
  isAvailable: boolean;
  isSelected: boolean;
  onSelect: (space: Space) => void;
}

function WorkplaceSeat({ space, isAvailable, isSelected, onSelect }: SeatProps) {
  const { scene } = useGLTF("/models/workplace.glb");
  const groupRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const state = isSelected ? "selected" : isAvailable ? "available" : "occupied";
  const glowColor = state === "selected" ? "#18d860" : state === "available" ? "#4f8ef7" : "#ef4444";
  const targetGlow = hovered ? 2.6 : state === "selected" ? 1.6 : 0.5;

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material = (child.material as THREE.MeshStandardMaterial).clone();
      }
    });
    return c;
  }, [scene, space.id]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat?.isMeshStandardMaterial) return;
      if (state === "occupied") {
        mat.color.setHex(0x3a0808); mat.emissive.setHex(0x8b1515); mat.emissiveIntensity = hovered ? 0.6 : 0.3;
      } else if (state === "selected") {
        mat.emissive.setHex(0x0a5c25); mat.emissiveIntensity = hovered ? 0.9 : 0.5;
      } else {
        mat.emissive.setHex(hovered ? 0x0a2a5e : 0x000000); mat.emissiveIntensity = hovered ? 0.35 : 0.0;
      }
    });
  }, [cloned, state, hovered]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const t = hovered ? 1.06 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(t, t, t), 0.13);
    }
    if (floorRef.current) {
      const mat = floorRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetGlow, delta * 6);
    }
  });

  return (
    <group ref={groupRef} position={[space.posX, 0, space.posZ]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!isAvailable && !isSelected) { toast.error("Место занято", { description: space.name.replace("Desk ", "Место ") }); return; }
        onSelect(space);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); setShowTip(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); setShowTip(false); document.body.style.cursor = "auto"; }}
    >
      <mesh ref={floorRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 2.1]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={targetGlow}
          transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.1, 2.1)]} />
        <lineBasicMaterial color={glowColor} transparent opacity={0.55} />
      </lineSegments>
      <primitive object={cloned} scale={[1.2, 1.2, 1.2]} />
      {showTip && (
        <Html distanceFactor={10} center position={[0, 2.4, 0]}>
          <div style={{ background: "rgba(10,13,20,0.96)", border: `1px solid ${state === "selected" ? "rgba(52,211,153,0.45)" : state === "available" ? "rgba(79,142,247,0.4)" : "rgba(239,68,68,0.4)"}`, borderRadius: "10px", padding: "8px 12px", minWidth: "128px", backdropFilter: "blur(16px)", pointerEvents: "none", boxShadow: "0 8px 28px rgba(0,0,0,0.55)" }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: "12px", fontWeight: 700, color: "#e8edf5", marginBottom: "2px" }}>{space.name.replace("Desk ", "Место ")}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "rgba(136,146,164,0.6)", marginBottom: "4px" }}>{RATES.DESK} ₽/ч · рабочее место</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: state === "selected" ? "#34d399" : state === "available" ? "#4f8ef7" : "#ef4444" }}>
              {state === "selected" ? "✓ Выбрано" : state === "available" ? "✓ Свободно" : "✗ Занято"}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function MeetingRoomBox({ space, isAvailable, isSelected, onSelect }: SeatProps) {
  const [hovered, setHovered] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const hw = RW / 2;
  const tableX = space.posX < 0 ? -(hw - 2.8) : hw - 2.8;

  const state = isSelected ? "selected" : isAvailable ? "available" : "occupied";
  const glowColor = state === "selected" ? "#18d860" : state === "available" ? "#4f8ef7" : "#ef4444";

  return (
    <group
      position={[tableX, 0, -3.5]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!isAvailable && !isSelected) { toast.error("Переговорная занята"); return; }
        onSelect(space);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); setShowTip(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(false); setShowTip(false); document.body.style.cursor = "auto"; }}
    >
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 5.5]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 6.0]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor}
          emissiveIntensity={hovered ? 0.9 : state === "selected" ? 0.6 : 0.22}
          transparent opacity={0.09} />
      </mesh>
      {showTip && (
        <Html distanceFactor={10} center position={[0, 2.2, 0]}>
          <div style={{ background: "rgba(10,13,20,0.96)", border: `1px solid ${state === "selected" ? "rgba(52,211,153,0.45)" : state === "available" ? "rgba(79,142,247,0.4)" : "rgba(239,68,68,0.4)"}`, borderRadius: "10px", padding: "8px 12px", minWidth: "155px", backdropFilter: "blur(16px)", pointerEvents: "none", boxShadow: "0 8px 28px rgba(0,0,0,0.55)" }}>
            <div style={{ fontFamily: "var(--font-tech)", fontSize: "12px", fontWeight: 700, color: "#e8edf5", marginBottom: "2px" }}>{space.name.replace("Meeting Room ", "Переговорная ")}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "9px", color: "rgba(136,146,164,0.6)", marginBottom: "4px" }}>{space.capacity} чел · {RATES.MEETING_ROOM} ₽/ч</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600, color: state === "selected" ? "#34d399" : state === "available" ? "#4f8ef7" : "#ef4444" }}>
              {state === "selected" ? "✓ Выбрано" : state === "available" ? "✓ Свободно" : "✗ Занято"}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface CoworkingMap3DProps {
  spaces: Space[];
  availableIds: string[];
  selectedId: string | null;
  onSelect: (space: Space) => void;
}

function Scene({ spaces, availableIds, selectedId, onSelect }: CoworkingMap3DProps) {
  const desks = spaces.filter((s) => s.type === "DESK");
  const rooms = spaces.filter((s) => s.type === "MEETING_ROOM");

  return (
    <>
      <ambientLight intensity={1.1} color="#c8d8f0" />
      <directionalLight position={[4, 12, 8]} intensity={1.2} color="#e8f0ff" />
      <pointLight position={[-(RW / 2 - 2), 3.2, -3]} intensity={0.5} color="#c8deff" distance={14} decay={2} />
      <pointLight position={[ (RW / 2 - 2), 3.2, -3]} intensity={0.5} color="#c8deff" distance={14} decay={2} />

      <OrbitControls enablePan
        minPolarAngle={0.15} maxPolarAngle={Math.PI / 2.2}
        minAzimuthAngle={-Math.PI / 2.0} maxAzimuthAngle={Math.PI / 2.0}
        minDistance={5} maxDistance={28}
        target={[0, 0.5, -2]}
      />

      <Room />

      <Suspense fallback={null}>
        {desks.map((s) => (
          <WorkplaceSeat key={s.id} space={s}
            isAvailable={availableIds.includes(s.id)}
            isSelected={selectedId === s.id}
            onSelect={onSelect} />
        ))}
      </Suspense>

      {rooms.map((s) => (
        <MeetingRoomBox key={s.id} space={s}
          isAvailable={availableIds.includes(s.id)}
          isSelected={selectedId === s.id}
          onSelect={onSelect} />
      ))}

      <fog attach="fog" args={["#0a0d14", 28, 48]} />
    </>
  );
}

export function CoworkingMap3D(props: CoworkingMap3DProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 15, 19], fov: 48 }}
      gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.2]}
      style={{ background: "#0a0d14" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
