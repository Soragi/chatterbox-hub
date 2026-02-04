import { Slider } from "@/components/ui/slider";
import { Sparkles, Zap, Volume2 } from "lucide-react";

interface EmotionControlsProps {
  exaggeration: number;
  cfgWeight: number;
  temperature: number;
  onExaggerationChange: (value: number) => void;
  onCfgWeightChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
}

const EmotionControls = ({
  exaggeration,
  cfgWeight,
  temperature,
  onExaggerationChange,
  onCfgWeightChange,
  onTemperatureChange,
}: EmotionControlsProps) => {
  const controls = [
    {
      label: "Emotion Exaggeration",
      description: "Controls how expressive the voice sounds",
      value: exaggeration,
      onChange: onExaggerationChange,
      icon: Sparkles,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: "CFG/Pace Weight",
      description: "Classifier-free guidance strength",
      value: cfgWeight,
      onChange: onCfgWeightChange,
      icon: Zap,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: "Temperature",
      description: "Randomness in voice generation",
      value: temperature,
      onChange: onTemperatureChange,
      icon: Volume2,
      min: 0.1,
      max: 1.5,
      step: 0.05,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Voice Parameters
      </h3>

      <div className="space-y-6">
        {controls.map((control) => {
          const Icon = control.icon;
          const percentage = ((control.value - control.min) / (control.max - control.min)) * 100;
          
          return (
            <div key={control.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{control.label}</span>
                </div>
                <span className="text-sm font-mono text-primary tabular-nums">
                  {control.value.toFixed(2)}
                </span>
              </div>
              
              <div className="relative">
                <Slider
                  value={[control.value]}
                  onValueChange={([v]) => control.onChange(v)}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  className="cursor-pointer"
                />
                {/* Glow indicator */}
                <div 
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, opacity: percentage / 100 }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">{control.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionControls;
