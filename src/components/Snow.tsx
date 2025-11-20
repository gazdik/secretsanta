import { useEffect, useState, type CSSProperties } from 'react';

interface Snowflake {
  id: number;
  left: number;
  size: number;
  speed: number;
  delay: number;
  driftStart: number;
  driftEnd: number;
  opacity: number;
  blur: number;
  twinkleDuration: number;
  twinkleMin: number;
}

export function Snow() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 140 }, (_, i) => {
      const opacity = Math.random() * 0.4 + 0.4;
      return {
        id: i,
        left: Math.random() * 100, // percentage across screen
        size: Math.random() * 0.5 + 0.2, // 0.2-0.7rem
        speed: Math.random() * 12 + 8, // 8-20s
        delay: Math.random() * -20, // random start time
        driftStart: (Math.random() - 0.5) * 40,
        driftEnd: (Math.random() - 0.5) * 80,
        opacity,
        blur: Math.random() * 1.5,
        twinkleDuration: Math.random() * 3 + 2,
        twinkleMin: opacity * (Math.random() * 0.4 + 0.2)
      } satisfies Snowflake;
    });
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-overlay fixed inset-0 pointer-events-none" aria-hidden>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 rounded-full bg-white shadow-sm"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}rem`,
            height: `${flake.size}rem`,
            animation: `fall ${flake.speed}s linear infinite, twinkle ${flake.twinkleDuration}s ease-in-out infinite`,
            animationDelay: `${flake.delay}s, ${flake.delay / 2}s`,
            filter: `blur(${flake.blur}px)`,
            '--snow-drift-start': `${flake.driftStart}px`,
            '--snow-drift-end': `${flake.driftEnd}px`,
            '--snow-opacity': flake.opacity,
            '--snow-opacity-min': flake.twinkleMin,
            opacity: flake.opacity,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
 