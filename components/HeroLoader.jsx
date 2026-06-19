"use client";

// SOURCE: ghuynguyen.md — PAGE LOADER + HERO sections
//
// PAGE LOADER = 300×400px white card (.preloader-container) inside a full-screen
// white hero section (.hero-container). Three.js WebGL canvas cycles 8 images
// via GLSL displacement shader. GSAP animates the card and navbar in.

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Lenis from "lenis";

// ─── GLSL shaders ────────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader — displacement transition between fromTex and toTex.
// Excerpt from ghuynguyen.md:
//   scaledUVFrom = (scaledUVFrom - 0.5) * (1.0 - m) + 0.5
//   scaledUVTo   = (scaledUVTo   - 0.5) * m + 0.5
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D fromTex;
  uniform sampler2D toTex;
  uniform sampler2D dispTex;
  uniform float     progress;
  uniform float     intensity;
  uniform vec2      cardSize;
  uniform vec2      imgSize;

  varying vec2 vUv;

  vec2 coverFit(vec2 uv, vec2 src, vec2 dst) {
    float srcR = src.x / src.y;
    float dstR = dst.x / dst.y;
    vec2 scale = vec2(1.0);
    if (dstR < srcR) scale.x = dstR / srcR;
    else             scale.y = srcR / dstR;
    return (uv - 0.5) / scale + 0.5;
  }

  void main() {
    vec4  disp = texture2D(dispTex, vUv);
    float m    = progress;

    vec2 duvFrom = vUv + disp.rg * intensity * (1.0 - m);
    vec2 duvTo   = vUv - disp.rg * intensity * m;

    vec2 fitFrom = coverFit(duvFrom, imgSize, cardSize);
    vec2 fitTo   = coverFit(duvTo,   imgSize, cardSize);

    // Exact pattern from ghuynguyen.md GLSL excerpt
    vec2 scaledUVFrom = (fitFrom - 0.5) * (1.0 + 0.06 * m)          + 0.5;
    vec2 scaledUVTo   = (fitTo   - 0.5) * (1.0 - 0.06 * (1.0 - m))  + 0.5;

    vec4 colorFrom = texture2D(fromTex, scaledUVFrom);
    vec4 colorTo   = texture2D(toTex,   scaledUVTo);

    gl_FragColor = mix(colorFrom, colorTo, smoothstep(0.0, 1.0, m));
  }
`;

// ─── Fallback gradient textures (used when real .webp images are absent) ─────

const PALETTES = [
  ["#1a1a2e", "#16213e"],
  ["#0f3460", "#533483"],
  ["#2d132c", "#c72c41"],
  ["#0d0d0d", "#1b4332"],
  ["#2c3e50", "#4ca1af"],
  ["#1c1c2e", "#6a0572"],
  ["#1a1a1a", "#c94b4b"],
  ["#0f2027", "#2c5364"],
];

function makePlaceholder(color1, color2, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx  = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

// ─── Procedural displacement texture (no file path given in ghuynguyen.md) ───

function makeDisplacementTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx  = canvas.getContext("2d");
  const img  = ctx.createImageData(size, size);
  const data = img.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i  = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;
      const v1 = Math.sin((nx * 8  + ny * 6) * Math.PI * 2) * 0.5 + 0.5;
      const v2 = Math.sin((nx * 3  - ny * 5) * Math.PI * 2) * 0.5 + 0.5;
      const v3 = Math.sin((nx * 11 + ny * 7) * Math.PI * 2) * 0.5 + 0.5;
      const v  = (v1 * 0.5 + v2 * 0.3 + v3 * 0.2) * 255;
      data[i]     = v;
      data[i + 1] = 255 - v;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_COUNT    = 8;
const CYCLE_DELAY_MS = 4000;   // not in ghuynguyen.md — assumed
const TRANSITION_DUR = 1.4;    // not in ghuynguyen.md — assumed

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroLoader() {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1. GSAP plugins + custom eases — exact values from ghuynguyen.md
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    gsap.config({ force3D: true, nullTargetWarn: false, autoSleep: 60 });

    CustomEase.create("main",       "0.6, 0.01, 0.05, 1");
    CustomEase.create("gentle",     "0.38, 0.005, 0.215, 1");
    CustomEase.create("smoothBlur", "0.25, 0.1, 0.25, 1");

    const container = containerRef.current;
    if (!container) return;

    // 2. Three.js scene — 300×400 orthographic renderer
    const CARD_W = 300;
    const CARD_H = 400;

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(CARD_W, CARD_H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    // 3. Shader uniforms
    const uniforms = {
      fromTex:   { value: null },
      toTex:     { value: null },
      dispTex:   { value: makeDisplacementTexture() },
      progress:  { value: 0 },
      intensity: { value: 0.35 },
      cardSize:  { value: new THREE.Vector2(CARD_W, CARD_H) },
      imgSize:   { value: new THREE.Vector2(1200, 1600) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    // 4. Render loop
    let animFrameId;
    const render = () => {
      animFrameId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    // 5. Texture loading — real images with gradient fallbacks
    const texLoader = new THREE.TextureLoader();
    let textures        = [];
    let currentIndex    = 0;
    let isTransitioning = false;

    function loadTex(path, fallbackIndex) {
      return new Promise((resolve) => {
        texLoader.load(
          path,
          (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            resolve(tex);
          },
          undefined,
          () => resolve(makePlaceholder(...PALETTES[fallbackIndex % PALETTES.length]))
        );
      });
    }

    // 6. Displacement transition
    function transitionTo(nextIndex) {
      if (isTransitioning) return;
      isTransitioning = true;

      uniforms.fromTex.value  = textures[currentIndex];
      uniforms.toTex.value    = textures[nextIndex];
      uniforms.progress.value = 0;

      gsap.to(uniforms.progress, {
        value:    1,
        duration: TRANSITION_DUR,
        ease:     "main",
        onComplete: () => {
          currentIndex    = nextIndex;
          isTransitioning = false;
        },
      });
    }

    // 7. Auto-cycle
    let cycleInterval;
    function startCycle() {
      uniforms.fromTex.value  = textures[0];
      uniforms.toTex.value    = textures[0];
      uniforms.progress.value = 1;

      cycleInterval = setInterval(() => {
        transitionTo((currentIndex + 1) % textures.length);
      }, CYCLE_DELAY_MS);
    }

    // 8. GSAP entrance animations — exact values from ghuynguyen.md
    function runEntranceAnimations() {
      const tl = gsap.timeline();

      // Card: scale 0.01→1, opacity 0.001→1, 1.2s, ease "main"
      tl.fromTo(
        ".preloader-container",
        { scale: 0.01, opacity: 0.001 },
        { scale: 1,    opacity: 1,     duration: 1.2, ease: "main" }
      );

      // Tagline: opacity 0→0.7, y 20→0, 0.8s, ease "gentle", delay 0.5s
      tl.fromTo(
        ".hero-tagline",
        { opacity: 0, y: 20 },
        { opacity: 0.7, y: 0, duration: 0.8, ease: "gentle", delay: 0.5 },
        "<"
      );

      // Navbar: opacity→1, blur→0, y→0, 0.65s, power2.out, delay 0.3s
      // (NAVBAR section of ghuynguyen.md — 0.65s is the explicit value there)
      tl.to(
        "header.header-blend",
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.65, ease: "power2.out", delay: 0.3 },
        ">"
      );
    }

    // 9. Boot
    async function boot() {
      const paths = Array.from({ length: IMAGE_COUNT }, (_, i) => `/images/Hero/${i + 1}.webp`);
      textures = await Promise.all(paths.map((p, i) => loadTex(p, i)));
      startCycle();
      runEntranceAnimations();
    }

    boot();

    // 10. Lenis smooth scroll — exact config from ghuynguyen.md
    const lenis = new Lenis({
      duration:        1.1,
      easing:          (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel:     true,
      wheelMultiplier: 1,
      touchMultiplier: 0.9,
      syncTouch:       true,
      lerp:            0.08,
    });

    let lenisRafId;
    function lenisRaf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      lenisRafId = requestAnimationFrame(lenisRaf);
    }
    lenisRafId = requestAnimationFrame(lenisRaf);

    return () => {
      cancelAnimationFrame(animFrameId);
      cancelAnimationFrame(lenisRafId);
      clearInterval(cycleInterval);
      lenis.destroy();
      renderer.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section id="about" className="hero-container">
      {/*
        .preloader-container — Three.js appends its canvas here.
        Hidden .image-wrapper <img> elements let the browser preload
        the .webp files eagerly so TextureLoader hits the cache.
        Attributes match ghuynguyen.md: loading="eager", fetchPriority="high", decoding="async"
      */}
      <div ref={containerRef} className="preloader-container">
        {Array.from({ length: IMAGE_COUNT }, (_, i) => (
          <div key={i} className="image-wrapper">
            <img
              src={`/images/Hero/${i + 1}.webp`}
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Tagline — exact text from ghuynguyen.md */}
      <p className="hero-tagline">
        Bridging the gap between humans and digital experiences
      </p>
    </section>
  );
}
