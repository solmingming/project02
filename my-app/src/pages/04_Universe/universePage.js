import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useCursor, useTexture, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
// …나머지 코드…


function DraggableBox() {
  const mesh = React.useRef();
  const { raycaster, mouse, camera } = useThree();
  const [hovered, setHover] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  useCursor(hovered);
  useFrame(() => {
    if (dragging && mesh.current) {
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);
      mesh.current.position.lerp(intersect, 0.2);
    }
  });

  return (
    <mesh
      ref={mesh}
      position={[0, 2, 0]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

function UnderwaterScene() {
  // Water normal map 텍스처를 가져옵니다. (직접 준비하셔야 해요)
  const waterNormals = useTexture('/assets/textures/waternormals.jpg');
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

  return (
    <>
      {/* 안개 효과 */}
      <fog attach="fog" args={['#001e0f', 5, 20]} />

      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#002" />
      </mesh>

      {/* 물 표면 */}
        {/* 물 표면 (반사 + 블러 효과) */}
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
     <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        mixStrength={0.8}
       resolution={1024}
      mirror={0.5}
        depthScale={1}
       minDepthThreshold={0.9}
       color="#001e0f"
     />
   </mesh>

      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
      />

      {/* 드래그 가능한 박스 */}
      <DraggableBox />

      {/* 카메라 컨트롤 */}
      <OrbitControls />
    </>
  );
}

export default function universe() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ height: '100vh', background: '#001e0f' }}
    >
      <Suspense fallback={null}>
        <UnderwaterScene />
      </Suspense>
    </Canvas>
  );
}
