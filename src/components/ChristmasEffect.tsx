'use client';

import React, { useEffect, useRef, useState } from 'react';


/**
 * Configuration Props for the Christmas Effect
 */
interface ChristmasEffectProps {
  /** 
   * Z-Index of the canvas. 
   * Default is 50. Ensure this is high enough to be seen, but low enough not to block modals if needed.
   * Since pointerEvents is 'none', it won't block clicks regardless of z-index.
   */
  zIndex?: number;
  /**
   * Whether to show the cursor Santa hat. Default true.
   */
  showCursorHat?: boolean;
}


interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'snow' | 'hat' | 'debris';
  opacity: number;
  swayPhase: number;
  color: string;
}


// Cookie helper functions
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export const ChristmasEffect: React.FC<ChristmasEffectProps> = ({ 
  zIndex = 50,
  showCursorHat = true
}) => {
  const [shouldShow, setShouldShow] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hatCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const groundRef = useRef<Float32Array>(new Float32Array(0));
  const startTimeRef = useRef<number>(Date.now());
  
  // Colors for the theme (Hardcoded to ensure consistency across projects)
  const COLORS = {
    SNOW_START: '#E8DCC8', // Warm Beige (Deeper cream for visibility)
    SNOW_END: '#F5E6D3',   // Light Wheat (Softer beige)
    SNOW_PILE: '#F0E5D8',  // Pale Sand (Visible cream pile)
    SNOW_DEBRIS: '#D4C5B0', // Darker beige for chunks
    RED: '#C41E3A',
    WHITE: '#FFFFFF',
    GOLD: '#D4AF37'
  };

  // Check cookie on mount
  useEffect(() => {
    const hasSeenEffect = getCookie('christmas-effect-seen');
    if (hasSeenEffect) {
      setShouldShow(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;


    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;


    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      // Initialize ground height map (1 bin per 2 logical pixels)
      const bins = Math.ceil(width / 2) + 2; 
      // Only reset if size changes significantly to avoid clearing snow on mobile scroll bar changes
      if (groundRef.current.length === 0 || Math.abs(groundRef.current.length - bins) > 50) {
          groundRef.current = new Float32Array(bins);
      }
    };


    const createParticle = (x: number, y: number, currentPhase: 'storm' | 'calm' | 'ending'): Particle => {
      const isHat = Math.random() > 0.998; 
      
      let sizeBase = currentPhase === 'storm' ? 6 : 5;
      let color = currentPhase === 'storm' ? COLORS.SNOW_START : COLORS.SNOW_END;
      
      const size = isHat ? Math.random() * 8 + 12 : Math.random() * sizeBase + 3;


      return {
        x,
        y,
        vx: (Math.random() - 0.5) * (currentPhase === 'storm' ? 2.5 : 0.8), 
        vy: Math.random() * (currentPhase === 'storm' ? 3 : 1.5) + 1.5, 
        size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        type: isHat ? 'hat' : 'snow',
        opacity: Math.random() * 0.2 + 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        color: isHat ? COLORS.RED : color
      };
    };


    const createDebris = (x: number, y: number, vx: number, vy: number): Particle => {
        return {
            x,
            y,
            vx,
            vy, // Should be negative to fly up
            size: Math.random() * 3 + 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            type: 'debris',
            opacity: 0.8,
            swayPhase: 0,
            color: COLORS.SNOW_DEBRIS
        };
    };


    // --- DRAWING HELPERS ---


    const drawSnowflake = (x: number, y: number, radius: number, opacity: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      
      // Optimization: Simple circle for small particles
      if (radius < 2.5) {
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();
      } else {
          // Detailed flake for larger ones
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, radius);
            ctx.stroke();
          }
      }
      ctx.restore();
    };
    
    const drawDebris = (x: number, y: number, size: number, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = COLORS.SNOW_DEBRIS;
        ctx.beginPath();
        // Irregular shape for clod
        ctx.rect(-size/2, -size/2, size, size);
        ctx.fill();
        ctx.restore();
    };


    const drawSantaHat = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation + Math.PI / 4);
      
      const w = size;
      const h = size * 1.2;


      ctx.beginPath();
      ctx.moveTo(-w/2, h/2);
      ctx.lineTo(w/2, h/2);
      ctx.bezierCurveTo(w/4, -h/2, -w/4, -h/2, -w*0.8, h/2); 
      ctx.fillStyle = COLORS.RED;
      ctx.fill();


      ctx.beginPath();
      ctx.arc(-w*0.8, h/2, w*0.15, 0, Math.PI*2);
      ctx.fillStyle = COLORS.WHITE;
      ctx.fill();
      
      ctx.beginPath();
      ctx.roundRect(-w/2 - 2, h/2 - 4, w + 4, w * 0.25, 5);
      ctx.fillStyle = COLORS.WHITE;
      ctx.fill();
      
      ctx.restore();
    };
    
    const drawGround = () => {
        ctx.fillStyle = COLORS.SNOW_PILE;
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        const ground = groundRef.current;
        for (let i = 0; i < ground.length; i++) {
            const x = i * 2;
            const h = ground[i];
            // Draw relative to height
            ctx.lineTo(x, height - h);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
    };


    // Realistic Physics: "Avalanche" simulation
    const smoothGround = () => {
        const ground = groundRef.current;
        const len = ground.length;
        // Tuned for natural drifts:
        // Steeper maxSlope = taller, spikier piles allowed
        // Lower maxSlope = flatter snow
        const maxSlope = 2.5; 
        const slideFactor = 0.4; 


        // Single pass per frame is usually enough for visual stability
        // Forward
        for(let i = 0; i < len - 1; i++) {
            const current = ground[i];
            const next = ground[i+1];
            const diff = current - next;
            if (diff > maxSlope) {
                const move = (diff - maxSlope) * slideFactor;
                ground[i] -= move;
                ground[i+1] += move;
            }
        }
        // Backward
        for(let i = len - 1; i > 0; i--) {
            const current = ground[i];
            const prev = ground[i-1];
            const diff = current - prev;
            if (diff > maxSlope) {
                const move = (diff - maxSlope) * slideFactor;
                ground[i] -= move;
                ground[i-1] += move;
            }
        }
    };


    const addToPile = (x: number, amount: number) => {
        const binIndex = Math.floor(x / 2);
        const ground = groundRef.current;
        
        if (binIndex >= 1 && binIndex < ground.length - 1) {
            // Significantly boost the amount added so it is visible quickly
            const actualAmount = amount * 2.5; 
            
            // Distribute to neighbors for immediate smoothness
            ground[binIndex] += actualAmount;
            ground[binIndex - 1] += actualAmount * 0.6;
            ground[binIndex + 1] += actualAmount * 0.6;
        }
    };


    // --- ANIMATION LOOP ---


    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const elapsed = (Date.now() - startTimeRef.current) / 1000; 
      let phase: 'storm' | 'calm' | 'ending' = 'storm';
      let spawnProbability = 0;


      // Narrative Timeline
      if (elapsed < 12) {
          phase = 'storm';
          spawnProbability = 0.12; // Gentle snow
      } else if (elapsed < 24) {
          phase = 'calm';
          spawnProbability = 0.05; // Light snow
      } else {
          phase = 'ending';
          spawnProbability = 0; // Stop completely
          
          // Set cookie when effect ends - only do this once
          if (elapsed >= 24 && elapsed < 24.1) {
            setCookie('christmas-effect-seen', 'true', 365);
          }
      }


      // --- INTERACTION: Clean snow on hover with PHYSICS ---
      if (mouseRef.current.x > 0 && groundRef.current.length > 0) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const pmx = prevMouseRef.current.x;
          const pmy = prevMouseRef.current.y;
          
          // Calculate mouse velocity for impact force
          const vx = mx - pmx;
          const vy = my - pmy;
          const speed = Math.sqrt(vx*vx + vy*vy);
          
          const binIndex = Math.floor(mx / 2);
          const brushRadius = 20; 
          
          let hasDug = false;


          for (let i = binIndex - brushRadius; i <= binIndex + brushRadius; i++) {
              if (i >= 0 && i < groundRef.current.length) {
                  const groundH = groundRef.current[i];
                  const surfaceY = height - groundH;
                  
                  // Interaction zone: Mouse is "inside" or just above snow
                  if (my > surfaceY - 40) {
                      const dist = Math.abs(i - binIndex);
                      const falloff = 1 - (dist / brushRadius); 
                      // Dig rate based on mouse movement speed (faster = cleaner cut)
                      // Base removal + Velocity bonus
                      const digAmount = (4 + speed * 0.5) * falloff; 
                      
                      if (groundH > 0) {
                          groundRef.current[i] = Math.max(0, groundH - digAmount);
                          hasDug = true;
                          
                          // Spawn debris particles if moving fast enough and actually removing snow
                          // (Limit spawn rate to avoid performance death)
                          if (speed > 2 && Math.random() < 0.15) {
                               const debrisVx = vx * 0.3 + (Math.random() - 0.5) * 4; // Follow mouse momentum + randomness
                               const debrisVy = -Math.abs(vy * 0.3) - Math.random() * 8 - 4; // Fly Up!
                               
                               // Spawn debris slightly above ground
                               particles.current.push(createDebris(i * 2, surfaceY - 5, debrisVx, debrisVy));
                          }
                      }
                  }
              }
          }
      }


      // Update Previous Mouse
      prevMouseRef.current = { ...mouseRef.current };


      // Physics update
      smoothGround();
      drawGround();


      // Only spawn new snow if active
      if (spawnProbability > 0 && Math.random() < spawnProbability) {
        particles.current.push(createParticle(Math.random() * width, -20, phase));
      }


      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        p.rotation += p.rotationSpeed;
        
        if (p.type === 'debris') {
            // Debris Physics
            p.vy += 0.5; // Heavy gravity
            p.x += p.vx;
            p.y += p.vy;
            
            drawDebris(p.x, p.y, p.size, p.opacity);


            // Debris collision with floor
            const bIdx = Math.floor(p.x / 2);
            const gH = (bIdx >= 0 && bIdx < groundRef.current.length) ? groundRef.current[bIdx] : 0;
            const fY = height - gH;


            if (p.y >= fY) {
                // Re-accumulate! (Conservation of mass-ish)
                // Add a small bump where it lands
                addToPile(p.x, p.size * 0.8);
                particles.current.splice(i, 1);
            } else if (p.y > height) {
                particles.current.splice(i, 1);
            }


        } else {
            // Snow/Hat Physics
            const windForce = Math.sin(Date.now() * 0.001 + p.swayPhase) * (phase === 'storm' ? 0.8 : 0.3);
            p.x += p.vx + windForce;
            p.y += p.vy;


            if (p.type === 'snow') {
                drawSnowflake(p.x, p.y, p.size, p.opacity, p.color);
            } else if (p.type === 'hat') {
                drawSantaHat(p.x, p.y, p.size, p.rotation);
            }


            // --- COLLISION LOGIC ---
            const binIndex = Math.floor(p.x / 2);
            const groundH = (binIndex >= 0 && binIndex < groundRef.current.length) 
                            ? groundRef.current[binIndex] 
                            : 0;
            
            const floorY = height - groundH;


            if (p.y + p.size >= floorY) {
                if (p.type === 'snow') {
                    // Accumulate!
                    addToPile(p.x, p.size); 
                }
                particles.current.splice(i, 1);
            } 
            else if (p.x < -50 || p.x > width + 50) {
                particles.current.splice(i, 1);
            }
        }
      }


      requestRef.current = requestAnimationFrame(animate);
    };


    init();


    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };


    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);


    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [showCursorHat, shouldShow]);

  // Separate useEffect for cursor hat (higher z-index)
  useEffect(() => {
    if (!showCursorHat) return;
    
    const hatCanvas = hatCanvasRef.current;
    if (!hatCanvas) return;
    const hatCtx = hatCanvas.getContext('2d', { alpha: true });
    if (!hatCtx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const initHat = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      hatCanvas.width = width * dpr;
      hatCanvas.height = height * dpr;
      hatCanvas.style.width = `${width}px`;
      hatCanvas.style.height = `${height}px`;
      hatCtx.scale(dpr, dpr);
    };

    const drawSantaHat = (x: number, y: number, size: number, rotation: number) => {
      hatCtx.save();
      hatCtx.translate(x, y);
      hatCtx.rotate(rotation + Math.PI / 4);
      
      const w = size;
      const h = size * 1.2;

      hatCtx.beginPath();
      hatCtx.moveTo(-w/2, h/2);
      hatCtx.lineTo(w/2, h/2);
      hatCtx.bezierCurveTo(w/4, -h/2, -w/4, -h/2, -w*0.8, h/2); 
      hatCtx.fillStyle = COLORS.RED;
      hatCtx.fill();

      hatCtx.beginPath();
      hatCtx.arc(-w*0.8, h/2, w*0.15, 0, Math.PI*2);
      hatCtx.fillStyle = COLORS.WHITE;
      hatCtx.fill();
      
      hatCtx.beginPath();
      hatCtx.roundRect(-w/2 - 2, h/2 - 4, w + 4, w * 0.25, 5);
      hatCtx.fillStyle = COLORS.WHITE;
      hatCtx.fill();
      
      hatCtx.restore();
    };

    const animateHat = () => {
      hatCtx.clearRect(0, 0, width, height);
      
      if (mouseRef.current.x > 0) {
        drawSantaHat(mouseRef.current.x + 10, mouseRef.current.y - 15, 24, -0.2);
      }
      
      requestAnimationFrame(animateHat);
    };

    initHat();
    window.addEventListener('resize', initHat);
    animateHat();

    return () => {
      window.removeEventListener('resize', initHat);
    };
  }, [showCursorHat, COLORS.RED, COLORS.WHITE]);

  // Don't render if effect has been seen
  if (!shouldShow) return null;

  return (
    <>
      {/* Snow effect canvas - lower z-index */}
      <canvas 
        ref={canvasRef} 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: zIndex
        }}
      />
      {/* Cursor hat canvas - higher z-index */}
      {showCursorHat && (
        <canvas 
          ref={hatCanvasRef} 
          style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9999
          }}
        />
      )}
    </>
  );
};
