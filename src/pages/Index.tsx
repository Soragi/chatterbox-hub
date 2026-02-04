import { useState, useEffect } from "react";
import { Waves, Github, ExternalLink } from "lucide-react";
import TextInput from "@/components/TextInput";
import VoiceSelector from "@/components/VoiceSelector";
import EmotionControls from "@/components/EmotionControls";
import AudioPlayer from "@/components/AudioPlayer";
import SettingsPanel from "@/components/SettingsPanel";
import { useChatterbox } from "@/hooks/useChatterbox";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [apiEndpoint, setApiEndpoint] = useState("/api");
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("default");
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null);
  
  // Voice parameters
  const [exaggeration, setExaggeration] = useState(0.5);
  const [cfgWeight, setCfgWeight] = useState(0.5);
  const [temperature, setTemperature] = useState(0.8);

  const { generate, audioUrl, isGenerating, error, connectionStatus, checkConnection } = useChatterbox(apiEndpoint);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, [apiEndpoint, checkConnection]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleGenerate = async () => {
    await generate({
      text,
      voiceId: selectedVoice,
      referenceAudio: referenceAudio || undefined,
      exaggeration,
      cfgWeight,
      temperature,
    });
  };

  const handleUploadVoice = (file: File) => {
    setReferenceAudio(file);
    toast({
      title: "Voice Uploaded",
      description: `"${file.name}" will be used as the reference voice.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-sm">
              <Waves className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Chatterbox TTS</h1>
              <p className="text-xs text-muted-foreground">Text-to-Speech with Voice Cloning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/antongisli/chatterbox-gb10"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <SettingsPanel
              apiEndpoint={apiEndpoint}
              onApiEndpointChange={setApiEndpoint}
              connectionStatus={connectionStatus}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left Column - Text Input & Audio Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input Card */}
            <div className="glass rounded-2xl p-6">
              <TextInput
                text={text}
                onTextChange={setText}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>

            {/* Audio Player */}
            <AudioPlayer audioUrl={audioUrl || undefined} isGenerating={isGenerating} />

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected" 
                  ? "bg-green-500 animate-pulse" 
                  : connectionStatus === "checking"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-destructive"
              }`} />
              <span className="text-muted-foreground">
                {connectionStatus === "connected" 
                  ? "Connected to Chatterbox Server"
                  : connectionStatus === "checking"
                  ? "Checking connection..."
                  : "Server not connected - Demo mode"}
              </span>
            </div>
          </div>

          {/* Right Column - Voice & Controls */}
          <div className="space-y-6">
            {/* Voice Selection Card */}
            <div className="glass rounded-2xl p-6">
              <VoiceSelector
                selectedVoice={selectedVoice}
                onVoiceSelect={setSelectedVoice}
                onUploadVoice={handleUploadVoice}
              />
            </div>

            {/* Emotion Controls Card */}
            <div className="glass rounded-2xl p-6">
              <EmotionControls
                exaggeration={exaggeration}
                cfgWeight={cfgWeight}
                temperature={temperature}
                onExaggerationChange={setExaggeration}
                onCfgWeightChange={setCfgWeight}
                onTemperatureChange={setTemperature}
              />
            </div>

            {/* Info Card */}
            <div className="glass rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                About Chatterbox
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chatterbox is a state-of-the-art TTS model using a 0.5B Llama architecture 
                with audio diffusion for high-quality voice synthesis. Upload a reference 
                audio to clone any voice!
              </p>
              <div className="flex flex-wrap gap-2">
                {["Voice Cloning", "Emotion Control", "High Quality"].map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Web UI for{" "}
            <a 
              href="https://github.com/antongisli/chatterbox-gb10" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chatterbox TTS
            </a>
            {" "}• Powered by Resemble AI's open-source model
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
