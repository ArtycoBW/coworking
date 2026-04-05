"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type Uniforms = Record<string, { value: number | number[] | number[][] | THREE.Vector2 | THREE.Vector3 | THREE.Vector3[]; type: string }>;

interface ShaderProps {
  source: string;
  uniforms: Uniforms;
  maxFps?: number;
}

const ShaderMaterial = ({ source, uniforms }: { source: string; uniforms: Uniforms }) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.ShaderMaterial;
    mat.uniforms.u_time.value = clock.getElapsedTime();
  });

  const preparedUniforms = useMemo(() => {
    const result: Record<string, { value: unknown }> = {};
    for (const [k, u] of Object.entries(uniforms)) {
      switch (u.type) {
        case "uniform1f":   result[k] = { value: u.value }; break;
        case "uniform1i":   result[k] = { value: u.value }; break;
        case "uniform1fv":  result[k] = { value: u.value }; break;
        case "uniform3fv":  result[k] = { value: (u.value as number[][]).map((v) => new THREE.Vector3().fromArray(v)) }; break;
        default: result[k] = { value: u.value };
      }
    }
    result["u_time"] = { value: 0 };
    result["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return result;
  }, [size.width, size.height, uniforms]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position.xy, 0.0, 1.0);
            fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }`,
        fragmentShader: source,
        uniforms: preparedUniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
      }),
    [source, preparedUniforms]
  );

  return (
    <mesh ref={ref as React.RefObject<THREE.Mesh>}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      gl={{ alpha: true, antialias: false }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ShaderMaterial source={source} uniforms={uniforms} />
    </Canvas>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[79, 142, 247]],
  opacities = [0.04, 0.04, 0.04, 0.06, 0.06, 0.08, 0.1, 0.1, 0.14, 0.18],
  totalSize = 24,
  dotSize = 2,
  center = ["x", "y"],
}) => {
  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    else if (colors.length === 3) colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];

    return {
      u_colors: { value: colorsArray.map((c) => [c[0] / 255, c[1] / 255, c[2] / 255]), type: "uniform3fv" },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
    };
  }, [colors, opacities, totalSize, dotSize]);

  return (
    <Shader
      source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        void main() {
          vec2 st = fragCoord.xy;
          ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
          ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}

          float opacity = step(0.0, st.x) * step(0.0, st.y);
          vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

          float show_offset = random(st2);
          float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0));
          opacity *= u_opacities[int(rand * 10.0)];
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

          vec3 color = u_colors[int(show_offset * 6.0)];

          float dist_from_center = distance(u_resolution / 2.0 / u_total_size, st2);
          float timing = dist_from_center * 0.01 + random(st2) * 0.15;
          opacity *= step(timing, u_time * 0.5);

          fragColor = vec4(color, opacity);
          fragColor.rgb *= fragColor.a;
        }`}
      uniforms={uniforms}
    />
  );
};

interface CanvasRevealEffectProps {
  colors?: number[][];
  dotSize?: number;
  opacities?: number[];
  containerClassName?: string;
  showGradient?: boolean;
}

export const CanvasRevealEffect: React.FC<CanvasRevealEffectProps> = ({
  colors = [[79, 142, 247], [124, 92, 252]],
  dotSize = 2,
  opacities = [0.03, 0.03, 0.04, 0.05, 0.05, 0.07, 0.08, 0.1, 0.12, 0.15],
  containerClassName,
  showGradient = true,
}) => (
  <div className={cn("h-full relative w-full", containerClassName)}>
    <DotMatrix colors={colors} dotSize={dotSize} opacities={opacities} />
    {showGradient && (
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/40 to-transparent pointer-events-none" />
    )}
  </div>
);
