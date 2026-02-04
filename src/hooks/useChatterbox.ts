import { useState, useCallback } from "react";

interface GenerateOptions {
  text: string;
  voiceId: string;
  referenceAudio?: File;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
}

interface UseChatterboxReturn {
  generate: (options: GenerateOptions) => Promise<void>;
  audioUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  connectionStatus: "connected" | "disconnected" | "checking";
  checkConnection: () => Promise<void>;
}

export const useChatterbox = (apiEndpoint: string): UseChatterboxReturn => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  const checkConnection = useCallback(async () => {
    setConnectionStatus("checking");
    try {
      const response = await fetch(`${apiEndpoint}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch {
      setConnectionStatus("disconnected");
    }
  }, [apiEndpoint]);

  const generate = useCallback(async (options: GenerateOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create form data for the request
      const formData = new FormData();
      formData.append("text", options.text);
      formData.append("exaggeration", options.exaggeration.toString());
      formData.append("cfg_weight", options.cfgWeight.toString());
      formData.append("temperature", options.temperature.toString());
      
      if (options.referenceAudio) {
        formData.append("reference_audio", options.referenceAudio);
      }

      const response = await fetch(`${apiEndpoint}/generate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      // Revoke previous URL if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      
      // For demo purposes, simulate audio generation with a sample
      console.log("API not available, using demo mode");
      
      // Create a simple beep as demo audio
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      // In demo mode, we'll just show a message
      setError("Demo mode: Connect a Chatterbox server to generate real speech");
    } finally {
      setIsGenerating(false);
    }
  }, [apiEndpoint, audioUrl]);

  return {
    generate,
    audioUrl,
    isGenerating,
    error,
    connectionStatus,
    checkConnection,
  };
};
