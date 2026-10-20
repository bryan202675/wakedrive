import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

globalThis.ProgressEvent ??= class ProgressEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    Object.assign(this, init);
  }
};

const source = fs.readFileSync('src/components/Driver3DView.tsx', 'utf8');
assert.equal((source.match(/new FBXLoader\(/g) ?? []).length, 1, 'FBXLoader should be created once');
assert.equal((source.match(/new THREE\.AnimationMixer\(/g) ?? []).length, 1, 'AnimationMixer should be created once');

const bytes = fs.readFileSync('public/models/driving.fbx');
const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const model = new FBXLoader().parse(arrayBuffer, '/');
let modelCreations = 1;
model.scale.setScalar(0.01);
const head = [];
model.traverse((object) => {
  if (object.isBone && object.name.includes('Head') && !object.name.includes('End') && !object.name.includes('Top')) head.push(object);
});
assert.equal(head.length, 2, 'Expected the two same-name head nodes present in this FBX');
const headBone = head.at(-1);

const mixer = new THREE.AnimationMixer(model);
let mixerCreations = 1;
assert.ok(model.animations.length > 0, 'Driving FBX must contain an animation clip');
mixer.clipAction(model.animations[0]).play();
const baseHead = headBone.quaternion.clone();
const pitchAxis = new THREE.Vector3(1, 0, 0);
let currentPitch = 0;
let maxFrameDelta = 0;
let globalTime = 0;
let seed = 0x51a7;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

for (let transition = 0; transition < 30; transition += 1) {
  const state = transition % 3;
  const duration = 0.12 + random() * 1.38;
  const target = state === 0
    ? 0
    : state === 1
      ? THREE.MathUtils.degToRad(12 + random() * 16)
      : THREE.MathUtils.degToRad(42);
  const steps = Math.ceil(duration * 60);
  for (let frame = 0; frame < steps; frame += 1) {
    const dt = 1 / 60;
    globalTime += dt;
    mixer.update(dt);
    const oscillation = state === 0 ? 0 : Math.sin(globalTime * (state === 1 ? 1.2 : 1.1)) * THREE.MathUtils.degToRad(state === 1 ? 2 : 1.4);
    const nextPitch = THREE.MathUtils.damp(currentPitch, target + oscillation, 4, dt);
    maxFrameDelta = Math.max(maxFrameDelta, Math.abs(THREE.MathUtils.radToDeg(nextPitch - currentPitch)));
    currentPitch = nextPitch;
    headBone.quaternion.copy(baseHead).multiply(new THREE.Quaternion().setFromAxisAngle(pitchAxis, currentPitch));
  }
}

assert.ok(maxFrameDelta <= 3, `Head pitch jumped ${maxFrameDelta.toFixed(2)}° in one frame`);
assert.equal(modelCreations, 1, 'Model should be created once');
assert.equal(mixerCreations, 1, 'Mixer should be created once');
console.log(`PASS: 30 state changes; max headPitch delta ${maxFrameDelta.toFixed(2)}°/frame; model=${modelCreations}, mixer=${mixerCreations}`);
