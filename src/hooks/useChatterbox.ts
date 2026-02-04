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
      // Try to discover the correct endpoint by checking /docs or /openapi.json
      // The Chatterbox API may use /synthesize, /tts, or /v1/audio/speech
      const endpoints = ["/synthesize", "/tts", "/v1/audio/speech", "/generate"];
      
      // Create form data for the request (native Chatterbox format)
      const formData = new FormData();
      formData.append("text", options.text);
      formData.append("exaggeration", options.exaggeration.toString());
      formData.append("cfg_weight", options.cfgWeight.toString());
      formData.append("temperature", options.temperature.toString());
      
      if (options.referenceAudio) {
        formData.append("audio", options.referenceAudio);
      }

      // Try /synthesize first (common Chatterbox endpoint)
      console.log("Sending generate request to:", `${apiEndpoint}/synthesize`);
      
      let response = await fetch(`${apiEndpoint}/synthesize`, {
        method: "POST",
        body: formData,
      });

      // If /synthesize returns 404, try /tts
      if (response.status === 404) {
        console.log("Trying /tts endpoint...");
        response = await fetch(`${apiEndpoint}/tts`, {
          method: "POST",
          body: formData,
        });
      }

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
