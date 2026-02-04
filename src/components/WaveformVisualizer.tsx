import { useEffect, useRef, useState } from "react";

interface WaveformVisualizerProps {
  isPlaying?: boolean;
  audioUrl?: string;
  className?: string;
}

const WaveformVisualizer = ({ isPlaying = false, audioUrl, className = "" }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [bars] = useState(() => 
    Array.from({ length: 64 }, () => Math.random() * 0.5 + 0.2)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / bars.length;
      const gap = 2;

      bars.forEach((baseHeight, i) => {
        const animatedHeight = isPlaying 
          ? baseHeight * (0.5 + Math.sin(Date.now() / 200 + i * 0.5) * 0.5)
          : baseHeight * 0.3;
        
        const barHeight = animatedHeight * height * 0.8;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, "hsl(175, 80%, 50%)");
        gradient.addColorStop(0.5, "hsl(175, 80%, 60%)");
        gradient.addColorStop(1, "hsl(175, 80%, 40%)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 2);
        ctx.fill();

        // Add glow effect when playing
        if (isPlaying) {
          ctx.shadowColor = "hsl(175, 80%, 50%)";
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, bars]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-24 rounded-lg bg-waveform-bg ${className}`}
      width={512}
      height={96}
    />
  );
};

export default WaveformVisualizer;
