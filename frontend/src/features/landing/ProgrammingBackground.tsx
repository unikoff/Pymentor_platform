import { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; offsetX: number; offsetY: number; size: number; layer: number; shiftX: number; shiftY: number; velocityX: number; velocityY: number };
const PARTICLE_COLORS = ['rgba(143, 231, 174, .24)', 'rgba(143, 231, 174, .42)', 'rgba(180, 245, 205, .64)'];

export function ProgrammingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.closest<HTMLElement>('.backend-landing');
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !root || !context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const modestDevice = (navigator.hardwareConcurrency || 4) <= 4;
    let width = 1;
    let height = 1;
    let particles: Particle[][] = [[], [], []];
    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let step = 1;
    let pointer: { x: number; y: number } | null = null;
    let pointerTarget: { x: number; y: number } | null = null;
    let pendingPointer: { x: number; y: number } | null = null;
    let pointerStrength = 0;
    let pointerInside = false;
    let visible = true;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = Math.max(1, root.clientWidth);
      height = Math.max(1, root.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, modestDevice ? 1 : 1.25);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const limit = finePointer.matches ? (modestDevice ? 1100 : 2500) : 400;
      const count = Math.min(limit, Math.max(150, Math.round(rect.width * rect.height / (finePointer.matches ? 850 : 3200))));
      particles = [[], [], []];
      for (let index = 0; index < count; index += 1) {
        const layer = Math.floor(Math.random() * 3);
        particles[layer].push({
          x: Math.random() * width, y: Math.random() * height, offsetX: Math.random() * 8 - 4, offsetY: Math.random() * 8 - 4,
          size: .45 + Math.random() * .85, layer,
          shiftX: 0, shiftY: 0, velocityX: 0, velocityY: 0,
        });
      }
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const driftX = Math.sin(elapsed * .00015) * 8;
      const driftY = Math.cos(elapsed * .00015) * 8;
      const swirl = .85 + Math.sin(elapsed * .0008) * .5;
      const damping = Math.pow(.8, step);
      const animateParticles = !motion.matches;
      const activePointer = finePointer.matches && animateParticles && pointerStrength > 0 ? pointer : null;
      for (let layer = 0; layer < 3; layer += 1) {
        context.fillStyle = PARTICLE_COLORS[layer];
        context.beginPath();
        for (const particle of particles[layer]) {
        const baseX = particle.x + driftX * (layer + 1) + particle.offsetX;
        const baseY = particle.y + driftY * (layer + 1) + particle.offsetY;
        let x = baseX;
        let y = baseY;
        let attraction = 0;
        if (activePointer) {
          const dx = activePointer.x - baseX;
          const dy = activePointer.y - baseY;
          const distanceSquared = dx * dx + dy * dy;
          const radius = 320;
          if (distanceSquared < radius * radius) {
            const distance = Math.sqrt(distanceSquared);
            const influence = (1 - distance / radius) ** 2 * pointerStrength;
            const angle = influence * swirl;
            const cosine = Math.cos(angle);
            const sine = Math.sin(angle);
            const scale = 1 - influence * .68;
            x = activePointer.x - (dx * cosine - dy * sine) * scale;
            y = activePointer.y - (dx * sine + dy * cosine) * scale;
            attraction = influence;
          }
        }
        if (animateParticles && (attraction || particle.shiftX || particle.shiftY || particle.velocityX || particle.velocityY)) {
          particle.velocityX = (particle.velocityX + (x - baseX - particle.shiftX) * .045 * step) * damping;
          particle.velocityY = (particle.velocityY + (y - baseY - particle.shiftY) * .045 * step) * damping;
          particle.shiftX += particle.velocityX * step;
          particle.shiftY += particle.velocityY * step;
          if (!attraction && Math.abs(particle.shiftX) + Math.abs(particle.shiftY) + Math.abs(particle.velocityX) + Math.abs(particle.velocityY) < .001) {
            particle.shiftX = 0; particle.shiftY = 0; particle.velocityX = 0; particle.velocityY = 0;
          }
        }
        const size = particle.size + attraction * .5;
        context.rect(baseX + particle.shiftX, baseY + particle.shiftY, size, size);
        }
        context.fill();
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (document.hidden || !visible || motion.matches) return;
      if (!lastFrame) lastFrame = now;
      const frameInterval = finePointer.matches && !modestDevice ? 16 : 33;
      if (now - lastFrame >= frameInterval) {
        const delta = Math.min(now - lastFrame, 50);
        step = Math.min(delta / 16.67, 1.5);
        elapsed += delta;
        lastFrame = now;
        if (pendingPointer) {
          const rect = canvas.getBoundingClientRect();
          pointerTarget = { x: pendingPointer.x - rect.left, y: pendingPointer.y - rect.top };
          if (!pointer) pointer = { ...pointerTarget };
          pendingPointer = null;
        }
        const easing = 1 - Math.exp(-delta / 110);
        if (pointer && pointerTarget && pointerInside) {
          pointer.x += (pointerTarget.x - pointer.x) * easing;
          pointer.y += (pointerTarget.y - pointer.y) * easing;
        }
        pointerStrength += ((pointerInside ? 1 : 0) - pointerStrength) * easing;
        if (!pointerInside && pointerStrength < .001) { pointer = null; pointerTarget = null; }
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && !document.hidden && visible && !motion.matches) {
        lastFrame = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch' || motion.matches) return;
      pendingPointer = { x: event.clientX, y: event.clientY };
      pointerInside = true;
    };
    const onPointerLeave = () => { pointerInside = false; pendingPointer = null; };
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    const onPreference = () => { pointer = null; pointerTarget = null; pendingPointer = null; pointerInside = false; pointerStrength = 0; stop(); resize(); start(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    resizeObserver.observe(root);
    observer.observe(canvas);
    root.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', onPreference);
    finePointer.addEventListener('change', onPreference);
    start();
    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onPreference);
      finePointer.removeEventListener('change', onPreference);
    };
  }, []);

  return <div className="landing-particle-field" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
