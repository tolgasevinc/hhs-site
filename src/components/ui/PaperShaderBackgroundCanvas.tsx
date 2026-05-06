import { Canvas } from '@react-three/fiber';
import { EnergyRing, ShaderPlane } from './background-paper-shaders';

type PaperShaderBackgroundCanvasProps = {
  dpr: [number, number];
};

export default function PaperShaderBackgroundCanvas({ dpr }: PaperShaderBackgroundCanvasProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 48 }} dpr={dpr} gl={{ alpha: true, antialias: true }}>
      <ShaderPlane position={[-1.7, 0.9, 0]} color1="#f0801a" color2="#d8d8d8" />
      <ShaderPlane position={[1.7, -0.8, -0.3]} color1="#253669" color2="#f0801a" />
      <EnergyRing radius={1.35} position={[1.25, 0.8, 0.1]} />
      <EnergyRing radius={0.85} position={[-1.4, -0.9, 0.2]} />
    </Canvas>
  );
}
