# Chatterbox TTS Web UI

A modern web interface for the [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) text-to-speech system with voice cloning capabilities.

![Chatterbox Web UI](https://img.shields.io/badge/Chatterbox-TTS%20Web%20UI-blue)

## Features

- 🎤 **Voice Cloning** - Upload reference audio to clone any voice
- 🎛️ **Emotion Controls** - Fine-tune exaggeration, CFG weight, and temperature
- 📝 **Paralinguistic Tags** - Add natural speech elements like laughter and sighs
- 🌊 **Waveform Visualization** - Real-time audio visualization
- 🌙 **Dark Theme** - Modern, audio-focused interface

## Quick Start with Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- NVIDIA GPU with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- Supports both x86_64 and ARM64 (DGX Spark with Blackwell GPU)

### Deployment

1. **Clone this repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Start the services:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Chatterbox TTS backend from source (ARM64/x86_64 compatible)
   - Build the Web UI container
   - Download TTS models on first run (~2GB)
   - Start both services with proper networking

   > **Note:** First build takes 10-15 minutes. First startup downloads models (~5-10 min).

3. **Access the application:**
   - **Web UI:** http://localhost:3000
   - **API (direct):** http://localhost:8000

### Stopping the Services

```bash
docker-compose down
```

### Running in Background (Detached Mode)

```bash
docker-compose up --build -d
```

View logs:
```bash
docker-compose logs -f
```

### CPU-Only / ARM64 Mode (Apple Silicon, etc.)

For systems without NVIDIA GPU or on ARM64 architecture (e.g., Apple Silicon Macs):

```bash
docker-compose -f docker-compose.cpu.yml up --build
```

This builds Chatterbox from source with CPU-only PyTorch, which:
- Works on ARM64 (Apple Silicon) and x86_64
- Does not require NVIDIA GPU or drivers
- First startup takes 10-15 minutes (model download + initialization)
- Inference is slower than GPU (expect 10-30 seconds per generation)

> **Note:** The default `docker-compose.yml` requires an NVIDIA GPU with the Container Toolkit installed.

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐
│   Web Browser   │────▶│  Web UI (port 3000) │
└─────────────────┘     └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │  Chatterbox Backend │
                        │    (port 8000)      │
                        └─────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate` | POST | Generate speech from text |

### Generate Speech Request

```bash
curl -X POST http://localhost:8000/generate \
  -F "text=Hello, world!" \
  -F "exaggeration=0.5" \
  -F "cfg_weight=0.5" \
  -F "temperature=0.8" \
  -F "audio=@reference.wav"
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at http://localhost:5173

### Project Structure

```
├── src/
│   ├── components/
│   │   ├── AudioPlayer.tsx      # Audio playback with controls
│   │   ├── EmotionControls.tsx  # Parameter sliders
│   │   ├── SettingsPanel.tsx    # API configuration
│   │   ├── TextInput.tsx        # Text input with tags
│   │   ├── VoiceSelector.tsx    # Voice grid & upload
│   │   └── WaveformVisualizer.tsx
│   ├── hooks/
│   │   └── useChatterbox.ts     # API integration hook
│   └── pages/
│       └── Index.tsx            # Main application
├── docker-compose.yml           # Multi-service deployment
├── Dockerfile                   # Web UI container
└── nginx.conf                   # Reverse proxy config
```

## Technologies

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Chatterbox TTS (PyTorch)
- **Deployment:** Docker, Docker Compose, Nginx

## Troubleshooting

### Backend not connecting
- Ensure the Chatterbox container is healthy: `docker-compose ps`
- Check backend logs: `docker-compose logs chatterbox`

### GPU not detected
- Verify NVIDIA drivers: `nvidia-smi`
- Check Container Toolkit: `docker run --gpus all nvidia/cuda:11.0-base nvidia-smi`

### Port conflicts
- Change ports in `docker-compose.yml` if 3000 or 8000 are in use

## License

MIT License
