import { Mic, Upload, Plus } from "lucide-react";
import { useState } from "react";

interface Voice {
  name: string;
  model_type: string;
}

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  onUploadVoice: (file: File) => void;
  availableVoices: Voice[];
}

const VoiceSelector = ({ selectedVoice, onVoiceSelect, onUploadVoice, availableVoices }: VoiceSelectorProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes("audio") || file.name.endsWith(".wav") || file.name.endsWith(".mp3"))) {
      onUploadVoice(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVoice(file);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Voice Selection
      </h3>
      
      {/* Voice Grid */}
      <div className="grid grid-cols-1 gap-3">
        {availableVoices.length === 0 ? (
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-sm text-muted-foreground">
              No voices available. Upload a reference audio below to create one.
            </p>
          </div>
        ) : (
          availableVoices.map((voice) => (
            <button
              key={voice.name}
              onClick={() => onVoiceSelect(voice.name)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 text-left ${
                selectedVoice === voice.name
                  ? "border-primary bg-primary/10 glow-sm"
                  : "border-border bg-card hover:border-primary/50 hover:bg-surface-elevated"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  selectedVoice === voice.name 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground group-hover:bg-primary/20"
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {voice.model_type}
                  </p>
                </div>
              </div>
              {selectedVoice === voice.name && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isDragging ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}>
            {isDragging ? <Plus className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? "Drop to upload" : "Upload Reference Audio"}
            </p>
            <p className="text-xs text-muted-foreground">
              WAV, MP3, OGG, FLAC, M4A • 5-30 seconds recommended
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
