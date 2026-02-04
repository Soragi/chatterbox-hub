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
      // Chatterbox API expects JSON body with specific field names
      const requestBody = {
        text: options.text,
        exaggeration: options.exaggeration,
        cfg: options.cfgWeight,
        temperature: options.temperature,
      };

      console.log("Sending generate request to:", `${apiEndpoint}/generate`);
      console.log("Request body:", requestBody);
      
      const response = await fetch(`${apiEndpoint}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Generate response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Generate error response:", errorText);
        throw new Error(`Generation failed (${response.status}): ${errorText || response.statusText}`);
      }

      // Check content type to ensure we got audio
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);
      
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML instead of audio - check API proxy configuration");
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
