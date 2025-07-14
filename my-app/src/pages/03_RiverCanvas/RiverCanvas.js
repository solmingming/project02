import * as THREE from 'three';
import React, { Suspense, useRef, useMemo, useState, useCallback, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Sky } from '@react-three/drei';

const riverWidth = 100;
const riverLength = 380;

const bankWidth = 100;
const bankHeight = 5;

const fishScale = 1;

const FOLIAGE_CONFIG = {
    tree1: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Tree1',
        baseScale: 2,
        count: 15,
    },
    tree2: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Tree2',
        baseScale: 2,
        count: 15,
    },
    rock1: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Rock1',
        baseScale: 3,
        count: 10,
    },
    rock2: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Rock2',
        baseScale: 3,
        count: 200,
    },
    rock3: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Rock3',
        baseScale: 3,
        count: 200,
    },
    rock4: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Rock4',
        baseScale: 3,
        count: 10,
    },
    branch: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Branch',
        baseScale: 3,
        count: 10,
    },
    stump: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Stump1',
        baseScale: 2,
        count: 15,
    },
    grass1: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Grass1',
        baseScale: 5,
        count: 1500,
    },
    grass2: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Grass2',
        baseScale: 5,
        count: 1500,
    },
    mushroom1: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Mushroom1',
        baseScale: 3,
        count: 30,
    },
    mushroom2: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Mushroom2',
        baseScale: 3,
        count: 30,
    },
    bush1: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Bush1',
        baseScale: 3,
        count: 10,
    },
    bush22: {
        path: '/low_poly_trees_grass_and_rocks.glb',
        meshName: 'Bush2',
        baseScale: 3,
        count: 10,
    },
};

function Fish({ id, onOutOfBounds, initialPosition, speed, wiggleSpeed, wiggleAmount, scale }) {
    const { scene } = useGLTF('/fish2.glb');
    const ref = useRef();
    const timeOffset = useMemo(() => Math.random() * 100, []);
    
    const [isDragging, setIsDragging] = useState(false);
    const [swimCenter, setSwimCenter] = useState([initialPosition[0], initialPosition[1]]);

    const DRAG_HEIGHT = 5;
    const SWIM_Y_LEVEL = initialPosition[1];

    const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT), [DRAG_HEIGHT]);
    const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
    const offset = useMemo(() => new THREE.Vector3(), []);
    const targetPosition = useMemo(() => new THREE.Vector3(), []);

    const padding = 15;

    const centeredModel = useMemo(() => {
        const model = scene.clone();
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return model;
    }, [scene]);
    
    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.position.set(...initialPosition);
        }
    }, [initialPosition]);

    useFrame((state, delta) => {
        if (!ref.current) return;

        if (isDragging) {
            state.raycaster.ray.intersectPlane(dragPlane, intersectionPoint);
            targetPosition.copy(intersectionPoint.sub(offset));

            const halfRiverWidth = riverWidth / 2;
            const halfRiverLength = riverLength / 2;
            targetPosition.x = THREE.MathUtils.clamp(targetPosition.x, -halfRiverWidth + padding, halfRiverWidth - padding);
            targetPosition.z = THREE.MathUtils.clamp(targetPosition.z, -halfRiverLength, halfRiverLength);

            ref.current.position.copy(targetPosition);
            return;
        }

        ref.current.position.z -= speed * delta;
        const t = state.clock.getElapsedTime() + timeOffset;
        ref.current.position.x = swimCenter[0] + Math.sin(t * wiggleSpeed) * wiggleAmount;
        ref.current.position.y = SWIM_Y_LEVEL;

        if (ref.current.position.z < -riverLength / 2 - 20) {
            onOutOfBounds(id);
            return;
        }

        const lookAtPosition = new THREE.Vector3(
            ref.current.position.x,
            ref.current.position.y,
            ref.current.position.z - 1
        );
        ref.current.lookAt(lookAtPosition);
    });

    const handlePointerDown = (e) => {
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);
        setIsDragging(true);

        if (e.ray.intersectPlane(dragPlane, intersectionPoint)) {
            ref.current.position.y = DRAG_HEIGHT;
            offset.copy(intersectionPoint).sub(ref.current.position);
        }
    };

    const handlePointerUp = (e) => {
        e.stopPropagation();
        e.target.releasePointerCapture(e.pointerId);
        setIsDragging(false);

        if (ref.current) {
            let releaseX = ref.current.position.x;
            let releaseZ = ref.current.position.z;
            
            // [핵심 수정] 마우스를 놓은 위치를 강 경계 안에 가둡니다.
            const halfRiverWidth = riverWidth / 2;
            const halfRiverLength = riverLength / 2;
            releaseX = THREE.MathUtils.clamp(releaseX, -halfRiverWidth + padding, halfRiverWidth - padding);
            releaseZ = THREE.MathUtils.clamp(releaseZ, -halfRiverLength, halfRiverLength);
            
            ref.current.position.set(releaseX, SWIM_Y_LEVEL, releaseZ);
            setSwimCenter([releaseX, SWIM_Y_LEVEL]);
        }
    };
    
    return (
        <group 
            ref={ref} 
            scale={scale}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <group rotation-y={Math.PI}>
                <primitive object={centeredModel} />
            </group>
        </group>
    );
}

function FishSpawner() {
    const [fishes, setFishes] = useState([]);
    const spawnTimer = useRef(Math.random() * 2);

    const createRandomFish = () => {
        return {
            id: THREE.MathUtils.generateUUID(),
            initialPosition: [
                (Math.random() - 0.5) * (riverWidth - 30),
                -8 + (Math.random() - 0.5) * 4,
                riverLength / 2,
            ],
            speed: Math.random() * 18 + 15,
            wiggleSpeed: Math.random() * 2 + 1,
            wiggleAmount: Math.random() * 1.5 + 0.5,
            scale: (15 + Math.random() * 3) * fishScale,
        };
    };
    
    const handleOutOfBounds = useCallback((fishId) => {
        setFishes(currentFishes => currentFishes.filter(fish => fish.id !== fishId));
    }, []);

    useFrame((state, delta) => {
        spawnTimer.current -= delta;
        if (spawnTimer.current <= 0) {
            spawnTimer.current = Math.random() * 4 + 1;
            setFishes(currentFishes => [...currentFishes, createRandomFish()]);
        }
    });

    return (
        <>
            {fishes.map((fishProps) => (
                <Fish key={fishProps.id} {...fishProps} onOutOfBounds={handleOutOfBounds} />
            ))}
        </>
    );
}

function ShimmeringWater() {
    const ref = useRef();
    const timerRef = useRef(0);
    const randRef = useRef(Math.random());
    const waterNormals = useTexture('/waternormals.jpg');
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    let RAND_TIME = 1 + Math.random() * 2;

    useFrame((state, delta) => {
        if (ref.current) {
            timerRef.current += delta;
            if (timerRef.current > RAND_TIME) {
                timerRef.current -= RAND_TIME;
                randRef.current += (Math.random() - 0.5) * 0.2;
                RAND_TIME = 1 + Math.random() * 2;
            }
            ref.current.material.normalMap.offset.x += Math.sin((randRef.current - 0.5) * 2 * Math.PI) * 0.001;
            ref.current.material.normalMap.offset.y -= delta * 0.1;
        }
    });

    return (
        <mesh ref={ref} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[riverWidth, riverLength, 64, 64]} />
            <meshPhysicalMaterial
                roughness={0.2}
                metalness={0.0}
                transmission={0.8}
                thickness={1.0}
                ior={1.33}
                transparent={true}
                opacity={0.8}
                color="#61C0BF"
                normalMap={waterNormals}
                normalScale={new THREE.Vector2(0.5, 0.5)}
            />
        </mesh>
    );
}

function FoliageModel({ path, meshName, position, scale, rotationY }) {
    const gltf = useGLTF(path);

    const centeredModel = useMemo(() => {
        const sourceObj = meshName ? gltf.scene.getObjectByName(meshName) : gltf.scene;
        if (!sourceObj) {
            console.warn(`Object "${meshName}" not found in ${path}`);
            return null;
        }

        const bakedGroup = new THREE.Group();

        sourceObj.traverse((child) => {
            if (child.isMesh) {
                const bakedMesh = new THREE.Mesh(child.geometry.clone(), child.material);

                bakedMesh.geometry.applyMatrix4(child.matrixWorld);

                bakedMesh.castShadow = true;
                bakedMesh.receiveShadow = true;

                bakedGroup.add(bakedMesh);
            }
        });

        const box = new THREE.Box3().setFromObject(bakedGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);

        bakedGroup.position.set(-center.x, -box.min.y, -center.z);

        return bakedGroup;

    }, [gltf, meshName]);


    if (!centeredModel) return null;

    return (
        <group position={position} scale={scale} rotation-y={rotationY}>
            <primitive object={centeredModel} />
        </group>
    );
}

function Cliff() {
    const gltf = useGLTF('/cliff.glb');

    const centeredModel = useMemo(() => {
        const scene = gltf.scene.clone();
        const box = new THREE.Box3().setFromObject(scene);
        const center = new THREE.Vector3();
        box.getCenter(center);

        scene.position.set(-center.x, -box.min.y, -center.z);

        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return scene;
    }, [gltf]);

    return <primitive object={centeredModel} />;
}

function Bank({ side }) {
    const bankXPosition = (side === 'left' ? -1 : 1) * (riverWidth / 2 + bankWidth / 2);

    const originalSandTexture = useTexture('/sand.jpg');

    const topTexture = useMemo(() => {
        const TILE_SIZE = 70;
        const texture = originalSandTexture.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(bankWidth / TILE_SIZE, riverLength / TILE_SIZE);
        texture.anisotropy = 16;
        texture.needsUpdate = true;
        return texture;
    }, [originalSandTexture]);

    const sideTexture = useMemo(() => {
        const TILE_SIZE = 15;
        const texture = originalSandTexture.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(riverLength / TILE_SIZE, bankHeight / TILE_SIZE);
        texture.anisotropy = 16;
        texture.needsUpdate = true;
        return texture;
    }, [originalSandTexture]);

    const foliage = useMemo(() => {
        const items = [];
        const padding = 3;

        Object.keys(FOLIAGE_CONFIG).forEach(type => {
            const config = FOLIAGE_CONFIG[type];
            const count = Math.floor(config.count * bankWidth * riverLength / 18000);

            const bankAspect = riverLength / bankWidth;
            const gridCols = Math.ceil(Math.sqrt(count / bankAspect));
            const gridRows = Math.ceil(count / gridCols);
            
            if (gridCols === 0 || gridRows === 0) return;

            const cellWidth = (bankWidth - padding * 2) / gridCols;
            const cellHeight = riverLength / gridRows;

            const cellIndices = Array.from({ length: gridCols * gridRows }, (_, i) => i);
            for (let i = cellIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
            }
            
            for (let i = 0; i < count; i++) {
                if (i >= cellIndices.length) break;

                const shuffledIndex = cellIndices[i];
                const col = shuffledIndex % gridCols;
                const row = Math.floor(shuffledIndex / gridCols);

                const x = bankXPosition - (bankWidth / 2 - padding) + (col + Math.random()) * cellWidth;
                const z = -riverLength / 2 + (row + Math.random()) * cellHeight;

                const scale = (Math.random() + 0.5) * config.baseScale;

                items.push({
                    type: type,
                    path: config.path,
                    position: [x, 0, z],
                    meshName: config.meshName,
                    scale: [scale, scale, scale],
                    rotationY: Math.random() * Math.PI * 2,
                });
            }
        });

        return items;
    }, [side, bankXPosition]);

    return (
        <group>
            <mesh receiveShadow position={[bankXPosition, -2.5, 0]}>
                <boxGeometry args={[bankWidth, bankHeight, riverLength]} />
                <meshStandardMaterial map={sideTexture} />
            </mesh>

            <mesh
                receiveShadow
                position={[bankXPosition, 0, 0]}
                rotation-x={-Math.PI / 2}
            >
                <planeGeometry args={[bankWidth, riverLength]} />
                <meshStandardMaterial map={topTexture} />
            </mesh>

            {foliage.map((item, index) => (
                <FoliageModel key={`${side}-${item.type}-${index}`} {...item} />
            ))}
        </group>
    );
}

export default function RiverCanvas() {
    return (
        <Canvas
            shadows
            camera={{ position: [-23.94, 44.1, -52.15], fov: 60 }}
            style={{ width: '100vw', height: '100vh', background:'#000000' }}
        >
            <Sky sunPosition={[-70, 50, 0]} />

            <hemisphereLight skyColor={"#87ceeb"} groundColor={"#4a4a4a"} intensity={0.8} />
            <directionalLight
                color={"#fffde8"}
                position={[-70, 50, 0]}
                intensity={4.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-riverLength / 1.5}
                shadow-camera-right={riverLength / 1.5}
                shadow-camera-top={riverWidth}
                shadow-camera-bottom={-riverWidth}
                shadow-camera-near={0.5}
                shadow-camera-far={500}
            />

            <Suspense fallback={null}>
                <group position={[0, 0, 66]}>
                    <mesh
                        visible={false}
                        rotation-x={-Math.PI / 2}
                    >
                        <planeGeometry args={[riverWidth, riverLength]} />
                        <meshBasicMaterial />
                    </mesh>
                    <ShimmeringWater />
                    <FishSpawner />
                    <Bank side="right" />

                    <group position={[180, 0, -153]} rotation-y={2.15} scale={0.05}>
                        <Cliff />
                    </group>
                    <group position={[180, 0, -43]} rotation-y={2.15} scale={0.05}>
                        <Cliff />
                    </group>
                </group>
            </Suspense>

            <OrbitControls
                target={[11.74, 9.1, -34]}
                enablePan={false}
                enableZoom={false}
                enableRotate={false}
            />
        </Canvas>
    );
}