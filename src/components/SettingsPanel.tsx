import { useState } from "react";
import { Settings, Server, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SettingsPanelProps {
  apiEndpoint: string;
  onApiEndpointChange: (endpoint: string) => void;
  connectionStatus: "connected" | "disconnected" | "checking";
}

const SettingsPanel = ({ apiEndpoint, onApiEndpointChange, connectionStatus }: SettingsPanelProps) => {
  const [tempEndpoint, setTempEndpoint] = useState(apiEndpoint);

  const handleSave = () => {
    onApiEndpointChange(tempEndpoint);
  };

  const statusConfig = {
    connected: {
      icon: Check,
      color: "text-green-500",
      bg: "bg-green-500/10",
      label: "Connected",
    },
    disconnected: {
      icon: X,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Disconnected",
    },
    checking: {
      icon: AlertCircle,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      label: "Checking...",
    },
  };

  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Configure your Chatterbox TTS connection
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* API Endpoint */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              API Endpoint
            </label>
            <Input
              value={tempEndpoint}
              onChange={(e) => setTempEndpoint(e.target.value)}
              placeholder="http://localhost:8000"
              className="bg-surface border-border"
            />
            <p className="text-xs text-muted-foreground">
              The URL where your Chatterbox TTS server is running
            </p>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-3 p-4 rounded-xl ${status.bg}`}>
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <div>
              <p className={`font-medium ${status.color}`}>{status.label}</p>
              <p className="text-xs text-muted-foreground">
                {connectionStatus === "connected" 
                  ? "Ready to generate speech"
                  : connectionStatus === "checking"
                  ? "Testing connection..."
                  : "Unable to reach server"}
              </p>
            </div>
          </div>

          {/* Docker Instructions */}
          <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
            <h4 className="font-medium text-foreground text-sm">Quick Start</h4>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Run Chatterbox with Docker:
              </p>
              <code className="block text-xs bg-background p-3 rounded-lg text-primary font-mono overflow-x-auto">
                docker compose up -d
              </code>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
