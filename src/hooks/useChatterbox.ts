import { useState, useCallback, useEffect } from "react";

interface GenerateOptions {
  text: string;
  voiceId: string;
  referenceAudio?: File;
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
}

interface Voice {
  name: string;
  model_type: string;
}

interface UseChatterboxReturn {
  generate: (options: GenerateOptions) => Promise<void>;
  audioUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  connectionStatus: "connected" | "disconnected" | "checking";
  checkConnection: () => Promise<void>;
  voices: Voice[];
  loadVoices: () => Promise<void>;
}

export const useChatterbox = (apiEndpoint: string): UseChatterboxReturn => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [voices, setVoices] = useState<Voice[]>([]);

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

  const loadVoices = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}/voices`, {
        method: "GET",
      });
      if (response.ok) {
        const voiceList = await response.json();
        setVoices(voiceList);
        console.log("Loaded voices:", voiceList);
      }
    } catch (err) {
      console.error("Failed to load voices:", err);
    }
  }, [apiEndpoint]);

  // Load voices when connection is established
  useEffect(() => {
    if (connectionStatus === "connected") {
      loadVoices();
    }
  }, [connectionStatus, loadVoices]);

  const generate = useCallback(async (options: GenerateOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      let response: Response;

      if (options.referenceAudio) {
        // Use /tts/with-audio for inline reference audio
        console.log("Using /tts/with-audio with reference audio");
        
        const formData = new FormData();
        formData.append("text", options.text);
        formData.append("files", options.referenceAudio);
        formData.append("model", "turbo");
        formData.append("temperature", options.temperature.toString());
        formData.append("exaggeration", options.exaggeration.toString());
        formData.append("cfg_weight", options.cfgWeight.toString());
        
        response = await fetch(`${apiEndpoint}/tts/with-audio`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Use /tts with a precomputed voice
        const voiceName = options.voiceId !== "default" ? options.voiceId : voices[0]?.name;
        
        if (!voiceName) {
          throw new Error("No voice available. Please upload a reference audio or create a voice first.");
        }

        const requestBody = {
          text: options.text,
          voice: voiceName,
          model: "turbo",
          temperature: options.temperature,
          exaggeration: options.exaggeration,
          cfg_weight: options.cfgWeight,
          output_format: "wav",
        };

        console.log("Sending TTS request to:", `${apiEndpoint}/tts`);
        console.log("Request body:", requestBody);
        
        response = await fetch(`${apiEndpoint}/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });
      }

      console.log("TTS response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TTS error response:", errorText);
        throw new Error(`Generation failed (${response.status}): ${errorText || response.statusText}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      console.log("Received audio blob:", audioBlob.size, "bytes, type:", audioBlob.type);
      
      const url = URL.createObjectURL(audioBlob);
      
      // Revoke previous URL if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      setError(null);
    } catch (err) {
      console.error("Generation error:", err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [apiEndpoint, audioUrl, voices]);

  return {
    generate,
    audioUrl,
    isGenerating,
    error,
    connectionStatus,
    checkConnection,
    voices,
    loadVoices,
  };
};
