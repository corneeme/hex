import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import "@fontsource/inter";
import { useMonsterGame } from "./lib/stores/useMonsterGame";
import { GameScene } from "./components/game/GameScene";
import { MenuScreen } from "./components/ui/MenuScreen";
import { GameHUD } from "./components/ui/GameHUD";
import { DeathScreen } from "./components/ui/DeathScreen";
import { SkillTreeScreen } from "./components/ui/SkillTreeScreen";

function App() {
  const phase = useMonsterGame((state) => state.phase);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {phase === 'menu' && <MenuScreen />}
      {phase === 'dead' && <DeathScreen />}
      {phase === 'skillTree' && <SkillTreeScreen />}
      
      {phase === 'playing' && (
        <>
          <Canvas
            shadows
            camera={{
              position: [0, 15, 20],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <color attach="background" args={["#0a0a0a"]} />
            <Suspense fallback={null}>
              <GameScene />
            </Suspense>
          </Canvas>
          <GameHUD />
        </>
      )}
    </div>
  );
}

export default App;
