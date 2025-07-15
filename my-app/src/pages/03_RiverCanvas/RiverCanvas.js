import React, {
    Suspense,
    useRef,
    useMemo,
    useState,
    useCallback,
    useLayoutEffect,
    useEffect,
    createContext,
    useContext
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Sky, useProgress, Html } from '@react-three/drei';
import { audioUnlocker } from '../../AudioUnlocker';

const RIVER_WIDTH = 100;
const RIVER_LENGTH = 380;
const BANK_WIDTH = 100;
const BANK_HEIGHT = 5;
const RIVER_VOLUME = 0.13;
const BIRD_VOLUME = 0.52;
const FADE_IN_DURATION = 2;
const FISH_BASE_SCALE = 1;

const FOLIAGE_PATH = '/low_poly_trees_grass_and_rocks.glb';

const FOLIAGE_CONFIG = {
    tree1: { meshName: 'Tree1', baseScale: 2, count: 30, draggable: true },
    tree2: { meshName: 'Tree2', baseScale: 2, count: 30, draggable: true },
    rock1: { meshName: 'Rock1', baseScale: 3, count: 20, draggable: true },
    rock2: { meshName: 'Rock2', baseScale: 3, count: 200, draggable: true },
    rock3: { meshName: 'Rock3', baseScale: 3, count: 200, draggable: true },
    rock4: { meshName: 'Rock4', baseScale: 3, count: 20, draggable: true },
    branch: { meshName: 'Branch', baseScale: 3, count: 60, draggable: true },
    stump: { meshName: 'Stump1', baseScale: 2, count: 30, draggable: true },
    bush1: { meshName: 'Bush1', baseScale: 3, count: 20, draggable: true },
    bush2: { meshName: 'Bush2', baseScale: 3, count: 20, draggable: true },
    mushroom1: { meshName: 'Mushroom1', baseScale: 3, count: 60, draggable: true },
    mushroom2: { meshName: 'Mushroom2', baseScale: 3, count: 60, draggable: true },
    grass1: { meshName: 'Grass1', baseScale: 5, count: 3000, draggable: false },
    grass2: { meshName: 'Grass2', baseScale: 5, count: 3000, draggable: false },
};

const AudioContext = createContext();
const WaterContext = createContext();

function Loader() {
    const { progress } = useProgress();
    return (
        <Html>
            <div style={{
                position: 'absolute',
                top: '50vh',
                left: '50vw',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{
                    padding: '10px 15px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '5px',
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
                    <div style={{ width: '200px', height: '10px', border: '1px solid white', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#61C0BF' }}></div>
                    </div>
                    <div style={{ marginTop: '10px' }}>{`${Math.round(progress)}%`}</div>
                </div>
            </div>
        </Html>
    );
}

function BackgroundAudio({ children }) {
    const { camera } = useThree();
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [audioStarted, setAudioStarted] = useState(window.__hasUserInteracted);
    const listenerRef = useRef();
    const riverSound = useRef();
    const birdSound = useRef();
    const splashSound = useRef();
    const splashSmallSound = useRef();
    const splashBigSound = useRef();
    const splashFoliageSound = useRef();
    const splashTinySound = useRef();
    const splashXSmallSound = useRef();
    const splashTreeSound = useRef();

    useEffect(() => {
        const listener = new THREE.AudioListener();
        camera.add(listener);
        listenerRef.current = listener;

        riverSound.current = new THREE.Audio(listener);
        birdSound.current = new THREE.Audio(listener);
        splashSound.current = new THREE.Audio(listener);
        splashSmallSound.current = new THREE.Audio(listener);
        splashBigSound.current = new THREE.Audio(listener);
        splashFoliageSound.current = new THREE.Audio(listener);
        splashTinySound.current = new THREE.Audio(listener);
        splashXSmallSound.current = new THREE.Audio(listener);
        splashTreeSound.current = new THREE.Audio(listener);

        const audioLoader = new THREE.AudioLoader();

        const loadPromises = [
            new Promise(res => audioLoader.load('/river.mp3', buffer => { riverSound.current.setBuffer(buffer); riverSound.current.setLoop(true); riverSound.current.setVolume(0); res(); })),
            new Promise(res => audioLoader.load('/bird.mp3', buffer => { birdSound.current.setBuffer(buffer); birdSound.current.setLoop(true); birdSound.current.setVolume(0); res(); })),
            new Promise(res => audioLoader.load('/splash.mp3', buffer => { splashSound.current.setBuffer(buffer); splashSound.current.setVolume(0.325); res(); })),
            new Promise(res => audioLoader.load('/splash_small.mp3', buffer => { splashSmallSound.current.setBuffer(buffer); splashSmallSound.current.setVolume(0.325); res(); })),
            new Promise(res => audioLoader.load('/splash_big.mp3', buffer => { splashBigSound.current.setBuffer(buffer); splashBigSound.current.setVolume(0.455); res(); })),
            new Promise(res => audioLoader.load('/splash_foliage.mp3', buffer => { splashFoliageSound.current.setBuffer(buffer); splashFoliageSound.current.setVolume(0.325); res(); })),
            new Promise(res => audioLoader.load('/splash_tiny.mp3', buffer => { splashTinySound.current.setBuffer(buffer); splashTinySound.current.setVolume(0.39); res(); })),
            new Promise(res => audioLoader.load('/splash_xsmall.mp3', buffer => { splashXSmallSound.current.setBuffer(buffer); splashXSmallSound.current.setVolume(0.455); res(); })),
            new Promise(res => audioLoader.load('/splash_tree.mp3', buffer => { splashTreeSound.current.setBuffer(buffer); splashTreeSound.current.setVolume(0.65); res(); })),
        ];
        Promise.all(loadPromises).then(() => setAudioLoaded(true));
        return () => {
            [
                riverSound,
                birdSound,
                splashSound,
                splashSmallSound,
                splashBigSound,
                splashFoliageSound,
                splashTinySound,
                splashXSmallSound,
                splashTreeSound
            ].forEach(ref => {
                if (ref.current?.isPlaying) {
                    ref.current.stop();
                }
            });
            camera.remove(listenerRef.current);
            if (listenerRef.current.context.state !== 'closed') {
                listenerRef.current.context.close();
            }
        };
    }, [camera]);

    useEffect(() => {
        if (audioLoaded && audioStarted) {
            if (riverSound.current && !riverSound.current.isPlaying) riverSound.current.play();
            if (birdSound.current && !birdSound.current.isPlaying) birdSound.current.play();
        }
    }, [audioLoaded, audioStarted]);

    useFrame((_, delta) => {
        if (riverSound.current?.isPlaying && riverSound.current.getVolume() < RIVER_VOLUME) { riverSound.current.setVolume(Math.min(riverSound.current.getVolume() + (RIVER_VOLUME / FADE_IN_DURATION) * delta, RIVER_VOLUME)); }
        if (birdSound.current?.isPlaying && birdSound.current.getVolume() < BIRD_VOLUME) { birdSound.current.setVolume(Math.min(birdSound.current.getVolume() + (BIRD_VOLUME / FADE_IN_DURATION) * delta, BIRD_VOLUME)); }
    });

    const playSound = useCallback((soundRef) => {
        if (soundRef.current?.buffer) {
            if (soundRef.current.isPlaying) soundRef.current.stop();
            soundRef.current.play();
        }
    }, []);

    const playSplash = useCallback(() => playSound(splashSound), [playSound]);
    const playSplashSmall = useCallback(() => playSound(splashSmallSound), [playSound]);
    const playSplashBig = useCallback(() => playSound(splashBigSound), [playSound]);
    const playSplashFoliage = useCallback(() => playSound(splashFoliageSound), [playSound]);
    const playSplashTiny = useCallback(() => playSound(splashTinySound), [playSound]);
    const playSplashXSmall = useCallback(() => playSound(splashXSmallSound), [playSound]);
    const playSplashTree = useCallback(() => playSound(splashTreeSound), [playSound]);

    const audioContextValue = useMemo(() => ({
        playSplash,
        playSplashSmall,
        playSplashBig,
        playSplashFoliage,
        playSplashTiny,
        playSplashXSmall,
        playSplashTree,
        audioLoaded
    }), [playSplash, playSplashSmall, playSplashBig, playSplashFoliage, playSplashTiny, playSplashXSmall, playSplashTree, audioLoaded]);

    return <AudioContext.Provider value={audioContextValue}>{children}</AudioContext.Provider>;
}

function Fish({ id, onOutOfBounds, initialPosition, speed, wiggleSpeed, wiggleAmount, scale }) {
    const ref = useRef();
    const { scene } = useGLTF('/fish2.glb');
    const { playSplash } = useContext(AudioContext);
    const [isDragging, setIsDragging] = useState(false);
    const [swimCenter, setSwimCenter] = useState([initialPosition[0], initialPosition[1]]);
    const timeOffset = useMemo(() => Math.random() * 100, []);
    const DRAG_HEIGHT = 5;
    const SWIM_Y_LEVEL = initialPosition[1];
    const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT), [DRAG_HEIGHT]);
    const intersectionPoint = useMemo(() => new THREE.Vector3(), []);
    const offset = useMemo(() => new THREE.Vector3(), []);
    const targetPosition = useMemo(() => new THREE.Vector3(), []);

    const centeredModel = useMemo(() => {
        const model = scene.clone();
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);
        model.traverse(child => {
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
            const PADDING = 15;
            targetPosition.x = THREE.MathUtils.clamp(targetPosition.x, -RIVER_WIDTH / 2 + PADDING, RIVER_WIDTH / 2 - PADDING);
            targetPosition.z = THREE.MathUtils.clamp(targetPosition.z, -RIVER_LENGTH / 2, RIVER_LENGTH / 2);
            ref.current.position.copy(targetPosition);
            return;
        }

        ref.current.position.z -= speed * delta;
        const t = state.clock.getElapsedTime() + timeOffset;
        ref.current.position.x = swimCenter[0] + Math.sin(t * wiggleSpeed) * wiggleAmount;
        ref.current.position.y = SWIM_Y_LEVEL;

        if (ref.current.position.z < -RIVER_LENGTH / 2 - 20) {
            onOutOfBounds(id);
            return;
        }
        const lookAtPosition = new THREE.Vector3(ref.current.position.x, ref.current.position.y, ref.current.position.z - 1);
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
        playSplash?.();

        if (ref.current) {
            const PADDING = 15;
            let releaseX = THREE.MathUtils.clamp(ref.current.position.x, -RIVER_WIDTH / 2 + PADDING, RIVER_WIDTH / 2 - PADDING);
            let releaseZ = THREE.MathUtils.clamp(ref.current.position.z, -RIVER_LENGTH / 2, RIVER_LENGTH / 2);
            ref.current.position.set(releaseX, SWIM_Y_LEVEL, releaseZ);
            setSwimCenter([releaseX, SWIM_Y_LEVEL]);
        }
    };

    return (
        <group ref={ref} scale={scale} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
            <group rotation-y={Math.PI}>
                <primitive object={centeredModel} />
            </group>
        </group>
    );
}

function FishSpawner() {
    const [fishes, setFishes] = useState([]);
    const spawnTimer = useRef(Math.random() * 2);
    const { audioLoaded } = useContext(AudioContext);

    const createRandomFish = useCallback(() => ({
        id: THREE.MathUtils.generateUUID(),
        initialPosition: [(Math.random() - 0.5) * (RIVER_WIDTH - 30), -8 + (Math.random() - 0.5) * 4, RIVER_LENGTH / 2],
        speed: Math.random() * 18 + 15,
        wiggleSpeed: Math.random() * 2 + 1,
        wiggleAmount: Math.random() * 0.5 + 0.5,
        scale: (15 + Math.random() * 3) * FISH_BASE_SCALE,
    }), []);

    const handleOutOfBounds = useCallback((fishId) => {
        setFishes(currentFishes => currentFishes.filter(fish => fish.id !== fishId));
    }, []);

    useFrame((_, delta) => {
        if (!audioLoaded) return;
        spawnTimer.current -= delta;
        if (spawnTimer.current <= 0) {
            spawnTimer.current = Math.random() * 4 + 1;
            setFishes(currentFishes => [...currentFishes, createRandomFish()]);
        }
    });

    return <>{fishes.map((fishProps) => <Fish key={fishProps.id} {...fishProps} onOutOfBounds={handleOutOfBounds} />)}</>;
}

function ShimmeringWater() {
    const ref = useRef();
    const waterVelocity = useContext(WaterContext);
    const waterNormals = useTexture('/waternormals.jpg', (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    const timerRef = useRef(0);
    const randRef = useRef(Math.random());
    let RAND_TIME = 1 + Math.random() * 2;

    useFrame((state, delta) => {
        if (!ref.current) return;
        timerRef.current += delta;
        if (timerRef.current > RAND_TIME) {
            timerRef.current -= RAND_TIME;
            randRef.current += (Math.random() - 0.5) * 0.2;
            RAND_TIME = 1 + Math.random() * 2;
        }

        const velocityX = Math.sin((randRef.current - 0.5) * 2 * Math.PI) * 0.001;
        const velocityZ = delta * 0.1;

        ref.current.material.normalMap.offset.x += velocityX;
        ref.current.material.normalMap.offset.y -= velocityZ;

        if (waterVelocity.current) {
            waterVelocity.current.x = velocityX;
            waterVelocity.current.z = velocityZ;
        }
    });

    return (
        <mesh ref={ref} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[RIVER_WIDTH, RIVER_LENGTH, 64, 64]} />
            <meshPhysicalMaterial
                roughness={0.2} metalness={0.0} transmission={0.8}
                thickness={1.0} ior={1.33} transparent={true}
                opacity={0.8} color="#61C0BF" normalMap={waterNormals}
                normalScale={new THREE.Vector2(0.5, 0.5)}
            />
        </mesh>
    );
}

function Cliff() {
    const { scene } = useGLTF('/cliff.glb');
    const centeredModel = useMemo(() => {
        const model = scene.clone();
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -box.min.y, -center.z);
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    }, [scene]);
    return <primitive object={centeredModel} />;
}

const DRAG_HEIGHT = 5;
const SINK_DEPTH = -20;

function FoliageModel({ id, onOutOfBounds, model, meshName, position, scale, rotationY, draggable = false }) {
    const ref = useRef();
    const { gl } = useThree();
    const { playSplashSmall, playSplashBig, playSplashFoliage, playSplashTiny, playSplashXSmall, playSplashTree } = useContext(AudioContext);
    const waterVelocity = useContext(WaterContext);

    const [isDragging, setIsDragging] = useState(false);
    const [isFloating, setIsFloating] = useState(false);
    const [isSinking, setIsSinking] = useState(false);

    const dragState = useRef({
        isDown: false,
        pointerId: null,
        offset: new THREE.Vector3(),
        intersectionPoint: new THREE.Vector3(),
        dragPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_HEIGHT),
    });

    const timeOffset = useMemo(() => Math.random() * 100, []);
    const isRock = useMemo(() => meshName.toLowerCase().includes('rock'), [meshName]);
    const targetPosition = useMemo(() => new THREE.Vector3(), []);

    const modelHeight = useMemo(() => {
        if (!model) return 0;
        const box = new THREE.Box3().setFromObject(model);
        return box.max.y - box.min.y;
    }, [model]);

    useLayoutEffect(() => { ref.current && ref.current.position.set(...position); }, [position]);

    const handlePointerDown = (e) => {
        if (!draggable || !ref.current) return;
        e.stopPropagation();
        e.target.setPointerCapture(e.pointerId);

        dragState.current.isDown = true;
        dragState.current.pointerId = e.pointerId;

        setIsFloating(false);
        setIsSinking(false);
        setIsDragging(true);

        ref.current.position.y = DRAG_HEIGHT;

        if (e.ray.intersectPlane(dragState.current.dragPlane, dragState.current.intersectionPoint)) {
            dragState.current.offset.copy(dragState.current.intersectionPoint).sub(ref.current.position);
        }
    };

    const handlePointerUp = (e) => {
        if (!dragState.current.isDown || e.pointerId !== dragState.current.pointerId) return;

        dragState.current.isDown = false;
        dragState.current.pointerId = null;
        setIsDragging(false);

        const isInWater = Math.abs(ref.current.position.x) < RIVER_WIDTH / 2;
        if (isInWater) {
            // meshName에 따라 다른 splash 사운드 재생
            switch (meshName) {
                case 'Mushroom1':
                case 'Mushroom2':
                    playSplashTiny?.();
                    break;
                case 'Rock2':
                case 'Rock3':
                    playSplashSmall?.();
                    break;
                case 'Rock1':
                case 'Rock4':
                    playSplashBig?.();
                    break;
                case 'Tree1':
                case 'Tree2':
                    playSplashTree?.();
                    break;
                case 'Bush1':
                case 'Bush2':
                    playSplashXSmall?.();
                    break;
                case 'Branch':
                case 'Stump1':
                    playSplashFoliage?.();
                    break;
                default:
                    break;
            }

            if (isRock) { setIsSinking(true); } else { setIsFloating(true); }
        } else {
            ref.current.position.y = 0;
            setIsFloating(false);
            setIsSinking(false);
        }
    };

    const handleLostPointerCapture = (e) => {
        if (e.pointerId === dragState.current.pointerId) {
            handlePointerUp(e);
        }
    }

    useFrame((state, delta) => {
        if (!ref.current) return;

        if (dragState.current.isDown) {
            if (state.raycaster.ray.intersectPlane(dragState.current.dragPlane, dragState.current.intersectionPoint)) {
                targetPosition.copy(dragState.current.intersectionPoint.sub(dragState.current.offset));
                ref.current.position.copy(targetPosition);
            }
        } else if (isSinking) {
            let baseSinkSpeed = 9;
            if (meshName === 'Rock1' || meshName === 'Rock4') {
                baseSinkSpeed = 13;
            }

            const sinkSpeed = baseSinkSpeed * (scale + 1) * delta;

            if (ref.current.position.y > SINK_DEPTH + sinkSpeed) {
                ref.current.position.y -= sinkSpeed;
            } else {
                ref.current.position.y = SINK_DEPTH;
            }
        } else if (isFloating && waterVelocity.current) {
            ref.current.position.x += waterVelocity.current.x * 20;
            ref.current.position.z -= waterVelocity.current.z * 150;
            ref.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5 + timeOffset) * (modelHeight * 0.2) - (modelHeight * 0.7);
            if (ref.current.position.z < -RIVER_LENGTH / 2 - 50) { onOutOfBounds(id); }
        }
    });

    useEffect(() => {
        const canvas = gl.domElement;
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('lostpointercapture', handleLostPointerCapture);
        return () => {
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('lostpointercapture', handleLostPointerCapture);
        };
    }, [gl.domElement]);

    useEffect(() => {
        if (!isDragging && ref.current && !isFloating && !isSinking) {
            ref.current.position.y = 0;
        }
    }, [isDragging, isFloating, isSinking]);

    if (!model) return null;

    return (
        <group
            ref={ref}
            scale={scale}
            rotation-y={rotationY}
            onPointerDown={handlePointerDown}
        >
            <primitive object={model.clone()} />
        </group>
    );
}

function InstancedFoliage({ model, instances }) {
    const ref = useRef();
    useEffect(() => {
        if (!ref.current || !instances || !model) return;
        const dummy = new THREE.Object3D();
        instances.forEach((instance, i) => {
            const { position, rotationY, scale } = instance;
            dummy.position.set(...position);
            dummy.rotation.set(0, rotationY, 0);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    }, [instances, model]);

    if (!model || instances.length === 0) return null;
    return (
        <instancedMesh ref={ref} args={[model.geometry, model.material, instances.length]} receiveShadow castShadow />
    );
}

const Bank = React.memo(({ side }) => {
    const originalSandTexture = useTexture('/sand.jpg');
    const gltf = useGLTF(FOLIAGE_PATH);

    const foliageModels = useMemo(() => {
        const models = {};
        if (!gltf.scene) return models;

        Object.values(FOLIAGE_CONFIG).forEach(config => {
            const sourceObj = gltf.scene.getObjectByName(config.meshName);
            if (sourceObj && !models[config.meshName]) {
                const bakedGroup = new THREE.Group();
                sourceObj.traverse(child => {
                    if (child.isMesh) {
                        const bakedMesh = new THREE.Mesh(child.geometry.clone(), child.material.clone());
                        bakedMesh.geometry.applyMatrix4(child.matrixWorld);
                        bakedMesh.castShadow = true;
                        bakedMesh.receiveShadow = true;
                        bakedGroup.add(bakedMesh);
                    }
                });

                const box = new THREE.Box3().setFromObject(bakedGroup);
                const center = new THREE.Vector3();
                box.getCenter(center);

                if (config.draggable) {
                    bakedGroup.position.set(-center.x, -box.min.y, -center.z);
                    models[config.meshName] = bakedGroup;
                }
                else if (bakedGroup.children.length > 0 && bakedGroup.children[0].isMesh) {
                    const mesh = bakedGroup.children[0];
                    const centeredGeometry = mesh.geometry.clone();
                    const centeringMatrix = new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z);
                    centeredGeometry.applyMatrix4(centeringMatrix);
                    models[config.meshName] = new THREE.Mesh(centeredGeometry, mesh.material);
                }
            }
        });
        return models;
    }, [gltf]);

    const { draggableFoliage, instancedFoliage } = useMemo(() => {
        const draggableItems = [];
        const instancedItems = {};
        const PADDING = 3;

        Object.keys(FOLIAGE_CONFIG).forEach(type => {
            const config = FOLIAGE_CONFIG[type];
            const count = Math.floor((config.count * (BANK_WIDTH * RIVER_LENGTH) / 18000) / 2) || 1;
            if (count === 0) return;

            const sign = side === 'left' ? -1 : 1;
            const bankInnerEdgeX = sign * (RIVER_WIDTH / 2);

            for (let i = 0; i < count; i++) {
                const x = bankInnerEdgeX + sign * (PADDING + Math.random() * (BANK_WIDTH - PADDING * 2));
                const z = -RIVER_LENGTH / 2 + Math.random() * RIVER_LENGTH;
                const scaleVal = (Math.random() * 0.5 + 0.75) * config.baseScale;

                const itemData = {
                    id: THREE.MathUtils.generateUUID(),
                    position: [x, 0, z],
                    scale: scaleVal,
                    rotationY: Math.random() * Math.PI * 2,
                    meshName: config.meshName,
                };

                if (config.draggable) {
                    draggableItems.push(itemData);
                } else {
                    if (!instancedItems[config.meshName]) {
                        instancedItems[config.meshName] = [];
                    }
                    instancedItems[config.meshName].push(itemData);
                }
            }
        });
        return { draggableFoliage: draggableItems, instancedFoliage: instancedItems };
    }, [side]);

    const [foliageList, setFoliageList] = useState([]);
    useEffect(() => {
        if (Object.keys(foliageModels).length > 0 && draggableFoliage?.length > 0 && foliageList.length === 0) {
            setFoliageList(draggableFoliage);
        }
    }, [foliageModels, draggableFoliage, foliageList.length]);

    const handleFoliageOutOfBounds = useCallback((id) => {
        setFoliageList(currentFoliage => currentFoliage.filter(item => item.id !== id));
    }, []);

    const [topTexture, sideTexture] = useMemo(() => {
        const makeTexture = (repeatX, repeatY) => {
            const texture = originalSandTexture.clone();
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
            return texture;
        };
        return [makeTexture(BANK_WIDTH / 70, RIVER_LENGTH / 70), makeTexture(RIVER_LENGTH / 15, BANK_HEIGHT / 15)];
    }, [originalSandTexture]);

    const bankXPosition = (side === 'left' ? -1 : 1) * (RIVER_WIDTH / 2 + BANK_WIDTH / 2);

    return (
        <group>
            <mesh receiveShadow position={[bankXPosition, -2.5, 0]}>
                <boxGeometry args={[BANK_WIDTH, BANK_HEIGHT, RIVER_LENGTH]} />
                <meshStandardMaterial map={sideTexture} />
            </mesh>
            <mesh receiveShadow position={[bankXPosition, 0, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[BANK_WIDTH, RIVER_LENGTH]} />
                <meshStandardMaterial map={topTexture} />
            </mesh>

            {foliageList.map((item) => (
                <FoliageModel
                    key={item.id}
                    {...item}
                    model={foliageModels[item.meshName]}
                    draggable={true}
                    onOutOfBounds={handleFoliageOutOfBounds}
                />
            ))}

            {Object.keys(instancedFoliage).map(meshName => (
                <InstancedFoliage
                    key={meshName}
                    model={foliageModels[meshName]}
                    instances={instancedFoliage[meshName]}
                />
            ))}
        </group>
    );
});

export default function RiverCanvas() {
    const waterVelocity = useRef({ x: 0, z: 0 });

    useGLTF.preload(FOLIAGE_PATH);
    useGLTF.preload('/cliff.glb');
    useGLTF.preload('/fish2.glb');
    useTexture.preload('/sand.jpg');
    useTexture.preload('/waternormals.jpg');

    return (
        <Canvas shadows camera={{ position: [-23.94, 44.1, -52.15], fov: 60 }} style={{ width: '100vw', height: '100vh', background: '#000000' }}>
            <Suspense fallback={<Loader />}>
                <Sky sunPosition={[-70, 50, 0]} />
                <hemisphereLight skyColor={"#87ceeb"} groundColor={"#4a4a4a"} intensity={0.8} />
                <directionalLight color={"#fffde8"} position={[-70, 50, 0]} intensity={4.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-RIVER_LENGTH / 1.5} shadow-camera-right={RIVER_LENGTH / 1.5} shadow-camera-top={RIVER_WIDTH} shadow-camera-bottom={-RIVER_WIDTH} shadow-camera-near={0.5} shadow-camera-far={500} />

                <BackgroundAudio>
                    <WaterContext.Provider value={waterVelocity}>
                        <group position={[0, 0, 66]}>
                            <ShimmeringWater />
                            <FishSpawner />
                            <Bank side="right" />
                            <group position={[180, 0, -153]} rotation-y={2.15} scale={0.05}><Cliff /></group>
                            <group position={[180, 0, -43]} rotation-y={2.15} scale={0.05}><Cliff /></group>
                        </group>
                    </WaterContext.Provider>
                </BackgroundAudio>
            </Suspense>
            <OrbitControls target={[11.74, 9.1, -34]} enablePan={false} enableZoom={false} enableRotate={false} />
        </Canvas>
    );
}