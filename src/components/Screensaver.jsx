import React, { useEffect, useRef, useState } from 'react';
import { formatTimeDiff } from '../utils';

const Screensaver = ({ onClose, colorTheme, currentHour, currentMinStr, nextPrayer, timeLeft, lang, renderFormattedTime, timings, activePrayer }) => {
  const canvasRef = useRef(null);
  const [pointer, setPointer] = useState({ x: -1000, y: -1000, isDown: false });

  // Screen WakeLock to keep Android display awake while Screensaver is active
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (e) {
        console.warn("Screen WakeLock failed", e);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Dynamic wave colors mapping matching active colorTheme
    const themeWaveColors = {
      emerald: ['rgba(52, 211, 153, 0.06)', 'rgba(16, 185, 129, 0.12)', 'rgba(4, 120, 87, 0.18)'],
      midnight: ['rgba(56, 189, 248, 0.06)', 'rgba(2, 132, 199, 0.12)', 'rgba(3, 105, 161, 0.18)'],
      sand: ['rgba(251, 191, 36, 0.06)', 'rgba(217, 119, 6, 0.12)', 'rgba(180, 83, 9, 0.18)'],
      velvet: ['rgba(192, 132, 252, 0.06)', 'rgba(147, 51, 234, 0.12)', 'rgba(107, 33, 168, 0.18)']
    };
    const colors = themeWaveColors[colorTheme] || themeWaveColors.emerald;

    // Wave config
    const waves = [
      { yOffset: 0.6, amplitude: 40, wavelength: 0.005, speed: 0.01, color: colors[0] },
      { yOffset: 0.7, amplitude: 60, wavelength: 0.003, speed: 0.008, color: colors[1] },
      { yOffset: 0.8, amplitude: 30, wavelength: 0.008, speed: 0.015, color: colors[2] }
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        for (let i = 0; i <= canvas.width; i += 10) {
          // base sine wave
          let dy = Math.sin(i * wave.wavelength + time * wave.speed) * wave.amplitude;
          
          // touch reaction
          const dx = i - pointer.x;
          // Only react if the touch is within the bottom half or near the waves
          const dy_pointer = (canvas.height * wave.yOffset) - pointer.y;
          const dist = Math.sqrt(dx * dx + dy_pointer * dy_pointer);
          
          if (dist < 300) {
            // increase amplitude near touch
            const effect = (300 - dist) / 300; // 0 to 1
            dy += Math.sin(i * wave.wavelength * 5 - time * wave.speed * 8) * (wave.amplitude * 1.5) * effect;
          }

          const y = canvas.height * wave.yOffset + dy;
          ctx.lineTo(i, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      time++;
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [pointer, colorTheme]);

  return (
    <div 
      className="screensaver-overlay"
      onClick={onClose}
      onPointerMove={(e) => setPointer({ x: e.clientX, y: e.clientY, isDown: pointer.isDown })}
      onPointerDown={(e) => setPointer({ x: e.clientX, y: e.clientY, isDown: true })}
      onPointerUp={() => setPointer({ ...pointer, isDown: false })}
      onPointerLeave={() => setPointer({ x: -1000, y: -1000, isDown: false })}
    >
      <canvas ref={canvasRef} className="screensaver-canvas" />

      <div className="screensaver-content">
        <div className="screensaver-time">
          {renderFormattedTime(`${currentHour}:${currentMinStr}`)}
        </div>
        
        {nextPrayer && (
          <div className="screensaver-next">
            {lang === 'bn' ? `পরবর্তী: ${nextPrayer.name}` : `Next: ${nextPrayer.name}`}
            <span className="screensaver-next-time">
              {renderFormattedTime(timings[nextPrayer.key])}
            </span>
            <div className="screensaver-countdown">
              {nextPrayer ? `(${formatTimeDiff(timeLeft, lang)} ${lang === 'bn' ? 'বাকি' : 'left'})` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Screensaver;
