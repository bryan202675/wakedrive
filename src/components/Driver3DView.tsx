import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FilteredStatus } from '../types';
import { Eye, ShieldAlert, CheckCircle2, RotateCcw, Compass, Radio, Loader2 } from 'lucide-react';

interface Driver3DViewProps {
  filteredStatus: FilteredStatus;
  isAlertActive: boolean;
  confirmationProgress: number;
}

export const Driver3DView: React.FC<Driver3DViewProps> = ({
  filteredStatus,
  isAlertActive,
  confirmationProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Model & Rig References
  const headBoneRef = useRef<THREE.Bone | null>(null);
  const leftArmRef = useRef<THREE.Bone | null>(null);
  const leftForeArmRef = useRef<THREE.Bone | null>(null);
  const leftHandRef = useRef<THREE.Bone | null>(null);
  const rightArmRef = useRef<THREE.Bone | null>(null);
  const rightForeArmRef = useRef<THREE.Bone | null>(null);
  const rightHandRef = useRef<THREE.Bone | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const driverRootRef = useRef<THREE.Group | null>(null);
  const sensorLedMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);

  // Animation targets (Head pitch only for natural drowsiness)
  const targetsRef = useRef({
    headPitch: 0,        // Head forward pitch (rad)
    currentHeadPitch: 0,
  });

  // Camera initial & target coordinates
  const initialCamPos = useRef(new THREE.Vector3(0.70, 0.95, 1.45));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.74, 0.15));

  // Sync posture targets with Arduino telemetry status
  // STRICTLY only head pitch to simulate falling asleep at the wheel
  useEffect(() => {
    if (isAlertActive) {
      // Critical sleepiness: head completely drops forward (chin down ~32°)
      targetsRef.current.headPitch = THREE.MathUtils.degToRad(32);
    } else if (filteredStatus === 'INCLINADO') {
      // Drowsy nod during confirmation window (~18°)
      targetsRef.current.headPitch = THREE.MathUtils.degToRad(18);
    } else {
      // Alert, upright driving posture
      targetsRef.current.headPitch = 0;
    }
  }, [filteredStatus, isAlertActive]);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');

    // 1. SCENE & ENVIRONMENT
    const scene = new THREE.Scene();
    const bgColor = isDark ? 0x0f1422 : 0xf4f0e8;
    scene.background = new THREE.Color(bgColor);

    // 2. CAMERA (FOV 32°, auto-framed to cockpit)
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 40);
    camera.position.copy(initialCamPos.current);
    camera.lookAt(targetLookAt.current);
    cameraRef.current = camera;

    // 3. RENDERER (ACES Filmic Tone Mapping, Antialiased, Max PR 2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.15 : 1.05;

    // Clear previous canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetLookAt.current);
    controls.minDistance = 0.9;
    controls.maxDistance = 2.8;
    controls.minPolarAngle = THREE.MathUtils.degToRad(60);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(100);
    controls.minAzimuthAngle = THREE.MathUtils.degToRad(-80);
    controls.maxAzimuthAngle = THREE.MathUtils.degToRad(80);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      setIsUserInteracting(true);
      controls.autoRotate = false;
    });

    // 5. LIGHTING (Studio Key + Fill + Rim + Soft Warm Ambient)
    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0xcfd8dc : 0xffffff,
      isDark ? 0x1e293b : 0xe2e8f0,
      isDark ? 0.75 : 0.85
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.25);
    keyLight.position.set(1.8, 2.8, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 7;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf1f5f9, isDark ? 0.55 : 0.40);
    fillLight.position.set(-2.0, 1.6, 1.4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.90 : 0.65);
    rimLight.position.set(-0.8, 2.4, -2.0);
    scene.add(rimLight);

    // 6. MASTER COCKPIT GROUP
    const driverRoot = new THREE.Group();
    scene.add(driverRoot);
    driverRootRef.current = driverRoot;

    // Soft ground contact shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
      gradient.addColorStop(0, isDark ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.22)');
      gradient.addColorStop(0.5, isDark ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0.07)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.01, 0.15);
    driverRoot.add(shadowPlane);

    // 7. CAR SEAT (ASIENTO DE AUTO DEPORTIVO)
    const seatGroup = new THREE.Group();
    driverRoot.add(seatGroup);

    const seatMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x18202f : 0x242d3d, // Matte automotive leather
      roughness: 0.72,
      metalness: 0.08,
    });

    const seatAccentMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f1520 : 0x1b2230,
      roughness: 0.65,
      metalness: 0.12,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.25,
      metalness: 0.85,
    });

    // Seat Base Cushion
    const seatCushion = new THREE.Mesh(
      new RoundedBoxGeometry(0.50, 0.12, 0.54, 4, 0.04),
      seatMat
    );
    seatCushion.position.set(0, 0.50, 0.12);
    seatCushion.rotation.x = 0.06;
    seatCushion.castShadow = true;
    seatCushion.receiveShadow = true;
    seatGroup.add(seatCushion);

    // Left and Right Cushion Bolsters
    const leftCushionBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.14, 0.50, 3, 0.03),
      seatAccentMat
    );
    leftCushionBolster.position.set(-0.24, 0.54, 0.12);
    leftCushionBolster.rotation.z = -0.15;
    leftCushionBolster.castShadow = true;
    seatGroup.add(leftCushionBolster);

    const rightCushionBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.14, 0.50, 3, 0.03),
      seatAccentMat
    );
    rightCushionBolster.position.set(0.24, 0.54, 0.12);
    rightCushionBolster.rotation.z = 0.15;
    rightCushionBolster.castShadow = true;
    seatGroup.add(rightCushionBolster);

    // Seat Backrest (Ergonomic bucket backrest with lateral support)
    const seatBackrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.66, 0.14, 5, 0.05),
      seatMat
    );
    seatBackrest.position.set(0, 0.88, -0.09);
    seatBackrest.rotation.x = -0.11;
    seatBackrest.castShadow = true;
    seatBackrest.receiveShadow = true;
    seatGroup.add(seatBackrest);

    // Left and Right Backrest Side Bolsters
    const leftBackBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.58, 0.18, 3, 0.04),
      seatAccentMat
    );
    leftBackBolster.position.set(-0.24, 0.88, -0.05);
    leftBackBolster.rotation.x = -0.11;
    leftBackBolster.rotation.y = -0.22;
    leftBackBolster.castShadow = true;
    seatGroup.add(leftBackBolster);

    const rightBackBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.58, 0.18, 3, 0.04),
      seatAccentMat
    );
    rightBackBolster.position.set(0.24, 0.88, -0.05);
    rightBackBolster.rotation.x = -0.11;
    rightBackBolster.rotation.y = 0.22;
    rightBackBolster.castShadow = true;
    seatGroup.add(rightBackBolster);

    // Chrome Headrest Pillars
    const leftPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.10, 16),
      chromeMat
    );
    leftPillar.position.set(-0.08, 1.20, -0.14);
    seatGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.10, 16),
      chromeMat
    );
    rightPillar.position.set(0.08, 1.20, -0.14);
    seatGroup.add(rightPillar);

    // Headrest Cushion
    const headrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.28, 0.18, 0.10, 4, 0.035),
      seatMat
    );
    headrest.position.set(0, 1.26, -0.15);
    headrest.rotation.x = -0.11;
    headrest.castShadow = true;
    seatGroup.add(headrest);

    // 8. STEERING WHEEL (VOLANTE DE AUTO DEPORTIVO)
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0, 0.68, 0.36);
    wheelGroup.rotation.x = -0.38; // 22° tilt towards driver
    driverRoot.add(wheelGroup);

    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Satin black rim
      roughness: 0.55,
      metalness: 0.15,
    });

    const spokeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Brushed metallic spokes
      roughness: 0.35,
      metalness: 0.70,
    });

    // Circular Torus Rim
    const wheelRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.017, 20, 48),
      wheelMat
    );
    wheelRim.castShadow = true;
    wheelGroup.add(wheelRim);

    // Center Horn / Hub
    const wheelHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.022, 24),
      wheelMat
    );
    wheelHub.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelHub);

    // Center Badge
    const wheelBadge = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 12),
      spokeMat
    );
    wheelBadge.scale.set(1.0, 1.0, 0.3);
    wheelBadge.position.set(0, 0, 0.012);
    wheelGroup.add(wheelBadge);

    // Spokes
    const spokeLeft = new THREE.Mesh(
      new RoundedBoxGeometry(0.13, 0.020, 0.012, 3, 0.003),
      spokeMat
    );
    spokeLeft.position.set(-0.088, 0, 0);
    wheelGroup.add(spokeLeft);

    const spokeRight = new THREE.Mesh(
      new RoundedBoxGeometry(0.13, 0.020, 0.012, 3, 0.003),
      spokeMat
    );
    spokeRight.position.set(0.088, 0, 0);
    wheelGroup.add(spokeRight);

    const spokeBottom = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.11, 0.012, 3, 0.003),
      spokeMat
    );
    spokeBottom.position.set(0, -0.088, 0);
    wheelGroup.add(spokeBottom);

    // Steering Column Tube
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.035, 0.35, 16),
      seatAccentMat
    );
    column.position.set(0, 0, -0.16);
    column.rotation.x = Math.PI / 2;
    wheelGroup.add(column);

    // 9. LOAD MIXAMO CHARACTER (Y-BOT SITTING IDLE)
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      '/models/sitting_idle.fbx',
      (fbx) => {
        // Scale to metric units
        fbx.scale.set(0.01, 0.01, 0.01);
        fbx.position.set(0, 0, 0);

        // Enhance materials & enable shadows
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const isJoint = child.name.toLowerCase().includes('joint');
            if (isJoint) {
              child.material = new THREE.MeshStandardMaterial({
                color: isDark ? 0x1e293b : 0x334155, // Dark graphite joints
                roughness: 0.38,
                metalness: 0.70,
              });
            } else {
              // Main body plates (Sleek titanium/slate driving mannequin)
              child.material = new THREE.MeshStandardMaterial({
                color: isDark ? 0x94a3b8 : 0x64748b, // High-end automotive clay/titanium
                roughness: 0.52,
                metalness: 0.18,
              });
            }
          }
          if (child instanceof THREE.Bone) {
            const name = child.name;
            if (name.includes('Head') && !name.includes('End')) {
              headBoneRef.current = child;
            }
            if (name.includes('LeftArm') && !name.includes('Fore')) {
              leftArmRef.current = child;
            }
            if (name.includes('LeftForeArm')) {
              leftForeArmRef.current = child;
            }
            if (name.includes('LeftHand') && !name.includes('Thumb') && !name.includes('Index') && !name.includes('Middle') && !name.includes('Ring') && !name.includes('Pinky')) {
              leftHandRef.current = child;
            }
            if (name.includes('RightArm') && !name.includes('Fore')) {
              rightArmRef.current = child;
            }
            if (name.includes('RightForeArm')) {
              rightForeArmRef.current = child;
            }
            if (name.includes('RightHand') && !name.includes('Thumb') && !name.includes('Index') && !name.includes('Middle') && !name.includes('Ring') && !name.includes('Pinky')) {
              rightHandRef.current = child;
            }
          }
        });

        console.log('INIT BONES FOUND JSON:', JSON.stringify({
          head: headBoneRef.current?.name,
          leftArm: leftArmRef.current?.name,
          leftForeArm: leftForeArmRef.current?.name,
          rightArm: rightArmRef.current?.name,
          rightForeArm: rightForeArmRef.current?.name,
          leftArmRot: leftArmRef.current ? [leftArmRef.current.rotation.x, leftArmRef.current.rotation.y, leftArmRef.current.rotation.z] : null,
          headRot: headBoneRef.current ? [headBoneRef.current.rotation.x, headBoneRef.current.rotation.y, headBoneRef.current.rotation.z] : null,
        }));

        // Initialize AnimationMixer with Sitting Idle motion
        if (fbx.animations && fbx.animations.length > 0) {
          const leftArmTrack = fbx.animations[0].tracks.find(t => t.name.includes('LeftArm.quaternion'));
          const leftForeTrack = fbx.animations[0].tracks.find(t => t.name.includes('LeftForeArm.quaternion'));
          console.log('TRACK VALUES:', JSON.stringify({
            leftArm: leftArmTrack ? Array.from(leftArmTrack.values.slice(0, 4)) : null,
            leftFore: leftForeTrack ? Array.from(leftForeTrack.values.slice(0, 4)) : null,
          }));
          const mixer = new THREE.AnimationMixer(fbx);
          const action = mixer.clipAction(fbx.animations[0]);
          action.play();
          mixerRef.current = mixer;
        }

        driverRoot.add(fbx);
        setIsLoadingModel(false);
        fitCameraToModel();
      },
      undefined,
      (err) => {
        console.error('Error loading Mixamo FBX model:', err);
        setIsLoadingModel(false);
      }
    );

    // 10. DYNAMIC BOUNDING BOX AUTO-FRAMING (15% MARGIN ON ALL SIDES)
    const fitCameraToModel = () => {
      if (!container || !cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;

      const w = container.clientWidth || 400;
      const h = container.clientHeight || 420;
      const aspect = w / h;
      cam.aspect = aspect;

      const box = new THREE.Box3().setFromObject(driverRoot);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Focus camera on driver cockpit center
      const targetY = THREE.MathUtils.clamp(center.y + 0.12, 0.70, 0.88);
      ctrl.target.set(0, targetY, 0.15);
      targetLookAt.current.copy(ctrl.target);

      const marginFactor = 1.30;
      const modelHeight = size.y * marginFactor;
      const modelWidth = size.x * marginFactor;

      const fovRad = THREE.MathUtils.degToRad(cam.fov);
      const distVertical = modelHeight / (2 * Math.tan(fovRad / 2));
      const distHorizontal = modelWidth / (2 * Math.tan(fovRad / 2) * aspect);
      const targetDist = Math.max(distVertical, distHorizontal) * 0.95 + size.z * 0.25;

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlAngle = params ? params.get('angle') : null;

      let camX = targetDist * Math.sin(0.42);
      const camY = targetY + 0.18;
      let camZ = targetDist * Math.cos(0.42);

      if (urlAngle === 'front' || urlAngle === 'frontal') {
        camX = 0.0;
        camZ = targetDist;
      } else if (urlAngle === '3/4-izq' || urlAngle === 'left') {
        camX = -targetDist * Math.sin(0.46);
        camZ = targetDist * Math.cos(0.46);
      } else if (urlAngle === '3/4-der' || urlAngle === 'right') {
        camX = targetDist * Math.sin(0.46);
        camZ = targetDist * Math.cos(0.46);
      } else if (urlAngle === 'lateral' || urlAngle === 'side') {
        camX = targetDist * Math.sin(0.92);
        camZ = targetDist * Math.cos(0.92);
      }

      cam.position.set(camX, camY, camZ);
      initialCamPos.current.set(camX, camY, camZ);

      if (urlAngle) {
        ctrl.autoRotate = false;
      }

      cam.updateProjectionMatrix();
      ctrl.update();
      renderer.setSize(w, h);
    };

    fitCameraToModel();

    // 11. ANIMATION RENDER LOOP (Mixamo Mixer + Telemetric Cervical Pitch Kinematics)
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. Update Mixamo skeleton animation mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Pose arms up to steering wheel (Driving Posture - Manos arriba manejando a las 10 y 2)
      if (leftArmRef.current) {
        const qArm = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, -0.25, -0.35));
        leftArmRef.current.quaternion.multiply(qArm);
      }
      if (leftForeArmRef.current) {
        const qFore = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.10, 0.15, 0.30));
        leftForeArmRef.current.quaternion.multiply(qFore);
      }
      if (leftHandRef.current) {
        const qHand = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, 0.20, 0.25));
        leftHandRef.current.quaternion.multiply(qHand);
      }

      if (rightArmRef.current) {
        const qArm = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, 0.25, 0.35));
        rightArmRef.current.quaternion.multiply(qArm);
      }
      if (rightForeArmRef.current) {
        const qFore = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.10, -0.15, -0.30));
        rightForeArmRef.current.quaternion.multiply(qFore);
      }
      if (rightHandRef.current) {
        const qHand = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.15, -0.20, -0.25));
        rightHandRef.current.quaternion.multiply(qHand);
      }

      // 2. Apply Telemetric Head Kinematics (STRICTLY head pitch, simulating nodding asleep)
      const easeSpeed = delta * 5.0;
      targetsRef.current.currentHeadPitch = THREE.MathUtils.lerp(
        targetsRef.current.currentHeadPitch,
        targetsRef.current.headPitch,
        easeSpeed
      );

      if (headBoneRef.current) {
        // Pure forward pitch on head bone, strictly simulating nodding off to sleep
        const headNodQ = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          targetsRef.current.currentHeadPitch
        );
        headBoneRef.current.quaternion.multiply(headNodQ);
      }

      // Update Pitch badge in real-time
      const deg = Math.round(THREE.MathUtils.radToDeg(targetsRef.current.currentHeadPitch));
      setCurrentPitch(Math.abs(deg) === 0 ? 0 : deg);

      // 3. Update controls and render
      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 12. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver(() => fitCameraToModel());
    resizeObserver.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 13. DISPOSAL & MEMORY CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      controls.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
      shadowTexture.dispose();
      renderer.dispose();
    };
  }, [filteredStatus, isAlertActive]);

  // Smooth camera reset
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = camera.position.clone();
    const endPos = initialCamPos.current.clone();
    const startTime = performance.now();
    const duration = 500;

    const animateReset = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.copy(targetLookAt.current);
      controls.update();

      if (t < 1) {
        requestAnimationFrame(animateReset);
      } else {
        setIsUserInteracting(false);
        controls.autoRotate = true;
      }
    };

    requestAnimationFrame(animateReset);
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[380px] lg:min-h-[420px] rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col shadow-card ${
        isAlertActive
          ? 'border-red-500/80 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
          : filteredStatus === 'INCLINADO'
          ? 'border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
          : 'border-black/5 dark:border-white/10'
      }`}
    >
      {/* Loading Overlay */}
      {isLoadingModel && (
        <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-mono font-medium text-slate-200">
            Cargando Mixamo Y-Bot & Cockpit...
          </span>
        </div>
      )}

      {/* Top Overlay HUD Bar */}
      <div className="absolute top-3.5 left-4 right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* Live 3D Badge */}
          <div className="px-3 py-1.5 rounded-full bg-white/85 dark:bg-black/75 border border-black/10 dark:border-white/15 backdrop-blur-md flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAlertActive ? 'bg-red-400' : filteredStatus === 'INCLINADO' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isAlertActive ? 'bg-red-500' : filteredStatus === 'INCLINADO' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Conductor Mixamo 3D
            </span>
          </div>

          {/* Real-time Pitch Angle Badge */}
          <div className="px-3 py-1.5 rounded-full bg-white/85 dark:bg-black/75 border border-black/10 dark:border-white/15 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            <span className={`text-xs font-mono font-bold tabular-nums ${
              isAlertActive ? 'text-red-500' : filteredStatus === 'INCLINADO' ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'
            }`}>
              Pitch: {currentPitch === 0 ? '0°' : `-${currentPitch}°`}
            </span>
          </div>
        </div>

        {/* State Chip & Reset Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isAlertActive ? (
            <div className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Somnolencia Crítica</span>
              <span className="sm:hidden">Alerta</span>
            </div>
          ) : filteredStatus === 'INCLINADO' ? (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
              <Eye className="w-3.5 h-3.5" />
              <span>Cabeceo ({confirmationProgress}%)</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Erguido</span>
            </div>
          )}

          {isUserInteracting && (
            <button
              onClick={handleResetCamera}
              className="px-2.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-black/10 dark:border-white/20 text-xs font-medium transition flex items-center gap-1 shadow-sm active:scale-95"
              title="Restablecer posición de cámara"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Centrar</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing relative"
        aria-label="Visualizador 3D del conductor Mixamo con asiento y volante"
      />

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none text-[11px] font-sans text-slate-500 dark:text-slate-400">
        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/70 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm">
          Arrastra para rotar &bull; Rueda para zoom
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-black/70 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-sm font-mono text-[10px] flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-cyan-500" />
          Sensor SW-520D Activo
        </span>
      </div>

      {/* Confirmation Window Progress Line */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${
            isAlertActive
              ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
              : confirmationProgress > 0
              ? 'bg-amber-400'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${confirmationProgress}%` }}
        />
      </div>
    </div>
  );
};

