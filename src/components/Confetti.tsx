import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  velocityHorizontal: number;
  velocityVertical: number;
  delay: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', 
  '#ef4444', '#14b8a6', '#f43f5e', '#a855f7', '#06b6d4'
];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 80 particles with random launch properties
    const temps: Particle[] = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of viewport width
      y: -10 - Math.random() * 20, // start above the viewport
      size: 5 + Math.random() * 8, // size in px
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      velocityHorizontal: (Math.random() - 0.5) * 2, // spread horizontal drift
      velocityVertical: 3 + Math.random() * 4, // fall speed
      delay: Math.random() * 1.5 // staggered entrance
    }));
    setParticles(temps);

    // Self destroy effect after 6 seconds to optimize DOM
    const timer = setTimeout(() => {
      setParticles([]);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm opacity-90 transition-all duration-1000 ease-linear animate-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`, // slightly rectangular confetti shape
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `fall ${6 / p.velocityVertical + p.delay}s linear infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 2px 6px ${p.color}50`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(15px);
          }
          100% {
            transform: translateY(115vh) rotate(360deg) translateX(-15px);
          }
        }
      `}</style>
    </div>
  );
}
