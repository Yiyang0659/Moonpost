import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Meteor = {
  id: number;
  style: CSSProperties;
};

export default function HeroMeteors() {
  const root = useRef<HTMLDivElement>(null);
  const [meteors, setMeteors] = useState<Meteor[]>([]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let nextWave = 0;
    let clearWave = 0;
    let serial = 0;

    const stop = (reset = true) => {
      window.clearTimeout(nextWave);
      window.clearTimeout(clearWave);
      if (reset) setMeteors([]);
    };
    const schedule = () => {
      if (!visible || document.hidden || reducedMotion.matches) return;
      nextWave = window.setTimeout(() => {
        const count = 1 + Math.floor(Math.random() * 3);
        setMeteors(Array.from({ length: count }, (_, index) => {
          const leftSky = Math.random() < 0.78;
          const angle = -19 - Math.random() * 23;
          const distance = 120 + Math.random() * 145;
          return {
            id: ++serial,
            style: {
              left: `${leftSky ? 37 + Math.random() * 13 : 87 + Math.random() * 10}%`,
              top: `${leftSky ? 9 + Math.random() * 37 : 10 + Math.random() * 25}%`,
              width: `${80 + Math.random() * 95}px`,
              '--meteor-angle': `${angle}deg`,
              '--meteor-x': `${-distance}px`,
              '--meteor-y': `${distance * (0.4 + Math.random() * 0.2)}px`,
              '--meteor-delay': `${index * (0.17 + Math.random() * 0.14)}s`,
              '--meteor-duration': `${1.05 + Math.random() * 0.5}s`,
            } as CSSProperties,
          };
        }));
        clearWave = window.setTimeout(() => setMeteors([]), 2300);
        schedule();
      }, 2400 + Math.random() * 4500);
    };
    const sync = () => {
      stop();
      schedule();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    }, { threshold: 0.05 });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    return () => {
      stop(false);
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
    };
  }, []);

  return <div ref={root} className="post-hero-meteors" aria-hidden="true">
    {meteors.map(meteor => <span key={meteor.id} className="post-hero-meteor" style={meteor.style} />)}
  </div>;
}
