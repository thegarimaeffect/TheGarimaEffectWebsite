"use client";

/**
 * EnvelopeHero — self-contained 3D hero animation.
 *
 * Sequence (GSAP timeline, autoplays on mount, zero interaction):
 *   1. THE CUT   — white envelope tied with a ribbon; ribbon is sliced and
 *                  falls away.
 *   2. THE OPEN  — the flap lifts upward with weighted motion.
 *   3. THE POP   — a glowing "The Garima Effect" core bursts out (bouncy pop).
 *   4. THE SHOOT — four service cards eject outward in four directions.
 *   5. THE ORBIT — the four cards lock into a continuous 3D planetary orbit
 *                  around the core; whole group floats gently.
 *
 * Text is NOT TextGeometry. The brand name + 4 service labels are HTML
 * overlay elements whose screen position is recomputed every frame by
 * projecting 3D anchor points → 2D screen coords. Sharp at any DPI/size.
 *
 * Envelope is stark white. Accent colours pull from the site CSS variables
 * (--color-accent-rose / lavender / gold / violet) read at runtime.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

const LABELS = ["INSTAGRAM GROWTH", "BRAND BUILDING", "SALES FUNNELS", "VIDEO SCRIPTS"];

// Read a CSS custom property (fallback if not present)
function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function EnvelopeHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const coreLabelRef = useRef<HTMLDivElement>(null);
  const cardLabelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Brand colours from CSS tokens ──────────────────────────────────
    const ROSE = new THREE.Color(cssVar("--color-accent-rose", "#e8547a"));
    const LAV = new THREE.Color(cssVar("--color-accent-lavender", "#b89ce0"));
    const GOLD = new THREE.Color(cssVar("--color-accent-gold", "#f5c842"));
    const VIOLET = new THREE.Color(cssVar("--color-accent-violet", "#9b7fc7"));
    const CARD_COLORS = [ROSE, LAV, GOLD, VIOLET];

    // ── Scene / camera / renderer ──────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.6, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // ── Lights ─────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(ROSE.getHex(), 1.4, 30);
    rim.position.set(-5, 2, 4);
    scene.add(rim);
    const fill = new THREE.PointLight(LAV.getHex(), 1.0, 30);
    fill.position.set(5, -2, 4);
    scene.add(fill);

    // ── Root group (for the final gentle float) ────────────────────────
    const root = new THREE.Group();
    scene.add(root);

    // ── ENVELOPE (stark white) ─────────────────────────────────────────
    const WHITE = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.05,
    });
    const WHITE_DARK = new THREE.MeshStandardMaterial({
      color: 0xf2f2f5,
      roughness: 0.6,
      metalness: 0.05,
    });

    const envelope = new THREE.Group();
    root.add(envelope);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.7, 0.35), WHITE);
    envelope.add(body);

    // Front pocket triangle (subtle)
    const pocketShape = new THREE.Shape();
    pocketShape.moveTo(-2.1, -1.35);
    pocketShape.lineTo(2.1, -1.35);
    pocketShape.lineTo(0, 0.5);
    pocketShape.closePath();
    const pocket = new THREE.Mesh(
      new THREE.ShapeGeometry(pocketShape),
      WHITE_DARK
    );
    pocket.position.z = 0.18;
    envelope.add(pocket);

    // Flap (top triangle) — pivots from the top edge
    const flapGroup = new THREE.Group();
    flapGroup.position.set(0, 1.35, 0.18);
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-2.1, 0);
    flapShape.lineTo(2.1, 0);
    flapShape.lineTo(0, -1.85);
    flapShape.closePath();
    const flap = new THREE.Mesh(new THREE.ShapeGeometry(flapShape), WHITE);
    flapGroup.add(flap);
    envelope.add(flapGroup);

    // ── RIBBON (cross of two thin bars) ────────────────────────────────
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: ROSE.getHex(),
      roughness: 0.4,
      metalness: 0.2,
      emissive: ROSE.clone().multiplyScalar(0.25),
    });
    const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.1, 0.42), ribbonMat);
    ribbonV.position.z = 0.05;
    const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 0.42), ribbonMat);
    ribbonH.position.z = 0.05;
    const ribbon = new THREE.Group();
    ribbon.add(ribbonV, ribbonH);
    root.add(ribbon);

    // ── CORE ("The Garima Effect" glowing element) ─────────────────────
    const core = new THREE.Group();
    const coreSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.95, 2),
      new THREE.MeshStandardMaterial({
        color: ROSE.getHex(),
        emissive: ROSE.clone().multiplyScalar(0.5),
        roughness: 0.3,
        metalness: 0.4,
        flatShading: true,
      })
    );
    core.add(coreSphere);
    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 32),
      new THREE.MeshBasicMaterial({
        color: ROSE.getHex(),
        transparent: true,
        opacity: 0.12,
      })
    );
    core.add(coreGlow);
    core.scale.setScalar(0.001); // hidden until the pop
    root.add(core);

    // ── SERVICE CARDS (4) ──────────────────────────────────────────────
    const cards: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.95, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.4,
          metalness: 0.1,
          emissive: CARD_COLORS[i].clone().multiplyScalar(0.15),
        })
      );
      // colored top bar
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.16, 0.1),
        new THREE.MeshStandardMaterial({
          color: CARD_COLORS[i].getHex(),
          emissive: CARD_COLORS[i].clone().multiplyScalar(0.4),
        })
      );
      bar.position.set(0, 0.4, 0.02);
      g.add(card, bar);
      g.scale.setScalar(0.001);
      g.position.set(0, 0, 0);
      root.add(g);
      cards.push(g);
    }

    // ── HTML overlay anchors (project these to screen) ──────────────────
    const coreAnchor = new THREE.Vector3();
    const cardAnchors = cards.map(() => new THREE.Vector3());

    // Orbit params per card (varied angles → dynamic look)
    const orbit = cards.map((_, i) => ({
      radius: 3.0 + i * 0.25,
      speed: 0.35 + i * 0.08,
      phase: (i / 4) * Math.PI * 2,
      tilt: 0.25 + i * 0.35, // varied orbital plane tilt
      yWobble: 0.4 + i * 0.15,
    }));

    let orbiting = false;
    let raf = 0;
    const clock = new THREE.Clock();

    // Project a world point → CSS pixel coords on the overlay
    function project(v: THREE.Vector3, el: HTMLDivElement | null) {
      if (!el) return;
      const p = v.clone().project(camera);
      const x = (p.x * 0.5 + 0.5) * mount!.clientWidth;
      const y = (-p.y * 0.5 + 0.5) * mount!.clientHeight;
      const visible = p.z < 1;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      el.style.opacity = visible ? "1" : "0";
    }

    // ── Animation loop ─────────────────────────────────────────────────
    function tick() {
      const t = clock.getElapsedTime();

      // Core idle spin
      coreSphere.rotation.y = t * 0.5;
      coreSphere.rotation.x = Math.sin(t * 0.3) * 0.2;
      coreGlow.scale.setScalar(1 + Math.sin(t * 2) * 0.06);

      // Orbit motion (after settle)
      if (orbiting) {
        cards.forEach((c, i) => {
          const o = orbit[i];
          const a = t * o.speed + o.phase;
          c.position.x = Math.cos(a) * o.radius;
          c.position.z = Math.sin(a) * o.radius * Math.cos(o.tilt);
          c.position.y = Math.sin(a) * o.radius * Math.sin(o.tilt)
            + Math.sin(t * 1.2 + i) * o.yWobble;
          c.lookAt(0, 0, 0);
          c.rotateY(Math.PI); // face outward-ish
        });
        // gentle whole-group float
        root.position.y = Math.sin(t * 0.8) * 0.18;
        root.rotation.y = Math.sin(t * 0.25) * 0.12;
      }

      // Sync HTML overlays
      core.getWorldPosition(coreAnchor);
      project(coreAnchor, coreLabelRef.current);
      cards.forEach((c, i) => {
        c.getWorldPosition(cardAnchors[i]);
        project(cardAnchors[i], cardLabelRefs.current[i]);
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // ── GSAP timeline ──────────────────────────────────────────────────
    // hide overlays until their element appears
    if (coreLabelRef.current) coreLabelRef.current.style.opacity = "0";
    cardLabelRefs.current.forEach((el) => el && (el.style.opacity = "0"));

    const tl = gsap.timeline({ delay: 0.4 });

    // 1. THE CUT — ribbon slices: split + fall away
    tl.to(ribbonV.scale, { y: 0.0, duration: 0.45, ease: "power2.in" }, 0.2)
      .to(ribbonH.scale, { x: 0.0, duration: 0.45, ease: "power2.in" }, 0.2)
      .to(ribbon.position, { y: -4, duration: 0.8, ease: "power1.in" }, 0.5)
      .to(ribbon.rotation, { z: -0.8, duration: 0.8 }, 0.5);

    // 2. THE OPEN — flap lifts up and back
    tl.to(flapGroup.rotation, { x: 2.4, duration: 0.9, ease: "power3.inOut" }, 0.9);

    // 3. THE POP — core bursts out with bouncy scale
    tl.to(core.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "elastic.out(1, 0.45)" }, 1.4)
      .fromTo(core.position, { y: 0, z: 0 }, { y: 1.4, z: 1.6, duration: 0.8, ease: "back.out(2)" }, 1.4)
      .to(coreLabelRef.current, { opacity: 1, duration: 0.4 }, 1.9);

    // 4. THE SHOOT — cards eject in 4 directions
    const dirs = [
      { x: -4.5, y: 2.3 },
      { x: 4.5, y: 2.3 },
      { x: -4.5, y: -2.0 },
      { x: 4.5, y: -2.0 },
    ];
    cards.forEach((c, i) => {
      tl.to(c.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2.5)" }, 2.0 + i * 0.08)
        .fromTo(
          c.position,
          { x: 0, y: 0.5, z: 0.5 },
          { x: dirs[i].x, y: dirs[i].y, z: 1.0, duration: 0.7, ease: "power3.out" },
          2.0 + i * 0.08
        )
        .to(cardLabelRefs.current[i], { opacity: 1, duration: 0.3 }, 2.3 + i * 0.08);
    });

    // 5. THE ORBIT — flip the flag; render loop takes over
    tl.add(() => { orbiting = true; }, 3.0);
    // fade envelope shell out so orbit reads cleanly
    tl.to([body.material, pocket.material, flap.material].map((m) => m as THREE.MeshStandardMaterial), {
      opacity: 0,
      duration: 0.8,
      onStart: () => {
        [body, pocket, flap].forEach((m) => {
          (m.material as THREE.Material).transparent = true;
        });
      },
    }, 3.0);

    // ── Resize ─────────────────────────────────────────────────────────
    function onResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener("resize", onResize);

    // ── Cleanup ────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      tl.kill();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((o) => {
        if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose();
        const m = (o as THREE.Mesh).material;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else if (m) (m as THREE.Material).dispose();
      });
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="envelope-hero">
      {/* 3D canvas mounts here */}
      <div ref={mountRef} className="envelope-canvas" />

      {/* HTML overlay text — positions synced to 3D anchors each frame */}
      <div className="envelope-overlay">
        <div ref={coreLabelRef} className="eh-core-label">
          <span className="eh-core-title">The Garima Effect</span>
        </div>
        {LABELS.map((label, i) => (
          <div
            key={label}
            ref={(el) => { cardLabelRefs.current[i] = el; }}
            className="eh-card-label"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
