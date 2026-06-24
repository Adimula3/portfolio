// Shared animation-timing helpers.
//
// The goal across the site: never let the animation engine, smooth-scroll, or
// heavy media compete with the browser's first paint. These helpers let each
// component boot its GSAP/Lenis setup *after* the page has loaded, while still
// degrading gracefully when motion is reduced or a script fails to load.

// True when the user has asked the OS to minimise motion. Safe on the server.
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Run `cb` once the page has finished loading, then on the next paint frame so
// the first frame is never blocked. If load already happened (e.g. client-side
// route change), it schedules immediately. Returns a cleanup function.
export function onPageReady(cb) {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let raf = 0;

  const run = () => {
    if (!cancelled) cb();
  };

  // Two rAFs: guarantees we run after the browser has painted at least once.
  const schedule = () => {
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(run);
    });
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}

// Warm the dynamic-import cache for the animation engine while something else
// (like the intro loader) is on screen, so the first real import resolves
// instantly. Fire-and-forget; failures are harmless.
export function prefetchAnimationEngine() {
  if (typeof window === "undefined") return;
  const warm = () => {
    import("gsap").catch(() => {});
    import("gsap/ScrollTrigger").catch(() => {});
    import("gsap/CustomEase").catch(() => {});
    import("lenis").catch(() => {});
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warm, { timeout: 800 });
  } else {
    setTimeout(warm, 300);
  }
}
