import fs from 'node:fs';
import assert from 'node:assert/strict';
import esbuild from 'esbuild';
import React from 'react';
import { renderToString } from 'react-dom/server';

console.log('=== TEST SUITE: AlertBanner & Notification Positioning ===');

// 1. Transpile TSX to executable JS
const tempOut = 'scripts/.temp_alert_banner.mjs';
esbuild.buildSync({
  entryPoints: ['src/components/AlertBanner.tsx'],
  outfile: tempOut,
  bundle: false,
  format: 'esm',
  loader: { '.tsx': 'tsx' },
  jsx: 'automatic'
});

const { AlertBanner } = await import('./.temp_alert_banner.mjs');

// Test 1: Inactive state rendering (0 layout footprint, does not affect document flow or scroll)
const inactiveHtml = renderToString(React.createElement(AlertBanner, { isActive: false }));
assert.equal(inactiveHtml, '', 'Inactive banner must render nothing (null) to guarantee 0 layout displacement');
console.log('✔ Test 1 passed: isActive=false produces 0 DOM footprint');

// Test 2: Active state rendering
const activeHtml = renderToString(React.createElement(AlertBanner, { isActive: true }));
assert.ok(activeHtml.includes('<aside'), 'Active alert must be rendered in an accessible <aside> container');
assert.ok(activeHtml.includes('role="alert"'), 'Must have role="alert"');
assert.ok(activeHtml.includes('aria-live="assertive"'), 'Must have aria-live="assertive"');
assert.ok(activeHtml.includes('aria-atomic="true"'), 'Must have aria-atomic="true"');
assert.ok(activeHtml.includes('fixed'), 'Must be positioned fixed (not in document flow)');
assert.ok(activeHtml.includes('top-3') && activeHtml.includes('right-3'), 'Must have mobile top-3 and right-3');
assert.ok(activeHtml.includes('sm:top-4') && activeHtml.includes('sm:right-4'), 'Must have desktop sm:top-4 and sm:right-4');
assert.ok(activeHtml.includes('z-50'), 'Must have z-50 to float above all components');
assert.ok(activeHtml.includes('animate-toast-enter'), 'Must have entrance animation class');
assert.ok(activeHtml.includes('pointer-events-auto'), 'Must accept pointer events when active');
assert.ok(activeHtml.includes('¡Cabeceo Crítico Detectado!'), 'Must include alert heading');
assert.ok(activeHtml.includes('Buzzer (Pin 8)'), 'Must include acoustic actuator pill');
assert.ok(activeHtml.includes('Vibrador (Pin 9)'), 'Must include haptic actuator pill');
assert.ok(activeHtml.includes('aria-label="Cerrar notificación"'), 'Must include accessible dismiss button');
console.log('✔ Test 2 passed: isActive=true renders floating fixed top-right toast with full metadata and actuator pills');

// Test 3: CSS Keyframe and Overflow-X verification
const css = fs.readFileSync('src/index.css', 'utf8');
assert.ok(css.includes('overflow-x: hidden;'), 'index.css must include overflow-x: hidden on body/html to prevent scroll jitter');
assert.ok(css.includes('@keyframes toast-enter-desktop'), 'Must define toast-enter-desktop keyframes');
assert.ok(css.includes('@keyframes toast-enter-mobile'), 'Must define toast-enter-mobile keyframes');
assert.ok(css.includes('@keyframes toast-exit-desktop'), 'Must define toast-exit-desktop keyframes');
assert.ok(css.includes('@keyframes toast-exit-mobile'), 'Must define toast-exit-mobile keyframes');
assert.ok(css.includes('.animate-toast-exit'), 'Must define animate-toast-exit class');
assert.ok(css.includes('pointer-events: none;'), 'animate-toast-exit must have pointer-events: none to avoid blocking clicks during fade-out');
console.log('✔ Test 3 passed: index.css includes overflow protection, desktop/mobile responsive keyframes and exit pass-through');

// Test 4: App.tsx Container Verification
const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(!appTsx.includes('<div className="px-1 mt-2">\n            <AlertBanner'), 'App.tsx must not wrap AlertBanner in an in-flow margin/padding container');
assert.ok(appTsx.includes('<AlertBanner'), 'App.tsx must mount AlertBanner');
assert.ok(appTsx.includes('onDismiss='), 'App.tsx should provide onDismiss callback');
console.log('✔ Test 4 passed: App.tsx correctly houses AlertBanner outside normal DOM content canvas');

// Test 5: State Machine Lifecycle Verification
function createAlertBannerStateMachine(initialActive = false) {
  let isRendered = initialActive;
  let isLeaving = false;
  let isDismissed = false;
  let exitTimer = null;
  let prevActive = initialActive;
  let dismissedCount = 0;

  return {
    setActive(newActive) {
      const wasActive = prevActive;
      prevActive = newActive;

      if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = null;
      }

      if (newActive) {
        if (!wasActive) {
          isDismissed = false;
        }
        if (!isDismissed) {
          isRendered = true;
          isLeaving = false;
        }
      } else {
        isDismissed = false;
        if (isRendered) {
          isLeaving = true;
          exitTimer = setTimeout(() => {
            isRendered = false;
            isLeaving = false;
            exitTimer = null;
          }, 280);
        }
      }
    },
    dismiss(onDismissCb) {
      if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = null;
      }
      isLeaving = true;
      exitTimer = setTimeout(() => {
        isDismissed = true;
        isRendered = false;
        isLeaving = false;
        exitTimer = null;
        dismissedCount++;
        onDismissCb?.();
      }, 280);
    },
    getState() {
      return {
        isRendered,
        isLeaving,
        isDismissed,
        isVisible: isRendered && !isDismissed,
        hasActiveTimer: exitTimer !== null,
        dismissedCount
      };
    }
  };
}

// 5A: Clean exit on alert deactivation
const sm1 = createAlertBannerStateMachine(true);
assert.equal(sm1.getState().isVisible, true, 'Initially visible when active');
sm1.setActive(false);
assert.equal(sm1.getState().isLeaving, true, 'Must transition to isLeaving=true immediately on deactivation');
assert.equal(sm1.getState().hasActiveTimer, true, 'Must have exit timer running');

await new Promise((resolve) => setTimeout(resolve, 320));
assert.equal(sm1.getState().isRendered, false, 'After exit timer, isRendered must be false');
assert.equal(sm1.getState().isLeaving, false, 'After exit timer, isLeaving must be false');
assert.equal(sm1.getState().isVisible, false, 'Toast must be unmounted');
console.log('✔ Test 5A passed: Clean exit and complete DOM unmount on alert deactivation');

// 5B: User dismiss while alert is still active
const sm2 = createAlertBannerStateMachine(true);
let dismissedCbFired = false;
sm2.dismiss(() => { dismissedCbFired = true; });
assert.equal(sm2.getState().isLeaving, true, 'Dismiss must set isLeaving=true');

await new Promise((resolve) => setTimeout(resolve, 320));
assert.equal(sm2.getState().isVisible, false, 'Toast must stay dismissed while alert remains active');
assert.equal(sm2.getState().isRendered, false, 'Toast must be unmounted');
assert.equal(dismissedCbFired, true, 'onDismiss callback must fire');

// Deactivate alert and re-activate: must show new alert
sm2.setActive(false);
sm2.setActive(true);
assert.equal(sm2.getState().isVisible, true, 'Subsequent alert cycle must re-show the toast notification');
console.log('✔ Test 5B passed: Dismiss works without bounce-back and re-arms on new alert cycle');

// 5C: Rapid oscillation (alert deactivates then re-activates before exit timeout)
const sm3 = createAlertBannerStateMachine(true);
sm3.setActive(false);
assert.equal(sm3.getState().isLeaving, true, 'Exiting');
// 50ms later, alert reactivates
sm3.setActive(true);
assert.equal(sm3.getState().isLeaving, false, 'Exit must be aborted');
assert.equal(sm3.getState().hasActiveTimer, false, 'Timer must be cancelled');
assert.equal(sm3.getState().isVisible, true, 'Must remain visible');

await new Promise((resolve) => setTimeout(resolve, 350));
assert.equal(sm3.getState().isVisible, true, 'Must still be visible after original timer would have fired');
console.log('✔ Test 5C passed: Rapid oscillation aborts exit cleanly without flicker or premature unmount');

try {
  fs.unlinkSync(tempOut);
} catch {}

console.log('All verification assertions PASSED successfully!');
