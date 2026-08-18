/**
 * iOS-safe scroll lock utility.
 *
 * `document.body.style.overflow = "hidden"` doesn't prevent background
 * scrolling on iOS Safari. This utility pins the body with `position: fixed`
 * and restores the scroll position when unlocked.
 *
 * Scrollbar-width compensation is applied to prevent the 15–17px content
 * shift on Windows/Android when the scrollbar disappears. Without it, the
 * `light-leak` gradient in the hero section bleeds into the scrollbar lane
 * and appears as a thin orange stripe at the right edge on first load.
 */

let scrollY = 0;
let lockCount = 0;
let scrollbarWidth = 0;

export function lockScroll() {
  lockCount++;
  if (lockCount > 1) return; // already locked

  // Measure scrollbar width BEFORE hiding it (innerWidth includes scrollbar,
  // clientWidth excludes it — difference = scrollbar width, 0 on mobile).
  scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.overflow = "hidden";
  // Compensate for lost scrollbar width so layout doesn't shift rightward
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

export function unlockScroll() {
  if (lockCount === 0) return; // no lock to release
  lockCount--;
  if (lockCount > 0) return; // still locked by another caller

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  window.scrollTo(0, scrollY);
}
