import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2, Trash2 } from "lucide-react";

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const TextInput = ({ text, onTextChange, onGenerate, isGenerating }: TextInputProps) => {
  const characterLimit = 10000;
  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const exampleTexts = [
    "Hello! Welcome to Chatterbox, the state-of-the-art text to speech system. I can speak with incredible naturalness and emotion.",
    "Today's weather forecast calls for partly cloudy skies with a high of 72 degrees. [laugh] Perfect weather for a picnic!",
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet.",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Text to Synthesize
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>•</span>
          <span className={characterCount > characterLimit * 0.9 ? "text-destructive" : ""}>
            {characterCount.toLocaleString()} / {characterLimit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          className="min-h-[200px] resize-none bg-surface border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground"
          maxLength={characterLimit}
        />
        
        {text && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onTextChange("")}
            className="absolute top-3 right-3 opacity-50 hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Example Texts */}
      {!text && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {exampleTexts.map((example, i) => (
              <button
                key={i}
                onClick={() => onTextChange(example)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors truncate max-w-[200px]"
              >
                {example.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hint about paralinguistic tags */}
      <p className="text-xs text-muted-foreground">
        💡 Tip: Use tags like <code className="px-1 py-0.5 bg-secondary rounded">[laugh]</code>, 
        <code className="px-1 py-0.5 bg-secondary rounded ml-1">[cough]</code>, or 
        <code className="px-1 py-0.5 bg-secondary rounded ml-1">[sigh]</code> for natural expressions.
      </p>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={!text.trim() || isGenerating}
        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-sm hover:glow-md transition-all duration-300"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate Speech
          </span>
        )}
      </Button>
    </div>
  );
};

export default TextInput;
