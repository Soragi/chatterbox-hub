import { Play, Pause, Download, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import WaveformVisualizer from "./WaveformVisualizer";
import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl?: string;
  isGenerating?: boolean;
}

const AudioPlayer = ({ audioUrl, isGenerating = false }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleVolumeChange = ([v]: number[]) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const handleSeek = ([time]: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `chatterbox-${Date.now()}.wav`;
    a.click();
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
      
      {/* Waveform */}
      <div className="relative">
        <WaveformVisualizer isPlaying={isPlaying || isGenerating} audioUrl={audioUrl} />
        
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i}
                    className="w-2 h-8 bg-primary rounded-full animate-wave"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-primary">Generating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {audioUrl && (
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={restart}
            disabled={!audioUrl}
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!audioUrl || isGenerating}
            className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground glow-sm transition-all hover:glow-md"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={!audioUrl}
            className="rounded-full"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-32">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
