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
      // Try different endpoint formats used by various Chatterbox implementations
      const endpoints = [
        "/audio/speech",           // travisvn/chatterbox-tts-api format
        "/v1/audio/speech",        // OpenAI compatible format
        "/tts",                    // Simple format
        "/generate",               // Direct format
      ];

      // Build request body - try both 'input' and 'text' keys
      const requestBody = {
        input: options.text,       // OpenAI compatible
        text: options.text,        // Chatterbox native
        exaggeration: options.exaggeration,
        cfg_weight: options.cfgWeight,
        cfg: options.cfgWeight,    // Some versions use 'cfg'
        temperature: options.temperature,
      };

      let response: Response | null = null;
      let lastError = "";

      for (const endpoint of endpoints) {
        console.log(`Trying endpoint: ${apiEndpoint}${endpoint}`);
        
        try {
          response = await fetch(`${apiEndpoint}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`${endpoint} response:`, response.status, response.statusText);

          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            break;
          } else if (response.status !== 404) {
            // Not a 404, so this endpoint exists but had an error
            const errorText = await response.text();
            lastError = `${endpoint}: ${response.status} - ${errorText}`;
            console.error(lastError);
          }
        } catch (e) {
          console.error(`Error with ${endpoint}:`, e);
        }
        
        response = null;
      }

      if (!response || !response.ok) {
        throw new Error(lastError || "No working endpoint found. Check /docs on your backend for available endpoints.");
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
