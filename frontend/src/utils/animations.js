import { animate, remove } from 'animejs';

/**
 * Animate container fade-in / slide for view switching.
 */
export function animateViewTransition(targetEl) {
  if (!targetEl) return;
  try {
    remove(targetEl);
    animate(targetEl, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 250,
      ease: 'outCubic',
    });
  } catch (e) {}
}

/**
 * Animate incoming live log row highlight.
 */
export function animateLogRowHighlight(targetEl) {
  if (!targetEl) return;
  try {
    remove(targetEl);
    animate(targetEl, {
      backgroundColor: ['rgba(59, 130, 246, 0.2)', 'rgba(30, 41, 59, 0)'],
      duration: 800,
      ease: 'outQuad',
    });
  } catch (e) {}
}

/**
 * Animate critical anomaly log highlight.
 */
export function animateCriticalLogHighlight(targetEl) {
  if (!targetEl) return;
  try {
    remove(targetEl);
    animate(targetEl, {
      backgroundColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.05)'],
      duration: 1000,
      ease: 'outQuad',
    });
  } catch (e) {}
}

/**
 * Animate counter nudge when stat updates.
 */
export function animateStatNudge(targetEl) {
  if (!targetEl) return;
  try {
    remove(targetEl);
    animate(targetEl, {
      scale: [1, 1.08, 1],
      duration: 300,
      ease: 'inOutQuad',
    });
  } catch (e) {}
}

/**
 * Animate Toast slide-in.
 */
export function animateToastSlideIn(targetEl) {
  if (!targetEl) return;
  try {
    remove(targetEl);
    animate(targetEl, {
      translateX: [100, 0],
      opacity: [0, 1],
      duration: 300,
      ease: 'outCubic',
    });
  } catch (e) {}
}
