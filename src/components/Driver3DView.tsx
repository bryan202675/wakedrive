import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { FilteredStatus } from '../types';
import { Eye, ShieldAlert, CheckCircle2, RotateCcw, Compass, Loader2 } from 'lucide-react';

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

  // Rig & Skeleton References
  const headBoneRef = useRef<THREE.Bone | null>(null);
  const neckBoneRef = useRef<THREE.Bone | null>(null);
  const spine2BoneRef = useRef<THREE.Bone | null>(null);
  const leftShoulderRef = useRef<THREE.Bone | null>(null);
  const rightShoulderRef = useRef<THREE.Bone | null>(null);
  const leftHandRef = useRef<THREE.Bone | null>(null);
  const rightHandRef = useRef<THREE.Bone | null>(null);
  const leftGripBonesRef = useRef<THREE.Bone[]>([]);
  const rightGripBonesRef = useRef<THREE.Bone[]>([]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const driverRootRef = useRef<THREE.Group | null>(null);
  const sensorLedMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);

  // Targets Ref to sync telemetry state without remounting or resetting the 3D scene
  const targetsRef = useRef({
    status: filteredStatus,
    isAlert: isAlertActive,
    progress: confirmationProgress,
    targetHeadPitch: 0,
    targetNeckPitch: 0,
    targetSpinePitch: 0,
    currentHeadPitch: 0,
    currentNeckPitch: 0,
    currentSpinePitch: 0,
    currentShoulderDrop: 0,
    totalPitch: 0,
    baseHead: new THREE.Quaternion(),
    baseNeck: new THREE.Quaternion(),
    baseSpine: new THREE.Quaternion(),
    baseLeftShoulder: new THREE.Quaternion(),
    baseRightShoulder: new THREE.Quaternion(),
  });

  const lastReportedPitchRef = useRef<number>(0);

  // Camera initial & target coordinates
  const initialCamPos = useRef(new THREE.Vector3(0.85, 0.98, 1.62));
  const targetLookAt = useRef(new THREE.Vector3(-0.02, 0.82, 0.18));

  // Sync posture targets smoothly with Arduino telemetry status
  // Verde (Estable): Erguido y atento al volante (0°)
  // Amarillo (Leve / Inclinado): Cabeceo progresivo / microsueño (18° a 26°)
  // Rojo (Crítico / Alerta): Caída severa de cabeza / somnolencia profunda (38°)
  useEffect(() => {
    targetsRef.current.status = filteredStatus;
    targetsRef.current.isAlert = isAlertActive;
    targetsRef.current.progress = confirmationProgress;

    if (isAlertActive) {
      // Estado Crítico (Rojo): Caída pronunciada de cabeza, cuello y torso
      targetsRef.current.targetHeadPitch = THREE.MathUtils.degToRad(55);
      targetsRef.current.targetNeckPitch = THREE.MathUtils.degToRad(15);
      // Inclina el torso suavemente sin cambiar el clip ni el cabeceo de cabeza.
      targetsRef.current.targetSpinePitch = THREE.MathUtils.degToRad(15);
    } else if (filteredStatus === 'INCLINADO') {
      // Estado Leve (Amarillo): Cabeceo progresivo en función de la ventana de confirmación
      const progressFactor = Math.min(Math.max(confirmationProgress / 100, 0), 1);
      const nodAngle = 12 + 16 * progressFactor;
      targetsRef.current.targetHeadPitch = THREE.MathUtils.degToRad(nodAngle * 0.94);
      targetsRef.current.targetNeckPitch = THREE.MathUtils.degToRad(nodAngle * 0.66);
      targetsRef.current.targetSpinePitch = THREE.MathUtils.degToRad(6 * progressFactor);
    } else {
      // Estado Estable (Verde): Postura erguida, natural y atenta
      targetsRef.current.targetHeadPitch = 0;
      targetsRef.current.targetNeckPitch = 0;
      targetsRef.current.targetSpinePitch = 0;
    }
  }, [filteredStatus, isAlertActive, confirmationProgress]);

  // Main Three.js Scene Setup (Mounts ONCE - continuous animation without restarts)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDark = document.documentElement.classList.contains('dark');

    // 1. SCENE & ENVIRONMENT
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0f1422 : 0xf4f0e8);

    // 2. CAMERA (FOV 32°, tuned for automotive cockpit framing)
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

    // Clean previous canvas if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(targetLookAt.current);
    controls.minDistance = 0.85;
    controls.maxDistance = 2.6;
    controls.minPolarAngle = THREE.MathUtils.degToRad(55);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(98);
    controls.minAzimuthAngle = THREE.MathUtils.degToRad(-85);
    controls.maxAzimuthAngle = THREE.MathUtils.degToRad(85);
    controls.autoRotate = false;
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

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.30);
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

    // Ground contact shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(64, 64, 10, 64, 64, 62);
      gradient.addColorStop(0, isDark ? 'rgba(0, 0, 0, 0.42)' : 'rgba(0, 0, 0, 0.22)');
      gradient.addColorStop(0.5, isDark ? 'rgba(0, 0, 0, 0.14)' : 'rgba(0, 0, 0, 0.07)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.01, 0.22);
    driverRoot.add(shadowPlane);

    // 7. CAR SEAT (ASIENTO DEPORTIVO ERGONÓMICO)
    const seatGroup = new THREE.Group();
    driverRoot.add(seatGroup);

    const seatMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x18202f : 0x242d3d, // Cuero automotriz mate
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
      new RoundedBoxGeometry(0.52, 0.12, 0.56, 4, 0.04),
      seatMat
    );
    seatCushion.position.set(0, 0.50, 0.08);
    seatCushion.rotation.x = 0.06;
    seatCushion.castShadow = true;
    seatCushion.receiveShadow = true;
    seatGroup.add(seatCushion);

    // Left and Right Cushion Bolsters
    const leftCushionBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.14, 0.52, 3, 0.03),
      seatAccentMat
    );
    leftCushionBolster.position.set(-0.25, 0.54, 0.08);
    leftCushionBolster.rotation.z = -0.15;
    leftCushionBolster.castShadow = true;
    seatGroup.add(leftCushionBolster);

    const rightCushionBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.14, 0.52, 3, 0.03),
      seatAccentMat
    );
    rightCushionBolster.position.set(0.25, 0.54, 0.08);
    rightCushionBolster.rotation.z = 0.15;
    rightCushionBolster.castShadow = true;
    seatGroup.add(rightCushionBolster);

    // Seat Backrest (Ergonomic bucket backrest with lateral lumbar support)
    const seatBackrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.48, 0.70, 0.14, 5, 0.05),
      seatMat
    );
    seatBackrest.position.set(0, 0.88, -0.26);
    seatBackrest.rotation.x = -0.12;
    seatBackrest.castShadow = true;
    seatBackrest.receiveShadow = true;
    seatGroup.add(seatBackrest);

    // Backrest Side Bolsters
    const leftBackBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.62, 0.18, 3, 0.04),
      seatAccentMat
    );
    leftBackBolster.position.set(-0.25, 0.88, -0.22);
    leftBackBolster.rotation.x = -0.12;
    leftBackBolster.rotation.y = -0.22;
    leftBackBolster.castShadow = true;
    seatGroup.add(leftBackBolster);

    const rightBackBolster = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.62, 0.18, 3, 0.04),
      seatAccentMat
    );
    rightBackBolster.position.set(0.25, 0.88, -0.22);
    rightBackBolster.rotation.x = -0.12;
    rightBackBolster.rotation.y = 0.22;
    rightBackBolster.castShadow = true;
    seatGroup.add(rightBackBolster);

    // Chrome Headrest Pillars
    const leftPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.11, 16),
      chromeMat
    );
    leftPillar.position.set(-0.08, 1.20, -0.29);
    seatGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.11, 16),
      chromeMat
    );
    rightPillar.position.set(0.08, 1.20, -0.29);
    seatGroup.add(rightPillar);

    // Headrest Cushion
    const headrest = new THREE.Mesh(
      new RoundedBoxGeometry(0.28, 0.18, 0.10, 4, 0.035),
      seatMat
    );
    headrest.position.set(0, 1.25, -0.28);
    headrest.rotation.x = -0.12;
    headrest.castShadow = true;
    seatGroup.add(headrest);

    // 8. STEERING WHEEL & DASHBOARD COCKPIT (VOLANTE Y CONSOLA DE CABINA)
    // Steering wheel center measured from both Mixamo wrist bones during Driving.
    const wheelPivot = new THREE.Group();
    wheelPivot.position.set(-0.039, 0.93, 0.305);
    wheelPivot.rotation.x = 0.48;
    driverRoot.add(wheelPivot);
    const wheelGroup = new THREE.Group();
    wheelPivot.add(wheelGroup);

    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x090a0c,
      roughness: 0.88,
      metalness: 0.02,
    });

    const spokeMat = wheelMat;

    // Circular Torus Rim (Radio 0.18 + Grosor 0.017 = Coincide con las manos del modelo)
    const wheelRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.191, 0.018, 16, 48),
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

    // Three lower spokes leave the left/right grip points clear for the hands.
    const spokeLeft = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.028, 0.024, 3, 0.005),
      spokeMat
    );
    spokeLeft.position.set(-0.062, -0.062, 0);
    spokeLeft.rotation.z = -Math.PI * 0.75;
    wheelGroup.add(spokeLeft);

    const spokeRight = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.028, 0.024, 3, 0.005),
      spokeMat
    );
    spokeRight.position.set(0.062, -0.062, 0);
    spokeRight.rotation.z = -Math.PI * 0.25;
    wheelGroup.add(spokeRight);

    const spokeBottom = new THREE.Mesh(
      new RoundedBoxGeometry(0.028, 0.18, 0.024, 3, 0.005),
      spokeMat
    );
    spokeBottom.position.set(0, -0.088, 0);
    wheelGroup.add(spokeBottom);

    // Dashboard Console Hood & Sensor Module
    const dashHood = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.07, 0.18, 4, 0.02),
      seatAccentMat
    );
    dashHood.position.set(-0.05, 0.59, 0.48);
    dashHood.castShadow = true;
    dashHood.receiveShadow = true;
    driverRoot.add(dashHood);

    // Telemetry SW-520D Sensor Case on Dashboard
    const sensorHousing = new THREE.Mesh(
      new RoundedBoxGeometry(0.09, 0.035, 0.06, 3, 0.008),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.6,
      })
    );
    sensorHousing.position.set(-0.05, 0.63, 0.49);
    driverRoot.add(sensorHousing);

    // Real-time Visual Status LED on the Cockpit Dash
    const sensorLedMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    sensorLedMatRef.current = sensorLedMat;

    const sensorLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.011, 16, 16),
      sensorLedMat
    );
    sensorLed.position.set(-0.05, 0.655, 0.49);
    driverRoot.add(sensorLed);

    // 9. LOAD MIXAMO DRIVING CHARACTER (/models/driving.fbx)
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      '/models/driving.fbx',
      (fbx) => {
        // Metric scale (0.01 conversion for Mixamo FBX centimeters)
        fbx.scale.set(0.01, 0.01, 0.01);
        fbx.position.set(0, 0, 0);

        // Enhance materials & enable shadows
        leftGripBonesRef.current = [];
        rightGripBonesRef.current = [];
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = new THREE.MeshStandardMaterial({
              color: isDark ? 0x94a3b8 : 0x64748b,
              roughness: 0.52,
              metalness: 0.18,
            });
          }
          if (child instanceof THREE.Bone) {
            const name = child.name;
            if (name.includes('Head') && !name.includes('End') && !name.includes('Top')) {
              headBoneRef.current = child;
            }
            if (name.includes('Neck')) {
              neckBoneRef.current = child;
            }
            if (name.includes('Spine2')) {
              spine2BoneRef.current = child;
            }
            if (name.includes('LeftShoulder')) leftShoulderRef.current = child;
            if (name.includes('RightShoulder')) rightShoulderRef.current = child;
            if (name.includes('LeftHand') && !/(Thumb|Index|Middle|Ring|Pinky)/.test(name)) leftHandRef.current = child;
            if (name.includes('RightHand') && !/(Thumb|Index|Middle|Ring|Pinky)/.test(name)) rightHandRef.current = child;
            if (/LeftHand(?:Index|Middle|Ring|Pinky)1$/.test(name)) leftGripBonesRef.current.push(child);
            if (/RightHand(?:Index|Middle|Ring|Pinky)1$/.test(name)) rightGripBonesRef.current.push(child);
          }
        });

        targetsRef.current.baseHead.copy(headBoneRef.current?.quaternion ?? new THREE.Quaternion());
        targetsRef.current.baseNeck.copy(neckBoneRef.current?.quaternion ?? new THREE.Quaternion());
        targetsRef.current.baseSpine.copy(spine2BoneRef.current?.quaternion ?? new THREE.Quaternion());
        targetsRef.current.baseLeftShoulder.copy(leftShoulderRef.current?.quaternion ?? new THREE.Quaternion());
        targetsRef.current.baseRightShoulder.copy(rightShoulderRef.current?.quaternion ?? new THREE.Quaternion());

        // Initialize AnimationMixer with Driving animation
        if (fbx.animations && fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          const action = mixer.clipAction(fbx.animations[0]);
          action.play();
          mixerRef.current = mixer;
        }

        driverRoot.add(fbx);
        driverRoot.updateMatrixWorld(true);
        setIsLoadingModel(false);
        fitCameraToModel();
      },
      undefined,
      (err) => {
        console.error('Error loading Mixamo Driving FBX model:', err);
        setIsLoadingModel(false);
      }
    );

    // 10. DYNAMIC BOUNDING BOX AUTO-FRAMING
    const fitCameraToModel = (preservePose = false) => {
      if (!container || !cameraRef.current || !controlsRef.current) return;
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;

      const w = container.clientWidth || 400;
      const h = container.clientHeight || 420;
      const aspect = w / h;
      cam.aspect = aspect;

      // Focus camera on driver upper cockpit center
      const targetX = -0.02;
      const targetY = 0.82;
      const targetZ = 0.18;
      if (!preservePose) {
        ctrl.target.set(targetX, targetY, targetZ);
        targetLookAt.current.copy(ctrl.target);
      }

      // Auto framed distance for ergonomic cockpit visibility
      const bounds = new THREE.Box3().setFromObject(driverRoot);
      if (bounds.isEmpty()) bounds.set(new THREE.Vector3(-0.36, 0.25, -0.4), new THREE.Vector3(0.36, 1.92, 0.8));
      const size = bounds.getSize(new THREE.Vector3());
      const fitHeight = Math.max(size.y, size.x / aspect) * 1.42;
      const targetDist = Math.max(fitHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))), 1.35) + size.z * 0.24;

      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlAngle = params ? params.get('angle') : null;

      let camX = targetX + targetDist * Math.sin(0.48);
      const camY = targetY + 0.16;
      let camZ = targetZ + targetDist * Math.cos(0.48);

      if (urlAngle === 'front' || urlAngle === 'frontal') {
        camX = targetX;
        camZ = targetZ + targetDist;
      } else if (urlAngle === '3/4-izq' || urlAngle === 'left') {
        camX = targetX - targetDist * Math.sin(0.48);
        camZ = targetZ + targetDist * Math.cos(0.48);
      } else if (urlAngle === '3/4-der' || urlAngle === 'right') {
        camX = targetX + targetDist * Math.sin(0.48);
        camZ = targetZ + targetDist * Math.cos(0.48);
      } else if (urlAngle === 'lateral' || urlAngle === 'side') {
        camX = targetX + targetDist * Math.sin(1.05);
        camZ = targetZ + targetDist * Math.cos(1.05);
      }

      if (!preservePose) {
        cam.position.set(camX, camY, camZ);
        initialCamPos.current.set(camX, camY, camZ);
      }

      if (urlAngle) {
        ctrl.autoRotate = false;
      }

      cam.updateProjectionMatrix();
      ctrl.update();
      renderer.setSize(w, h);
    };

    fitCameraToModel();

    // 11. CONTINUOUS ANIMATION LOOP (Mixamo Driving + Organic Drowsiness Kinematics)
    let animationFrameId: number;
    let lastTime = performance.now();
    // This FBX faces +Z; local X is the measured forward/back nod axis.
    const pitchAxis = new THREE.Vector3(1, 0, 0);
    const leftWheelHand = new THREE.Vector3();
    const rightWheelHand = new THREE.Vector3();
    const wheelHandMidpoint = new THREE.Vector3();
    const wheelHandOffset = new THREE.Vector3();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. Advance base Mixamo driving animation seamlessly (NEVER resets)
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Keep the grip points on the animated wrists through the Driving loop.
      if (leftHandRef.current && rightHandRef.current) {
        const leftGripBones = leftGripBonesRef.current;
        const rightGripBones = rightGripBonesRef.current;
        if (leftGripBones.length && rightGripBones.length) {
          leftWheelHand.set(0, 0, 0);
          rightWheelHand.set(0, 0, 0);
          leftGripBones.forEach((bone) => {
            bone.getWorldPosition(wheelHandOffset);
            leftWheelHand.add(wheelHandOffset);
          });
          rightGripBones.forEach((bone) => {
            bone.getWorldPosition(wheelHandOffset);
            rightWheelHand.add(wheelHandOffset);
          });
          leftWheelHand.multiplyScalar(1 / leftGripBones.length);
          rightWheelHand.multiplyScalar(1 / rightGripBones.length);
        } else {
          leftHandRef.current.getWorldPosition(leftWheelHand);
          rightHandRef.current.getWorldPosition(rightWheelHand);
        }
        driverRoot.worldToLocal(leftWheelHand);
        driverRoot.worldToLocal(rightWheelHand);
        wheelHandMidpoint.addVectors(leftWheelHand, rightWheelHand).multiplyScalar(0.5);
        wheelPivot.position.copy(wheelHandMidpoint);

        const handSpanX = leftWheelHand.x - rightWheelHand.x;
        const handSpanY = leftWheelHand.y - rightWheelHand.y;
        const handSpan = Math.hypot(handSpanX, handSpanY);
        wheelGroup.scale.setScalar(THREE.MathUtils.clamp(handSpan / 0.382, 0.94, 1.06));
        wheelPivot.rotation.z = Math.atan2(handSpanY, handSpanX);
      }

      // 2. Compute dynamic biological kinematics for drowsiness states
      const {
        targetHeadPitch,
        targetNeckPitch,
        targetSpinePitch,
        isAlert,
        status,
      } = targetsRef.current;

      let dynamicHeadPitch = targetHeadPitch;
      let dynamicSpinePitch = targetSpinePitch;
      const globalSeconds = currentTime / 1000;

      if (isAlert) {
        // Estado Crítico: Respiración profunda y pesada de conductor dormido
        const sleepBreath = Math.sin(globalSeconds * 1.1) * THREE.MathUtils.degToRad(1.4);
        dynamicHeadPitch += sleepBreath;
        dynamicSpinePitch += sleepBreath * 0.25;
        dynamicHeadPitch -= Math.pow(Math.max(0, Math.sin(globalSeconds * 0.32)), 14) * THREE.MathUtils.degToRad(6);
      } else if (status === 'INCLINADO') {
        // Estado Leve: Cabeceo oscilatorio (microsueño / lucha por mantenerse despierto)
        const nodBob = Math.sin(globalSeconds * 1.2) * THREE.MathUtils.degToRad(2.0);
        dynamicHeadPitch += nodBob;
      }

      // 4. Smooth exponential lerp transition across states (NO cuts, NO stutters)
      const smoothFactor = 1.0 - Math.exp(-delta * 4);
      targetsRef.current.currentHeadPitch = THREE.MathUtils.lerp(
        targetsRef.current.currentHeadPitch,
        dynamicHeadPitch,
        smoothFactor
      );
      targetsRef.current.currentNeckPitch = THREE.MathUtils.lerp(
        targetsRef.current.currentNeckPitch,
        targetNeckPitch,
        smoothFactor
      );
      targetsRef.current.currentSpinePitch = THREE.MathUtils.lerp(
        targetsRef.current.currentSpinePitch,
        dynamicSpinePitch,
        smoothFactor
      );
      targetsRef.current.totalPitch = targetsRef.current.currentHeadPitch + targetsRef.current.currentNeckPitch;

      const shoulderTarget = isAlert ? THREE.MathUtils.degToRad(7) : status === 'INCLINADO' ? THREE.MathUtils.degToRad(3) : 0;
      targetsRef.current.currentShoulderDrop += (shoulderTarget - targetsRef.current.currentShoulderDrop) * smoothFactor;

      // 5. Apply anatomical pitch rotations to spine, neck, and head bones
      if (spine2BoneRef.current) {
        const qSpine = new THREE.Quaternion().setFromAxisAngle(
          pitchAxis,
          targetsRef.current.currentSpinePitch
        );
        spine2BoneRef.current.quaternion.copy(targetsRef.current.baseSpine).multiply(qSpine);
      }

      if (neckBoneRef.current) {
        const qNeck = new THREE.Quaternion().setFromAxisAngle(
          pitchAxis,
          targetsRef.current.currentNeckPitch
        );
        neckBoneRef.current.quaternion.copy(targetsRef.current.baseNeck).multiply(qNeck);
      }

      if (headBoneRef.current) {
        const qHead = new THREE.Quaternion().setFromAxisAngle(
          pitchAxis,
          targetsRef.current.currentHeadPitch
        );
        headBoneRef.current.quaternion.copy(targetsRef.current.baseHead).multiply(qHead);
      }
      if (leftShoulderRef.current) leftShoulderRef.current.quaternion.copy(targetsRef.current.baseLeftShoulder).multiply(new THREE.Quaternion().setFromAxisAngle(pitchAxis, targetsRef.current.currentShoulderDrop));
      if (rightShoulderRef.current) rightShoulderRef.current.quaternion.copy(targetsRef.current.baseRightShoulder).multiply(new THREE.Quaternion().setFromAxisAngle(pitchAxis, targetsRef.current.currentShoulderDrop));

      // 6. Update dashboard LED indicator to match telemetry mode in real time
      if (sensorLedMatRef.current) {
        if (isAlert) {
          const pulse = 0.55 + 0.45 * Math.sin(currentTime * 0.008);
          sensorLedMatRef.current.color.setRGB(1.0 * pulse, 0.1, 0.1);
          sensorLedMatRef.current.emissive.setRGB(0.9 * pulse, 0.05, 0.05);
        } else if (status === 'INCLINADO') {
          sensorLedMatRef.current.color.setRGB(0.95, 0.70, 0.10);
          sensorLedMatRef.current.emissive.setRGB(0.85, 0.55, 0.05);
        } else {
          sensorLedMatRef.current.color.setRGB(0.06, 0.85, 0.45);
          sensorLedMatRef.current.emissive.setRGB(0.04, 0.60, 0.30);
        }
      }

      // 7. Update UI Pitch badge in real time (throttled to integer degrees)
      const deg = Math.round(THREE.MathUtils.radToDeg(targetsRef.current.totalPitch));
      if (deg !== lastReportedPitchRef.current) {
        lastReportedPitchRef.current = deg;
        setCurrentPitch(deg);
      }

      // 8. Update controls & render scene
      controls.update();
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 12. OBSERVERS (Resize & Dark Mode Class Change)
    const resizeObserver = new ResizeObserver(() => fitCameraToModel(true));
    resizeObserver.observe(container);

    const handleThemeChange = () => {
      const darkNow = document.documentElement.classList.contains('dark');
      scene.background = new THREE.Color(darkNow ? 0x0f1422 : 0xf4f0e8);
      renderer.toneMappingExposure = darkNow ? 1.15 : 1.05;
      hemiLight.color.set(darkNow ? 0xcfd8dc : 0xffffff);
      hemiLight.groundColor.set(darkNow ? 0x1e293b : 0xe2e8f0);
    };

    const themeObserver = new MutationObserver(handleThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

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
      themeObserver.disconnect();
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
  }, []); // Run ONCE on mount so scene & animation never restart when status changes

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
        controls.autoRotate = false;
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
            Cargando Mixamo Driving Y-Bot & Cockpit...
          </span>
        </div>
      )}

      {/* Top Overlay HUD Bar */}
      <div className="absolute top-3.5 left-4 right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
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
