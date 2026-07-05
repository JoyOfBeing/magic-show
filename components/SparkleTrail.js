'use client';

import { useEffect } from 'react';

export default function SparkleTrail() {
  useEffect(() => {
    const colors = ['#d4b84c', '#a8c744', '#3dcdb4', '#9b6dff', '#d466b0', '#e05577', '#e8a838'];
    let cursorX = 0, cursorY = 0;
    let prevX = null, prevY = null;
    let isMoving = false;
    let moveTimeout = null;
    let animFrame = null;

    if (!document.getElementById('sparkle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'sparkle-keyframes';
      style.textContent = `
        @keyframes sparkleDrift {
          0% { opacity: 0.9; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.5; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.1); }
        }
        .sparkle-particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          animation: sparkleDrift var(--duration) ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    function spawnSparkle(x, y) {
      const el = document.createElement('div');
      el.className = 'sparkle-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 5 + 2;
      const dx = (Math.random() - 0.5) * 40;
      const dy = (Math.random() - 0.5) * 40 - 15;
      const duration = Math.random() * 1 + 1.5;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = color;
      el.style.boxShadow = `0 0 ${size + 2}px ${color}80`;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.setProperty('--duration', duration + 's');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000);
    }

    function sparkleLoop() {
      if (!isMoving) return;
      if (prevX !== null) {
        const dx = cursorX - prevX;
        const dy = cursorY - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          const steps = Math.max(1, Math.floor(dist / 12));
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const ix = prevX + dx * t;
            const iy = prevY + dy * t;
            spawnSparkle(ix + (Math.random() - 0.5) * 14, iy + (Math.random() - 0.5) * 14);
          }
        }
      }
      spawnSparkle(cursorX + (Math.random() - 0.5) * 14, cursorY + (Math.random() - 0.5) * 14);
      prevX = cursorX;
      prevY = cursorY;
      animFrame = requestAnimationFrame(sparkleLoop);
    }

    function handleMove(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        prevX = cursorX;
        prevY = cursorY;
        sparkleLoop();
      }
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
        cancelAnimationFrame(animFrame);
        prevX = null;
        prevY = null;
      }, 100);
    }

    function handleTouch(e) {
      const touch = e.touches[0];
      if (touch) handleMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('touchmove', handleTouch, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  return null;
}
